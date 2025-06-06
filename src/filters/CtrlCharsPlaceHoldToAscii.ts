import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class CtrlCharsPlaceHoldToAscii extends AbstractHandler {

  public transform(segment: string): string {
    // Replace br placeholders
    segment = segment.replace(new RegExp(ConstantEnum.crlfPlaceholder.replace(/\$/g, '\\$'), 'g'), '\r\n');
    segment = segment.replace(new RegExp(ConstantEnum.lfPlaceholder.replace(/\$/g, '\\$'), 'g'), '\n');
    segment = segment.replace(new RegExp(ConstantEnum.crPlaceholder.replace(/\$/g, '\\$'), 'g'), '\r');
    segment = segment.replace(new RegExp(ConstantEnum.tabPlaceholder.replace(/\$/g, '\\$'), 'g'), '\t');

    return segment;
  }
}