import { FeatureSetInterface } from './contracts/FeatureSetInterface';

/**
 * @abstract
 * @class AbstractFilter
 */
export abstract class AbstractFilter {
  protected static _INSTANCE: AbstractFilter | null = null;
  protected featureSet!: FeatureSetInterface;
  protected source!: string | null;
  protected target!: string | null;
  protected dataRefMap: Record<string, any> = {};

  /**
   * Update/Add featureSet
   * @param {FeatureSetInterface} featureSet
   */
  protected setFeatureSet(featureSet: FeatureSetInterface): void {
    this.featureSet = featureSet;
  }

  /**
   * @param {Record<string, any>} dataRefMap
   */
  protected setDataRefMap(dataRefMap: Record<string, any> = {}): void {
    this.dataRefMap = dataRefMap;
  }

  /**
   * @param {string | null} source
   */
  protected setSource(source: string | null): void {
    this.source = source;
  }

  /**
   * @param {string | null} target
   */
  protected setTarget(target: string | null): void {
    this.target = target;
  }

  /**
   * Destroy the singleton
   */
  public static destroyInstance(): void {
    AbstractFilter._INSTANCE = null;
  }

  /**
   * @param {FeatureSetInterface} featureSet
   * @param {string | null} source
   * @param {string | null} target
   * @param {Record<string, any>} dataRefMap
   * @returns {T}
   * @throws {Error}
   */
  public static getInstance<T extends AbstractFilter>(
    this: new () => T,
    featureSet: FeatureSetInterface,
    source: string | null = null,
    target: string | null = null,
    dataRefMap: Record<string, any> = {},
  ): T {
    if (AbstractFilter._INSTANCE === null) {
      AbstractFilter._INSTANCE = new this();
    }

    // Type assertion to ensure _INSTANCE is of type T
    const instance = AbstractFilter._INSTANCE as T;

    instance.setSource(source);
    instance.setTarget(target);
    instance.setDataRefMap(dataRefMap);
    instance.setFeatureSet(featureSet);

    return instance;
  }

  /**
   * Used to transform database raw xml content ( Layer 0 ) to the sub filtered structures, used for server to server ( Ex: TM/MT ) communications ( Layer 1 )
   * @param {string} segment
   * @returns {string}
   * @abstract
   */
  public abstract fromLayer0ToLayer1(segment: string): string;

  /**
   * Used to transform external server raw xml content ( Ex: TM/MT ) to allow them to be stored in database ( Layer 0 ), used for server to server communications ( Layer 1 )
   * @param {string} segment
   * @returns {string}
   * @abstract
   */
  public abstract fromLayer1ToLayer0(segment: string): string;
}