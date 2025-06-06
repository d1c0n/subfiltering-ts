import { AbstractHandler } from './AbstractHandler';
import { ConstantEnum } from '../enums/ConstantEnum';

export class Pipeline {
  protected handlers: AbstractHandler[] = [];
  protected idNumber: number = -1;
  protected source: string | null;
  protected target: string | null;
  protected dataRefMap: Map<string, any>;
  private _segmentContainsHtml: boolean = false;

  public constructor(source: string | null = null, target: string | null = null, dataRefMap: Record<string, any> = {}) {
    this.source = source;
    this.target = target;
    this.dataRefMap = new Map(Object.entries(dataRefMap));
  }

  public getNextId(): string {
    this.idNumber++;
    return `${ConstantEnum.INTERNAL_ATTR_ID_PREFIX}${this.idNumber}`;
  }

  public resetId(): void {
    this.idNumber = -1;
  }

  public segmentContainsHtml(): boolean {
    return this._segmentContainsHtml;
  }

  public setSegmentContainsHtml(): void {
    this._segmentContainsHtml = true;
  }

  public getSource(): string | null {
    return this.source;
  }

  public getTarget(): string | null {
    return this.target;
  }

  public getDataRefMap(): Record<string, any> {
    return Object.fromEntries(this.dataRefMap);
  }

  public addFirst(handler: AbstractHandler): Pipeline {
    this._register(handler);
    this.handlers.unshift(handler);
    return this;
  }

  public addBefore(before: AbstractHandler, newPipeline: AbstractHandler): Pipeline {
    this._register(newPipeline);
    const index = this.handlers.findIndex((handler) => handler.getName() === before.getName());
    if (index !== -1) {
      this.handlers.splice(index, 0, newPipeline);
    }
    return this;
  }

  public addAfter(after: AbstractHandler, newPipeline: AbstractHandler): Pipeline {
    this._register(newPipeline);
    const index = this.handlers.findIndex((handler) => handler.getName() === after.getName());
    if (index !== -1) {
      this.handlers.splice(index + 1, 0, newPipeline);
    }
    return this;
  }

  public remove(handlerToDelete: AbstractHandler): Pipeline {
    this.handlers = this.handlers.filter((handler) => handler.getName() !== handlerToDelete.getName());
    return this;
  }

  public addLast(handler: AbstractHandler): Pipeline {
    this._register(handler);
    this.handlers.push(handler);
    return this;
  }

  public transform(segment: string): string {
    this.idNumber = -1;
    for (const handler of this.handlers) {
      segment = handler.transform(segment);
    }
    return this.realignIDs(segment);
  }

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

  protected _register(handler: AbstractHandler): Pipeline {
    handler.setPipeline(this);
    return this;
  }
}