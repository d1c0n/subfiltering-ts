import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class SplitPlaceholder extends AbstractHandler {
  public transform(segment: string): string {
    segment = segment.replace(new RegExp(ConstantEnum.splitPlaceHolder, 'g'), '');
    return segment;
  }
}