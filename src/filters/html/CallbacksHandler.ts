import { Pipeline } from '../../commons/Pipeline';

export interface CallbacksHandler {
  _finalizeHTMLTag(buffer: string): string;
  _fixWrongBuffer(buffer: string): string;
  _isTagValid(buffer: string): boolean;
  _finalizePlainText(buffer: string): string;
  _finalizeScriptTag(buffer: string): string;
  _setSegmentContainsHtml(): void;
}