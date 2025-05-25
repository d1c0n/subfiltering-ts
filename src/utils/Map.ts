import { Utils } from './Utils';
import { DomainException } from '../exceptions/DomainException';

/**
 * @file Map.ts
 * @brief Implements a Map-like class with additional utility methods, inspired by Java's Map interface,
 *        wrapping a standard JavaScript object for key-value storage.
 */
export class Map<K extends string | number | symbol, V> implements Iterable<[K, V]> {
  private data: Record<K, V>;

  /**
   * Constructs a new Map instance.
   * @param initialMap An optional initial object or array of key-value pairs to populate the map.
   *                   If an array is provided, it must not be a list (i.e., it must be an associative array/object).
   * @throws DomainException if an invalid list is provided as initialMap.
   */
  public constructor(initialMap: [K, V][] | Record<K, V> = {} as Record<K, V>) {
    if (Array.isArray(initialMap)) {
      if (Utils.arrayIsList(initialMap)) {
        throw new DomainException('Invalid map provided: Cannot initialize Map with a numeric-indexed array.');
      }
      this.data = initialMap.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<K, V>);
    } else {
      this.data = { ...initialMap };
    }
  }

  /**
   * Static helper for constructor, providing a more fluent way to create a Map instance.
   * @param initialMap An optional initial object or array of key-value pairs.
   * @returns A new Map instance.
   */
  public static instance<K extends string | number | symbol, V>(initialMap: [K, V][] | Record<K, V> = {} as Record<K, V>): Map<K, V> {
    return new Map<K, V>(initialMap);
  }

  /**
   * Returns the number of key-value mappings in this map.
   * @returns The number of key-value mappings.
   */
  public size(): number {
    return Object.keys(this.data).length;
  }

  /**
   * Returns an iterator for the key-value pairs in this map.
   * @returns An iterator for the map entries.
   */
  public *[Symbol.iterator](): Iterator<[K, V]> {
    for (const key in this.data) {
      if (Object.prototype.hasOwnProperty.call(this.data, key)) {
        yield [key as K, this.data[key]];
      }
    }
  }

  /**
   * Checks if the map contains a mapping for the specified key.
   * @param key The key whose presence in this map is to be tested.
   * @returns True if this map contains a mapping for the specified key.
   */
  public containsKey(key: K): boolean {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  /**
   * Checks if the map contains one or more keys to the specified value.
   * @param value The value whose presence in this map is to be tested.
   * @returns True if this map contains a mapping for the specified value.
   */
  public containsValue(value: V): boolean {
    for (const key in this.data) {
      if (Object.prototype.hasOwnProperty.call(this.data, key)) {
        if (this.data[key] === value) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Returns the value to which the specified key is mapped, or `undefined` if this map contains no mapping for the key.
   * @param key The key whose associated value is to be returned.
   * @returns The value to which the specified key is mapped, or `undefined` if this map contains no mapping for the key.
   */
  public get(key: K): V | undefined {
    return this.data[key];
  }

  /**
   * Returns the value to which the specified key is mapped, or `defaultValue` if this map contains no mapping for the key.
   * @param key The key whose associated value is to be returned.
   * @param defaultValue The default value to return if the key is not found.
   * @returns The value to which the specified key is mapped, or `defaultValue` if this map contains no mapping for the key.
   */
  public getOrDefault(key: K, defaultValue: V): V {
    const value = this.data[key];
    return value === undefined ? defaultValue : value;
  }

  /**
   * Removes all of the mappings from this map. The map will be empty after this call returns.
   */
  public clear(): void {
    this.data = {} as Record<K, V>;
  }

  /**
   * Returns a shallow copy of this Map instance.
   * @returns A new Map instance containing the same key-value mappings.
   */
  public clone(): Map<K, V> {
    return new Map<K, V>(this.data);
  }

  /**
   * Returns `true` if this map contains no key-value mappings.
   * @returns `true` if this map contains no key-value mappings.
   */
  public isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Returns a new `Array` of the keys contained in this map.
   * @returns An array of the keys.
   */
  public keySet(): K[] {
    return Object.keys(this.data) as K[];
  }

  /**
   * Returns a new `Array` of the values contained in this map.
   * @returns An array of the values.
   */
  public values(): V[] {
    return Object.values(this.data);
  }

  /**
   * Returns a new `Array` of the key-value pairs (entries) contained in this map.
   * @returns An array of [key, value] pairs.
   */
  public entries(): [K, V][] {
    return Object.entries(this.data) as [K, V][];
  }

  /**
   * Associates the specified value with the specified key in this map.
   * If the map previously contained a mapping for the key, the old value is replaced.
   * @param key The key with which the specified value is to be associated.
   * @param value The value to be associated with the specified key.
   * @returns The previous value associated with `key`, or `null` if there was no mapping for `key`.
   */
  public put(key: K, value: V): V | null {
    const previousValue = this.data[key];
    this.data[key] = value;
    return previousValue === undefined ? null : previousValue;
  }

  /**
   * Copies all of the mappings from the specified map to this map.
   * These mappings will replace any mappings that this map had for any of the keys currently in the specified map.
   * @param mapToPut The map whose mappings are to be placed in this map.
   */
  public putAll(mapToPut: Map<K, V> | [K, V][] | Record<K, V>): void {
    if (mapToPut instanceof Map) {
      mapToPut.forEach((value, key) => { this.data[key] = value; });
    } else if (Array.isArray(mapToPut)) {
      mapToPut.forEach(([key, value]) => { this.data[key] = value; });
    } else {
      for (const key in mapToPut) {
        if (Object.prototype.hasOwnProperty.call(mapToPut, key)) {
          this.data[key] = mapToPut[key];
        }
      }
    }
  }

  /**
   * If the specified key is not already associated with a value (or is mapped to `undefined`),
   * associates it with the given value and returns `null`, else returns the current value.
   * @param key The key with which the specified value is to be associated.
   * @param value The value to be associated with the specified key.
   * @returns The previous value associated with the specified key, or `null` if there was no mapping for the key.
   */
  public putIfAbsent(key: K, value: V): V | null {
    if (!this.containsKey(key) || this.data[key] === undefined) {
      this.data[key] = value;
      return null;
    }
    return this.data[key];
  }

  /**
   * Removes the mapping for the specified key from this map if present.
   * @param key The key whose mapping is to be removed from the map.
   * @returns `true` if the value was removed.
   */
  public remove(key: K): boolean {
    const exists = this.containsKey(key);
    if (exists) {
      delete this.data[key];
    }
    return exists;
  }

  /**
   * Replaces the entry for the specified key only if it is currently mapped to some value.
   * @param key The key with which the specified value is to be associated.
   * @param value The value to be associated with the specified key.
   * @returns The previous value associated with the specified key, or `null` if there was no mapping for the key.
   */
  public replace(key: K, value: V): V | null {
    if (this.containsKey(key)) {
      const previousValue = this.data[key];
      this.data[key] = value;
      return previousValue === undefined ? null : previousValue;
    }
    return null;
  }

  /**
   * Replaces the entry for the specified key only if currently mapped to the specified value.
   * @param key The key with which the specified value is to be associated.
   * @param oldValue The value expected to be associated with the specified key.
   * @param newValue The value to be associated with the specified key.
   * @returns `true` if the value was replaced.
   */
  public replaceIfEquals(key: K, oldValue: V, newValue: V): boolean {
    if (this.containsKey(key) && this.data[key] === oldValue) {
      this.data[key] = newValue;
      return true;
    }
    return false;
  }

  /**
   * Replaces each entry's value with the result of invoking the given function on that entry.
   * @param replacer A function that accepts a value and its corresponding key, and returns the new value.
   */
  public replaceAll(replacer: (value: V, key: K) => V): void {
    for (const key in this.data) {
      if (Object.prototype.hasOwnProperty.call(this.data, key)) {
        this.data[key] = replacer(this.data[key], key as K);
      }
    }
  }

  /**
   * Attempts to compute a mapping for the specified key and its current mapped value (or `null` if there is no current mapping).
   * If the function returns `null`, the mapping is removed (or remains absent if initially absent).
   * @param key The key with which the specified value is to be associated.
   * @param remappingFunction The function to compute a value.
   * @returns The new value associated with the specified key, or `null` if none.
   */
  public compute(key: K, remappingFunction: (key: K, value: V | null) => V | null): V | null {
    const currentValue = this.containsKey(key) ? this.data[key] : null;
    const newValue = remappingFunction(key, currentValue as V | null);

    if (newValue === null) {
      delete this.data[key];
    } else {
      this.data[key] = newValue;
    }
    return newValue;
  }

  /**
   * If the specified key is not already associated with a value (or is mapped to `null`),
   * attempts to compute its value using the given mapping function and enters it into this map unless `null`.
   * @param key The key with which the specified value is to be associated.
   * @param mappingFunction The function to compute a value.
   * @returns The current (existing or computed) value associated with the specified key, or `null` if the computed value is `null`.
   */
  public computeIfAbsent(key: K, mappingFunction: (key: K) => V | null): V | null {
    const currentValue = this.containsKey(key) ? this.data[key] : null;
    if (currentValue === null) {
      const newValue = mappingFunction(key);
      if (newValue !== null) {
        this.data[key] = newValue;
      }
      return newValue;
    }
    return currentValue;
  }

  /**
   * If the value for the specified key is present and non-`null`, attempts to compute a new mapping given the key and its current mapped value.
   * If the function returns `null`, the mapping is removed.
   * @param key The key with which the specified value is to be associated.
   * @param remappingFunction The function to compute a value.
   * @returns The new value associated with the specified key, or `null` if none.
   */
  public computeIfPresent(key: K, remappingFunction: (key: K, value: V) => V | null): V | null {
    const currentValue = this.containsKey(key) ? this.data[key] : null;
    if (currentValue !== null) {
      const newValue = remappingFunction(key, currentValue as V);
      if (newValue === null) {
        delete this.data[key];
      } else {
        this.data[key] = newValue;
      }
      return newValue;
    }
    return null;
  }

  /**
   * Performs the given action for each entry in this map.
   * @param callbackfn A function that accepts a value and its corresponding key.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   */
  public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    for (const key in this.data) {
      if (Object.prototype.hasOwnProperty.call(this.data, key)) {
        callbackfn.call(thisArg, this.data[key], key as K, this);
      }
    }
  }
  /**
   * Returns a plain JavaScript object representation of this Map.
   * @returns A plain object with the same key-value pairs as this Map.
   */
  public toObject(): Record<K, V> {
    return { ...this.data };
  }
}