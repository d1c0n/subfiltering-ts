import { FeatureSetInterface } from '../../src/contracts/FeatureSetInterface';
import { BaseFeature } from './features/BaseFeature';

export class FeatureSet implements FeatureSetInterface {
  private features: BaseFeature[] = [];

  public constructor(features: BaseFeature[] | null = null) {
    if (features) {
      this.features = features;
    }
  }

  public filter(method: string, filterable: any, ...args: any[]): any {
    for (const feature of this.features) {
      if (feature && typeof (feature as any)[method] === 'function') {
        filterable = (feature as any)[method](filterable, ...args);
      }
    }
    return filterable;
  }
}