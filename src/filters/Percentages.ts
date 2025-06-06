import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { CTypeEnum } from '../enums/CTypeEnum';

export class Percentages extends AbstractHandler {
  /**
   * All inside percentages will be locked if there are no spaces
   *
   * TestSet:
   * ```
   * Dear %%customer.first_name%%, This is %agent.alias%% from Skyscanner. % this-will-not-locked % e %%ciao%% a {%this-will-not-locked%
   * ```
   */
  public transform(segment: string): string {
    const regex = /%%[^<>\s%{}]+?%%/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const percentageVariable = match[0];
      // Check if inside twig variable there is a tag because in this case shouldn't replace the content with PH tag
      if (!percentageVariable.includes(ConstantEnum.GTPLACEHOLDER)) {
        // Replace subsequent elements excluding already encoded
        const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.PERCENTAGES}" equiv-text="base64:${Buffer.from(percentageVariable).toString('base64')}"/>`;
        segment = segment.replace(percentageVariable, replacement);
      }
    }

    return segment;
  }
}