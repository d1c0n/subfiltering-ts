import { Pipeline } from '../commons/Pipeline'; // Assuming Pipeline will be in the same commons directory

export abstract class AbstractHandler {
  protected name: string;
  protected pipeline: Pipeline;

  public constructor() {
    this.name = this.constructor.name;
    this.pipeline = new Pipeline();
  }

  public abstract transform(segment: string): string;

  public getName(): string {
    return this.name;
  }

  public setPipeline(pipeline: Pipeline): void {
    this.pipeline = pipeline;
  }

  public getPipeline(): Pipeline {
    return this.pipeline;
  }
}