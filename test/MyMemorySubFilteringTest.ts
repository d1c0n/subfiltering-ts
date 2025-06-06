import * as assert from 'assert';
import { MyMemoryFilter } from '../src/MyMemoryFilter';
import { FeatureSet } from './mocks/FeatureSet';
import { CTypeEnum } from '../src/enums/CTypeEnum';
import { ConstantEnum } from '../src/enums/ConstantEnum';
import { describe, it } from 'node:test';

describe('MyMemorySubFilteringTest', () => {

  const getFilterInstance = () => {
    (MyMemoryFilter as any).instance = null; // for isolation test
    return MyMemoryFilter.getInstance(new FeatureSet(), 'en-US', 'it-IT', {});
  };

  it('testSingleCurlyBrackets', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = "This is a {placeholder}";
    const segmentL1 = filter.fromLayer0ToLayer1(segment, 'roblox');
    const string_from_UI = `This is a <ph id="mtc_1" ctype="${CTypeEnum.CURLY_BRACKETS}" equiv-text="base64:e3BsYWNlaG9sZGVyfQ=="/>`;
    assert.strictEqual(string_from_UI, segmentL1);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
  });

  it('testVariablesWithHTML', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'Airbnb account.%{\\n}%{&lt;br&gt;}%{\\n}1) From ';
    const segment_from_UI = `Airbnb account.<ph id="mtc_1" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:JXtcbn0="/>%{<ph id="mtc_2" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2JyJmd0Ow=="/>}<ph id="mtc_3" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:JXtcbn0="/>1) From `;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    // assert.strictEqual(filter.fromLayer0ToLayer1(db_segment, 'airbnb'), segment_from_UI);
  });

  it('testSinglePercentageSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This syntax %this_is_a_variable% is no more valid';
    const segment_from_UI = 'This syntax %this_is_a_variable% is no more valid';
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testDoublePercentageSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This syntax %%customer.first_name%% is still valid';
    const segment_from_UI = `This syntax <ph id="mtc_1" ctype="${CTypeEnum.PERCENTAGES}" equiv-text="base64:JSVjdXN0b21lci5maXJzdF9uYW1lJSU="/> is still valid`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testSingleSnailSyntax', {skip: false}, () => {
    let filter = getFilterInstance();
    let db_segment = 'This syntax @this is a variable@ is not valid';
    let segment_from_UI = 'This syntax @this is a variable@ is not valid';
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
    filter = getFilterInstance();
    db_segment = 'This syntax @this_is_a_variable@ is no more valid';
    segment_from_UI = 'This syntax @this_is_a_variable@ is no more valid';
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testDoubleSnailSyntax', {skip: false}, () => {
    let filter = getFilterInstance();
    let db_segment = 'This syntax @@this is a variable@@ is not valid';
    let segment_from_UI = 'This syntax @@this is a variable@@ is not valid';
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
    filter = getFilterInstance();
    db_segment = 'This syntax @@this_is_a_variable@@ is valid';
    segment_from_UI = `This syntax <ph id="mtc_1" ctype="${CTypeEnum.SNAILS}" equiv-text="base64:QEB0aGlzX2lzX2FfdmFyaWFibGVAQA=="/> is valid`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testPercentDoubleCurlyBracketsSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'Save up to {{|discount|}} with these hotels';
    const segment_from_UI = `Save up to <ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:e3t8ZGlzY291bnR8fX0="/> with these hotels`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testPercentSnailSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string: %@ is a IOS placeholder %@.';
    const segment_from_UI = `This string: <ph id="mtc_1" ctype="${CTypeEnum.PERCENT_SNAILS}" equiv-text="base64:JUA="/> is a IOS placeholder <ph id="mtc_2" ctype="${CTypeEnum.PERCENT_SNAILS}" equiv-text="base64:JUA="/>.`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testPercentNumberSnailSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string: %12$@ is a IOS placeholder %1$@ %14343$@';
    const segment_from_UI = `This string: <ph id="mtc_1" ctype="${CTypeEnum.PERCENT_NUMBER_SNAILS}" equiv-text="base64:JTEyJEA="/> is a IOS placeholder <ph id="mtc_2" ctype="${CTypeEnum.PERCENT_NUMBER_SNAILS}" equiv-text="base64:JTEkQA=="/> <ph id="mtc_3" ctype="${CTypeEnum.PERCENT_NUMBER_SNAILS}" equiv-text="base64:JTE0MzQzJEA="/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testDecodeInternalEncodedXliffTags', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = '&lt;x id="1"/&gt;&lt;g id="2"&gt;As soon as the tickets are available to the sellers, they will be able to execute the transfer to you. ';
    const segment_received = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3ggaWQ9IjEiLyZndDs="/><ph id="mtc_2" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2cgaWQ9IjIiJmd0Ow=="/>As soon as the tickets are available to the sellers, they will be able to execute the transfer to you. `;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_received), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_received);
  });

  it('testWithDoubleSquareBrackets', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string contains [[placeholder]]';
    const segment_from_UI = `This string contains <ph id="mtc_1" ctype="${CTypeEnum.DOUBLE_SQUARE_BRACKETS}" equiv-text="base64:W1twbGFjZWhvbGRlcl1d"/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  // public function testWithDoubleUnderscore()
  // {
  //     const filter = getFilterInstance();
  //
  //     const db_segment = 'This string contains __placeholder_one__';
  //     const segment_from_UI = 'This string contains <ph id="mtc_1" ctype="'.CTypeEnum::DOUBLE_UNDERSCORE.'" equiv-text="base64:X19wbGFjZWhvbGRlcl9vbmVfXw=="/>';
  //
  //     assert.strictEqual( db_segment, filter.fromLayer1ToLayer0( segment_from_UI ) );
  //     assert.strictEqual( segment_from_UI, filter.fromLayer0ToLayer1( db_segment ) );
  // }

  it('testWithDollarCurlyBrackets', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string contains ${placeholder_one}';
    const segment_from_UI = `This string contains <ph id="mtc_1" ctype="${CTypeEnum.DOLLAR_CURLY_BRACKETS}" equiv-text="base64:JHtwbGFjZWhvbGRlcl9vbmV9"/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testWithSquareSprintf', {skip: false}, () => {
    const filter = getFilterInstance();
    const tags = [
      '[%s]',
            '[%1$s]',
            '[%222$s]',
            '[%s:name]',
            '[%s:placeholder]',
            '[%s:place_holder]',
            '[%i]',
            '[%1$i]',
            '[%222$i]',
            '[%i:name]',
            '[%i:placeholder]',
            '[%i:place_holder]',
            '[%f]',
            '[%.2f]',
            '[%.2332f]',
            '[%1$.2f]',
            '[%23$.24343f]',
            '[%.222f:name]',
            '[%.2f:placeholder]',
            '[%.2f:place_holder]',
            '[%key_id:1234%]',
            '[%test:1234%]',
            '[%.2f:placeholder]',
            '[%1$s:placeholder]',
            '[%1$i:placeholder]',
            '[%f:placeholder]',
            '[%1$.2f:placeholder]'
    ];
    for (const tag of tags) {
      const db_segment = 'Ciao ' + tag;
      const segment_from_UI = `Ciao <ph id="mtc_1" ctype="${CTypeEnum.SQUARE_SPRINTF}" equiv-text="base64:${Buffer.from(tag).toString('base64')}"/>`;
      assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
      assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
    }
  });
});