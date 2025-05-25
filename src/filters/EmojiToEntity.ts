import { AbstractHandler } from '../commons/AbstractHandler';
import { Emoji } from '../utils/Emoji';

export class EmojiToEntity extends AbstractHandler {
  public transform(segment: string): string {
    return Emoji.toEntity(segment);
  }
}