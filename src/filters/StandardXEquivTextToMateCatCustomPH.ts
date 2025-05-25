import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class StandardXEquivTextToMateCatCustomPH extends AbstractHandler {
  public transform(segment: string): string {
    const regex = /<x[^>]*?equiv-text="([^"]*?)"[^>]*?\/>/gi;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const group = match[0];
      const equivText = match[1];
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="${Buffer.from(group).toString('base64')}" equiv-text="base64:${Buffer.from(equivText).toString('base64')}"/>`;
      segment = segment.replace(group, replacement);
    }

    return segment;
  }
}