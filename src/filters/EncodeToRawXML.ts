import { AbstractHandler } from '../commons/AbstractHandler';
import { Utils } from '../utils/Utils';

export class EncodeToRawXML extends AbstractHandler {
  public transform(segment: string): string {
    // handling &#10; (line feed)
    // prevent to convert it to \n
    segment = segment.replace(/&(#10;|#x0A;)|\n/g, '##_ent_0A_##');

    // handling &#13; (carriage return)
    // prevent to convert it to \r
    segment = segment.replace(/&(#13;|#x0D;)|\r/g, '##_ent_0D_##');

    // handling &#09; (tab)
    // prevent to convert it to \t
    segment = segment.replace(/&#09;|\t/g, '##_ent_09_##');

    // Substitute 4(+)-byte characters from a UTF-8 string to htmlentities
    segment = segment.replace(/([\u{F0}-\u{F7}][\u{80}-\u{BF}]{3})/gu, (match) => {
      return Utils.htmlentitiesFromUnicode(match);
    });

    // handling &#10;
    if (segment.includes('##_ent_0D_##')) {
      segment = segment.replace(/##_ent_0D_##/g, '&#13;');
    }

    // handling &#13;
    if (segment.includes('##_ent_0A_##')) {
      segment = segment.replace(/##_ent_0A_##/g, '&#10;');
    }

    // handling &#09; (tab)
    // prevent to convert it to \t
    if (segment.includes('##_ent_09_##')) {
      segment = segment.replace(/##_ent_09_##/g, '&#09;');
    }

    // encode all not valid XML entities
    segment = segment.replace(/&(?!lt;|gt;|amp;|quot;|apos;|#[x]{0,1}[0-9A-F]{1,7};)/g, '&amp');

    return segment;
  }
}