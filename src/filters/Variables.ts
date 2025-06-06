import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class Variables extends AbstractHandler {

  public transform(segment: string): string {
    /*
     * Examples:
     * - %{{(text-align=center)}}
     */
    const regex = /%{{(?!<ph )[^{}]*?}}/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const variable = match[0];
      // Replace subsequent elements excluding already encoded
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.PERCENT_VARIABLE}" equiv-text="base64:${Buffer.from(variable).toString('base64')}"/>`;
      segment = segment.replace(variable, replacement);
    }

    return segment;
  }
}