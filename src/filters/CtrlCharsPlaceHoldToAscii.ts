import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class CtrlCharsPlaceHoldToAscii extends AbstractHandler {
  /**
   * @inheritDoc
   */
  public transform(segment: string): string {
    // Replace br placeholders
    segment = segment.replace(new RegExp(ConstantEnum.crlfPlaceholder, 'g'), '\r\n');
    segment = segment.replace(new RegExp(ConstantEnum.lfPlaceholder, 'g'), '\n');
    segment = segment.replace(new RegExp(ConstantEnum.crPlaceholder, 'g'), '\r');
    segment = segment.replace(new RegExp(ConstantEnum.tabPlaceholder, 'g'), '\t');

    return segment;
  }
}