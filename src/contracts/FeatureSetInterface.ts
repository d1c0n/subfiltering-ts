/**
 * @interface FeatureSetInterface
 */
export interface FeatureSetInterface {
  /**
   * Returns the filtered subject variable passed to all enabled features.
   *
   * @param {string} method
   * @param {any} filterable
   * @returns {any}
   */
  filter(method: string, filterable: any): any;
}