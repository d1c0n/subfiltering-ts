import { Pipeline } from '../../commons/Pipeline';
import { CallbacksHandler } from './CallbacksHandler';

export class HtmlParser {
  private static readonly STATE_PLAINTEXT = 0;
  private static readonly STATE_HTML = 1;
  private static readonly STATE_COMMENT = 2;
  private static readonly STATE_JS_CSS = 3;

  private pipeline: Pipeline | null;
  protected callbacksHandler!: CallbacksHandler;

  constructor(pipeline: Pipeline | null = null) {
    this.pipeline = pipeline;
  }

  public registerCallbacksHandler(handler: CallbacksHandler): void {
    this.callbacksHandler = handler;
  }

  public transform(segment: string): string {
    const originalSplit = segment.split('');
    let state = HtmlParser.STATE_PLAINTEXT;
    let htmlBuffer = '';
    let plainTextBuffer = '';
    let inQuoteChar = '';
    let output = '';

    for (let idx = 0; idx < originalSplit.length; idx++) {
      const char = originalSplit[idx];

      if (state === HtmlParser.STATE_PLAINTEXT) {
        switch (char) {
          case '<':
            state = HtmlParser.STATE_HTML;
            htmlBuffer += char;
            output += this.callbacksHandler._finalizePlainText(plainTextBuffer);
            plainTextBuffer = '';
            break;
          
          //
          // *************************************
          // NOTE
          // *************************************
          //
          // This case covers simple greater than sign (>),
          // otherwise is ignored and left as >.
          //
          case '>':
            plainTextBuffer += this.callbacksHandler._fixWrongBuffer(char);
            break;
          default:
            plainTextBuffer += char;
            break;
        }
      } else if (state === HtmlParser.STATE_HTML) {
        switch (char) {
          case '<':
            // is not possible to have angle brackets inside a tag, this case can not happen
            // this code would ignore '>' if inside a quote, useless
            // for more info see https://www.w3.org/TR/xml/#charsets

            // if we found a second less than symbol the first one IS NOT a tag,
            // treat the html_buffer as plain text and attach to the output
            output += this.callbacksHandler._fixWrongBuffer(htmlBuffer);
            htmlBuffer = char;
            break;
          case '>':
            // is not possible to have angle brackets inside a tag, this case can not happen
            // this code would ignore '>' if inside a quote, useless
            // for more info see https://www.w3.org/TR/xml/#charsets

            htmlBuffer += char;
            if (htmlBuffer.startsWith('<script>') || 
                htmlBuffer.startsWith('<style>')) {
              state = HtmlParser.STATE_JS_CSS;
              break;
            }

            // this is closing the tag in tag_buffer
            inQuoteChar = '';
            state = HtmlParser.STATE_PLAINTEXT;
            if (this.callbacksHandler._isTagValid(htmlBuffer)) {
              output += this.callbacksHandler._finalizeHTMLTag(htmlBuffer);
            } else {
              output += this.callbacksHandler._fixWrongBuffer(htmlBuffer);
            }
            if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
              this.callbacksHandler._setSegmentContainsHtml();
            }
            htmlBuffer = '';
            break;
          case '"':
          case '\'':
            // catch both single and double quotes

            if (char === inQuoteChar) {
              inQuoteChar = '';
            } else {
              inQuoteChar = (inQuoteChar !== '' ? inQuoteChar : char);
            }
            htmlBuffer += char;
            break;
          case '-':
            if (htmlBuffer === '<!-') {
              state = HtmlParser.STATE_COMMENT;
            }
            htmlBuffer += char;
            break;
          case ' ': //0x20 is a space
          case '\n':
            if (htmlBuffer === '<') {
              state = HtmlParser.STATE_PLAINTEXT; // but we work in XML text, so encode it
              output += this.callbacksHandler._fixWrongBuffer('< ');
              htmlBuffer = '';
              if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
                this.callbacksHandler._setSegmentContainsHtml();
              }
              break;
            }
            htmlBuffer += char;
            break;
          default:
            // check the last char
            if (idx === (originalSplit.length - 1)) {
              htmlBuffer += char;

              //
              // *************************************
              // NOTE
              // *************************************
              //
              // Check if $html_buffer is valid. If not, then
              // convert it to $plain_text_buffer.
              //
              // Example:
              //
              // $html_buffer = '<3 %}'
              //
              // is not a valid tag, so it's converted to $plain_text_buffer
              //
              if (!this.callbacksHandler._isTagValid(htmlBuffer)) {
                state = HtmlParser.STATE_PLAINTEXT;
                plainTextBuffer += this.callbacksHandler._fixWrongBuffer(htmlBuffer);
                htmlBuffer = '';
                if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
                  this.callbacksHandler._setSegmentContainsHtml();
                }
                break;
              }
            }
            htmlBuffer += char;
            break;
        }
      } else if (state === HtmlParser.STATE_COMMENT) {
        htmlBuffer += char;
        if (char === '>') {
          if (htmlBuffer.endsWith('-->')) {
            // close the comment
            state = HtmlParser.STATE_PLAINTEXT;
            output += this.callbacksHandler._finalizeScriptTag(htmlBuffer);
            htmlBuffer = '';
            if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
              this.callbacksHandler._setSegmentContainsHtml();
            }
          }
        }
      } else if (state === HtmlParser.STATE_JS_CSS) {
        htmlBuffer += char;
        if (char === '>') {
          if (htmlBuffer.endsWith('/script>') || htmlBuffer.endsWith('/style>')) {
            // close the comment
            state = HtmlParser.STATE_PLAINTEXT;
            output += this.callbacksHandler._finalizeScriptTag(htmlBuffer);
            htmlBuffer = '';
            if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
              this.callbacksHandler._setSegmentContainsHtml();
            }
          }
        }
      }
    }

    //HTML Partial, add wrong HTML to preserve string content
    if (htmlBuffer !== '') {
      if (this.callbacksHandler._isTagValid(htmlBuffer) && this.pipeline !== null) {
        this.callbacksHandler._setSegmentContainsHtml();
      }
      output += this.callbacksHandler._fixWrongBuffer(htmlBuffer);
    }

    //HTML Partial, add wrong HTML to preserve string content
    if (plainTextBuffer !== '' && plainTextBuffer !== null) {
      output += this.callbacksHandler._finalizePlainText(plainTextBuffer);
    }

    return output;
  }
}