export interface FeatureSetInterface {
  /**
   * Returns the filtered subject variable passed to all enabled features.
   */
  filter(method: string, filterable: any): any;
}