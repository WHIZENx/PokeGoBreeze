import React, { useEffect, useRef, useState } from 'react';
import { capitalize, createDataRows, getDataWithKey, getKeyWithData, splitAndCapitalize } from '../../../utils/utils';

import './SearchMoves.scss';
import { ColumnType, TypeMove } from '../../../enums/type.enum';
import { ICombat } from '../../../core/models/combat.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import { combineClasses, toFloatWithPadding, toNumber } from '../../../utils/extension';
import { SelectType } from './enums/select-type.enum';
import { EqualMode } from '../../../utils/enums/string.enum';
import { Params } from '../../../utils/constants';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Commons/Tables/CustomDataTable/CustomDataTable';
import { PokemonTypeBadge } from '../../../core/enums/pokemon-type.enum';
import { getTypes } from '../../../utils/helpers/options-context.helpers';
import SelectMui from '../../../components/Commons/Selects/SelectMui';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import ProcessedDataService from '../../../services/processed-data.service';
import APIService from '../../../services/api.service';

const columns = createDataRows<TableColumnModify<ICombat>>(
  {
    id: ColumnType.Id,
    name: 'id',
    selector: (row) => row.track,
    sortable: true,
  },
  {
    id: ColumnType.Type,
    name: 'Type',
    selector: (row) => (
      <div className={combineClasses('type-icon-small', row.type?.toLowerCase())}>{capitalize(row.type)}</div>
    ),
    sortable: true,
  },
  {
    id: ColumnType.Name,
    name: 'Name',
    selector: (row) => (
      <LinkToTop
        to={`/move/${row.track}${row.isMultipleWithType ? `?${Params.MoveType}=${row.type?.toLowerCase()}` : ''}`}
      >
        {splitAndCapitalize(row.name, '_', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    width: '180px',
  },
  {
    id: ColumnType.Power,
    name: 'Power (PVE/PVP)',
    selector: (row) => `${row.pvePower}/${row.pvpPower}`,
    sortable: true,
    width: '150px',
  },
  {
    id: ColumnType.DPS,
    name: 'DPS',
    selector: (row) => toFloatWithPadding(row.pvePower / (row.durationMs / 1000), 2),
    sortable: true,
  }
);

type MoveSortField = 'track' | 'type' | 'name' | 'power' | 'dps';
type MoveTableRow = ICombat & { tableKey: string };

const getMoveSortField = (columnId: string | number | undefined): MoveSortField => {
  switch (toNumber(columnId)) {
    case ColumnType.Id:
      return 'track';
    case ColumnType.Type:
      return 'type';
    case ColumnType.Power:
      return 'power';
    case ColumnType.DPS:
      return 'dps';
    default:
      return 'name';
  }
};

const useMoveResults = (category: TypeMove, type: SelectType, name: string) => {
  const [data, setData] = useState<MoveTableRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [debouncedName, setDebouncedName] = useState(name);
  const [sort, setSort] = useState<{ field: MoveSortField; order: 'asc' | 'desc' }>({
    field: 'name',
    order: 'asc',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedName(name.trim()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [name]);

  useEffect(() => {
    setPage(1);
    setResetPaginationToggle((value) => !value);
  }, [category, type, debouncedName]);

  useEffect(() => {
    const requestId = ++latestRequestRef.current;
    const controller = new AbortController();
    const moveType = type === SelectType.All ? undefined : getKeyWithData(PokemonTypeBadge, type)?.toLocaleLowerCase();

    setIsLoading(true);
    setData([]);
    ProcessedDataService.getPage<ICombat>(
      'combats',
      {
        typeMove: category,
        type: moveType,
        q: debouncedName,
        page,
        limit: 50,
        sort: sort.field,
        order: sort.order,
      },
      { signal: controller.signal }
    )
      .then((result) => {
        if (requestId !== latestRequestRef.current) {
          return;
        }
        setData(
          result.data.map((move, index) => ({
            ...move,
            tableKey: `${move.track}:${move.id}:${move.type}:${move.typeMove}:${index}`,
          }))
        );
        setTotalRows(result.meta.total);
      })
      .catch((error) => {
        if (requestId !== latestRequestRef.current || APIService.isCancel(error)) {
          return;
        }
        setData([]);
        setTotalRows(0);
      })
      .finally(() => {
        if (requestId === latestRequestRef.current) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [category, type, debouncedName, page, sort]);

  const changeSort = (columnId: string | number | undefined, order: 'asc' | 'desc') => {
    setSort({ field: getMoveSortField(columnId), order });
    setPage(1);
    setResetPaginationToggle((value) => !value);
  };

  return { data, totalRows, page, setPage, changeSort, isLoading, resetPaginationToggle };
};

interface IFilter {
  fMoveType: SelectType;
  fMoveName: string;
  cMoveType: SelectType;
  cMoveName: string;
}

class Filter implements IFilter {
  fMoveType = SelectType.All;
  fMoveName = '';
  cMoveType = SelectType.All;
  cMoveName = '';

  static create(value: IFilter) {
    const obj = new Filter();
    Object.assign(obj, value);
    return obj;
  }
}

const Search = () => {
  useTitle({
    title: 'Moves - Search',
    description:
      'Search and filter Pokémon GO moves by type, power, energy, and more. Find the best moves for your Pokémon in battles and raids.',
    keywords: ['Pokémon moves', 'move search', 'best moves', 'PVP moves', 'raid moves', 'Pokémon GO attacks'],
  });
  const [filters, setFilters] = useState(new Filter());

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const fastMoves = useMoveResults(TypeMove.Fast, fMoveType, fMoveName);
  const chargedMoves = useMoveResults(TypeMove.Charge, cMoveType, cMoveName);

  const setMoveByType = (category: TypeMove, value: SelectType) => {
    if (category === TypeMove.Fast) {
      setFilters(Filter.create({ ...filters, fMoveType: value }));
    } else {
      setFilters(Filter.create({ ...filters, cMoveType: value }));
    }
  };

  const setMoveNameByType = (category: TypeMove, value: string) => {
    if (category === TypeMove.Fast) {
      setFilters(Filter.create({ ...filters, fMoveName: value }));
    } else {
      setFilters(Filter.create({ ...filters, cMoveName: value }));
    }
  };

  const moveList = (result: ReturnType<typeof useMoveResults>, type: SelectType, name: string, category: TypeMove) => {
    return (
      <div className="xl:tw-flex-1 table-movesets-col !tw-p-0">
        <table className="table-info table-movesets">
          <thead />
          <tbody>
            <tr className="tw-text-center">
              <td className="table-sub-header" colSpan={3}>
                <div className="row !tw-m-0">
                  <div className="!tw-w-1/3 tw-flex-none tw-flex tw-justify-center tw-items-center !tw-p-0">{`${getKeyWithData(
                    TypeMove,
                    category
                  )} Moves List`}</div>
                  <div className="!tw-w-1/3 tw-flex-none tw-flex tw-justify-center tw-items-center !tw-p-0">
                    <SelectMui
                      formClassName="tw-mt-2"
                      formSx={{ m: 1, minWidth: 150 }}
                      onChangeSelect={(value) => setMoveByType(category, toNumber(value))}
                      value={type}
                      inputLabel="Type"
                      menuItems={[
                        {
                          value: SelectType.All,
                          label: getKeyWithData(SelectType, SelectType.All),
                          defaultChecked: true,
                        },
                        ...getTypes().map((value) => ({
                          value: getDataWithKey<PokemonTypeBadge>(
                            PokemonTypeBadge,
                            value,
                            EqualMode.IgnoreCaseSensitive
                          ),
                          label: capitalize(value),
                        })),
                      ]}
                    />
                  </div>
                  <div className="!tw-w-1/3 tw-flex-none tw-flex tw-justify-center tw-items-center !tw-p-0">
                    <InputMui
                      placeholder="Enter Name or ID"
                      defaultValue={name}
                      onChange={(value) => setMoveNameByType(category, value)}
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="data-table">
                <CustomDataTable
                  customColumns={columns}
                  data={result.data}
                  keyField="tableKey"
                  defaultSortFieldId={ColumnType.Name}
                  sortServer
                  onSort={(column, direction) => result.changeSort(column.id, direction === 'desc' ? 'desc' : 'asc')}
                  pagination
                  paginationServer
                  paginationTotalRows={result.totalRows}
                  paginationDefaultPage={1}
                  paginationResetDefaultPage={result.resetPaginationToggle}
                  paginationPerPage={50}
                  paginationComponentOptions={{ noRowsPerPage: true }}
                  onChangePage={result.setPage}
                  fixedHeader
                  fixedHeaderScrollHeight="70vh"
                  progressPending={result.isLoading}
                  progressComponent={<CircularProgressTable />}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="tw-container tw-my-4">
      <div className="table-head">Moveset list in Pokémon GO</div>
      <div className="row tw-w-full !tw-m-0">
        {moveList(fastMoves, fMoveType, fMoveName, TypeMove.Fast)}
        {moveList(chargedMoves, cMoveType, cMoveName, TypeMove.Charge)}
      </div>
    </div>
  );
};

export default Search;
