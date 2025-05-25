import { AbstractHandler } from '../commons/AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class RestoreXliffTagsContent extends AbstractHandler {
  public transform(segment: string): string {
    segment = segment.replace(new RegExp(`${ConstantEnum.LTPLACEHOLDER}(.*?)${ConstantEnum.GTPLACEHOLDER}`, 'gu'), (match, p1) => {
      const decodedMatch = Buffer.from(p1, 'base64').toString('utf8');
      return `${ConstantEnum.LTPLACEHOLDER}${decodedMatch}${ConstantEnum.GTPLACEHOLDER}`;
    });
    return segment;
  }
}