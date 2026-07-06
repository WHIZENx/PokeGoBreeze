import './extensions/string.extension';
import { TableColumn } from 'react-data-table-component';
import { TableColumnModify } from './models/overrides/data-table.model';
import { EqualMode, IncludeMode, PaddingMode } from './enums/string.enum';
import { FloatPaddingOption } from './models/extension.model';

export type DynamicObj<S, T extends string | number = string | number> = { [x in T]: S };
type Constructor =
  | typeof Number
  | typeof String
  | typeof Boolean
  | typeof BigInt
  | typeof Symbol
  | typeof Array
  | typeof Object
  | typeof Date
  | typeof Map
  | typeof Set
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | (new (...args: any[]) => any);

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
): T => {
  const isBlank = isNullOrUndefined(value) || (type === String && isEmpty(value as unknown as string));
  if (!isBlank) {
    return value as T;
  }
  const fallback = defaultValues.find((v) => !isNullOrUndefined(v));
  switch (type) {
    case Number:
      return (fallback ?? 0) as T;
    case String:
      return (fallback ?? '') as T;
    case Boolean:
      return (fallback ?? false) as T;
    case BigInt:
      return (fallback ?? BigInt(0)) as T;
    case Symbol:
      return (fallback ?? Symbol()) as T;
    case Array:
      return (fallback ?? []) as T;
    case Map:
      return (fallback ?? new Map()) as T;
    case Set:
      return (fallback ?? new Set()) as T;
    case Date:
      return (fallback ?? new Date()) as T;
    case Object:
      return (fallback ?? {}) as T;
    default:
      return (fallback ?? value) as T;
  }
};

export const convertColumnDataType = <T>(columns: TableColumnModify<T>[]) => columns as TableColumn<T>[];

export const combineClasses = <T>(...classes: (T | null | undefined)[]) =>
  classes.filter((c) => c != null && c.toString() !== '').join(' ');

export const isUndefined = <T>(value?: T | null): value is undefined => value === undefined;

export const isNull = <T>(value?: T | null): value is null => value === null;

export const isEmpty = (value?: string | null) => typeof value === 'string' && value === '';

export const isNotEmpty = <T>(value: string | T[] | null | undefined) =>
  Array.isArray(value) ? value.length > 0 : !isNullOrUndefined(value) && !isEmpty(value);

export const isNullOrUndefined = <T>(value?: T | null): value is null | undefined => value == null;

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
  const hasDot = result.includes('.');
  if (mode === PaddingMode.Start) {
    result = result.padStart(plusLength + (hasDot ? 1 + toNumber(point?.length) : 0), fillString);
  } else if (mode === PaddingMode.End) {
    if (!hasDot) {
      result += '.';
    }
    result = result.padEnd(plusLength + 1 + toNumber(integer?.length), fillString);
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

export const isIncludeList = <T>(
  value: T[] | undefined | null,
  includesValue: T | undefined | null,
  mode: IncludeMode.Include | IncludeMode.IncludeIgnoreCaseSensitive = IncludeMode.Include
) => {
  if (!isNotEmpty(value)) {
    return false;
  }
  const result = getValueOrDefault(
    Array,
    value?.map((i) => (!isNullOrUndefined(i) ? (i as string).toString() : ''))
  );
  const resultIncludesValue = getValueOrDefault(String, includesValue?.toString());
  switch (mode) {
    case IncludeMode.IncludeIgnoreCaseSensitive: {
      const upper = resultIncludesValue.toUpperCase();
      return result.some((i) => i.toUpperCase() === upper);
    }
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
  Object.keys(obj).forEach((k) => (res[k as keyof T] = k));
  return expression(res) as S;
};

export const sparseIndexOf = <T>(array: T[], value: T, defaultOutput = -1) => {
  const key = Object.keys(array).find((k) => array[+k] === value);
  return key !== undefined ? +key : defaultOutput;
};

export const UniqValueInArray = <T>(array: (T | null | undefined)[] | null | undefined): T[] => {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of getValueOrDefault(Array, array)) {
    if (item != null) {
      const key = `${item}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item as T);
      }
    }
  }
  return out;
};

export const safeObjectEntries = <T extends object | string | number, S extends string | number = string | number>(
  obj: Record<S, T> | object | undefined,
  defaultObj = new Object()
) => Object.entries(obj || defaultObj) as [string, T][];
