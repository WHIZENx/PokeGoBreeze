import React, { useEffect, useState } from 'react';
import { capitalize, getDataWithKey, getKeyWithData, splitAndCapitalize } from '../../../utils/utils';

import './SearchMoves.scss';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { ColumnType, TypeMove, VariantType } from '../../../enums/type.enum';
import { ICombat } from '../../../core/models/combat.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TableColumnModify } from '../../../utils/models/overrides/data-table.model';
import {
  combineClasses,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../utils/extension';
import { SelectType } from './enums/select-type.enum';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { Params } from '../../../utils/constants';
import { LinkToTop } from '../../../utils/hooks/LinkToTop';
import { debounce } from 'lodash';
import CircularProgressTable from '../../../components/Sprites/CircularProgress/CircularProgress';
import CustomDataTable from '../../../components/Table/CustomDataTable/CustomDataTable';
import { PokemonTypeBadge } from '../../../core/enums/pokemon-type.enum';
import { getTypes } from '../../../utils/helpers/options-context.helpers';
import useDataStore from '../../../composables/useDataStore';

const nameSort = (rowA: ICombat, rowB: ICombat) => {
  const a = rowA.name.toLowerCase();
  const b = rowB.name.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const moveSort = (rowA: ICombat, rowB: ICombat) => {
  const a = getValueOrDefault(String, rowA.type?.toLowerCase());
  const b = getValueOrDefault(String, rowB.type?.toLowerCase());
  return a === b ? 0 : a > b ? 1 : -1;
};

const numSortDps = (rowA: ICombat, rowB: ICombat) => {
  const a = toFloat(rowA.pvePower / (rowA.durationMs / 1000));
  const b = toFloat(rowB.pvePower / (rowB.durationMs / 1000));
  return a - b;
};

const columns: TableColumnModify<ICombat>[] = [
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
    sortFunction: moveSort,
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
    sortFunction: nameSort,
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
    sortFunction: numSortDps,
    sortable: true,
  },
];

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
  const { combatsData } = useDataStore();

  const [filters, setFilters] = useState(new Filter());

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const [combatFMoves, setCombatFMoves] = useState<ICombat[]>([]);
  const [resultFMove, setResultFMove] = useState<ICombat[]>([]);
  const [fMoveIsLoad, setFMoveIsLoad] = useState(false);
  const [combatCMoves, setCombatCMoves] = useState<ICombat[]>([]);
  const [resultCMove, setResultCMove] = useState<ICombat[]>([]);
  const [cMoveIsLoad, setCMoveIsLoad] = useState(false);

  useEffect(() => {
    if (isNotEmpty(combatsData())) {
      setCombatFMoves(combatsData().filter((item) => item.typeMove === TypeMove.Fast));
      setCombatCMoves(combatsData().filter((item) => item.typeMove === TypeMove.Charge));
    }
  }, [combatsData()]);

  useEffect(() => {
    const debounced = debounce(() => {
      setResultFMove(searchMove(combatFMoves, fMoveType, fMoveName));
      setFMoveIsLoad(true);
    });
    debounced();
    return () => {
      debounced.cancel();
    };
  }, [combatFMoves, fMoveType, fMoveName]);

  useEffect(() => {
    const debounced = debounce(() => {
      setResultCMove(searchMove(combatCMoves, cMoveType, cMoveName));
      setCMoveIsLoad(true);
    });
    debounced();
    return () => {
      debounced.cancel();
    };
  }, [combatCMoves, cMoveType, cMoveName]);

  const searchMove = (combat: ICombat[], type: SelectType | PokemonTypeBadge, name: string) =>
    combat.filter(
      (move) =>
        (isInclude(splitAndCapitalize(move.name, '_', ' '), name, IncludeMode.IncludeIgnoreCaseSensitive) ||
          isInclude(move.track, name)) &&
        (type === SelectType.All ||
          isEqual(getKeyWithData(PokemonTypeBadge, type), move.type, EqualMode.IgnoreCaseSensitive))
    );

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

  const moveList = (data: ICombat[], type: SelectType, name: string, moveLoad: boolean, category: TypeMove) => {
    return (
      <div className="col-xl table-movesets-col p-0">
        <table className="table-info table-movesets">
          <thead />
          <tbody>
            <tr className="text-center">
              <td className="table-sub-header" colSpan={3}>
                <div className="row m-0">
                  <div className="col-4 d-flex justify-content-center align-items-center p-0">{`${getKeyWithData(
                    TypeMove,
                    category
                  )} Moves List`}</div>
                  <div className="col-4 d-flex justify-content-center align-items-center p-0">
                    <FormControl className="my-2" sx={{ m: 1, width: 150 }} size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={type}
                        label="Type"
                        onChange={(e) => setMoveByType(category, toNumber(e.target.value))}
                      >
                        <MenuItem value={SelectType.All} defaultChecked>
                          {getKeyWithData(SelectType, SelectType.All)}
                        </MenuItem>
                        {getTypes().map((value, index) => (
                          <MenuItem
                            key={index}
                            value={getDataWithKey<PokemonTypeBadge>(
                              PokemonTypeBadge,
                              value,
                              EqualMode.IgnoreCaseSensitive
                            )}
                          >
                            {capitalize(value)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-4 d-flex justify-content-center align-items-center p-0">
                    <TextField
                      type="text"
                      variant={VariantType.Outlined}
                      placeholder="Enter Name or ID"
                      defaultValue={name}
                      onChange={(e) => setMoveNameByType(category, e.target.value)}
                      size="small"
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="data-table">
                <CustomDataTable
                  customColumns={columns}
                  data={data}
                  defaultSortFieldId={ColumnType.Name}
                  fixedHeader
                  fixedHeaderScrollHeight="70vh"
                  progressPending={!moveLoad}
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
    <div className="container my-4">
      <div className="table-head">Moveset list in Pokémon GO</div>
      <div className="row w-100 m-0">
        {moveList(resultFMove, fMoveType, fMoveName, fMoveIsLoad, TypeMove.Fast)}
        {moveList(resultCMove, cMoveType, cMoveName, cMoveIsLoad, TypeMove.Charge)}
      </div>
    </div>
  );
};

export default Search;
