/**
 * @file Utils.ts
 * @brief Provides utility functions for array and string manipulation.
 */
export class Utils {
  /**
   * Checks if an array is a list (i.e., has sequential, 0-based numeric keys).
   * @param arr The array to check.
   * @returns True if the array is a list, false otherwise.
   */
  public static arrayIsList(arr: unknown[]): boolean {
    if (!Array.isArray(arr)) {
      return false;
    }
    if (arr.length === 0) {
      return true;
    }
    return arr.every((_, index) => index === arr.indexOf(_));
  }

  /**
   * Checks if a string contains another string.
   * @param needle The string to search for.
   * @param haystack The string to search within.
   * @returns True if the haystack contains the needle, false otherwise.
   */
  public static contains(needle: string, haystack: string): boolean {
    return haystack.includes(needle);
  }

  /**
   * Get the char code from a multibyte char.
   * This is a simplified version as JavaScript handles Unicode characters directly.
   * @param mbChar Unicode Multibyte Char String.
   * @returns The Unicode code point of the first character.
   */
  public static fastUnicode2Ord(mbChar: string): number {
    if (mbChar.length === 0) {
      return 0; // Or throw an error, depending on desired behavior for empty string
    }
    return mbChar.codePointAt(0) || 0;
  }

  /**
   * Converts a string to HTML entities from Unicode characters.
   * This is a simplified version as JavaScript handles Unicode characters directly.
   * @param str The string to convert.
   * @returns The string with HTML entities.
   */
  public static htmlentitiesFromUnicode(str: string): string {
    // In JavaScript, we typically don't need to convert Unicode characters to HTML entities
    // unless specifically targeting older HTML versions or specific XML contexts.
    // For general string manipulation, JavaScript handles Unicode natively.
    // This implementation will return the HTML entity for the first character's code point.
    const code = Utils.fastUnicode2Ord(str);
    return `&#${code};`; // Using & to escape the ampersand itself
  }

  /**
   * Gets the character from a Unicode code point.
   * @param o The Unicode code point.
   * @returns The character corresponding to the code point.
   */
  public static unicode2Chr(o: number): string {
    return String.fromCodePoint(o);
  }
}