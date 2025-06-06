import { Utils } from '../utils/Utils';

export enum CTypeEnum {
  // Layer 1
  ORIGINAL_X = 'x-original_x',
  ORIGINAL_SELF_CLOSE_PH_WITH_EQUIV_TEXT = 'x-original_ph',
  ORIGINAL_PH_CONTENT = 'x-original_ph_content',
  HTML = 'x-html',
  TWIG = 'x-twig',
  RUBY_ON_RAILS = 'x-ruby-on-rails',
  SNAILS = 'x-snails',
  CURLY_BRACKETS = 'x-curly-brackets',
  PERCENT_SNAILS = 'x-percent-snails',
  PERCENT_NUMBER_SNAILS = 'x-percent-number-snails',
  PERCENTAGES = 'x-percentages',
  SPRINTF = 'x-sprintf',
  PERCENT_VARIABLE = 'x-percent-variable',
  SMART_COUNT = 'x-smart-count',
  DOUBLE_SQUARE_BRACKETS = 'x-double-square-brackets',
  DOLLAR_CURLY_BRACKETS = 'x-dollar-curly-brackets',
  SQUARE_SPRINTF = 'x-square-sprintf',

  // Data Ref Layer 2
  ORIGINAL_PC_OPEN_NO_DATA_REF = 'x-original_pc_open',
  ORIGINAL_PC_CLOSE_NO_DATA_REF = 'x-original_pc_close',
  ORIGINAL_PH_OR_NOT_DATA_REF = 'x-original_ph_no_data_ref',
  PH_DATA_REF = 'x-ph_data_ref',
  PC_OPEN_DATA_REF = 'x-pc_open_data_ref',
  PC_CLOSE_DATA_REF = 'x-pc_close_data_ref',
  PC_SELF_CLOSE_DATA_REF = 'x-pc_sc_data_ref',
  SC_DATA_REF = 'x-sc_data_ref',
  EC_DATA_REF = 'x-ec_data_ref',
}

export class CTypeEnumHelper {
  private static allConstantValues: Record<string, string> = {};
  private static layer2ConstantValues: Record<string, string> = {};

  /**
   * Initializes the maps of all constant values and layer 2 constant values.
   * This is a static initializer to ensure the maps are populated once.
   */
  private static initializeConstantValues(): void {
    if (Object.keys(CTypeEnumHelper.allConstantValues).length === 0) {
      const allConstants: Record<string, string> = {};
      const layer2Constants: Record<string, string> = {};

      for (const key in CTypeEnum) {
        if (Object.prototype.hasOwnProperty.call(CTypeEnum, key)) {
          const value = CTypeEnum[key as keyof typeof CTypeEnum];
          if (typeof value === 'string') {
            allConstants[value] = key; // value as key, key as value (PHP array_flip behavior)
            if (Utils.contains('DATA_REF', key)) {
              layer2Constants[value] = key;
            }
          }
        }
      }
      CTypeEnumHelper.allConstantValues = allConstants;
      CTypeEnumHelper.layer2ConstantValues = layer2Constants;
    }
  }

  public static isMatecatCType(ctype: string): boolean {
    CTypeEnumHelper.initializeConstantValues();
    return Object.prototype.hasOwnProperty.call(CTypeEnumHelper.allConstantValues, ctype);
  }

  public static isLayer2Constant(ctype: string): boolean {
    CTypeEnumHelper.initializeConstantValues();
    return Object.prototype.hasOwnProperty.call(CTypeEnumHelper.layer2ConstantValues, ctype);
  }
}