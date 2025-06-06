import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { CTypeEnum } from '../enums/CTypeEnum';

export class DollarCurlyBrackets extends AbstractHandler {
  public transform(segment: string): string {
    const regex = /\$\{[^<>\s]+?\}/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const snailVariable = match[0];
      // Check if inside twig variable there is a tag because in this case shouldn't replace the content with PH tag
      if (!snailVariable.includes(ConstantEnum.GTPLACEHOLDER)) {
        // Replace subsequent elements excluding already encoded
        const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.DOLLAR_CURLY_BRACKETS}" equiv-text="base64:${Buffer.from(snailVariable).toString('base64')}"/>`;
        segment = segment.replace(snailVariable, replacement);
      }
    }

    return segment;
  }
}