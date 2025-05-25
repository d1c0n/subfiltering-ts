import * as assert from 'assert';
import { MateCatFilter } from '../src/MateCatFilter';
import { FeatureSet } from './mocks/FeatureSet';
import { CTypeEnum } from '../src/enums/CTypeEnum';
import { describe, it } from 'node:test';

describe('SprintfTest', () => {

  const runTests = (notAllowed: { [key: string]: CTypeEnum }, languageToTest: string) => {
    for (const placeholder in notAllowed) {
      if (Object.prototype.hasOwnProperty.call(notAllowed, placeholder)) {
        (MateCatFilter as any).instance = null; // Destroy instance for isolation
        const filter = MateCatFilter.getInstance(new FeatureSet(), 'en-US', languageToTest);
        const segment = `The house ${placeholder} is red.`;
        const segmentL1 = filter.fromLayer0ToLayer1(segment);
        const segmentL2 = filter.fromLayer0ToLayer2(segment);
        assert.strictEqual(segment, segmentL1);
        assert.strictEqual(segment, segmentL2);
      }
    }
  };

  it('testForGerman', () => {
    const notAllowed = {
      '%-ige': CTypeEnum.SPRINTF,
    };
    runTests(notAllowed, 'de-AT');
  });

  it('testForHungarian', () => {
    const notAllowed = {
      '%-xxx': CTypeEnum.SPRINTF,
    };
    runTests(notAllowed, 'hu-HU');
  });

  it('testForHebrew', () => {
    const notAllowed = {
      '%s': CTypeEnum.SPRINTF,
      '%u': CTypeEnum.SPRINTF,
      '%d': CTypeEnum.SPRINTF,
      '%c': CTypeEnum.SPRINTF,
      '%x': CTypeEnum.SPRINTF,
      '%@': CTypeEnum.PERCENT_SNAILS,
    };
    runTests(notAllowed, 'he-IL');
  });

  it('testForTurkish', () => {
    const notAllowed = {
      '%s': CTypeEnum.SPRINTF,
      '%u': CTypeEnum.SPRINTF,
      '%d': CTypeEnum.SPRINTF,
      '%c': CTypeEnum.SPRINTF,
      '%x': CTypeEnum.SPRINTF,
      '%@': CTypeEnum.PERCENT_SNAILS,
    };
    runTests(notAllowed, 'tr-TR');
  });
});