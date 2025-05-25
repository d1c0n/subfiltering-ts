import { Utils } from './Utils';

/**
 * @file ArrayList.ts
 * @brief Implements an ArrayList-like class with safe access to elements, inspired by Java's ArrayList.
 */
export class ArrayList<T> extends Array<T> {
  /**
   * Constructs a new ArrayList instance.
   * @param initialList An optional initial array to populate the list.
   * @throws Error if an invalid non-list array is provided.
   */
  public constructor(initialList: T[] = []) {
    if (!Utils.arrayIsList(initialList)) {
      throw new Error('Invalid list provided: ArrayList can only be initialized with a numeric-indexed array.');
    }
    super(...initialList);
  }

  /**
   * Static helper for constructor, providing a more fluent way to create an ArrayList instance.
   * @param initialList An optional initial array.
   * @returns A new ArrayList instance.
   */
  public static instance<T>(initialList: T[] = []): ArrayList<T> {
    return new ArrayList<T>(initialList);
  }

  /**
   * Returns the element at the specified position in this list.
   * Provides safe access, returning `undefined` if the index is out of bounds.
   * @param index The index of the element to return.
   * @returns The element at the specified position, or `undefined` if the index is out of bounds.
   */
  public get(index: number): T | undefined {
    if (index >= 0 && index < this.length) {
      return this[index];
    }
    return undefined;
  }

  /**
   * Appends the specified element to the end of this list.
   * @param value The element to be appended to this list.
   * @returns The new length of the array.
   */
  public add(value: T): number {
    return this.push(value);
  }
}