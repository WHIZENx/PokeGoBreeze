import './extensions/string.extension';
import { TableColumn } from 'react-data-table-component';
import { TableColumnModify } from './models/overrides/data-table.model';
import { EqualMode, IncludeMode, PaddingMode } from './enums/string.enum';
import { FloatPaddingOption } from './models/extension.model';

export type DynamicObj<S, T extends string | number = string | number> = { [x in T]: S };
type Constructor = typeof Number | typeof String | typeof Boolean | typeof Array | typeof Object | typeof Date;

/**
 * Returns the default value for the given type.
 * Works even when the value is null or undefined.
 *
 * @param type - The constructor reference (e.g., Number, String, etc.)
 * @param value - The value to get the type for (can be null/undefined)
 * @param defaultValues - Optional default values to use if the value is null/undefined
 * @returns The default value for the given type
 *
 * @example
 * // Returns 0 even though value is undefined
 * const myNumber: number | undefined = undefined;
 * getValueOrDefault(Number, myNumber); // returns 0
 */
export const getValueOrDefault = <T>(
  type: Constructor,
  value: T | undefined | null,
  ...defaultValues: (T | null | undefined)[]
) => {
  if (isNullOrUndefined(value) || isEmpty(value?.toString())) {
    const defaultValue = defaultValues.find((v) => !isNullOrUndefined(v));
    switch (type) {
      case Number:
        return (defaultValue || 0) as T;
      case String:
        return (defaultValue || '') as T;
      case Boolean:
        return (defaultValue || false) as T;
      case Array:
        return (defaultValue || []) as T;
      case Date:
        return (defaultValue || new Date()) as T;
      case Object:
        return (defaultValue || new Object()) as T;
      default:
        return (defaultValue || value) as T;
    }
  }
  return value;
};

export const convertColumnDataType = <T>(columns: TableColumnModify<T>[]) => columns as TableColumn<T>[];

export const combineClasses = <T>(...classes: (T | null | undefined)[]) =>
  classes.filter((c) => !isNullOrUndefined(c) && isNotEmpty(c?.toString())).join(' ');

export const isUndefined = <T>(value?: T | null) => typeof value === 'undefined' && value === undefined;

export const isNull = <T>(value?: T | null) => typeof value !== 'undefined' && value === null;

export const isEmpty = (value?: string | null) => typeof value === 'string' && value === '';

export const isNotEmpty = <T>(value: string | T[] | null | undefined) =>
  Array.isArray(value) ? value.length > 0 : !isNullOrUndefined(value) && !isEmpty(value);

export const isNullOrUndefined = <T>(value?: T | null) => isNull(value) || isUndefined(value);

export const isNullOrEmpty = (value?: string | null) => isNull(value) || isEmpty(value);

export const isUndefinedOrEmpty = (value?: string | null) => isUndefined(value) || isEmpty(value);

export const isNumber = <T>(value: T | null | undefined) => {
  if (Array.isArray(value)) {
    return false;
  }
  const result = getValueOrDefault(String, value?.toString());
  return !isEmpty(result) && !isNaN(Number(result));
};

export const toNumber = (value: string | number | null | undefined, defaultValue = 0) => {
  if (isNullOrUndefined(value)) {
    return defaultValue;
  }
  const result = parseFloat(value.toString());
  if (isNaN(result)) {
    return defaultValue;
  }
  return result;
};

export const toFloat = (value: string | number | null | undefined, fixedRounding = -1, defaultValue = 0) => {
  const result = toNumber(value, defaultValue);
  if (fixedRounding < 0) {
    return result;
  }
  return parseFloat(result.toFixed(fixedRounding));
};

export const padding = (num: number, plusLength: number, mode = PaddingMode.End, fillString = '0') => {
  let result = num.toString();
  const [integer, point] = result.split('.');
  if (mode === PaddingMode.Start) {
    result = result.padStart(plusLength + (isInclude(result, '.') ? 1 + toNumber(point?.length) : 0), fillString);
  } else if (mode === PaddingMode.End) {
    if (!isInclude(result, '.')) {
      result += '.';
    }
    result = result.padEnd(plusLength + (isInclude(result, '.') ? 1 + toNumber(integer?.length) : 0), fillString);
  }
  return result;
};

export const toFloatWithPadding = (
  value: string | number | null | undefined,
  fixedRounding: number,
  options = new FloatPaddingOption()
) => {
  const result = parseFloat((value || options.defaultValue).toString());
  if (
    result === 0 ||
    (!isNullOrUndefined(options.minValue) && result <= options.minValue) ||
    (!isNullOrUndefined(options.maxValue) && result >= options.maxValue)
  ) {
    return Math.round(result).toString();
  }
  const paddingResult = padding(parseFloat(result.toFixed(fixedRounding)), fixedRounding);
  if (
    (!isNullOrUndefined(options.minLength) && paddingResult.length <= options.minLength) ||
    (!isNullOrUndefined(options.maxLength) && paddingResult.length >= options.maxLength)
  ) {
    return Math.round(result).toString();
  }
  return paddingResult;
};

export const isEqual = (
  value: string | number | undefined | null,
  compareValue: string | number | undefined | null,
  mode = EqualMode.CaseSensitive
) => {
  value = getValueOrDefault(String, value?.toString());
  compareValue = getValueOrDefault(String, compareValue?.toString());
  switch (mode) {
    case EqualMode.IgnoreCaseSensitive:
      return value.isEqualWithIgnoreCase(compareValue);
    case EqualMode.CaseSensitive:
    default:
      return value.isEqual(compareValue);
  }
};

export const isInclude = (
  value: string | number | undefined | null,
  includesValue: string | number | undefined | null,
  mode = IncludeMode.Include
) => {
  const result = getValueOrDefault(String, value?.toString());
  const resultIncludesValue = getValueOrDefault(String, includesValue?.toString());
  switch (mode) {
    case IncludeMode.IncludeIgnoreCaseSensitive:
      return result.includesWithIgnoreCase(resultIncludesValue);
    case IncludeMode.IncludeBetweenIgnoreCaseSensitive:
      return result.includesWithIgnoreCase(resultIncludesValue) || resultIncludesValue.includesWithIgnoreCase(result);
    case IncludeMode.IncludeBetween:
      return result.includes(resultIncludesValue) || resultIncludesValue.includes(result);
    case IncludeMode.Include:
    default:
      return result.includes(resultIncludesValue);
  }
};

export const isIncludeList = (
  value: (string | number | undefined | null)[] | undefined | null,
  includesValue: string | number | undefined | null,
  mode: IncludeMode.Include | IncludeMode.IncludeIgnoreCaseSensitive = IncludeMode.Include
) => {
  if (!isNotEmpty(value)) {
    return false;
  }
  const result = getValueOrDefault(
    Array,
    value?.map((i) => (!isNullOrUndefined(i) ? i.toString() : ''))
  );
  const resultIncludesValue = getValueOrDefault(String, includesValue?.toString());
  switch (mode) {
    case IncludeMode.IncludeIgnoreCaseSensitive:
      return result.map((i) => i.toUpperCase()).includes(resultIncludesValue.toUpperCase());
    case IncludeMode.Include:
    default:
      return result.includes(resultIncludesValue);
  }
};

export const isIncludeListBetween = (
  valueList: (string | number | undefined | null)[] | undefined | null,
  includesValueList: (string | number | undefined | null)[] | undefined | null,
  mode: IncludeMode.Include | IncludeMode.IncludeIgnoreCaseSensitive = IncludeMode.Include
) => {
  const result = new Set(
    getValueOrDefault(
      Array,
      valueList?.map((i) =>
        !isNullOrUndefined(i)
          ? mode === IncludeMode.IncludeIgnoreCaseSensitive
            ? i.toString().toUpperCase()
            : i.toString()
          : ''
      )
    )
  );
  const resultBetween = new Set(
    getValueOrDefault(
      Array,
      includesValueList?.map((i) =>
        !isNullOrUndefined(i)
          ? mode === IncludeMode.IncludeIgnoreCaseSensitive
            ? i.toString().toUpperCase()
            : i.toString()
          : ''
      )
    )
  );
  return isNotEmpty(Array.from(result.intersection(resultBetween)));
};

export const Count = <T>(array: T[], value: T, key?: string, mode = EqualMode.CaseSensitive) =>
  array.filter((item) =>
    isEqual(key ? (item as unknown as DynamicObj<string>)[key] : (item as string), value as string, mode)
  ).length;

type DynamicKeyObj<T> = { [Property in keyof T]: string };
export const getPropertyName = <T extends object, S extends string = ''>(
  obj: T | null | undefined,
  expression: (x: DynamicKeyObj<T>) => string
): S => {
  if (isNullOrUndefined(obj)) {
    return '' as S;
  }
  const res = new Object() as DynamicKeyObj<T>;
  Object.keys(obj).map((k) => (res[k as keyof T] = k));
  return expression(res) as S;
};

export const sparseIndexOf = <T>(array: T[], value: T, defaultOutput = -1) => {
  return toNumber(
    Object.keys(array).find((k) => array[toNumber(k)] === value),
    defaultOutput
  );
};

export const UniqValueInArray = <T>(array: (T | null | undefined)[] | null | undefined) => {
  const seen = new Object() as DynamicObj<number>;
  const out: T[] = [];
  array = getValueOrDefault(Array, array);
  const len = array.length;
  let j = 0;
  for (let i = 0; i < len; i++) {
    const item = array[i];
    if (!isNullOrUndefined(item) && seen[`${item}`] !== 1) {
      seen[`${item}`] = 1;
      out[j++] = item;
    }
  }
  return out;
};

export const safeObjectEntries = <T extends object | string | number, S extends string | number = string | number>(
  obj: Record<S, T> | object | undefined,
  defaultObj = new Object()
) => Object.entries(obj || defaultObj) as [string, T][];
