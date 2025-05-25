import { AbstractHandler } from '../commons/AbstractHandler';

export class EncodeControlCharsInXliff extends AbstractHandler {
  /**
   * @inheritDoc
   */
  public transform(segment: string): string {
    return segment
      .replace(/\r\n/g, '&#13;&#10;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;')
      .replace(/\t/g, '&#09;');
  }
}