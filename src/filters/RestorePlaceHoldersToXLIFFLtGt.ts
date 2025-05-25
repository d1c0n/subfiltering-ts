import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class RestorePlaceHoldersToXLIFFLtGt extends AbstractHandler {
  public transform(segment: string): string {
    segment = segment.replace(new RegExp(ConstantEnum.LTPLACEHOLDER, 'g'), '<');
    segment = segment.replace(new RegExp(ConstantEnum.GTPLACEHOLDER, 'g'), '>');
    return segment;
  }
}