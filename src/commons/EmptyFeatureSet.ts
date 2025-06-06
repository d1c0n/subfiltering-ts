import { FeatureSetInterface } from '../contracts/FeatureSetInterface';

/**
 * Used from sources which want not to implement a custom object from this package
 */
export class EmptyFeatureSet implements FeatureSetInterface {

  // eslint-disable-next-line class-methods-use-this
  public filter<T>(method: string, filterable: T): T {
    return filterable;
  }
}