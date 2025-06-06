import { AbstractHandler } from './AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';
import { ArrayList } from '../utils/ArrayList'; // Assuming ArrayList is in utils

/**
 * @class Pipeline
 */
export class Pipeline {
  protected handlers: AbstractHandler[] = [];
  protected idNumber: number = -1;
  protected source: string | null;
  protected target: string | null;
  protected dataRefMap: Map<string, any>;
  private _segmentContainsHtml: boolean = false;

  /**
   * @param {string | null} source
   * @param {string | null} target
   * @param {Record<string, any>} dataRefMap
   */
  public constructor(source: string | null = null, target: string | null = null, dataRefMap: Record<string, any> = {}) {
    this.source = source;
    this.target = target;
    this.dataRefMap = new Map(Object.entries(dataRefMap));
  }

  /**
   * @returns {string}
   */
  public getNextId(): string {
    this.idNumber++;
    return `${ConstantEnum.INTERNAL_ATTR_ID_PREFIX}${this.idNumber}`;
  }

  /**
   * Resets the ID counter.
   */
  public resetId(): void {
    this.idNumber = -1;
  }

  /**
   * @returns {boolean}
   */
  public segmentContainsHtml(): boolean {
    return this._segmentContainsHtml;
  }

  /**
   * Sets segmentContainsHtml to true.
   */
  public setSegmentContainsHtml(): void {
    this._segmentContainsHtml = true;
  }

  /**
   * @returns {string | null}
   */
  public getSource(): string | null {
    return this.source;
  }

  /**
   * @returns {string | null}
   */
  public getTarget(): string | null {
    return this.target;
  }

  /**
   * @returns {Map<string, any>}
   */
  public getDataRefMap(): Record<string, any> {
    return Object.fromEntries(this.dataRefMap);
  }

  /**
   * Adds a handler to the beginning of the pipeline.
   * @param {AbstractHandler} handler
   * @returns {Pipeline}
   */
  public addFirst(handler: AbstractHandler): Pipeline {
    this._register(handler);
    this.handlers.unshift(handler);
    return this;
  }

  /**
   * Adds a new handler before a specified existing handler.
   * @param {AbstractHandler} before
   * @param {AbstractHandler} newPipeline
   * @returns {Pipeline}
   */
  public addBefore(before: AbstractHandler, newPipeline: AbstractHandler): Pipeline {
    this._register(newPipeline);
    const index = this.handlers.findIndex((handler) => handler.getName() === before.getName());
    if (index !== -1) {
      this.handlers.splice(index, 0, newPipeline);
    }
    return this;
  }

  /**
   * Adds a new handler after a specified existing handler.
   * @param {AbstractHandler} after
   * @param {AbstractHandler} newPipeline
   * @returns {Pipeline}
   */
  public addAfter(after: AbstractHandler, newPipeline: AbstractHandler): Pipeline {
    this._register(newPipeline);
    const index = this.handlers.findIndex((handler) => handler.getName() === after.getName());
    if (index !== -1) {
      this.handlers.splice(index + 1, 0, newPipeline);
    }
    return this;
  }

  /**
   * Removes a handler from the pipeline.
   * @param {AbstractHandler} handlerToDelete
   * @returns {Pipeline}
   */
  public remove(handlerToDelete: AbstractHandler): Pipeline {
    this.handlers = this.handlers.filter((handler) => handler.getName() !== handlerToDelete.getName());
    return this;
  }

  /**
   * Adds a handler to the end of the pipeline.
   * @param {AbstractHandler} handler
   * @returns {Pipeline}
   */
  public addLast(handler: AbstractHandler): Pipeline {
    this._register(handler);
    this.handlers.push(handler);
    return this;
  }

  /**
   * Transforms the segment by passing it through all handlers in the pipeline.
   * @param {string} segment
   * @returns {string}
   */
  public transform(segment: string): string {
    this.idNumber = -1;
    for (const handler of this.handlers) {
      segment = handler.transform(segment);
    }
    return this.realignIDs(segment);
  }

  /**
   * Realigns IDs in the segment.
   * @param {string} segment
   * @returns {string}
   */
  protected realignIDs(segment: string): string {
    if (this.idNumber > -1) {
      const regex = /"__mtc_[0-9]+"/g;
      let match;
      const htmlMatches: string[] = [];

      while ((match = regex.exec(segment)) !== null) {
        htmlMatches.push(match[0]);
      }

      htmlMatches.forEach((tagId, pos) => {
        // Replace subsequent elements excluding already encoded
        segment = segment.replace(tagId, `"mtc_${pos + 1}"`);
      });
    }
    return segment;
  }

  /**
   * Registers a handler with the pipeline.
   * @param {AbstractHandler} handler
   * @returns {Pipeline}
   */
  protected _register(handler: AbstractHandler): Pipeline {
    handler.setPipeline(this);
    return this;
  }
}