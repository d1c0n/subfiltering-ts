import * as xmljs from 'xml-js';
import { CTypeEnum, CTypeEnumHelper } from '../enums/CTypeEnum';
import { DataRefReplacer } from '../utils/DataRefReplacer';
import { AbstractHandler } from '../commons/AbstractHandler';

export class DataRefReplace extends AbstractHandler {
    private dataRefMap: Record<string, string> | undefined;

    /**
     * DataRefReplaceHandler constructor.
     */
    public constructor() {
        super();
    }

    public transform(segment: string): string {
        if (this.dataRefMap === undefined) { // Initialize once per instance
            this.dataRefMap = this.pipeline.getDataRefMap();
        }

        let currentSegment = segment;

        // dataRefMap is present only in xliff 2.0 files
        if (Object.keys(this.dataRefMap).length === 0) {
            currentSegment = this.replace_Ph_TagsWithoutDataRefCorrespondenceToMatecatPhTags(currentSegment);
            currentSegment = this.replace_Pc_TagsWithoutDataRefCorrespondenceToMatecatPhTags(currentSegment);
            return currentSegment;
        }

        // If dataRefMap is not empty, use DataRefReplacer first
        const dataRefReplacer = new DataRefReplacer(this.dataRefMap);
        currentSegment = dataRefReplacer.replace(currentSegment);

        // Then, apply the non-dataRef correspondence replacements
        currentSegment = this.replace_Ph_TagsWithoutDataRefCorrespondenceToMatecatPhTags(currentSegment);
        currentSegment = this.replace_Pc_TagsWithoutDataRefCorrespondenceToMatecatPhTags(currentSegment);

        return currentSegment;
    }

    /**
     * This function replace encoded ph tags (from Xliff 2.0) without any dataRef correspondence
     * to regular Matecat <ph> tag for UI presentation
     *
     * Example:
     *
     * We can control who sees content when with <ph id="source1" dataRef="source1"/>Visibility Constraints.
     *
     * Is transformed to:
     *
     * We can control who sees content when with &lt;ph id="mtc_ph_u_1" equiv-text="base64:PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIi8+"/&gt;Visibility Constraints.
     *
     */
    private replace_Ph_TagsWithoutDataRefCorrespondenceToMatecatPhTags(segment: string): string {
        const phTagRegex = /<(ph .*?)\/>/gi;
        let match;
        
        const phTagsMatches: string[] = [];
        // Create a local RegExp instance to ensure lastIndex is managed correctly for multiple exec calls
        const localPhTagRegex = new RegExp(phTagRegex); 
        while ((match = localPhTagRegex.exec(segment)) !== null) {
            phTagsMatches.push(match[0]); // match[0] is the full tag string, e.g., <ph id="x">
        }

        if (phTagsMatches.length === 0) {
            return segment;
        }

        let currentSegment = segment;
        for (const phTag of phTagsMatches) {
            if (this.isAValidPhTag(phTag)) {
                // Escape phTag for use in RegExp constructor, similar to PHP's preg_quote
                const escapedPhTag = phTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Create a new RegExp for replacement; it will only match the first occurrence by default
                const regexToReplace = new RegExp(escapedPhTag); 

                const replacementString = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:${Buffer.from(phTag).toString('base64')}"/>`;
                
                currentSegment = currentSegment.replace(regexToReplace, replacementString);
            }
        }
        return currentSegment;
    }

    /**
     * Checks if a given ph tag string is "valid" for replacement.
     * A ph tag is valid if it doesn't have a Matecat ctype, doesn't have equiv-text,
     * and if it has a dataRef attribute, that dataRef is not found in the dataRefMap.
     */
    private isAValidPhTag(phTag: string): boolean {
        let parsedJsObj: xmljs.Element | xmljs.ElementCompact;
        try {
            // Parse the individual phTag string.
            // Options: compact: false -> standard verbose structure. alwaysArray: true -> predictable output.
            parsedJsObj = xmljs.xml2js(phTag, { compact: false, alwaysArray: true, trim: false });
        } catch (e) {
            // If parsing fails (e.g., malformed XML snippet), consider it not a valid tag for this processing.
            return false; 
        }

        // Expected structure with compact:false, alwaysArray:true : { elements: [ actualElement ] }
        const rootContainer = parsedJsObj as { elements?: xmljs.Element[] }; 
        if (!rootContainer.elements || rootContainer.elements.length === 0) {
            return false;
        }
        
        const phNode: xmljs.Element = rootContainer.elements[0];
        // Ensure it's an element named 'ph'
        if (!phNode || phNode.type !== 'element' || phNode.name !== 'ph') {
            return false; 
        }

        const attributes = phNode.attributes || {}; // xmljs.ElementAttributes

        // Check for Matecat ctype
        const cType = attributes.ctype ? String(attributes.ctype) : null;
        if (cType && CTypeEnumHelper.isMatecatCType(cType)) {
            return false; // Already a Matecat tag, don't process further
        }

        // If has equiv-text, don't touch
        if (attributes.hasOwnProperty('equiv-text')) {
            return false;
        }

        if (attributes.hasOwnProperty('dataRef')) {
            const dataRefAttr = String(attributes.dataRef);
            // If dataRefMap does NOT have dataRefAttr as a key, then it's a "valid" tag for this replacement.
            if (this.dataRefMap && !this.dataRefMap.hasOwnProperty(dataRefAttr)) {
                return true; 
            }
            // Otherwise (key IS in map, or dataRefMap itself is undefined/null - though transform ensures it's an object),
            // it's not a "valid" tag for this method's replacement.
            // If key is in map, it's handled by DataRefReplacer or it's intentionally kept.
            return false; 
        }

        // If no Matecat ctype, no equiv-text, and no dataRef attribute, it's considered "valid" for replacement.
        return true;
    }

    /**
     * This function replaces pc tags (from Xliff 2.0) that do not have dataRef correspondence
     * with regular Matecat <ph> tags for UI presentation. Opening and closing pc tags are handled.
     */
    private replace_Pc_TagsWithoutDataRefCorrespondenceToMatecatPhTags(segment: string): string {
        const openingPcTagRegex = /<(pc .*?)>/gi; 
        const closingPcTagRegex = /<\/pc>/gi;    

        let currentSegment = segment;
        let match;

        // --- Process opening tags ---
        const openingPcTagsMatches: string[] = [];
        const localOpeningPcTagRegex = new RegExp(openingPcTagRegex);
        while ((match = localOpeningPcTagRegex.exec(currentSegment)) !== null) { 
            openingPcTagsMatches.push(match[0]);
        }
        
        if (openingPcTagsMatches.length === 0) {
            return currentSegment;
        }
        
        for (const openingPcTag of openingPcTagsMatches) {
            const escapedOpeningPcTag = openingPcTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regexToReplace = new RegExp(escapedOpeningPcTag);
            
            const replacementString = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_PC_OPEN_NO_DATA_REF}" equiv-text="base64:${Buffer.from(openingPcTag).toString('base64')}"/>`;
            currentSegment = currentSegment.replace(regexToReplace, replacementString);
        }

        // --- Process closing tags ---
        const closingTagMatchesFromInitialSegment: string[] = [];
        const initialSegmentClosingRegex = new RegExp(closingPcTagRegex);
        // `segment` here refers to the state *before* opening tags were processed.
        while((match = initialSegmentClosingRegex.exec(segment)) !== null) {
            closingTagMatchesFromInitialSegment.push(match[0]); // match[0] is '</pc>'
        }

        for (const closingPcTag of closingTagMatchesFromInitialSegment) {
            const escapedClosingPcTag = closingPcTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regexToReplace = new RegExp(escapedClosingPcTag); 
            
            const replacementString = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_PC_CLOSE_NO_DATA_REF}" equiv-text="base64:${Buffer.from(closingPcTag).toString('base64')}"/>`;
            currentSegment = currentSegment.replace(regexToReplace, replacementString);
        }

        return currentSegment;
    }
}