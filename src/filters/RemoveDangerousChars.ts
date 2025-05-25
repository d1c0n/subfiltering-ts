import { AbstractHandler } from '../commons/AbstractHandler';

export class RemoveDangerousChars extends AbstractHandler {
  public transform(segment: string): string {
    // clean invalid xml entities ( characters with ascii < 32 and different from 0A, 0D and 09
    const regexpHexEntity = /&#x(0[0-8BCEF]|1[0-9A-F]|7F);/gu;
    const regexpEntity = /&#(0[0-8]|1[1-2]|1[4-9]|2[0-9]|3[0-1]|127);/gu;
    // remove binary chars in some xliff files
    const regexpAscii = /[\u{00}-\u{08}\u{0B}\u{0C}\u{0E}-\u{1F}\u{7F}]/gu;

    segment = segment.replace(regexpAscii, '');
    segment = segment.replace(regexpHexEntity, '');
    segment = segment.replace(regexpEntity, '');

    return segment;
  }
}