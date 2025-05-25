import { AbstractHandler } from '../commons/AbstractHandler';

export class LtGtEncode extends AbstractHandler {
  public transform(segment: string): string {
    // encode < and >
    segment = segment.replace(/</g, '&lt;');
    segment = segment.replace(/>/g, '&gt;');
    return segment;
  }
}