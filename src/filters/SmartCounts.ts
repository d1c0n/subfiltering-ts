import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class SmartCounts extends AbstractHandler {
  public transform(segment: string): string {
    /*
     * Examples:
     * - [AIRBNB] Reminder: Reply to %{guest}’s inquiry. |||| [AIRBNB] Reminder: Reply to %{guest}’s inquiry.
     */
    const regex = /(\|\|\|\|)/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const variable = match[0];
      // Replace subsequent elements excluding already encoded
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.SMART_COUNT}" equiv-text="base64:${Buffer.from(variable).toString('base64')}"/>`;
      segment = segment.replace(variable, replacement);
    }

    return segment;
  }
}