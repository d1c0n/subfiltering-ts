import * as assert from 'assert';
import { MateCatFilter } from '../src/MateCatFilter';
import { FeatureSet } from '../test/mocks/FeatureSet';
import { AirbnbFeature } from '../test/mocks/features/AirbnbFeature';
import { ConstantEnum } from '../src/enums/ConstantEnum';
import { CTypeEnum } from '../src/enums/CTypeEnum';
import { Pipeline } from '../src/commons/Pipeline';
import { SmartCounts } from '../src/filters/SmartCounts';
import { SprintfToPH } from '../src/filters/SprintfToPH';
import { TwigToPh } from '../src/filters/TwigToPh';
import { describe, it } from 'node:test';

describe('MateCatSubFilteringTest', () => {

  // Helper function to get a new filter instance for isolation
  const getFilterInstance = (data_ref_map: any = {}) => {
    // Assuming MateCatFilter has a static method to reset its instance for testing isolation
    // If not, this might need adjustment in MateCatFilter.ts
    MateCatFilter.destroyInstance();
    const filter = MateCatFilter.getInstance(new FeatureSet(), 'en-US', 'it-IT', data_ref_map);
    return filter;
  };

  it('testSimpleString', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = "The house is red.";
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(segmentL2), segmentL1);
  });

  it('testHTMLStringWithApostrophe', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = "&lt;Value&gt; &lt;![CDATA[Visitez Singapour et détendez-vous sur l'île de Langkawi]]&gt; &lt;/Value&gt;";
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
  });

  it('testHtmlInXML', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '&lt;p&gt; Airbnb &amp;amp; Co. &amp;lt; <x id="1"> &lt;strong&gt;Use professional tools&lt;/strong&gt; in your &lt;a href="/users/settings?test=123&amp;amp;ciccio=1" target="_blank"&gt;';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
  });

  it('testUIHtmlInXML', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '&lt;p&gt; Airbnb &amp;amp; Co. &amp;lt; &lt;strong&gt;Use professional tools&lt;/strong&gt; in your &lt;a href="/users/settings?test=123&amp;amp;ciccio=1" target="_blank"&gt;';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    //Start test
    const string_from_UI = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3AmZ3Q7"/> Airbnb &amp;amp; Co. &amp;lt; <ph id="mtc_2" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3N0cm9uZyZndDs="/>Use professional tools<ph id="mtc_3" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0Oy9zdHJvbmcmZ3Q7"/> in your <ph id="mtc_4" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2EgaHJlZj0iL3VzZXJzL3NldHRpbmdzP3Rlc3Q9MTIzJmFtcDthbXA7Y2ljY2lvPTEiIHRhcmdldD0iX2JsYW5rIiZndDs="/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testComplexUrls', {skip: false}, () => {
    const filter = getFilterInstance();
    const fromUi = `<ph id="mtc_14" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2EgaHJlZj0iaHR0cHM6Ly9hdXRoLnViZXIuY29tL2xvZ2luLz9icmVlemVfbG9jYWxfem9uZT1kY2ExJmFtcDthbXA7bmV4dF91cmw9aHR0cHMlM0ElMkYlMkZkcml2ZXJzLnViZXIuY29tJTJGcDMlMkYmYW1wO2FtcDtzdGF0ZT00MElLeF9YR0N1OXRobEtrSUkxUmRCOFlhUVRVY0g1aE1uVnllWXJCN0lBJTNEIiZndDs="/>Partner Dashboard<ph id="mtc_15" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0Oy9hJmd0Ow=="/> to match the payment document you uploaded`;
    const expectedToDb = '&lt;a href="https://auth.uber.com/login/?breeze_local_zone=dca1&amp;amp;next_url=https%3A%2F%2Fdrivers.uber.com%2Fp3%2F&amp;amp;state=40IKx_XGCu9thlKkII1RdB8YaQTUcH5hMnVyeYrB7IA%3D"&gt;Partner Dashboard&lt;/a&gt; to match the payment document you uploaded';
    const toDb = filter.fromLayer1ToLayer0(fromUi);
    assert.strictEqual(toDb, expectedToDb);
  });

  it('testComplexXML', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '&lt;p&gt; Airbnb &amp;amp; Co. &amp;amp; <ph id="PlaceHolder1" equiv-text="{0}"/> &amp;quot; &amp;apos;<ph id="PlaceHolder2" equiv-text="/users/settings?test=123&amp;ciccio=1"/> &lt;a href="/users/settings?test=123&amp;amp;ciccio=1" target="_blank"&gt;';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3AmZ3Q7"/> Airbnb &amp;amp; Co. &amp;amp; <ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="PHBoIGlkPSJQbGFjZUhvbGRlcjEiIGVxdWl2LXRleHQ9InswfSIvPg==" equiv-text="base64:ezB9"/> &amp;quot; &amp;apos;<ph id="mtc_3" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="PHBoIGlkPSJQbGFjZUhvbGRlcjIiIGVxdWl2LXRleHQ9Ii91c2Vycy9zZXR0aW5ncz90ZXN0PTEyMyZhbXA7Y2ljY2lvPTEiLz4=" equiv-text="base64:L3VzZXJzL3NldHRpbmdzP3Rlc3Q9MTIzJmFtcDtjaWNjaW89MQ=="/> <ph id="mtc_4" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2EgaHJlZj0iL3VzZXJzL3NldHRpbmdzP3Rlc3Q9MTIzJmFtcDthbXA7Y2ljY2lvPTEiIHRhcmdldD0iX2JsYW5rIiZndDs="/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testOriginalPhContent', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'Test <ph id="PlaceHolder1">Airbnb &amp;amp; Co. &amp;amp;</ph> locked.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(segmentL1), segmentL1);
  });

  it('testGTagsWithXidAttributes', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'This is a <g id="43">test</g> (with a <g xid="068cd98d-103c-49fe-92e1-76e863f93bba" id="44">g tag with xid attribute</g>).';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const string_from_UI = 'This is a <g id="43">test</g> (with a <g xid="068cd98d-103c-49fe-92e1-76e863f93bba" id="44">g tag with xid attribute</g>).';
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testComplexHtmlFilledWithXML', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '<g id="1">To: </g><g id="2">No-foo, Farmaco (Gen) <g id="3">&lt;fa</g><g id="4">foo.bar@foo.com&gt;</g></g>';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const string_from_UI = '<g id="1">To: </g><g id="2">No-foo, Farmaco (Gen) <g id="3">&lt;fa</g><g id="4">foo.bar@foo.com&gt;</g></g>';
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testPlainTextInXMLWithNewLineFeed', {skip: false}, () => {
    // 20 Aug 2019
    // ---------------------------
    // Originally we save new lines on DB ("level 0") without any encoding.
    // This of course generates a wrong XML, because in XML the new lines does not make sense.
    // Now we store them as "&#13;" entity in the DB, and return them as "##$_0A$##" for the view level ("level 2"")

    // this was the segment from the original test
//        $original_segment = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand
//
//is &lt; 70 dB(A).';
    const filter = getFilterInstance();
    const segment = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand&#10;&#10;is &lt; 70 dB(A).';
    const expectedL1 = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand&#10;&#10;is &lt; 70 dB(A).';
    const expected_fromUI = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand##$_0A$####$_0A$##is &lt; 70 dB(A).';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(segmentL1, expectedL1);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(expected_fromUI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(expected_fromUI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(expected_fromUI), segmentL1);
  });

  it('testPlainTextInXMLWithCarriageReturn', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand&#13;&#13;is &lt; 70 dB(A).';
    const expectedL1 = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand&#13;&#13;is &lt; 70 dB(A).';
    const expectedL2 = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand##$_0D$####$_0D$##is &lt; 70 dB(A).';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL1, expectedL1);
    assert.strictEqual(segmentL2, expectedL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const string_from_UI = 'The energetically averaged emission sound level of the pressure load cycling and bursting test stand##$_0D$####$_0D$##is &lt; 70 dB(A).';
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('test_2_HtmlInXML', {skip: false}, () => {
    const filter = getFilterInstance();
    //DB segment
    const segment = '&lt;b&gt;de %1$s, &lt;/b&gt;que';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
  });

  it('test_3_HandlingNBSP', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '5 tips for creating a great   guide';
    const expectedL1 = '5 tips for creating a great   guide';
    const segment_to_UI = `5 tips for creating a great ${ConstantEnum.nbspPlaceholder} guide`;
    const string_from_UI = `5 tips for creating a great ${ConstantEnum.nbspPlaceholder} guide`;
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL1, expectedL1);
    assert.strictEqual(segmentL2, segment_to_UI);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testHTMLFromLayer2', {skip: false}, () => {
    const filter = getFilterInstance();
    const expected_segment = '&lt;b&gt;de %1$s, &lt;/b&gt;que';
    //Start test
    const string_from_UI = `&lt;b&gt;de <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JTEkcw=="/>, &lt;/b&gt;que`;
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), expected_segment);
    const string_in_layer1 = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2ImZ3Q7"/>de <ph id="mtc_2" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JTEkcw=="/>, <ph id="mtc_3" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0Oy9iJmd0Ow=="/>que`;
    assert.strictEqual(filter.fromLayer1ToLayer0(string_in_layer1), expected_segment);
  });

  it('testNbsp', {skip: false}, () => {
    const filter = getFilterInstance();
    const expected_segment = '   Test';
    const string_from_UI = ConstantEnum.nbspPlaceholder + ConstantEnum.nbspPlaceholder + ConstantEnum.nbspPlaceholder + 'Test';
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), expected_segment);
    assert.strictEqual(filter.fromLayer0ToLayer2(expected_segment), string_from_UI);
  });

  it('testNbspAsString', {skip: false}, () => {
    const filter = getFilterInstance();
    // </x> is a html snippet sent as text and encoded inside a xliff
    // &lt;/i&gt; - &nbsp; is html sent as encoded string like a lesson of html on a web page
    const database_segment = '&lt;/a&gt; - &amp;lt;/i&amp;gt; - &amp;nbsp; -      Text <g id="1">pippo</g>';
    const string_from_UI = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0Oy9hJmd0Ow=="/> - &amp;lt;/i&amp;gt; - &amp;nbsp; - ##$_A0$##    Text <g id="1">pippo</g>`;
    assert.strictEqual(filter.fromLayer0ToLayer2(database_segment), string_from_UI);
    assert.strictEqual(filter.fromLayer2ToLayer0(string_from_UI), database_segment);
  });

  it('testSprintf', {skip: false}, () => {
    let channel = new Pipeline('hu-HU', 'az-AZ');
    channel.addLast(new SprintfToPH());
    let segment = 'Legalább 10%-os befejezett foglalás 20%-dir VAGY';
    let seg_transformed = channel.transform(segment);
    assert.strictEqual(seg_transformed, segment);
    segment = 'Legalább 10%-aaa befejezett foglalás 20%-bbb VAGY';
    seg_transformed = channel.transform(segment);
    assert.strictEqual(seg_transformed, segment);
    channel = new Pipeline('hu-HU', 'it-IT');
    channel.addLast(new SprintfToPH());
    segment = 'Legalább 10%-aaa befejezett foglalás 20%-bbb VAGY';
    seg_transformed = channel.transform(segment);
    assert.strictEqual(seg_transformed, segment);
  });

  it('testXliffTagsInsideAXliffFile', {skip: false}, () => {
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const xliffTags = [
      { 'db_segment': '&lt;g id="1"&gt;', 'expected_l1_segment': `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2cgaWQ9IjEiJmd0Ow=="/>` },
      { 'db_segment': '&lt;x id="1"/&gt;', 'expected_l1_segment': `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3ggaWQ9IjEiLyZndDs="/>` },
      { 'db_segment': '&lt;pc id="1"&gt;', 'expected_l1_segment': `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3BjIGlkPSIxIiZndDs="/>` },
    ];
    xliffTags.forEach(xliffTag => {
      const db_segment = xliffTag['db_segment'];
      const expected_l1_segment = xliffTag['expected_l1_segment'];
      const expected_l2_segment = xliffTag['expected_l1_segment'];
      const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
      const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
      assert.strictEqual(l1_segment, expected_l1_segment);
      assert.strictEqual(l2_segment, expected_l2_segment);
      const back_to_db = Filter.fromLayer1ToLayer0(expected_l1_segment);
      assert.strictEqual(db_segment, back_to_db);
    });
  });

  it('testTwigFilterWithLessThan', {skip: false}, () => {
    // less than %lt;
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '{% if count &lt; 3 %}';
    const expected_l1_segment = `<ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyUgaWYgY291bnQgJmx0OyAzICV9"/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l1_segment);
    const back_to_db = Filter.fromLayer1ToLayer0(expected_l1_segment);
    assert.strictEqual(db_segment, back_to_db);
  });

  it('testTwigFilterWithLessThanAttachedToANumber', {skip: false}, () => {
    // less than %lt;
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '{% if count &lt;3 %}';
    const expected_l1_segment = `<ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyUgaWYgY291bnQgJmx0OzMgJX0="/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l1_segment);
    const back_to_db = Filter.fromLayer1ToLayer0(expected_l1_segment);
    assert.strictEqual(db_segment, back_to_db);
  });

  it('testTwigFilterWithGreaterThan', {skip: false}, () => {
    // less than %gt;
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '{% if count &gt; 3 %}';
    const expected_l1_segment = `<ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyUgaWYgY291bnQgJmd0OyAzICV9"/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l1_segment);
    const back_to_db = Filter.fromLayer1ToLayer0(expected_l1_segment);
    assert.strictEqual(db_segment, back_to_db);
  });

  it('testTwigFilterWithLessThanAndGreaterThan', {skip: false}, () => {
    // less than %lt;
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '{% if count &lt; 10 and &gt; 3 %}';
    const expected_l1_segment = `<ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyUgaWYgY291bnQgJmx0OyAxMCBhbmQgJmd0OyAzICV9"/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l1_segment);
    const back_to_db = Filter.fromLayer1ToLayer0(expected_l1_segment);
    assert.strictEqual(db_segment, back_to_db);
  });

  it('testTwigFilterWithSingleBrackets', {skip: false}, () => {
    const segment = 'Hi {this strings would not be escaped}. Instead {{this one}} is a valid twig expression. Also {%ciao%} is valid!';
    const expected = `Hi {this strings would not be escaped}. Instead <ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:e3t0aGlzIG9uZX19"/> is a valid twig expression. Also <ph id="mtc_2" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyVjaWFvJX0="/> is valid!`;
    const channel = new Pipeline();
    channel.addLast(new TwigToPh());
    const seg_transformed = channel.transform(segment);
    assert.strictEqual(seg_transformed, expected);
  });

  it('testTwigUngreedy', {skip: false}, () => {
    const segment = 'Dear {{customer.first_name}}, This is {{agent.alias}} with Airbnb.';
    const expected = `Dear <ph id="mtc_1" ctype="${CTypeEnum.TWIG}" equiv-text="base64:e3tjdXN0b21lci5maXJzdF9uYW1lfX0="/>, This is <ph id="mtc_2" ctype="${CTypeEnum.TWIG}" equiv-text="base64:e3thZ2VudC5hbGlhc319"/> with Airbnb.`;
    const channel = new Pipeline();
    channel.addLast(new TwigToPh());
    const seg_transformed = channel.transform(segment);
    assert.strictEqual(seg_transformed, expected);
  });

  it('testPhWithoutDataRef', {skip: false}, () => {
    const db_segment = 'We can control who sees %s content when with <ph id="source1" dataRef="source1"/>Visibility Constraints.';
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const expected_l1_segment = `We can control who sees <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JXM="/> content when with <ph id="source1" dataRef="source1"/>Visibility Constraints.`;
    const expected_l2_segment = `We can control who sees <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JXM="/> content when with <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIi8+"/>Visibility Constraints.`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(expected_l1_segment, l1_segment);
    assert.strictEqual(expected_l2_segment, l2_segment);
    // Persistance test
    const from_UI = `Saame nähtavuse piirangutega kontrollida, <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JXM="/> kes sisu näeb .<ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIi8+"/>`;
    const exptected_db_segment = 'Saame nähtavuse piirangutega kontrollida, %s kes sisu näeb .<ph id="source1" dataRef="source1"/>';
    const back_to_db_segment = Filter.fromLayer2ToLayer0(from_UI);
    assert.strictEqual(back_to_db_segment, exptected_db_segment);
  });

  it('testsPHPlaceholderWithDataRefForAirbnb', {skip: false}, () => {
    const data_ref_map = {
      'source3' : '&lt;/a&gt;',
      'source4' : '&lt;br&gt;',
      'source5' : '&lt;br&gt;',
      'source1' : '&lt;br&gt;',
      'source2' : '&lt;a href=%s&gt;'
    };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = "Hi %s .";
    const db_translation = "Tere %s .";
    const expected_l1_segment = `Hi <ph id="mtc_1" ctype="x-sprintf" equiv-text="base64:JXM="/> .`;
    const expected_l1_translation = `Tere <ph id="mtc_1" ctype="x-sprintf" equiv-text="base64:JXM="/> .`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l1_translation = Filter.fromLayer0ToLayer1(db_translation);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    const l2_translation = Filter.fromLayer1ToLayer2(l1_translation);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l1_translation, expected_l1_translation);
    assert.strictEqual(l2_segment, expected_l1_segment);
    assert.strictEqual(l2_translation, expected_l1_translation);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    const back_to_db_translation = Filter.fromLayer1ToLayer0(l1_translation);
    assert.strictEqual(back_to_db_segment, db_segment);
    assert.strictEqual(back_to_db_translation, db_translation);
  });

  it('testPHPlaceholderWithDataRef', {skip: false}, () => {
    const data_ref_map = { 'source1': '&lt;br&gt;' };
    
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    
    const db_segment = 'Frase semplice: <ph id="source1" dataRef="source1"/>.';
    const db_translation = 'Simple sentence: <ph id="source1" dataRef="source1"/>.';
    const expected_l1_segment = 'Frase semplice: <ph id="source1" dataRef="source1"/>.';
    const expected_l1_translation = 'Simple sentence: <ph id="source1" dataRef="source1"/>.';

    const expected_l2_segment = `Frase semplice: <ph id="source1" ctype="${CTypeEnum.PH_DATA_REF}" equiv-text="base64:Jmx0O2JyJmd0Ow==" x-orig="PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIi8+"/>.`;
    const expected_l2_translation = `Simple sentence: <ph id="source1" ctype="${CTypeEnum.PH_DATA_REF}" equiv-text="base64:Jmx0O2JyJmd0Ow==" x-orig="PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIi8+"/>.`;
    
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l1_translation = Filter.fromLayer0ToLayer1(db_translation);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    const l2_translation = Filter.fromLayer1ToLayer2(l1_translation);
    
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l1_translation, expected_l1_translation);
    assert.strictEqual(l2_segment, expected_l2_segment);
    assert.strictEqual(l2_translation, expected_l2_translation);

    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    const back_to_db_translation = Filter.fromLayer1ToLayer0(l1_translation);

    assert.strictEqual(back_to_db_segment, db_segment);
    assert.strictEqual(back_to_db_translation, db_translation);
  });

  it('testWithTwoPCTagsWithLessThanBetweenThem', {skip: false}, () => {
    const data_ref_map = { "source1": "<br>", "source2": "<hr>" };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = '<pc id="source1" dataRefStart="source1">&lt;<pc id="source2" dataRefStart="source2">Rider /&gt;</pc></pc>';
    const expected_l1_segment = '<pc id="source1" dataRefStart="source1">&lt;<pc id="source2" dataRefStart="source2">Rider /&gt;</pc></pc>';
    const expected_l2_segment = `<ph id="source1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGJyPg==" x-orig="PHBjIGlkPSJzb3VyY2UxIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTEiPg=="/>&lt;<ph id="source2_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGhyPg==" x-orig="PHBjIGlkPSJzb3VyY2UyIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTIiPg=="/>Rider /&gt;<ph id="source2_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGhyPg==" x-orig="PC9wYz4="/><ph id="source1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGJyPg==" x-orig="PC9wYz4="/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l2_segment);
  });

  it('testPCWithComplexDataRefMap', {skip: false}, () => {
    const data_ref_map = {
      "source3" : "<g id=\"jcP-TFFSO2CSsuLt\" ctype=\"x-html-strong\" \\/>",
      "source4" : "<g id=\"5StCYYRvqMc0UAz4\" ctype=\"x-html-ul\" \\/>",
      "source5" : "<g id=\"99phhJcEQDLHBjeU\" ctype=\"x-html-li\" \\/>",
      "source1" : "<g id=\"lpuxniQlIW3KrUyw\" ctype=\"x-html-p\" \\/>",
      "source6" : "<g id=\"0HZug1d3LkXJU04E\" ctype=\"x-html-li\" \\/>",
      "source2" : "<g id=\"d3TlPtomlUt0Ej1k\" ctype=\"x-html-p\" \\/>",
      "source7" : "<g id=\"oZ3oW_0KaicFXFDS\" ctype=\"x-html-li\" \\/>"
    };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = '<pc id="source1" dataRefStart="source1">Click the image on the left, read the information and then select the contact type that would replace the red question mark.</pc><pc id="source2" dataRefStart="source2"><pc id="source3" dataRefStart="source3">Things to consider:</pc></pc><pc id="source4" dataRefStart="source4"><pc id="source5" dataRefStart="source5">The rider stated the car had a different tag from another state.</pc><pc id="source6" dataRefStart="source6">The rider stated the car had a color from the one registered in Bliss.</pc><pc id="source7" dataRefStart="source7">The rider can’t tell if the driver matched the profile picture.</pc></pc>';
    const expected_l1_segment = '<pc id="source1" dataRefStart="source1">Click the image on the left, read the information and then select the contact type that would replace the red question mark.</pc><pc id="source2" dataRefStart="source2"><pc id="source3" dataRefStart="source3">Things to consider:</pc></pc><pc id="source4" dataRefStart="source4"><pc id="source5" dataRefStart="source5">The rider stated the car had a different tag from another state.</pc><pc id="source6" dataRefStart="source6">The rider stated the car had a color from the one registered in Bliss.</pc><pc id="source7" dataRefStart="source7">The rider can’t tell if the driver matched the profile picture.</pc></pc>';
    const expected_l2_segment = `<ph id="source1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9ImxwdXhuaVFsSVczS3JVeXciIGN0eXBlPSJ4LWh0bWwtcCIgXC8+" x-orig="PHBjIGlkPSJzb3VyY2UxIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTEiPg=="/>Click the image on the left, read the information and then select the contact type that would replace the red question mark.<ph id="source1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9ImxwdXhuaVFsSVczS3JVeXciIGN0eXBlPSJ4LWh0bWwtcCIgXC8+" x-orig="PC9wYz4="/><ph id="source2_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9ImQzVGxQdG9tbFV0MEVqMWsiIGN0eXBlPSJ4LWh0bWwtcCIgXC8+" x-orig="PHBjIGlkPSJzb3VyY2UyIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTIiPg=="/><ph id="source3_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9ImpjUC1URkZTTzJDU3N1THQiIGN0eXBlPSJ4LWh0bWwtc3Ryb25nIiBcLz4=" x-orig="PHBjIGlkPSJzb3VyY2UzIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTMiPg=="/>Things to consider:<ph id="source3_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9ImpjUC1URkZTTzJDU3N1THQiIGN0eXBlPSJ4LWh0bWwtc3Ryb25nIiBcLz4=" x-orig="PC9wYz4="/><ph id="source2_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9ImQzVGxQdG9tbFV0MEVqMWsiIGN0eXBlPSJ4LWh0bWwtcCIgXC8+" x-orig="PC9wYz4="/><ph id="source4_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9IjVTdENZWVJ2cU1jMFVBejQiIGN0eXBlPSJ4LWh0bWwtdWwiIFwvPg==" x-orig="PHBjIGlkPSJzb3VyY2U0IiBkYXRhUmVmU3RhcnQ9InNvdXJjZTQiPg=="/><ph id="source5_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9Ijk5cGhoSmNFUURMSEJqZVUiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PHBjIGlkPSJzb3VyY2U1IiBkYXRhUmVmU3RhcnQ9InNvdXJjZTUiPg=="/>The rider stated the car had a different tag from another state.<ph id="source5_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9Ijk5cGhoSmNFUURMSEJqZVUiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PC9wYz4="/><ph id="source6_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9IjBIWnVnMWQzTGtYSlUwNEUiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PHBjIGlkPSJzb3VyY2U2IiBkYXRhUmVmU3RhcnQ9InNvdXJjZTYiPg=="/>The rider stated the car had a color from the one registered in Bliss.<ph id="source6_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9IjBIWnVnMWQzTGtYSlUwNEUiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PC9wYz4="/><ph id="source7_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:PGcgaWQ9Im9aM29XXzBLYWljRlhGRFMiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PHBjIGlkPSJzb3VyY2U3IiBkYXRhUmVmU3RhcnQ9InNvdXJjZTciPg=="/>The rider can’t tell if the driver matched the profile picture.<ph id="source7_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9Im9aM29XXzBLYWljRlhGRFMiIGN0eXBlPSJ4LWh0bWwtbGkiIFwvPg==" x-orig="PC9wYz4="/><ph id="source4_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:PGcgaWQ9IjVTdENZWVJ2cU1jMFVBejQiIGN0eXBlPSJ4LWh0bWwtdWwiIFwvPg==" x-orig="PC9wYz4="/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l2_segment);
    const back_to_db_segment_from_l1 = Filter.fromLayer1ToLayer0(l1_segment);
    assert.strictEqual(back_to_db_segment_from_l1, db_segment);
    const back_to_db_segment_from_l2 = Filter.fromLayer2ToLayer0(l2_segment);
    assert.strictEqual(back_to_db_segment_from_l2, db_segment);
  });

  it('testPCWithoutAnyDataRefMap', {skip: false}, () => {
    const data_ref_map = {};
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = 'Practice using <pc id="1b" type="fmt" subType="m:b">coaching frameworks</pc> and skills with peers and coaches in a safe learning environment.';
    const expected_l1_segment = 'Practice using <pc id="1b" type="fmt" subType="m:b">coaching frameworks</pc> and skills with peers and coaches in a safe learning environment.';
    const expected_l2_segment = `Practice using <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PC_OPEN_NO_DATA_REF}" equiv-text="base64:PHBjIGlkPSIxYiIgdHlwZT0iZm10IiBzdWJUeXBlPSJtOmIiPg=="/>coaching frameworks<ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_PC_CLOSE_NO_DATA_REF}" equiv-text="base64:PC9wYz4="/> and skills with peers and coaches in a safe learning environment.`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l2_segment);
    const back_to_db_segment_from_l1 = Filter.fromLayer1ToLayer0(l1_segment);
    assert.strictEqual(back_to_db_segment_from_l1, db_segment);
  });

  it('testMostSimpleCaseOfPC', {skip: false}, () => {
    const data_ref_map = { 'd1': '_' };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = 'Testo libero contenente <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d1" dataRefStart="d1">corsivo</pc>.';
    const db_translation = 'Free text containing <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d1" dataRefStart="d1">curvise</pc>.';
    const expected_l1_segment = 'Testo libero contenente <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d1" dataRefStart="d1">corsivo</pc>.';
    const expected_l1_translation = 'Free text containing <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d1" dataRefStart="d1">curvise</pc>.';
    const expected_l2_segment = `Testo libero contenente <ph id="1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:Xw==" x-orig="PHBjIGlkPSIxIiBjYW5Db3B5PSJubyIgY2FuRGVsZXRlPSJubyIgZGF0YVJlZkVuZD0iZDEiIGRhdGFSZWZTdGFydD0iZDEiPg=="/>corsivo<ph id="1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:Xw==" x-orig="PC9wYz4="/>.`;
    const expected_l2_translation = `Free text containing <ph id="1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:Xw==" x-orig="PHBjIGlkPSIxIiBjYW5Db3B5PSJubyIgY2FuRGVsZXRlPSJubyIgZGF0YVJlZkVuZD0iZDEiIGRhdGFSZWZTdGFydD0iZDEiPg=="/>curvise<ph id="1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:Xw==" x-orig="PC9wYz4="/>.`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l1_translation = Filter.fromLayer0ToLayer1(db_translation);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    const l2_translation = Filter.fromLayer1ToLayer2(l1_translation);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l1_translation, expected_l1_translation);
    assert.strictEqual(l2_segment, expected_l2_segment);
    assert.strictEqual(l2_translation, expected_l2_translation);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    const back_to_db_translation = Filter.fromLayer1ToLayer0(l1_translation);
    assert.strictEqual(back_to_db_segment, db_segment);
    assert.strictEqual(back_to_db_translation, db_translation);
  });

  it('testDoublePCPlaceholderWithDataRef', {skip: false}, () => {
    const data_ref_map = { 'd1': '[', 'd2': '](http://repubblica.it)' };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = 'Link semplice: <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d2" dataRefStart="d1">La Repubblica</pc>.';
    const db_translation = 'Simple link: <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d2" dataRefStart="d1">La Repubblica</pc>.';
    const expected_l1_segment = 'Link semplice: <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d2" dataRefStart="d1">La Repubblica</pc>.';
    const expected_l1_translation = 'Simple link: <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d2" dataRefStart="d1">La Repubblica</pc>.';
    const expected_l2_segment = `Link semplice: <ph id="1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:Ww==" x-orig="PHBjIGlkPSIxIiBjYW5Db3B5PSJubyIgY2FuRGVsZXRlPSJubyIgZGF0YVJlZkVuZD0iZDIiIGRhdGFSZWZTdGFydD0iZDEiPg=="/>La Repubblica<ph id="1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:XShodHRwOi8vcmVwdWJibGljYS5pdCk=" x-orig="PC9wYz4="/>.`;
    const expected_l2_translation = `Simple link: <ph id="1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:Ww==" x-orig="PHBjIGlkPSIxIiBjYW5Db3B5PSJubyIgY2FuRGVsZXRlPSJubyIgZGF0YVJlZkVuZD0iZDIiIGRhdGFSZWZTdGFydD0iZDEiPg=="/>La Repubblica<ph id="1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:XShodHRwOi8vcmVwdWJibGljYS5pdCk=" x-orig="PC9wYz4="/>.`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l1_translation = Filter.fromLayer0ToLayer1(db_translation);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    const l2_translation = Filter.fromLayer1ToLayer2(l1_translation);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l1_translation, expected_l1_translation);
    assert.strictEqual(l2_segment, expected_l2_segment);
    assert.strictEqual(l2_translation, expected_l2_translation);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    const back_to_db_translation = Filter.fromLayer1ToLayer0(l1_translation);
    assert.strictEqual(back_to_db_segment, db_segment);
    assert.strictEqual(back_to_db_translation, db_translation);
  });

  it('testWithPCTagsWithAndWithoutDataRefInTheSameSegment', {skip: false}, () => {
    const data_ref_map = { 'source1': 'x' };
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', data_ref_map);
    const db_segment = 'Text <pc id="source1" dataRefStart="source1" dataRefEnd="source1"><pc id="1u" type="fmt" subType="m:u">link</pc></pc>.';
    const db_translation = 'Testo <pc id="source1" dataRefStart="source1" dataRefEnd="source1"><pc id="1u" type="fmt" subType="m:u">link</pc></pc>.';
    const expected_l1_segment = 'Text <pc id="source1" dataRefStart="source1" dataRefEnd="source1"><pc id="1u" type="fmt" subType="m:u">link</pc></pc>.';
    const expected_l1_translation = 'Testo <pc id="source1" dataRefStart="source1" dataRefEnd="source1"><pc id="1u" type="fmt" subType="m:u">link</pc></pc>.';
    const expected_l2_segment = `Text <ph id="source1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:eA==" x-orig="PHBjIGlkPSJzb3VyY2UxIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTEiIGRhdGFSZWZFbmQ9InNvdXJjZTEiPg=="/><ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PC_OPEN_NO_DATA_REF}" equiv-text="base64:PHBjIGlkPSIxdSIgdHlwZT0iZm10IiBzdWJUeXBlPSJtOnUiPg=="/>link<ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_PC_CLOSE_NO_DATA_REF}" equiv-text="base64:PC9wYz4="/><ph id="source1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:eA==" x-orig="PC9wYz4="/>.`;
    const expected_l2_translation = `Testo <ph id="source1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:eA==" x-orig="PHBjIGlkPSJzb3VyY2UxIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTEiIGRhdGFSZWZFbmQ9InNvdXJjZTEiPg=="/><ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PC_OPEN_NO_DATA_REF}" equiv-text="base64:PHBjIGlkPSIxdSIgdHlwZT0iZm10IiBzdWJUeXBlPSJtOnUiPg=="/>link<ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_PC_CLOSE_NO_DATA_REF}" equiv-text="base64:PC9wYz4="/><ph id="source1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:eA==" x-orig="PC9wYz4="/>.`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l1_translation = Filter.fromLayer0ToLayer1(db_translation);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    const l2_translation = Filter.fromLayer1ToLayer2(l1_translation);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l1_translation, expected_l1_translation);
    assert.strictEqual(l2_segment, expected_l2_segment);
    assert.strictEqual(l2_translation, expected_l2_translation);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    const back_to_db_translation = Filter.fromLayer1ToLayer0(l1_translation);
    assert.strictEqual(back_to_db_segment, db_segment);
    assert.strictEqual(back_to_db_translation, db_translation);
  });

  it('testDontTouchAlreadyParsedPhTags', {skip: false}, () => {
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const segment = 'Frase semplice: <ph id="source1" dataRef="source1" equiv-text="base64:Jmx0O2JyJmd0Ow=="/>.';
    const expected = 'Frase semplice: <ph id="source1" dataRef="source1" equiv-text="base64:Jmx0O2JyJmd0Ow=="/>.';
    const l2_segment = Filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(expected, l2_segment);
  });

  it('testHtmlStringsWithDataTypeAttribute', {skip: false}, () => {
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '&lt;span data-type="hotspot" class="hotspotOnImage" style="position: relative;display: inline-block;max-width: 100%"&gt;';
    const expected_l1_segment = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3NwYW4gZGF0YS10eXBlPSJob3RzcG90IiBjbGFzcz0iaG90c3BvdE9uSW1hZ2UiIHN0eWxlPSJwb3NpdGlvbjogcmVsYXRpdmU7ZGlzcGxheTogaW5saW5lLWJsb2NrO21heC13aWR0aDogMTAwJSImZ3Q7"/>`;
    const expected_l2_segment = `<ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O3NwYW4gZGF0YS10eXBlPSJob3RzcG90IiBjbGFzcz0iaG90c3BvdE9uSW1hZ2UiIHN0eWxlPSJwb3NpdGlvbjogcmVsYXRpdmU7ZGlzcGxheTogaW5saW5lLWJsb2NrO21heC13aWR0aDogMTAwJSImZ3Q7"/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(l1_segment, expected_l1_segment);
    assert.strictEqual(l2_segment, expected_l2_segment);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    assert.strictEqual(back_to_db_segment, db_segment);
  });

  it('testPhTagsWithoutDataRef', {skip: false}, () => {
    const Filter = MateCatFilter.getInstance(new FeatureSet(), 'en-EN', 'et-ET', []);
    const db_segment = '<ph id="1j" type="other" subType="m:j"/>';
    const expected_l1_segment = '<ph id="1j" type="other" subType="m:j"/>';
    const expected_l2_segment = `<ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:PHBoIGlkPSIxaiIgdHlwZT0ib3RoZXIiIHN1YlR5cGU9Im06aiIvPg=="/>`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    const l2_segment = Filter.fromLayer1ToLayer2(l1_segment);
    assert.strictEqual(expected_l1_segment, l1_segment);
    assert.strictEqual(expected_l2_segment, l2_segment);
    const back_to_db_segment = Filter.fromLayer1ToLayer0(l1_segment);
    assert.strictEqual(back_to_db_segment, db_segment);
  });

  it('testSmartCount', {skip: false}, () => {
    const Filter = MateCatFilter.getInstance(new FeatureSet([new AirbnbFeature()]), 'en-EN', 'et-ET', []);
    const db_segment = '%{smart_count} discount||||%{smart_count} discounts';
    const segment_from_UI = `<ph id="mtc_1" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:JXtzbWFydF9jb3VudH0="/> discount<ph id="mtc_2" ctype="x-smart-count" equiv-text="base64:fHx8fA=="/><ph id="mtc_3" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:JXtzbWFydF9jb3VudH0="/> discounts`;
    const l1_segment = Filter.fromLayer0ToLayer1(db_segment);
    assert.strictEqual(Filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(Filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
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

  it('testVariablesSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'Save up to %{{|discount|}} with these hotels';
    const segment_from_UI = `Save up to <ph id="mtc_1" ctype="${CTypeEnum.PERCENT_VARIABLE}" equiv-text="base64:JXt7fGRpc2NvdW50fH19"/> with these hotels`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testPercentSnailSyntax', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string: %@ is a IOS placeholder %@.';
    const segment_from_UI = `This string: <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JUA="/> is a IOS placeholder <ph id="mtc_2" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JUA="/>.`;
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

  it('testWithMixedPercentTags', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string contains all these tags: %-4d %@ %12$@ ​%{{|discount|}} {% if count &lt; 3 %} but not this %placeholder%';
    const segment_from_UI = `This string contains all these tags: <ph id="mtc_1" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JS00ZA=="/> <ph id="mtc_2" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:JUA="/> <ph id="mtc_3" ctype="${CTypeEnum.PERCENT_NUMBER_SNAILS}" equiv-text="base64:JTEyJEA="/> ​<ph id="mtc_4" ctype="${CTypeEnum.PERCENT_VARIABLE}" equiv-text="base64:JXt7fGRpc2NvdW50fH19"/> <ph id="mtc_5" ctype="${CTypeEnum.TWIG}" equiv-text="base64:eyUgaWYgY291bnQgJmx0OyAzICV9"/> but not this %placeholder%`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

  it('testWithDoubleSquareBrackets', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'This string contains [[placeholder]]';
    const segment_from_UI = `This string contains <ph id="mtc_1" ctype="${CTypeEnum.DOUBLE_SQUARE_BRACKETS}" equiv-text="base64:W1twbGFjZWhvbGRlcl1d"/>`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
  });

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
    ];
    tags.forEach(tag => {
      const db_segment = 'Ciao ' + tag;
      const segment_from_UI = `Ciao <ph id="mtc_1" ctype="${CTypeEnum.SQUARE_SPRINTF}" equiv-text="base64:${Buffer.from(tag).toString('base64')}"/>`;
      assert.strictEqual(filter.fromLayer1ToLayer0(segment_from_UI), db_segment);
      assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), segment_from_UI);
    });
  });

  it('testTagXWithEquivTextShouldBeHandled', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'Last Successfully Logged In At: <x id="1" equiv-text="&lt;ph id=&quot;3&quot; disp=&quot;{{data}}&quot; dataRef=&quot;d1&quot; /&gt;"/>';
    const layer1And2 = `Last Successfully Logged In At: <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjEiIGVxdWl2LXRleHQ9IiZsdDtwaCBpZD0mcXVvdDszJnF1b3Q7IGRpc3A9JnF1b3Q7e3tkYXRhfX0mcXVvdDsgZGF0YVJlZj0mcXVvdDtkMSZxdW90OyAvJmd0OyIvPg==" equiv-text="base64:Jmx0O3BoIGlkPSZxdW90OzMmcXVvdDsgZGlzcD0mcXVvdDt7e2RhdGF9fSZxdW90OyBkYXRhUmVmPSZxdW90O2QxJnF1b3Q7IC8mZ3Q7"/>`;
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), layer1And2);
    assert.strictEqual(filter.fromLayer0ToLayer2(db_segment), layer1And2);
    assert.strictEqual(filter.fromLayer1ToLayer0(layer1And2), db_segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(layer1And2), db_segment);
  });

  it('testXliffInXliffWithoutId', {skip: false}, () => {
    const filter = getFilterInstance();
    const db_segment = 'Test &lt;X&gt; and &lt;/X&gt; fine.';
    const layer1And2 = `Test <ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O1gmZ3Q7"/> and <ph id="mtc_2" ctype="x-html" equiv-text="base64:Jmx0Oy9YJmd0Ow=="/> fine.`;
    assert.strictEqual(filter.fromLayer0ToLayer1(db_segment), layer1And2);
    assert.strictEqual(filter.fromLayer0ToLayer2(db_segment), layer1And2);
    assert.strictEqual(filter.fromLayer1ToLayer0(layer1And2), db_segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(layer1And2), db_segment);
  });

  it('testSmartCounts', {skip: false}, () => {
    const pipeline = new Pipeline();
    pipeline.addLast(new SmartCounts());
    const db_segment = "Test||||and |||| fine.";
    const transformed = `Test<ph id="mtc_1" ctype="${CTypeEnum.SMART_COUNT}" equiv-text="base64:fHx8fA=="/>and <ph id="mtc_2" ctype="x-smart-count" equiv-text="base64:fHx8fA=="/> fine.`;
    assert.strictEqual(pipeline.transform(db_segment), transformed);
    // revert
    const filter = getFilterInstance();
    assert.strictEqual(filter.fromLayer1ToLayer0(transformed), db_segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(transformed), db_segment);
  });

  it('testHtmlDoubleEncodedInXML', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = '<g id="123">&lt;code&gt; &amp;lt;strong&amp;gt; THIS IS TREATED AS TEXT CONTENT EVEN IF IT IS AN HTML &amp;lt;/strong&amp;gt; &lt;/code&gt;</g>';
    const expectedL1 = `<g id="123"><ph id="mtc_1" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0O2NvZGUmZ3Q7"/> &amp;lt;strong&amp;gt; THIS IS TREATED AS TEXT CONTENT EVEN IF IT IS AN HTML &amp;lt;/strong&amp;gt; <ph id="mtc_2" ctype="${CTypeEnum.HTML}" equiv-text="base64:Jmx0Oy9jb2RlJmd0Ow=="/></g>`;
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(expectedL1, segmentL1);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
  });

  it('testOriginalPhWithHtmlAttributes', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'Test <ph id="PlaceHolder1" equiv-text="&lt;ph id=&quot;3&quot; disp=&quot;{{data}}&quot; dataRef=&quot;d1&quot; /&gt;"/> locked.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `Test <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="PHBoIGlkPSJQbGFjZUhvbGRlcjEiIGVxdWl2LXRleHQ9IiZsdDtwaCBpZD0mcXVvdDszJnF1b3Q7IGRpc3A9JnF1b3Q7e3tkYXRhfX0mcXVvdDsgZGF0YVJlZj0mcXVvdDtkMSZxdW90OyAvJmd0OyIvPg==" equiv-text="base64:Jmx0O3BoIGlkPSZxdW90OzMmcXVvdDsgZGlzcD0mcXVvdDt7e2RhdGF9fSZxdW90OyBkYXRhUmVmPSZxdW90O2QxJnF1b3Q7IC8mZ3Q7"/> locked.`;
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testRealCaseMxliff', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'For the site <ph id="4" disp="{{siteId}}" dataRef="d2"/><x id="2" equiv-text="&lt;ph id=&quot;4&quot; disp=&quot;{{siteId}}&quot; dataRef=&quot;d2&quot; /&gt;"/><x id="3"/> group id <x id="4"/><x id="5"/><x id="6"/> is already associated.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `For the site <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:PHBoIGlkPSI0IiBkaXNwPSJ7e3NpdGVJZH19IiBkYXRhUmVmPSJkMiIvPg=="/><ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjIiIGVxdWl2LXRleHQ9IiZsdDtwaCBpZD0mcXVvdDs0JnF1b3Q7IGRpc3A9JnF1b3Q7e3tzaXRlSWR9fSZxdW90OyBkYXRhUmVmPSZxdW90O2QyJnF1b3Q7IC8mZ3Q7Ii8+" equiv-text="base64:Jmx0O3BoIGlkPSZxdW90OzQmcXVvdDsgZGlzcD0mcXVvdDt7e3NpdGVJZH19JnF1b3Q7IGRhdGFSZWY9JnF1b3Q7ZDImcXVvdDsgLyZndDs="/><x id="3"/> group id <x id="4"/><x id="5"/><x id="6"/> is already associated.`;
    assert.strictEqual(string_from_UI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testXtagAndXtagWithEquivText', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'Click <x id="1"/>Create Site Admin<x id="2" equiv-text="bold"/><x id="3" equiv-text="italic"/>administration<x id="4" equiv-text="italic"/> site.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `Click <x id="1"/>Create Site Admin<ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjIiIGVxdWl2LXRleHQ9ImJvbGQiLz4=" equiv-text="base64:Ym9sZA=="/><ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjMiIGVxdWl2LXRleHQ9Iml0YWxpYyIvPg==" equiv-text="base64:aXRhbGlj"/>administration<ph id="mtc_3" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjQiIGVxdWl2LXRleHQ9Iml0YWxpYyIvPg==" equiv-text="base64:aXRhbGlj"/> site.`;
    assert.strictEqual(string_from_UI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testXtagAndXtagWithEquivTextWithRandomAttributeOrder', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'Click <x id="1"/>Create Site Admin<x id="2" equiv-text="bold"/><x equiv-text="italic" id="3"/>administration<x equiv-text="italic" x-attribute="pippo-attribute" id="4"/> site.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `Click <x id="1"/>Create Site Admin<ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjIiIGVxdWl2LXRleHQ9ImJvbGQiLz4=" equiv-text="base64:Ym9sZA=="/><ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggZXF1aXYtdGV4dD0iaXRhbGljIiBpZD0iMyIvPg==" equiv-text="base64:aXRhbGlj"/>administration<ph id="mtc_3" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggZXF1aXYtdGV4dD0iaXRhbGljIiB4LWF0dHJpYnV0ZT0icGlwcG8tYXR0cmlidXRlIiBpZD0iNCIvPg==" equiv-text="base64:aXRhbGlj"/> site.`;
    assert.strictEqual(string_from_UI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testRandomPhAndXTags', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'Click <x id="1"/>Create <ph id="PlaceHolder1" equiv-text="&lt;ph id=&quot;3&quot; disp=&quot;{{data}}&quot; dataRef=&quot;d1&quot; /&gt;"/>Site Admin<x id="2" equiv-text="bold"/><ph id="111"/><x id="3" equiv-text="italic"/>administration<x id="4" equiv-text="italic"/> site.';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    const string_from_UI = `Click <x id="1"/>Create <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="PHBoIGlkPSJQbGFjZUhvbGRlcjEiIGVxdWl2LXRleHQ9IiZsdDtwaCBpZD0mcXVvdDszJnF1b3Q7IGRpc3A9JnF1b3Q7e3tkYXRhfX0mcXVvdDsgZGF0YVJlZj0mcXVvdDtkMSZxdW90OyAvJmd0OyIvPg==" equiv-text="base64:Jmx0O3BoIGlkPSZxdW90OzMmcXVvdDsgZGlzcD0mcXVvdDt7e2RhdGF9fSZxdW90OyBkYXRhUmVmPSZxdW90O2QxJnF1b3Q7IC8mZ3Q7"/>Site Admin<ph id="mtc_2" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjIiIGVxdWl2LXRleHQ9ImJvbGQiLz4=" equiv-text="base64:Ym9sZA=="/><ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_PH_OR_NOT_DATA_REF}" equiv-text="base64:PHBoIGlkPSIxMTEiLz4="/><ph id="mtc_3" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjMiIGVxdWl2LXRleHQ9Iml0YWxpYyIvPg==" equiv-text="base64:aXRhbGlj"/>administration<ph id="mtc_4" ctype="${CTypeEnum.ORIGINAL_X}" x-orig="PHggaWQ9IjQiIGVxdWl2LXRleHQ9Iml0YWxpYyIvPg==" equiv-text="base64:aXRhbGlj"/> site.`;
    assert.strictEqual(string_from_UI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('testFromUIConversion', {skip: false}, () => {
    const data_ref_map = { 'd1': '[', 'd2': '](http://repubblica.it)' };
    const filter = getFilterInstance(data_ref_map);
    const segment = 'Link semplice: <pc id="1" canCopy="no" canDelete="no" dataRefEnd="d2" dataRefStart="d1">La Repubblica</pc>.';
    const segmentL0 = (filter as any).fromRawXliffToLayer0(segment); // Assuming fromRawXliffToLayer0 is public or accessible for testing
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    const segmentL0_2 = filter.fromLayer1ToLayer0(segmentL1);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL0, segmentL0_2);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    const string_from_UI = `Link semplice: <ph id="1_1" ctype="${CTypeEnum.PC_OPEN_DATA_REF}" equiv-text="base64:Ww==" x-orig="PHBjIGlkPSIxIiBjYW5Db3B5PSJubyIgY2FuRGVsZXRlPSJubyIgZGF0YVJlZkVuZD0iZDIiIGRhdGFSZWZTdGFydD0iZDEiPg=="/>La Repubblica<ph id="1_2" ctype="${CTypeEnum.PC_CLOSE_DATA_REF}" equiv-text="base64:XShodHRwOi8vcmVwdWJibGljYS5pdCk=" x-orig="PC9wYz4="/>.`;
    assert.strictEqual(string_from_UI, segmentL2);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer1ToLayer2(segmentL1), segmentL2);
    assert.strictEqual(filter.fromLayer2ToLayer1(string_from_UI), segmentL1);
  });

  it('layer1ShouldWorkWithMalformedPhTags', {skip: false}, () => {
    const filter = getFilterInstance();
    const segment = 'not <ph id="1" dataRef="pippo"> valid';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(segment, segmentL1);
  });

  it('layer2SShouldWorkWithMalformedPhTags', {skip: false}, () => {
    const filter = getFilterInstance({ 'yyy': 'xxx' });
    const segment = 'not <ph id="1" dataRef="pippo"> valid';
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL2, segment);
  });

  it('when_empty_equiv_text_shgould_put_NULL_in_converted_ph', {skip: false}, () => {
    // sample test
    const map = { "source2": '${RIDER}', "source3": '&amp;lt;br&amp;gt;' };
    const filter = getFilterInstance(map);
    const string = 'Hola <ph id="source1" dataRef="source1" equiv-text=""/>';
    const expected = `Hola <ph id="mtc_1" ctype="${CTypeEnum.ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT}" x-orig="PHBoIGlkPSJzb3VyY2UxIiBkYXRhUmVmPSJzb3VyY2UxIiBlcXVpdi10ZXh0PSIiLz4=" equiv-text="base64:TlVMTA=="/>`;
    const layer2 = filter.fromLayer0ToLayer2(string);
    const convertedBack = filter.fromLayer2ToLayer0(layer2);
    assert.strictEqual(expected, layer2);
    assert.strictEqual(string, convertedBack);
  });

  it('should_work_with_real_pc_case', {skip: false}, () => {
    const segment = '<pc id="1b" type="fmt" subType="m:b">Ready to get started?</pc>';
    const segment_UI = `<ph id="mtc_1" ctype="x-original_pc_open" equiv-text="base64:PHBjIGlkPSIxYiIgdHlwZT0iZm10IiBzdWJUeXBlPSJtOmIiPg=="/>Ready to get started?<ph id="mtc_2" ctype="x-original_pc_close" equiv-text="base64:PC9wYz4="/>`;
    const filter = getFilterInstance([]);
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(segment_UI, segmentL2);
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('testRubyOnRails', {skip: false}, () => {
    const segment = 'For the %{first_ruby_variable} site %{{second_bnb_variable}}, is ok.';
    const forUI = `For the <ph id="mtc_1" ctype="${CTypeEnum.RUBY_ON_RAILS}" equiv-text="base64:JXtmaXJzdF9ydWJ5X3ZhcmlhYmxlfQ=="/> site <ph id="mtc_2" ctype="${CTypeEnum.PERCENT_VARIABLE}" equiv-text="base64:JXt7c2Vjb25kX2JuYl92YXJpYWJsZX19"/>, is ok.`;
    const filter = getFilterInstance();
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(forUI, segmentL2);
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('nested_pc_tags_real_case', {skip: false}, () => {
    const refMap = {
      'source1': '&lt;w:hyperlink r:id="rId25"&gt;&lt;/w:hyperlink&gt;',
      'source2': '&lt;w:r&gt;&lt;w:rPr&gt;&lt;w:color w:val="1A1A1A"&gt;&lt;/w:color&gt;&lt;/w:rPr&gt;&lt;w:t&gt;&lt;/w:t&gt;&lt;/w:r&gt;',
    };
    const filter = getFilterInstance(refMap);
    const segment = '<pc id="source1" dataRefStart="source1"><pc id="1u" type="fmt" subType="m:u">Crea una carpeta separada en tu Cuenta de ahorros Square para impuestos</pc></pc><pc id="source2" dataRefStart="source2"> y automáticamente contribuye un porcentaje de cada venta de Square.</pc>';
    const sentFromUI = `<ph id="source1_1" ctype="x-pc_open_data_ref" equiv-text="base64:Jmx0O3c6aHlwZXJsaW5rIHI6aWQ9InJJZDI1IiZndDsmbHQ7L3c6aHlwZXJsaW5rJmd0Ow==" x-orig="PHBjIGlkPSJzb3VyY2UxIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTEiPg=="/><ph id="mtc_1" ctype="x-original_pc_open" equiv-text="base64:PHBjIGlkPSIxdSIgdHlwZT0iZm10IiBzdWJUeXBlPSJtOnUiPg=="/>Crea una carpeta separada en tu Cuenta de ahorros Square para impuestos<ph id="mtc_2" ctype="x-original_pc_close" equiv-text="base64:PC9wYz4="/><ph id="source1_2" ctype="x-pc_close_data_ref" equiv-text="base64:Jmx0O3c6aHlwZXJsaW5rIHI6aWQ9InJJZDI1IiZndDsmbHQ7L3c6aHlwZXJsaW5rJmd0Ow==" x-orig="PC9wYz4="/><ph id="source2_1" ctype="x-pc_open_data_ref" equiv-text="base64:Jmx0O3c6ciZndDsmbHQ7dzpyUHImZ3Q7Jmx0O3c6Y29sb3Igdzp2YWw9IjFBMUExQSImZ3Q7Jmx0Oy93OmNvbG9yJmd0OyZsdDsvdzpyUHImZ3Q7Jmx0O3c6dCZndDsmbHQ7L3c6dCZndDsmbHQ7L3c6ciZndDs=" x-orig="PHBjIGlkPSJzb3VyY2UyIiBkYXRhUmVmU3RhcnQ9InNvdXJjZTIiPg=="/> y automáticamente contribuye un porcentaje de cada venta de Square.<ph id="source2_2" ctype="x-pc_close_data_ref" equiv-text="base64:Jmx0O3c6ciZndDsmbHQ7dzpyUHImZ3Q7Jmx0O3c6Y29sb3Igdzp2YWw9IjFBMUExQSImZ3Q7Jmx0Oy93OmNvbG9yJmd0OyZsdDsvdzpyUHImZ3Q7Jmx0O3c6dCZndDsmbHQ7L3c6dCZndDsmbHQ7L3c6ciZndDs=" x-orig="PC9wYz4="/>`;
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    // layer 2
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(segmentL2, filter.fromLayer1ToLayer2(segmentL1));
    assert.strictEqual(sentFromUI, segmentL2);
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(segmentL2));
    assert.strictEqual(segment, filter.fromLayer2ToLayer0(sentFromUI));
    assert.strictEqual(segmentL1, filter.fromLayer2ToLayer1(segmentL2));
  });

  it('nested_pc_tags_real_case_2', {skip: false}, () => {
    const refMap = {
      'source3'  : '&lt;bpt ctype="x-style" id="span_2"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source34' : '&lt;g ctype="x-text" id="text_13" /&gt;',
      'source45' : '&lt;bpt ctype="x-block" id="block_17" /&gt;',
      'source56' : '&lt;g ctype="x-text" id="text_22" /&gt;',
      'source30' : '&lt;ph id="generic_12"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="72" TrailingMargin="0" FirstLineMargin="36" Justification="Left" ListLevel="1" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source41' : '&lt;g ctype="x-text" id="text_16" /&gt;',
      'source52' : '&lt;ept id="block_17" /&gt;',
      'source17' : '&lt;g ctype="x-text" id="text_7" /&gt;',
      'source28' : '&lt;ept id="block_8" /&gt;',
      'source8'  : '&lt;bpt ctype="x-block" id="block_3" /&gt;',
      'source39' : '&lt;bpt ctype="x-style" id="span_16"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source13' : '&lt;bpt ctype="x-style" id="span_6"&gt;&lt;Style FontSize="11" FontIsBold="True" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source24' : '&lt;bpt ctype="x-style" id="span_10"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source4'  : '&lt;g ctype="x-text" id="text_2" /&gt;',
      'source35' : '&lt;ept id="span_13" /&gt;',
      'source46' : '&lt;ph id="generic_18"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="72" TrailingMargin="0" FirstLineMargin="36" Justification="Left" ListLevel="1" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source57' : '&lt;ept id="span_22" /&gt;',
      'source20' : '&lt;ept id="span_7" /&gt;',
      'source31' : '&lt;bpt ctype="x-style" id="span_13"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source42' : '&lt;g ctype="x-text" id="text_16" /&gt;',
      'source53' : '&lt;bpt ctype="x-block" id="block_20" /&gt;',
      'source18' : '&lt;g ctype="x-text" id="text_7" /&gt;',
      'source29' : '&lt;bpt ctype="x-block" id="block_11" /&gt;',
      'source9'  : '&lt;ph id="generic_4"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="0" TrailingMargin="0" FirstLineMargin="0" Justification="Left" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source14' : '&lt;g ctype="x-text" id="text_6" /&gt;',
      'source25' : '&lt;g ctype="x-text" id="text_10" /&gt;',
      'source5'  : '&lt;g ctype="x-text" id="text_2" /&gt;',
      'source36' : '&lt;ept id="block_11" /&gt;',
      'source47' : '&lt;bpt ctype="x-style" id="span_19"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source58' : '&lt;ept id="block_20" /&gt;',
      'source10' : '&lt;bpt ctype="x-style" id="span_5"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source21' : '&lt;ept id="block_3" /&gt;',
      'source1'  : '&lt;bpt ctype="x-block" id="block_0" /&gt;',
      'source32' : '&lt;g ctype="x-text" id="text_13" /&gt;',
      'source43' : '&lt;ept id="span_16" /&gt;',
      'source54' : '&lt;ph id="generic_21"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="0" TrailingMargin="0" FirstLineMargin="0" Justification="Left" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source50' : '&lt;g ctype="x-text" id="text_19" /&gt;',
      'source19' : '&lt;g ctype="x-text" id="text_7" /&gt;',
      'source15' : '&lt;ept id="span_6" /&gt;',
      'source26' : '&lt;g ctype="x-text" id="text_10" /&gt;',
      'source6'  : '&lt;ept id="span_2" /&gt;',
      'source37' : '&lt;bpt ctype="x-block" id="block_14" /&gt;',
      'source48' : '&lt;g ctype="x-text" id="text_19" /&gt;',
      'source11' : '&lt;g ctype="x-text" id="text_5" /&gt;',
      'source22' : '&lt;bpt ctype="x-block" id="block_8" /&gt;',
      'source2'  : '&lt;ph id="generic_1"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="0" TrailingMargin="0" FirstLineMargin="0" Justification="Left" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source33' : '&lt;g ctype="x-text" id="text_13" /&gt;',
      'source44' : '&lt;ept id="block_14" /&gt;',
      'source55' : '&lt;bpt ctype="x-style" id="span_22"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source40' : '&lt;g ctype="x-text" id="text_16" /&gt;',
      'source51' : '&lt;ept id="span_19" /&gt;',
      'source16' : '&lt;bpt ctype="x-style" id="span_7"&gt;&lt;Style FontSize="11" ForegroundColor="lt1,00" LinkColor="lt1,00" /&gt;&lt;/bpt&gt;',
      'source27' : '&lt;ept id="span_10" /&gt;',
      'source7'  : '&lt;ept id="block_0" /&gt;',
      'source38' : '&lt;ph id="generic_15"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="72" TrailingMargin="0" FirstLineMargin="36" Justification="Left" ListLevel="1" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
      'source49' : '&lt;g ctype="x-text" id="text_19" /&gt;',
      'source12' : '&lt;ept id="span_5" /&gt;',
      'source23' : '&lt;ph id="generic_9"&gt;&lt;Style FlowDirection="LeftToRight" LeadingMargin="0" TrailingMargin="0" FirstLineMargin="0" Justification="Left" LineSpacingRule="Multiple" LineSpacing="21" SpacingBefore="0" SpacingAfter="6"&gt;&lt;ListStyle ListType="None" ListTypeFormat="Parentheses" Color="#000000" BulletFont="Arial" /&gt;&lt;/Style&gt;&lt;/ph&gt;',
    };
    const filter = getFilterInstance(refMap);
    const segment = '<pc id="source5" dataRefStart="source5"></pc><ph id="source6" dataRef="source6"/><ph id="source7" dataRef="source7"/><ph id="source8" dataRef="source8"/><ph id="source9" dataRef="source9"/><ph id="source10" dataRef="source10"/><pc id="source11" dataRefStart="source11">Uber is committed to our employees, contractors, customers, and to the communities where we do business by </pc><ph id="source12" dataRef="source12"/><ph id="source13" dataRef="source13"/><pc id="source14" dataRefStart="source14">putting people first</pc><ph id="source15" dataRef="source15"/><ph id="source16" dataRef="source16"/><pc id="source17" dataRefStart="source17">.</pc>';
    const segmentL1 = filter.fromLayer0ToLayer1(segment);
    assert.strictEqual(filter.fromLayer1ToLayer0(segmentL1), segment);
    const segmentL2 = filter.fromLayer0ToLayer2(segment);
    assert.strictEqual(filter.fromLayer2ToLayer0(segmentL2), segment);
    assert.strictEqual(filter.fromLayer2ToLayer1(segmentL1), segmentL1);
  });
});