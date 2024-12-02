/* eslint-disable no-unused-vars */
import { TableColumn } from 'react-data-table-component';

type Primitive = string | number | boolean | JSX.Element | JSX.Element[];
type Selector<T> = (row: T, rowIndex?: number) => Primitive;
type TableColumnOverride<T> = Omit<TableColumn<T>, 'selector'> & { selector?: Selector<T> };

export interface TableColumnModify<T> extends TableColumnOverride<T> {
  selector?: Selector<T>;
}

export enum SortOrderType {
  ASC = 'asc',
  DESC = 'desc',
}
