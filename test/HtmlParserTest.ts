import * as assert from 'assert';
import { Pipeline } from '../src/commons/Pipeline';
import { HtmlToPh } from '../src/filters/HtmlToPh';
import { CTypeEnum } from '../src/enums/CTypeEnum';
import { describe, it } from 'node:test'
describe('HtmlParserTest', () => {

  it('test4', () => {
    //this html segment comes from the previous layers
    //we must extract and lock html inside ph tags AS IS
    //WARNING the href attribute MUST NOT BE encoded because we want only extract HTML
    //WARNING the text node inside HTML must remain untouched
    const segment = "<p> Airbnb &amp;amp; Co. &amp;lt; <strong>Use professional tools</strong> in your <a href=\"/users/settings?test=123&amp;amp;ciccio=1\" target=\"_blank\">"
    const expected = "<ph id=\"mtc_1\" ctype=\"x-html\" equiv-text=\"base64:Jmx0O3AmZ3Q7\"/> Airbnb &amp;amp; Co. &amp;lt; <ph id=\"mtc_2\" ctype=\"x-html\" equiv-text=\"base64:Jmx0O3N0cm9uZyZndDs=\"/>Use professional tools<ph id=\"mtc_3\" ctype=\"x-html\" equiv-text=\"base64:Jmx0Oy9zdHJvbmcmZ3Q7\"/> in your <ph id=\"mtc_4\" ctype=\"x-html\" equiv-text=\"base64:Jmx0O2EgaHJlZj0iL3VzZXJzL3NldHRpbmdzP3Rlc3Q9MTIzJmFtcDthbXA7Y2ljY2lvPTEiIHRhcmdldD0iX2JsYW5rIiZndDs=\"/>";
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testValidCSS', () => {
    const segment = `<style>body{background-color:powderblue;} 
h1 {color:blue;}p{color:red;}
</style>`;
    const expected = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O3N0eWxlJmd0O2JvZHl7YmFja2dyb3VuZC1jb2xvcjpwb3dkZXJibHVlO30gCmgxIHtjb2xvcjpibHVlO31we2NvbG9yOnJlZDt9CiZsdDsvc3R5bGUmZ3Q7"/>`;
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testNotValidCSS', () => {
    const segment = "<style>body{background-color:powderblue;} h1 {color:blue;}p{color:red;}";
    const expected = "&lt;style&gt;body{background-color:powderblue;} h1 {color:blue;}p{color:red;}";
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testStyleLikeTags', () => {
    const segment = "<style0>this is a test text inside a custom xml tag similar to a style html tag</style0>";
    const expected = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O3N0eWxlMCZndDs="/>this is a test text inside a custom xml tag similar to a style html tag<ph id="mtc_2" ctype="x-html" equiv-text="base64:Jmx0Oy9zdHlsZTAmZ3Q7"/>`;
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testJS', () => {
    const segment = `<script>
let elements = document.getElementsByClassName('note');
</script>`
    const expected = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O3NjcmlwdCZndDsKbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbm90ZScpOwombHQ7L3NjcmlwdCZndDs="/>`;
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testScriptLikeTags', () => {
    const segment = "<scripting>let elements = document.getElementsByClassName('note');</scripting>";
    const expected = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O3NjcmlwdGluZyZndDs="/>let elements = document.getElementsByClassName('note');<ph id="mtc_2" ctype="x-html" equiv-text="base64:Jmx0Oy9zY3JpcHRpbmcmZ3Q7"/>`;
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });

  it('testWithDoublePoints', () => {
    const segment = "<l:style1>test</l:style1>";
    const expected = `<ph id="mtc_1" ctype="x-html" equiv-text="base64:Jmx0O2w6c3R5bGUxJmd0Ow=="/>test<ph id="mtc_2" ctype="x-html" equiv-text="base64:Jmx0Oy9sOnN0eWxlMSZndDs="/>`;
    const pipeline = new Pipeline();
    pipeline.addLast(new HtmlToPh());
    const str = pipeline.transform(segment);
    assert.strictEqual(str, expected);
  });
});