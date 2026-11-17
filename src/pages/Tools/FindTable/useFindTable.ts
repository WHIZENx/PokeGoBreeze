import { useCallback, useEffect, useRef, useState } from 'react';
import type { TableColumn } from 'react-data-table-component';
import APIService from '../../../services/api.service';
import { ColumnType } from '../../../enums/type.enum';

type Params = Record<string, string | number | boolean | undefined>;
interface FindSummary {
  total: number;
  averageHp: number;
  averageCp: number;
  averagePercent: number;
  stars: number[];
}
interface FindPage<T> {
  data: T;
  meta: { page: number; limit: number; total: number; pages: number; summary: FindSummary };
}
const sortFields: Partial<Record<ColumnType, string>> = {
  [ColumnType.Level]: 'level',
  [ColumnType.Atk]: 'atk',
  [ColumnType.Def]: 'def',
  [ColumnType.Sta]: 'sta',
  [ColumnType.Hp]: 'hp',
  [ColumnType.Percent]: 'percent',
  [ColumnType.CP]: 'CP',
  [ColumnType.MinCP]: 'minCP',
  [ColumnType.MaxCP]: 'maxCP',
};

export const useFindTable = <Row, T extends { result: Row[] }>(
  defaultSort: string,
  onError: (error: unknown) => void,
  onEmpty?: (data: T) => void
) => {
  const [query, setQuery] = useState<Params>();
  const [response, setResponse] = useState<FindPage<T>>();
  const [loading, setLoading] = useState(false);
  const [resetPage, setResetPage] = useState(false);
  const callbacks = useRef({ onError, onEmpty });
  callbacks.current = { onError, onEmpty };

  const submit = useCallback(
    (params: Params) => {
      setQuery((current) => ({
        ...params,
        page: 1,
        limit: current?.limit ?? 10,
        sort: current?.sort ?? defaultSort,
        order: current?.order ?? (defaultSort === 'percent' ? 'desc' : 'asc'),
      }));
      setResetPage((current) => !current);
    },
    [defaultSort]
  );
  const clear = useCallback(() => {
    setQuery(undefined);
    setResponse(undefined);
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    APIService.getFetchUrl<FindPage<T>>(APIService.getFindCalculation(query), { signal: controller.signal })
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setResponse(data);
        if (!data.meta.total) {
          callbacks.current.onEmpty?.(data.data);
        }
      })
      .catch((error: unknown) => {
        if (active && !APIService.isCancel(error)) {
          callbacks.current.onError(error);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [query]);

  return {
    submit,
    clear,
    loading,
    data: response?.data,
    summary: response?.meta.summary,
    tableProps: {
      pagination: true,
      paginationServer: true,
      sortServer: true,
      paginationPerPage: Number(query?.limit ?? 10),
      paginationTotalRows: response?.meta.total ?? 0,
      paginationDefaultPage: 1,
      paginationResetDefaultPage: resetPage,
      onChangePage: (page: number) =>
        setQuery((current) => (current && current.page !== page ? { ...current, page } : current)),
      onChangeRowsPerPage: (limit: number) => {
        setQuery((current) => (current ? { ...current, limit, page: 1 } : current));
        setResetPage((current) => !current);
      },
      onSort: (column: TableColumn<Row>, order: 'asc' | 'desc') => {
        const sort = sortFields[column.id as ColumnType] ?? defaultSort;
        setQuery((current) => (current ? { ...current, sort, order, page: 1 } : current));
        setResetPage((current) => !current);
      },
    },
  };
};
