
export class Utils {

  public static arrayIsList(arr: unknown[]): boolean {
    if (!Array.isArray(arr)) {
      return false;
    }
    if (arr.length === 0) {
      return true;
    }
    return arr.every((_, index) => index === arr.indexOf(_));
  }

  public static contains(needle: string, haystack: string): boolean {
    return haystack.includes(needle);
  }

  public static fastUnicode2Ord(mbChar: string): number {
    if (mbChar.length === 0) {
      return 0; // Or throw an error, depending on desired behavior for empty string
    }
    return mbChar.codePointAt(0) || 0;
  }

  public static htmlentitiesFromUnicode(str: string): string {
    // In JavaScript, we typically don't need to convert Unicode characters to HTML entities
    // unless specifically targeting older HTML versions or specific XML contexts.
    // For general string manipulation, JavaScript handles Unicode natively.
    // This implementation will return the HTML entity for the first character's code point.
    const code = Utils.fastUnicode2Ord(str);
    return `&#${code};`; // Using & to escape the ampersand itself
  }

  public static unicode2Chr(o: number): string {
    return String.fromCodePoint(o);
  }
}