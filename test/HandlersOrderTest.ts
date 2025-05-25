import * as assert from 'assert';
import { Pipeline } from '../src/commons/Pipeline';
import { HtmlToPh } from '../src/filters/HtmlToPh';
import { LtGtDecode } from '../src/filters/LtGtDecode';
import { Percentages } from '../src/filters/Percentages';
import { PlaceHoldXliffTags } from '../src/filters/PlaceHoldXliffTags';
import { RestorePlaceHoldersToXLIFFLtGt } from '../src/filters/RestorePlaceHoldersToXLIFFLtGt';
import { RestoreXliffTagsContent } from '../src/filters/RestoreXliffTagsContent';
import { RubyOnRailsI18n } from '../src/filters/RubyOnRailsI18n';
import { SingleCurlyBracketsToPh } from '../src/filters/SingleCurlyBracketsToPh';
import { SprintfToPH } from '../src/filters/SprintfToPH';
import { StandardPHToMateCatCustomPH } from '../src/filters/StandardPHToMateCatCustomPH';
import { TwigToPh } from '../src/filters/TwigToPh';
import { AbstractHandler } from '../src/commons/AbstractHandler';
import { describe, it, beforeEach } from 'node:test';
describe('HandlersOrderTest', () => {
  let channel: Pipeline;

  beforeEach(() => {
    channel = new Pipeline('it-IT', 'en-US', []);
    channel.addLast(new StandardPHToMateCatCustomPH());
    channel.addLast(new PlaceHoldXliffTags());
    channel.addLast(new LtGtDecode());
    channel.addLast(new HtmlToPh());
    channel.addLast(new TwigToPh());
    channel.addLast(new SprintfToPH());
    channel.addLast(new RestoreXliffTagsContent());
    channel.addLast(new RestorePlaceHoldersToXLIFFLtGt());
  });

  it('testReOrder', () => {
    channel.remove(new TwigToPh());
    channel.remove(new SprintfToPH());
    channel.addAfter(new HtmlToPh(), new RubyOnRailsI18n());
    channel.addAfter(new RubyOnRailsI18n(), new Percentages());
    channel.addAfter(new Percentages(), new SprintfToPH());
    channel.addAfter(new SprintfToPH(), new TwigToPh());
    channel.addAfter(new TwigToPh(), new SingleCurlyBracketsToPh());

    const handlerList: AbstractHandler[] = (channel as any).handlers; // Access private property for testing

    assert.ok(handlerList[0] instanceof StandardPHToMateCatCustomPH);
    assert.ok(handlerList[1] instanceof PlaceHoldXliffTags);
    assert.ok(handlerList[2] instanceof LtGtDecode);
    assert.ok(handlerList[3] instanceof HtmlToPh);
    assert.ok(handlerList[4] instanceof RubyOnRailsI18n);
    assert.ok(handlerList[5] instanceof Percentages);
    assert.ok(handlerList[6] instanceof SprintfToPH);
    assert.ok(handlerList[7] instanceof TwigToPh);
    assert.ok(handlerList[8] instanceof SingleCurlyBracketsToPh);
    assert.ok(handlerList[9] instanceof RestoreXliffTagsContent);
    assert.ok(handlerList[10] instanceof RestorePlaceHoldersToXLIFFLtGt);
  });

  it('testReOrder2', () => {
    channel.remove(new TwigToPh());
    channel.remove(new SprintfToPH());
    channel.addFirst(new SprintfToPH());
    channel.addBefore(new HtmlToPh(), new RubyOnRailsI18n());
    channel.remove(new HtmlToPh());

    const handlerList: AbstractHandler[] = (channel as any).handlers; // Access private property for testing

    assert.ok(handlerList[0] instanceof SprintfToPH);
    assert.ok(handlerList[1] instanceof StandardPHToMateCatCustomPH);
    assert.ok(handlerList[2] instanceof PlaceHoldXliffTags);
    assert.ok(handlerList[3] instanceof LtGtDecode);
    assert.ok(handlerList[4] instanceof RubyOnRailsI18n);
    assert.ok(handlerList[5] instanceof RestoreXliffTagsContent);
    assert.ok(handlerList[6] instanceof RestorePlaceHoldersToXLIFFLtGt);
  });
});