import { Pipeline } from '../commons/Pipeline'; // Assuming Pipeline will be in the same commons directory

/**
 * @abstract
 * @class AbstractHandler
 */
export abstract class AbstractHandler {
  protected name: string;
  protected pipeline: Pipeline;

  /**
   * AbstractHandler constructor.
   */
  public constructor() {
    this.name = this.constructor.name;
    this.pipeline = new Pipeline();
  }

  /**
   * @param {string} segment
   * @returns {string}
   * @abstract
   */
  public abstract transform(segment: string): string;

  /**
   * @returns {string}
   */
  public getName(): string {
    return this.name;
  }

  /**
   * @param {Pipeline} pipeline
   */
  public setPipeline(pipeline: Pipeline): void {
    this.pipeline = pipeline;
  }

  /**
   * @returns {Pipeline}
   */
  public getPipeline(): Pipeline {
    return this.pipeline;
  }
}