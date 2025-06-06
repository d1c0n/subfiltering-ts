import { AbstractHandler } from '../commons/AbstractHandler';
import { CTypeEnum } from '../enums/CTypeEnum';
import { SprintfLocker } from './sprintf/SprintfLocker';

export class SprintfToPH extends AbstractHandler {
  /**
   * TestSet:
   * ```
   * |%-4d|%-4d|
   * |%':4d|
   * |%-':4d|
   * |%-'04d|
   * %02.2f
   * %02d
   * %1$s!
   * %08b
   * 20%-os - ignored
   * 20%-dir - ignored
   * 20%-zar - ignored
   * ```
   *
   * @see
   * - https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Strings/Articles/formatSpecifiers.html#//apple_ref/doc/uid/TP40004265-SW1
   * - https://en.cppreference.com/w/c/io/fprintf
   * - https://www.php.net/manual/en/function.sprintf.php
   * - https://www.w3resource.com/c-programming/stdio/c_library_method_sprintf.php
   *
   * @param segment
   * @returns string
   */
  public transform(segment: string): string {
    const sprintfLocker = new SprintfLocker(this.pipeline.getSource(), this.pipeline.getTarget());

    // placeholding
    segment = sprintfLocker.lock(segment);

    // Octal parsing is disabled due to Hungarian percentages 20%-os
    const regex = /(?:\x25\x25)|(\x25(?:(?:[1-9]\d*)\$|\((?:[^\)]+)\))?(?:\+)?(?:0|[+-]?\'[^$])?(?:-)?(?:\d+)?(?:\.(?:\d+))?((?:[hjlqtzL]{0,2}[ac-giopsuxAC-GOSUX]{1})(?![\d\w])|(?:#@[\w]+@)|(?:@)))/g
    const matches = [...segment.matchAll(regex)];

    matches.forEach((match) => {
      const variable = match[0];
      // Replace subsequent elements excluding already encoded
      const replacement = `<ph id="${this.pipeline.getNextId()}" ctype="${CTypeEnum.SPRINTF}" equiv-text="base64:${Buffer.from(variable).toString('base64')}"/>`;
      segment = segment.replace(variable, replacement);
    });


   

    // revert placeholding
    segment = sprintfLocker.unlock(segment);

    return segment;
  }
}