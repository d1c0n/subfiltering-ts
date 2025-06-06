import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';
import { DataRefReplacer } from '../utils/DataRefReplacer';
import { Buffer } from 'buffer';

export class DataRefRestore extends AbstractHandler {
    private dataRefMap: Record<string, string> | undefined;

    /**
     * DataRefRestoreHandler constructor.
     */
    public constructor() {
        super();
        // this.dataRefMap is initialized lazily in the transform method
    }


    public transform(segment: string): string {
        if (this.dataRefMap === undefined) { // Initialize once per instance
            this.dataRefMap = this.pipeline.getDataRefMap();
        }

        let currentSegment = segment;

        // If dataRefMap is empty, only restore non-DataRef tags
        if (Object.keys(this.dataRefMap).length === 0) {
            currentSegment = this.restoreXliffPhTagsFromMatecatPhTags(currentSegment);
            currentSegment = this.restoreXliffPcTagsFromMatecatPhTags(currentSegment);
            return currentSegment;
        }

        // If dataRefMap is not empty, use DataRefReplacer.restore first
        const dataRefReplacer = new DataRefReplacer(this.dataRefMap);
        currentSegment = dataRefReplacer.restore(currentSegment);

        // Then, restore the non-DataRef specific Matecat ph/pc tags
        currentSegment = this.restoreXliffPhTagsFromMatecatPhTags(currentSegment);
        currentSegment = this.restoreXliffPcTagsFromMatecatPhTags(currentSegment);

        return currentSegment;
    }

    /**
     * Helper to escape literal strings for use in RegExp.
     */
    private escapeLiteralStringForRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Restores original XLIFF <ph> tags (that were not dataRef-related)
     * from Matecat's <ph ctype="x-original_ph_no_data_ref" ...> representation.
     */
    private restoreXliffPhTagsFromMatecatPhTags(segment: string): string {
        const ctypeVal = CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF;
        // Regex to find <ph ... ctype="x-original_ph_no_data_ref" ... equiv-text="base64:..." ... />
        // It captures the full matched tag and the base64 content.
        const regex = new RegExp(
            String.raw`<ph\s+[^>]*?ctype="${this.escapeLiteralStringForRegex(ctypeVal)}"[^>]*?equiv-text="base64:([^"]*?)"[^>]*?\/>`,
            'gi'
        );

        let currentSegment = segment;
        
        // Collect all matches first because replacing in a loop can affect subsequent regex.exec calls on the same string.
        const matchesToProcess: Array<{ fullMatch: string; base64Content: string }> = [];
        let matchExecResult;
        // Execute regex on the original segment state to find all targets
        while ((matchExecResult = regex.exec(segment)) !== null) {
            matchesToProcess.push({
                fullMatch: matchExecResult[0], // The entire <ph.../> tag string
                base64Content: matchExecResult[1], // The content of equiv-text (base64 encoded)
            });
        }

        if (matchesToProcess.length === 0) {
            return currentSegment; // Return the current (potentially modified by DataRefReplacer) segment
        }
        
        for (const item of matchesToProcess) {
            const decodedValue = Buffer.from(item.base64Content, 'base64').toString('utf-8');
            // Replace all occurrences of this specific fullMatch string with its decoded value.
            // This mimics PHP's str_replace($match, $decoded, $segment) behavior for each unique match found.
            const escapedFullMatch = this.escapeLiteralStringForRegex(item.fullMatch);
            currentSegment = currentSegment.replace(new RegExp(escapedFullMatch, 'g'), decodedValue);
        }

        return currentSegment;
    }

    /**
     * Restores original XLIFF <pc> tags (that were not dataRef-related)
     * from Matecat's <ph ctype="x-original_pc_open_no_data_ref" ...> and 
     * <ph ctype="x-original_pc_close_no_data_ref" ...> representations.
     */
    private restoreXliffPcTagsFromMatecatPhTags(segment: string): string {
        const ctypeOpenVal = CTypeEnum.ORIGINAL_PC_OPEN_NO_DATA_REF;
        const ctypeCloseVal = CTypeEnum.ORIGINAL_PC_CLOSE_NO_DATA_REF;

        const regexOpen = new RegExp(
            String.raw`<ph\s+[^>]*?ctype="${this.escapeLiteralStringForRegex(ctypeOpenVal)}"[^>]*?equiv-text="base64:([^"]*?)"[^>]*?\/>`,
            'gi'
        );
        const regexClose = new RegExp(
            String.raw`<ph\s+[^>]*?ctype="${this.escapeLiteralStringForRegex(ctypeCloseVal)}"[^>]*?equiv-text="base64:([^"]*?)"[^>]*?\/>`,
            'gi'
        );

        let currentSegment = segment;
        const matchesToProcess: Array<{ fullMatch: string; base64Content: string }> = [];
        let matchExecResult;

        // Collect all "open pc" matches from the original segment state
        while ((matchExecResult = regexOpen.exec(segment)) !== null) {
            matchesToProcess.push({
                fullMatch: matchExecResult[0],
                base64Content: matchExecResult[1],
            });
        }

        // Collect all "close pc" matches from the original segment state
        // Reset lastIndex for regexClose if it was the same regex instance (it's not here, but good practice)
        // regexClose.lastIndex = 0; 
        while ((matchExecResult = regexClose.exec(segment)) !== null) {
            matchesToProcess.push({
                fullMatch: matchExecResult[0],
                base64Content: matchExecResult[1],
            });
        }

        if (matchesToProcess.length === 0) {
            return currentSegment; // Return current segment if no pc tags of this type
        }
        
        // Process all collected matches (both open and close types)
        for (const item of matchesToProcess) {
            const decodedValue = Buffer.from(item.base64Content, 'base64').toString('utf-8');
            const escapedFullMatch = this.escapeLiteralStringForRegex(item.fullMatch);
            // Replace all occurrences of item.fullMatch in the evolving currentSegment
            currentSegment = currentSegment.replace(new RegExp(escapedFullMatch, 'g'), decodedValue);
        }

        return currentSegment;
    }
}