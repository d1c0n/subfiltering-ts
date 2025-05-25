import { AbstractHandler } from "../commons/AbstractHandler";
import { ConstantEnum } from "../enums/ConstantEnum";
import { CTypeEnum } from "../enums/CTypeEnum";
import { CallbacksHandler } from "./html/CallbacksHandler";
import { HtmlParser } from "./html/HtmlParser";
import { decode, encode } from "html-entities";

export class HtmlToPh extends AbstractHandler implements CallbacksHandler {
  public _finalizePlainText(buffer: string): string {
    return buffer;
  }

  public _finalizeHTMLTag(buffer: string): string {
    // decode attributes by locking <,> first
    // because a html tag has it's attributes encoded and here we get lt and gt decoded but not other parts of the string
    // Ex:
    // incoming string : <a href="/users/settings?test=123&amp;ciccio=1" target="_blank">
    // this should be: <a href="/users/settings?test=123&ciccio=1" target="_blank"> with only one ampersand encoding
    buffer = buffer.replace(/</g, "#_lt_#").replace(/>/g, "#_gt_#");
    buffer = this.htmlEntityDecode(buffer);
    buffer = buffer.replace(/#_lt_#/g, "<").replace(/#_gt_#/g, ">");
    return this._finalizeTag(buffer);
  }

  public _finalizeTag(buffer: string): string {
    return `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.HTML
      }" equiv-text="base64:${Buffer.from(this.htmlEntities(buffer)).toString(
        "base64"
      )}"/>`;
  }

  public _fixWrongBuffer(buffer: string): string {
    buffer = buffer.replace(/</g, "&lt;");
    buffer = buffer.replace(/>/g, "&gt;");
    return buffer;
  }

  public _finalizeScriptTag(buffer: string): string {
    return this._finalizeTag(buffer);
  }

  /**
   * This is meant to cover the case when strip_tags fails because of a string like these
   *
   * " test 3<4 and test 2>5 " <-- becomes --> " test 35 "
   *
   * Only tags should be converted here
   *
   * @param {string} buffer
   * @returns {boolean}
   */
  public _isTagValid(buffer: string): boolean {
    /*
     * accept tags start with (case insensitive):
     * - starting with / ( optional )
     * - NOT starting with a number
     * - containing at least 1 [a-zA-Z0-9\-\._]
     * - ending with a letter a-zA-Z0-9 or a quote "' or /
     */
    if (
      buffer.match(
        /<[\/]{0,1}(?![0-9]+)[a-z0-9\-\._:]+?(?:\s[:a-z0-9\-\._]+=.+?)?\s*[\/]{0,1}>/i
      )
    ) {
      // this case covers when filters create an xliff tag inside an html tag:
      // EX:
      // original: <a href=\"<x id="1">\">
      // <a href=\"##LESSTHAN##eCBpZD0iMSIv##GREATERTHAN##\">
      if (
        buffer.includes(ConstantEnum.LTPLACEHOLDER) ||
        buffer.includes(ConstantEnum.GTPLACEHOLDER)
      ) {
        return false;
      }
      return true;
    }
    return false;
  }

  public transform(segment: string): string {
    const parser = new HtmlParser(this.pipeline);
    parser.registerCallbacksHandler(this);
    return parser.transform(segment);
  }

  // Helper function for html_entity_decode equivalent
  private htmlEntityDecode(str: string): string {
    let strDecoded = decode(str, { level: "xml" });
    // re-encode quotes
    // strDecoded = strDecoded.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    return strDecoded;
  }

  // Helper function for htmlentities equivalent
  private htmlEntities(str: string): string {
    let strEncoded = encode(str, { level: "xml" });
    // re-decode quotes
    strEncoded = strEncoded.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    return strEncoded;
  }

  // Implement the _setSegmentContainsHtml method from CallbacksHandler
  public _setSegmentContainsHtml(): void {
    this.pipeline.setSegmentContainsHtml();
  }
}
