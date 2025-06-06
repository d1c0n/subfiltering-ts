import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { CTypeEnum } from '../enums/CTypeEnum';

export class SingleCurlyBracketsToPh extends AbstractHandler {
  /**
   * TestSet:
   * ```
   * Dear {{%%customer.first_name%%}}, This is {{ "now"|date(null, "Europe/Rome") }} with {%%agent.alias%%} Airbnb. {% for user in users %} e {%%ciao%%}
   * {# note: disabled template because we no longer use this
   * {% for user in users %}
   * ...
   * {% endfor %}
   *
   * ... {variable}
   * #}
   * ```
   */
  public transform(segment: string): string {
    const regex = /{[^<>{} ]+?}/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const twigVariable = match[0];
      // Check if inside twig variable there is a tag because in this case shouldn't replace the content with PH tag
      if (!twigVariable.includes(ConstantEnum.GTPLACEHOLDER)) {
        // Replace subsequent elements excluding already encoded
        const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.CURLY_BRACKETS}" equiv-text="base64:${Buffer.from(twigVariable).toString('base64')}"/>`;
        segment = segment.replace(twigVariable, replacement);
      }
    }

    return segment;
  }
}