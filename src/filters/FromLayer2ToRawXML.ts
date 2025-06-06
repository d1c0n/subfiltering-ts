import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { Utils } from '../utils/Utils';

export class FromLayer2ToRawXML extends AbstractHandler {
  private brokenHTML: boolean = false;

  public transform(segment: string): string {
    // normal control characters must be converted to entities
    segment = segment
      .replace(/\r\n/g, '&#13;&#10;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;')
      .replace(/\t/g, '&#09;')
      .replace(//g, '&#157;'); // This character might need special handling depending on context

    // now convert the real &nbsp;

    // escape dollar sign in regex
    const nbspPlaceholder = ConstantEnum.nbspPlaceholder.replace(/\$/g, '\\$');
    const nbspRegex = new RegExp(nbspPlaceholder, 'g');
    return segment.replace(nbspRegex, String.fromCodePoint(0xa0));
  }
}