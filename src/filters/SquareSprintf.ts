import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';

export class SquareSprintf extends AbstractHandler {
  /**
   * @inheritDoc
   */
  public transform(segment: string): string {
    const tags = [
      '\\[%s\\]',
      '\\[%\\d+\\$s\\]',
      '\\[%\\d+\\$i\\]',
      '\\[%\\d+\\$s:[a-z_]+\\]',
      '\\[%\\d+\\$i:[a-z_]+\\]',
      '\\[%s:[a-z_]+\\]',
      '\\[%i\\]',
      '\\[%i:[a-z_]+\\]',
      '\\[%f\\]',
      '\\[%f:[a-z_]+\\]',
      '\\[%.\\d+f\\]',
      '\\[%\\d+\\.\\d+f\\]',
      '\\[%\\d+\\.\\d+f:[a-z_]+\\]',
      '\\[%.\\d+f:[a-z_]+\\]',
      '\\[%[a-z_]+:\\d+%\\]',
    ];
    const regex = new RegExp(tags.join('|'), 'gi');
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const percentSnailVariable = match[0];
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.SQUARE_SPRINTF}" equiv-text="base64:${Buffer.from(percentSnailVariable).toString('base64')}"/>`;
      segment = segment.replace(percentSnailVariable, replacement);
    }

    return segment;
  }
}