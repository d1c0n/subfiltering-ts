import { notAllowed as allNotAllowed } from './language/all/notAllowed';
import { notAllowed as azAZNotAllowed } from './language/az-AZ/notAllowed';
import { notAllowed as heILNotAllowed } from './language/he-IL/notAllowed';
import { notAllowed as huHUNotAllowed } from './language/hu-HU/notAllowed';
import { notAllowed as trTRNotAllowed } from './language/tr-TR/notAllowed';

interface NotAllowedItem {
  type: 'exact' | 'regex';
  value: string;
}

export class SprintfLocker {
  private static readonly PRE_LOCK_TAG = '_____########';
  private static readonly POST_LOCK_TAG = '########_____';

  private source: string | null;
  private target: string | null;
  private notAllowedMap: NotAllowedItem[] = [];
  private replacementMap: { [key: string]: string } = {};

  constructor(source: string | null = null, target: string | null = null) {
    this.source = source;
    this.target = target;
    this.notAllowedMap = this.createNotAllowedMap();
  }

  private createNotAllowedMap(): NotAllowedItem[] {
    let map: NotAllowedItem[] = [];
    map = map.concat(allNotAllowed.map(item => ({ type: 'exact', value: item })));

    if (this.source) {
      switch (this.source) {
        case 'az-AZ':
          map = map.concat(azAZNotAllowed.map(item => ({ type: 'regex', value: item.regex })));
          break;
        case 'he-IL':
          map = map.concat(heILNotAllowed.map(item => ({ type: 'exact', value: item.exact })));
          break;
        case 'hu-HU':
          map = map.concat(huHUNotAllowed.map(item => ({ type: 'regex', value: item.regex })));
          break;
        case 'tr-TR':
          map = map.concat(trTRNotAllowed.map(item => ({ type: 'exact', value: item.exact })));
          break;
        default:
          break;
      }
    }

    if (this.target) {
      switch (this.target) {
        case 'az-AZ':
          map = map.concat(azAZNotAllowed.map(item => ({ type: 'regex', value: item.regex })));
          break;
        case 'he-IL':
          map = map.concat(heILNotAllowed.map(item => ({ type: 'exact', value: item.exact })));
          break;
        case 'hu-HU':
          map = map.concat(huHUNotAllowed.map(item => ({ type: 'regex', value: item.regex })));
          break;
        case 'tr-TR':
          map = map.concat(trTRNotAllowed.map(item => ({ type: 'exact', value: item.exact })));
          break;
        default:
          break;
      }
    }

    return map;
  }

  public lock(segment: string): string {
    const replacementMap = this.createReplacementMap(segment);
    this.replacementMap = replacementMap;
    let lockedSegment = segment;
    for (const key in replacementMap) {
      if (Object.prototype.hasOwnProperty.call(replacementMap, key)) {
        lockedSegment = lockedSegment.split(key).join(replacementMap[key]);
      }
    }
    return lockedSegment;
  }

  public unlock(segment: string): string {
    let unlockedSegment = segment;
    for (const key in this.replacementMap) {
      if (Object.prototype.hasOwnProperty.call(this.replacementMap, key)) {
        unlockedSegment = unlockedSegment.split(this.replacementMap[key]).join(key);
      }
    }
    return unlockedSegment;
  }

  private createReplacementMap(segment: string): { [key: string]: string } {
    const replacementMap: { [key: string]: string } = {};
    for (const item of this.notAllowedMap) {
      if (item.type === 'exact') {
        replacementMap[item.value] = SprintfLocker.PRE_LOCK_TAG + this.maskString(item.value) + SprintfLocker.POST_LOCK_TAG;
      } else if (item.type === 'regex') {
        const regex = new RegExp(item.value, 'g');
        let match;
        while ((match = regex.exec(segment)) !== null) {
          replacementMap[match[0]] = SprintfLocker.PRE_LOCK_TAG + this.maskString(match[0]) + SprintfLocker.POST_LOCK_TAG;
        }
      }
    }
    return replacementMap;
  }

  private maskString(str: string): string {
    return str.replace(/[%_-]/g, '');
  }
}