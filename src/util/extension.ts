import './extensions/string.extension';
import { TableColumn } from 'react-data-table-component';
import { TableColumnModify } from './models/overrides/data-table.model';
import { EqualMode, IncludeMode, PaddingMode } from './enums/string.enum';

// eslint-disable-next-line no-unused-vars
export type DynamicObj<S, T extends string | number = string | number> = { [x in T]: S };
type Constructor = NumberConstructor | StringConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor | DateConstructor;

export const getValueOrDefault = <T>(type: Constructor, value: T | undefined | null, ...defaultValues: (T | null | undefined)[]) => {
  if (isNullOrUndefined(value)) {
    const defaultValue = defaultValues.find((v) => !isNullOrUndefined(v));
    switch (type.name) {
      case Number.name:
        return (defaultValue || 0) as T;
      case String.name:
        return (defaultValue || '') as T;
      case Boolean.name:
        return (defaultValue || false) as T;
      case Array.name:
        return (defaultValue || []) as T;
      case Date.name:
        return (defaultValue || new Date()) as T;
      case Object.name:
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

export const toNumber = (value: string | number | null | undefined, defaultValue = 0) =>
  parseFloat((value || defaultValue).toString()) || defaultValue;

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

export const toFloatWithPadding = (value: string | number | null | undefined, fixedRounding: number, defaultValue = 0) => {
  const result = parseFloat((value || defaultValue).toString());
  if (result === 0) {
    return result.toString();
  }
  return padding(parseFloat(result.toFixed(fixedRounding)), fixedRounding);
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
        !isNullOrUndefined(i) ? (mode === IncludeMode.IncludeIgnoreCaseSensitive ? i.toString().toUpperCase() : i.toString()) : ''
      )
    )
  );
  const resultBetween = new Set(
    getValueOrDefault(
      Array,
      includesValueList?.map((i) =>
        !isNullOrUndefined(i) ? (mode === IncludeMode.IncludeIgnoreCaseSensitive ? i.toString().toUpperCase() : i.toString()) : ''
      )
    )
  );
  return isNotEmpty(Array.from(result.intersection(resultBetween)));
};

export const Count = <T>(array: T[], value: T, key?: string, mode = EqualMode.CaseSensitive) =>
  array.filter((item) => isEqual(key ? (item as unknown as DynamicObj<string>)[key] : (item as string), value as string, mode)).length;

// eslint-disable-next-line no-unused-vars
type DynamicKeyObj<T> = { [Property in keyof T]: string };
export const getPropertyName = <T extends object, S extends string = ''>(
  obj: T | null | undefined,
  // eslint-disable-next-line no-unused-vars
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
