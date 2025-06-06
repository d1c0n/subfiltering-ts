import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';
import { SprintfLocker } from './sprintf/SprintfLocker';

export class PercentSnail extends AbstractHandler {

  public transform(segment: string): string {
    const sprintfLocker = new SprintfLocker(this.pipeline.getSource(), this.pipeline.getTarget());

    // placeholding
    segment = sprintfLocker.lock(segment);

    const regex = /%@/g;
    let match;

    while ((match = regex.exec(segment)) !== null) {
      const percentSnailVariable = match[0];
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.PERCENT_SNAILS}" equiv-text="base64:${Buffer.from(percentSnailVariable).toString('base64')}"/>`;
      segment = segment.replace(percentSnailVariable, replacement);
    }

    segment = sprintfLocker.unlock(segment);

    return segment;
  }
}