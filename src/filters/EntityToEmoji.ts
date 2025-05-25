import { AbstractHandler } from '../commons/AbstractHandler';
import { Emoji } from '../utils/Emoji';

export class EntityToEmoji extends AbstractHandler {
  public transform(segment: string): string {
    return Emoji.toEmoji(segment);
  }
}