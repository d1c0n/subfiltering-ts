import { AbstractHandler } from '../commons/AbstractHandler';

export class LtGtDecode extends AbstractHandler {
  public transform(segment: string): string {
    // restore < and >
    segment = segment.replace(/&lt;/g, '<');
    segment = segment.replace(/&gt;/g, '>');
    return segment;
  }
}