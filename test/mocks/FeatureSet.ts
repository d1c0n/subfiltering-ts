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
        // The original PHP code uses `call_user_func_array` which passes all arguments
        // after the method name. TypeScript/JavaScript functions can be called directly
        // with spread operator for arguments.
        // The original PHP code also shifts the first argument (filterable) and unshifts it back.
        // In TypeScript, we can directly pass `filterable` and then the rest of the arguments.
        filterable = (feature as any)[method](filterable, ...args);
      }
    }
    return filterable;
  }
}