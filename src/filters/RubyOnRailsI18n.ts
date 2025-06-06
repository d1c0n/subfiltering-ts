import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { CTypeEnum } from '../enums/CTypeEnum';

export class RubyOnRailsI18n extends AbstractHandler {
  /**
   * Support for ruby on rails i18n variables
   *
   * TestSet:
   * ```
   * Dear %{person}, This is %{agent.alias} from Customer. %{ this will not locked } e %{ciao}
   * ```
   */
  public transform(segment: string): string {
    /*
     * Examples:
     * - %{# }
     * - %{\n}$spaces=2%{\n}
     * - %{vars}
     */
    const regex = /%{(?!<ph )[^{}]*?}/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const rubyVariable = match[0];
      // Check if inside twig variable there is a tag because in this case shouldn't replace the content with PH tag
      if (!rubyVariable.includes(ConstantEnum.GTPLACEHOLDER)) {
        // Replace subsequent elements excluding already encoded
        const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:${Buffer.from(rubyVariable).toString('base64')}"/>`;
        segment = segment.replace(rubyVariable, replacement);
      }
    }

    return segment;
  }
}