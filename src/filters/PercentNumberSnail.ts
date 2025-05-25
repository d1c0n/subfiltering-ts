import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class PercentNumberSnail extends AbstractHandler {
  /**
   * @inheritDoc
   */
  public transform(segment: string): string {
    const regex = /%\d+\$@/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const percentNumberSnailVariable = match[0];
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.PERCENT_NUMBER_SNAILS}" equiv-text="base64:${Buffer.from(percentNumberSnailVariable).toString('base64')}"/>`;
      segment = segment.replace(percentNumberSnailVariable, replacement);
    }

    return segment;
  }
}