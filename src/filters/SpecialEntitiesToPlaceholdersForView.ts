import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class SpecialEntitiesToPlaceholdersForView extends AbstractHandler {
  public transform(segment: string): string {
    segment = segment.replace(/&#10;/gi, ConstantEnum.lfPlaceholder);
    segment = segment.replace(/&#13;/gi, ConstantEnum.crPlaceholder);
    segment = segment.replace(/ /gi, ConstantEnum.nbspPlaceholder); // NBSP in ascii value
    segment = segment.replace(/&#x0A;/gi, ConstantEnum.lfPlaceholder);
    segment = segment.replace(/&#x0C;/gi, ConstantEnum.crPlaceholder);
    segment = segment.replace(/&#160;/gi, ConstantEnum.nbspPlaceholder);
    segment = segment.replace(/&#xA0;/gi, ConstantEnum.nbspPlaceholder);
    segment = segment.replace(/&#09;/gi, ConstantEnum.tabPlaceholder);
    segment = segment.replace(/&#9;/gi, ConstantEnum.tabPlaceholder);
    segment = segment.replace(/&#x09;/gi, ConstantEnum.tabPlaceholder);
    return segment;
  }
}