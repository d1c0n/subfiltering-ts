import { AbstractHandler } from '../commons/AbstractHandler';

export class MateCatCustomPHToOriginalValue extends AbstractHandler {
  public transform(segment: string): string {
    segment = this.restoreOriginalTags(segment);
    segment = this.restoreFilteredContent(segment);
    return segment;
  }

  /**
   * This pipeline method is needed to restore x-original content (when an entire tag is replaced with a PH)
   *
   * @param segment
   * @returns string
   */
  private restoreOriginalTags(segment: string): string {
    const regex = /<ph id\s*=\s*["']mtc_[0-9]+["'] ctype\s*=\s*["']([^"']+)["'] x-orig\s*=\s*["']([^"']+)["'] equiv-text\s*=\s*["']base64:[^"']+["']\s*\/>/gi;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const originalTag = match[0];
      const decodedValue = Buffer.from(match[2], 'base64').toString('utf8');
      segment = segment.replace(originalTag, decodedValue);
    }
    return segment;
  }

  /**
   * This pipeline method is needed to restore a filtered block (as PH tag) to its original value.
   * It can be everything filtered out: sprintf, html, etc.
   *
   * @param segment
   * @returns string
   */
  private restoreFilteredContent(segment: string): string {
    // pipeline for restore PH tag of subfiltering to original encoded HTML
    const regex = /<ph id\s*=\s*["']mtc_[0-9]+["'] ctype\s*=\s*["']([0-9a-zA-Z\-_]+)["'] equiv-text\s*=\s*["']base64:([^"']+)["']\s*\/>/gi;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      /*
       * This code tries to handle xliff/html tags (encoded) inside an xliff.
       */
      const subfilterTag = match[0];
      const value = Buffer.from(match[2], 'base64').toString('utf8');
      segment = segment.replace(subfilterTag, value);
    }
    return segment;
  }
}