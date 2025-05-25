import * as assert from 'assert';
import { MateCatFilter } from '../src/MateCatFilter';
import { FeatureSet } from './mocks/FeatureSet';
import { CTypeEnum } from '../src/enums/CTypeEnum';
import { ConstantEnum } from '../src/enums/ConstantEnum';
import { describe, it } from 'node:test';

describe('SpecialHtmlEntitiesTest', () => {

  const getFilterInstance = () => {
    (MateCatFilter as any).instance = null; // for isolation test
    return MateCatFilter.getInstance(new FeatureSet(), 'en-US', 'it-IT');
  };

  it('testHtmlNbspInHtmlEncoding', () => {
    const filter = getFilterInstance();
    const segment = "This is &amp;nbsp; in html, but we are in xml ( double encode )";
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testRealNbspInXliff', () => {
    const filter = getFilterInstance();
    const segment = "This is a real non-breaking space in xliff";
    const segment_UI = `This is a real non-breaking space ${ConstantEnum.nbspPlaceholder} in xliff`;
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testUnsupportedXmlEntities', () => {
    const filter = getFilterInstance();
    const segment = "These are <p> some chars \n \r\n \t inside an xliff";
    const expected_db_segment = "These are <p> some chars &#10; &#13;&#10; &#09; inside an xliff";
    const segment_UI = `These are <ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O3AmZ3Q7"/> some chars ${ConstantEnum.lfPlaceholder} ${ConstantEnum.crPlaceholder}${ConstantEnum.lfPlaceholder} ${ConstantEnum.tabPlaceholder} inside an xliff`;
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(database_segment);
    const segmentL2 = filter.fromLayer0ToLayer2(database_segment);
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(database_segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(database_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(expected_db_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testQuotesNoEntities', () => {
    const filter = getFilterInstance();
    const segment = "These are quotes inside an xliff: ' \"";
    const expected_db_segment = "These are quotes inside an xliff: ' \"";
    const segment_UI = "These are quotes inside an xliff: ' \"";
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(database_segment);
    const segmentL2 = filter.fromLayer0ToLayer2(database_segment);
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(database_segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(database_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(expected_db_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testQuotesAsEntities', () => {
    const filter = getFilterInstance();
    const segment = "These are quotes inside a xliff: ' \"";
    const expected_db_segment = "These are quotes inside a xliff: ' \"";
    const segment_UI = 'These are quotes inside a xliff: \' "';
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(database_segment);
    const segmentL2 = filter.fromLayer0ToLayer2(database_segment);
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(database_segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(database_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(expected_db_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testQuotesAsEncodedEntities', () => {
    const filter = getFilterInstance();
    const segment = "These are quotes inside a html encoded in a xliff: &apos; &quot;";
    const expected_db_segment = "These are quotes inside a html encoded in a xliff: &apos; &quot;";
    const segment_UI = 'These are quotes inside a html encoded in a xliff: &apos; &quot;';
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(database_segment);
    const segmentL2 = filter.fromLayer0ToLayer2(database_segment);
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(database_segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(database_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(expected_db_segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testDangerousChars', () => {
    const filter = getFilterInstance();
    let segment = `These dangerous characters in a xliff: '${String.fromCharCode(0X07)}'(Bell) '${String.fromCharCode(0X7F)}'(Delete) '${String.fromCharCode(0X18)}'(Cancel)`;
    let expected_db_segment = "These dangerous characters in a xliff: ''(Bell) ''(Delete) ''(Cancel)";
    let database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);

    segment = "These dangerous characters in a xliff: '&#07;'(Bell) '&#127;'(Delete) '&#24;'(Cancel)";
    expected_db_segment = "These dangerous characters in a xliff: ''(Bell) ''(Delete) ''(Cancel)";
    database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);

    segment = "These dangerous characters in a xliff: '&#x07;'(Bell) '&#x7F;'(Delete) '&#x18;'(Cancel)";
    expected_db_segment = "These dangerous characters in a xliff: ''(Bell) ''(Delete) ''(Cancel)";
    database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(expected_db_segment, database_segment);
  });

  it('testSomeMultipleEncodings', () => {
    const filter = getFilterInstance();
    const segment = "<h1>This is a title</h1> <p><ph id='123'/>This is a snippet of <code> &lt;div&gt;Snippet&lt;/div&gt; </p>";
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testFoolishEncodingLevels', () => {
    const filter = getFilterInstance();
    const segment = "&amp;amp;amp;lt;p&amp;amp;amp;gt; &amp;nbsp; ' ' ";
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testEmojiHandling', () => {
    const filter = getFilterInstance();
    const segment = "Questo &#10005; è un emoji a croce &#1048918;&#129689; manina &#128075;&#127995;";
    const database_segment = filter.fromRawXliffToLayer0(segment);
    assert.strictEqual(segment, database_segment);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segment, filter.fromLayer1ToLayer0(segmentL1));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });
});