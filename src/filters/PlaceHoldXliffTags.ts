import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class PlaceHoldXliffTags extends AbstractHandler {
  public transform(segment: string): string {
    // input : <g id="43">bang & < 3 olufsen </g>; <x id="33"/>
    // remove not existent </x> tags
    segment = segment.replace(/(<\/x>)/si, '');

    segment = segment.replace( /<(g\s*id=[\"\']+.*?[\"\']+\s*[^<>]*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(g\s*xid=[\"\']+.*?[\"\']+\s*[^<>]*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);

    segment = segment.replace( /<(\/g)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);

    segment = segment.replace( /<(x .*?\/?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(bx[ ]{0,}\/?\/bx .*?\/?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ex[ ]{0,}\/?   \/ex .*?\/?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(bpt\s*.*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/bpt)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ept\s*.*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ept)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ph .*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ph)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ec .*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ec)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(sc .*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/sc)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(pc .*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/pc)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(it .*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/it)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(mrk\s*.*?)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/mrk)>/si, `${ConstantEnum.LTPLACEHOLDER}\$1{ConstantEnum.GTPLACEHOLDER}`);


    return segment.replace(new RegExp(`${ConstantEnum.LTPLACEHOLDER}(.*?)${ConstantEnum.GTPLACEHOLDER}`, 'gu'), (match, p1) => {
      return `${ConstantEnum.LTPLACEHOLDER}${Buffer.from(p1).toString('base64')}${ConstantEnum.GTPLACEHOLDER}`;
    });
  }
}