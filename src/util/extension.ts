/* eslint-disable no-unused-vars */
import './extensions/string.extension';
import { TableColumn } from 'react-data-table-component';
import { TableColumnModify } from './models/overrides/data-table.model';
import { EqualMode, IncludeMode, PaddingMode } from './enums/string.enum';

export type DynamicObj<S, T extends string | number = string | number> = { [x in T]: S };

export const getValueOrDefault = <T>(
  i: NumberConstructor | StringConstructor | BooleanConstructor | ArrayConstructor | ObjectConstructor,
  value: T | undefined | null,
  defaultValue?: T
) => {
  if (isUndefined(value) || isNull(value)) {
    const type = Object.prototype.toString.call(i.prototype).slice(8, -1).toLowerCase();
    switch (type) {
      case 'number':
        return (defaultValue || 0) as T;
      case 'string':
        return (defaultValue || '') as T;
      case 'boolean':
        return (defaultValue || false) as T;
      case 'array':
        return (defaultValue || []) as T;
      case 'object':
        return (defaultValue || {}) as T;
    }
  }
  return value as T;
};

export const convertColumnDataType = <T>(columns: TableColumnModify<T>[]) => {
  return columns as TableColumn<T>[];
};

export const combineClasses = <T>(...classes: (T | null | undefined)[]) => {
  return classes.filter((c) => c).join(' ');
};

export const isNotEmpty = <T>(array: T[] | null | undefined = []) => {
  return getValueOrDefault(Boolean, array && array.length > 0);
};

export const isUndefined = <T>(value?: T | null): value is undefined => {
  return typeof value === 'undefined' && value === undefined;
};

export const isNull = <T>(value?: T | null): value is null => {
  return typeof value !== 'undefined' && value === null;
};

export const isNullOrUndefined = <T>(value?: T | null): value is null | undefined => {
  return getValueOrDefault(Boolean, isNull(value) || isUndefined(value), true);
};

export const isEmpty = (value?: string | null) => {
  return getValueOrDefault(Boolean, value?.isEmpty(), false);
};

export const isNullOrEmpty = (value?: string | null): value is string | null => {
  return getValueOrDefault(Boolean, value?.isNullOrEmpty(), true);
};

export const toNumber = (value: string | number | null | undefined, defaultValue = 0) => {
  return parseInt((value || defaultValue).toString());
};

export const toFloat = (value: string | number | null | undefined, fixedRounding = -1, defaultValue = 0) => {
  const result = parseFloat((value || defaultValue).toString());
  if (fixedRounding < 0) {
    return result;
  }
  return parseFloat(result.toFixed(fixedRounding));
};

export const padding = (num: number, plusLength: number, mode = PaddingMode.End, fillString = '0') => {
  let result = num.toString();
  const [integer, point] = result.split('.');
  if (mode === PaddingMode.Start) {
    result = result.padStart(plusLength + (isInclude(result, '.') ? 1 + getValueOrDefault(Number, point?.length) : 0), fillString);
  } else if (mode === PaddingMode.End) {
    result = result.padEnd(plusLength + (isInclude(result, '.') ? 1 + getValueOrDefault(Number, integer?.length) : 0), fillString);
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
      return value.toUpperCase() === compareValue.toUpperCase();
    case EqualMode.CaseSensitive:
    default: {
      return value === compareValue;
    }
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
      return result.includesWithIgnoreCase(resultIncludesValue) || resultIncludesValue.includes(result);
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
  if (isNullOrUndefined(value)) {
    return false;
  }
  const result = getValueOrDefault(
    Array,
    value?.map((i) => i?.toString())
  );
  const resultIncludesValue = getValueOrDefault(String, includesValue?.toString());
  switch (mode) {
    case IncludeMode.IncludeIgnoreCaseSensitive:
      return result.map((i) => i?.toUpperCase()).includes(resultIncludesValue.toUpperCase());
    case IncludeMode.Include:
    default:
      return result.includes(resultIncludesValue);
  }
};

export const Count = <T>(array: T[], value: T, key?: string, mode = EqualMode.CaseSensitive) => {
  return array.filter((item) => isEqual(key ? (item as unknown as DynamicObj<string>)[key] : (item as string), value as string, mode))
    .length;
};

export const getPropertyName = <T extends object>(
  obj: T | null | undefined,
  expression: (x: { [Property in keyof T]: string }) => string
) => {
  if (!obj) {
    return '';
  }
  const res = {} as { [Property in keyof T]: string };
  Object.keys(obj).map((k) => (res[k as keyof T] = k));
  return expression(res);
};
