/**
 * @file ConstantEnum.ts
 * @brief Defines a TypeScript enum for various constants used in subfiltering.
 */
export enum ConstantEnum {
  INTERNAL_ATTR_ID_PREFIX = '__mtc_',
  LTPLACEHOLDER = '##LESSTHAN##',
  GTPLACEHOLDER = '##GREATERTHAN##',
  AMPPLACEHOLDER = '##AMPPLACEHOLDER##',
  lfPlaceholder = '##$_0A$##',
  crPlaceholder = '##$_0D$##',
  crlfPlaceholder = '##$_0D0A$##',
  tabPlaceholder = '##$_09$##',
  nbspPlaceholder = '##$_A0$##',
  splitPlaceHolder = '##$_SPLIT$##',
  xliffInXliffStartPlaceHolder = '##XLIFFTAGPLACEHOLDER_START##',
  xliffInXliffEndPlaceHolder = '##XLIFFTAGPLACEHOLDER_END##',
}