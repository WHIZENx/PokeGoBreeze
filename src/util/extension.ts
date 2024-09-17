/* eslint-disable no-unused-vars */
import './extensions/string.extension';
import { TableColumn } from 'react-data-table-component';
import { TableColumnModify } from './models/overrides/data-table.model';

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

export const isUndefined = <T>(value?: T | null) => {
  return typeof value === 'undefined' && value === undefined;
};

export const isNull = <T>(value?: T | null) => {
  return typeof value !== 'undefined' && value === null;
};

export const isNullOrUndefined = <T>(value?: T | null) => {
  return getValueOrDefault(Boolean, isNull(value) || isUndefined(value), true);
};

export const isEmpty = (value?: string | null) => {
  return getValueOrDefault(Boolean, value?.isEmpty(), false);
};

export const isNullOrEmpty = (value?: string | null) => {
  return getValueOrDefault(Boolean, value?.isNullOrEmpty(), true);
};
