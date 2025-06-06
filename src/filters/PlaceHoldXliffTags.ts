import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class PlaceHoldXliffTags extends AbstractHandler {
  public transform(segment: string): string {
    // input : <g id="43">bang & < 3 olufsen </g>; <x id="33"/>
    // remove not existent </x> tags
    segment = segment.replace(/(<\/x>)/gsi, '');

    segment = segment.replace( /<(g\s*id=[\"\']+.*?[\"\']+\s*[^<>]*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(g\s*xid=[\"\']+.*?[\"\']+\s*[^<>]*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);

    segment = segment.replace( /<(\/g)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);

    segment = segment.replace( /<(x .*?\/?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(bx[ ]{0,}\/?\/bx .*?\/?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ex[ ]{0,}\/?   \/ex .*?\/?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(bpt\s*.*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/bpt)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ept\s*.*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ept)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ph .*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ph)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(ec .*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/ec)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(sc .*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/sc)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(pc .*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/pc)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(it .*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/it)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(mrk\s*.*?)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);
    segment = segment.replace( /<(\/mrk)>/gsi, `${ConstantEnum.LTPLACEHOLDER}\$1${ConstantEnum.GTPLACEHOLDER}`);


    return segment.replace(new RegExp(`${ConstantEnum.LTPLACEHOLDER}(.*?)${ConstantEnum.GTPLACEHOLDER}`, 'gu'), (match, p1) => {
      return `${ConstantEnum.LTPLACEHOLDER}${Buffer.from(p1).toString('base64')}${ConstantEnum.GTPLACEHOLDER}`;
    });
  }
}