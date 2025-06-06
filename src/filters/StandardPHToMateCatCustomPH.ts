import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class StandardPHToMateCatCustomPH extends AbstractHandler {
  public transform(segment: string): string {
    segment = this.filterPhTagContent(segment);
    segment = this.filterOriginalSelfClosePhTagsWithEquivText(segment);
    return segment;
  }


  private filterPhTagContent(segment: string): string {
    if (/<\/ph>/gi.test(segment)) {
      const regex = /<ph id=["']([^'"]+?)["'].*?>(.*?)<\/ph>/gi;
      const matches = [...segment.matchAll(regex)];

      matches.forEach(match => {
        const group = match[0];
        const content = match[2];
        const encodedContent = Buffer.from(content).toString('base64'); // Equivalent to htmlentities(content, ENT_NOQUOTES | ENT_XML1, 'UTF-8')
        const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_PH_CONTENT}" x-orig="${Buffer.from(group).toString('base64')}" equiv-text="base64:${encodedContent}"/>`;
        segment = segment.replace(group, replacement);
      });
      
    }
    return segment;
  }

  /**
   * Show the equivalent text of the <ph> tag instead of the tag itself.
   *
   */
  private filterOriginalSelfClosePhTagsWithEquivText(segment: string): string {
    const regex = /<ph[^>]+?equiv-text\s*?=\s*?(["'])(?!base64:)(.*?)\1[^>]*?\/>/gi;
    const matches = [...segment.matchAll(regex)];

    matches.forEach(match => {
      const tagAttribute = match[0];
      const equivText = match[2] !== '' ? match[2] : 'NULL';
      const encodedEquivText = Buffer.from(equivText).toString('base64');
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="${Buffer.from(tagAttribute).toString('base64')}" equiv-text="base64:${encodedEquivText}"/>`;
      segment = segment.replace(tagAttribute, replacement);
    });
    
    return segment;
  }
}