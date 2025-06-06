import { FeatureSetInterface } from './contracts/FeatureSetInterface';

export abstract class AbstractFilter {
  protected static _INSTANCE: AbstractFilter | null = null;
  protected featureSet!: FeatureSetInterface;
  protected source!: string | null;
  protected target!: string | null;
  protected dataRefMap: Record<string, any> = {};


  protected setFeatureSet(featureSet: FeatureSetInterface): void {
    this.featureSet = featureSet;
  }

  protected setDataRefMap(dataRefMap: Record<string, any> = {}): void {
    this.dataRefMap = dataRefMap;
  }

  protected setSource(source: string | null): void {
    this.source = source;
  }

  protected setTarget(target: string | null): void {
    this.target = target;
  }

  public static destroyInstance(): void {
    AbstractFilter._INSTANCE = null;
  }

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

  public abstract fromLayer0ToLayer1(segment: string): string;

  public abstract fromLayer1ToLayer0(segment: string): string;
}