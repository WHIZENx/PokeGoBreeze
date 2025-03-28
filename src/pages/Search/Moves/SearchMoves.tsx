import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { capitalize, getCustomThemeDataTable, getKeyWithData, splitAndCapitalize } from '../../../util/utils';

import './SearchMoves.scss';
import { useSelector } from 'react-redux';
import { CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { TypeMove, VariantType } from '../../../enums/type.enum';
import { StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import {
  combineClasses,
  convertColumnDataType,
  getValueOrDefault,
  isEqual,
  isInclude,
  isNotEmpty,
  toFloat,
  toFloatWithPadding,
  toNumber,
} from '../../../util/extension';
import { SelectType } from './enums/select-type.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';
import { Params } from '../../../util/constants';
import { LinkToTop } from '../../../util/hooks/LinkToTop';

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
    name: 'id',
    selector: (row) => row.track,
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row) => <div className={combineClasses('type-icon-small', row.type?.toLowerCase())}>{capitalize(row.type)}</div>,
    sortable: true,
    sortFunction: moveSort,
  },
  {
    name: 'Name',
    selector: (row) => (
      <LinkToTop to={`/move/${row.track}${row.isMultipleWithType ? `?${Params.MoveType}=${row.type?.toLowerCase()}` : ''}`}>
        {splitAndCapitalize(row.name, '_', ' ')}
      </LinkToTop>
    ),
    sortable: true,
    sortFunction: nameSort,
    width: '180px',
  },
  {
    name: 'Power (PVE/PVP)',
    selector: (row) => `${row.pvePower}/${row.pvpPower}`,
    sortable: true,
    width: '150px',
  },
  {
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
  useChangeTitle('Moves - Search');
  const theme = useTheme<ThemeModify>();
  const combat = useSelector((state: StoreState) => state.store.data.combats);
  const types = useSelector((state: StoreState) => state.store.data.typeEff);

  const [filters, setFilters] = useState(new Filter());

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const [resultFMove, setResultFMove] = useState<ICombat[]>([]);
  const [fMoveIsLoad, setFMoveIsLoad] = useState(false);
  const [resultCMove, setResultCMove] = useState<ICombat[]>([]);
  const [cMoveIsLoad, setCMoveIsLoad] = useState(false);

  useEffect(() => {
    if (isNotEmpty(combat)) {
      const timeOutId = setTimeout(() => {
        setResultFMove(searchMove(TypeMove.Fast, fMoveType, fMoveName));
        setFMoveIsLoad(true);
      });
      return () => clearTimeout(timeOutId);
    }
  }, [combat, fMoveType, fMoveName]);

  useEffect(() => {
    if (isNotEmpty(combat)) {
      const timeOutId = setTimeout(() => {
        setResultCMove(searchMove(TypeMove.Charge, cMoveType, cMoveName));
        setCMoveIsLoad(true);
      });
      return () => clearTimeout(timeOutId);
    }
  }, [combat, cMoveType, cMoveName]);

  const searchMove = (category: TypeMove, type: SelectType, name: string) => {
    return combat
      .filter((item) => item.typeMove === category)
      .filter(
        (move) =>
          (isInclude(splitAndCapitalize(move.name, '_', ' '), name, IncludeMode.IncludeIgnoreCaseSensitive) ||
            isInclude(move.track, name)) &&
          (type === SelectType.All || isEqual(type, move.type, EqualMode.IgnoreCaseSensitive))
      );
  };

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 20 }}>
      <div className="table-head">Moveset list in Pokémon GO</div>
      <div className="row w-100" style={{ margin: 0 }}>
        <div className="col-xl table-movesets-col" style={{ padding: 0 }}>
          <table className="table-info table-movesets">
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={3}>
                  <div className="row" style={{ margin: 0 }}>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      Fast Moves List
                    </div>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      <FormControl sx={{ m: 1, width: 150, margin: '8px 0' }} size="small">
                        <InputLabel className="text-black">Type</InputLabel>
                        <Select
                          className="text-black"
                          value={fMoveType}
                          label="Type"
                          onChange={(e) => setFilters(Filter.create({ ...filters, fMoveType: toNumber(e.target.value) }))}
                        >
                          <MenuItem value={SelectType.All} defaultChecked={true}>
                            {getKeyWithData(SelectType, SelectType.All)}
                          </MenuItem>
                          {Object.keys(types).map((value, index) => (
                            <MenuItem key={index} value={capitalize(value)}>
                              {capitalize(value)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      <TextField
                        type="text"
                        variant={VariantType.Outlined}
                        placeholder="Enter Name or ID"
                        defaultValue={fMoveName}
                        onChange={(e) => setFilters(Filter.create({ ...filters, fMoveName: e.target.value }))}
                        size="small"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="data-table">
                  <DataTable
                    columns={convertColumnDataType(columns)}
                    data={resultFMove}
                    defaultSortFieldId={3}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="70vh"
                    customStyles={getCustomThemeDataTable(theme)}
                    progressPending={!fMoveIsLoad}
                    progressComponent={
                      <div style={{ margin: 10 }}>
                        <CircularProgress />
                      </div>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-xl table-movesets-col" style={{ padding: 0 }}>
          <table className="table-info table-movesets">
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={3}>
                  <div className="row" style={{ margin: 0 }}>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      Charged Moves List
                    </div>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      <FormControl sx={{ m: 1, width: 150, margin: '8px 0' }} size="small">
                        <InputLabel className="text-black">Type</InputLabel>
                        <Select
                          className="text-black"
                          value={cMoveType}
                          label="Type"
                          onChange={(e) => setFilters(Filter.create({ ...filters, cMoveType: toNumber(e.target.value) }))}
                        >
                          <MenuItem value={SelectType.All}>{getKeyWithData(SelectType, SelectType.All)}</MenuItem>
                          {Object.keys(types).map((value, index) => (
                            <MenuItem key={index} value={capitalize(value)}>
                              {capitalize(value)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    <div className="col-4 d-flex justify-content-center align-items-center" style={{ padding: 0 }}>
                      <TextField
                        type="text"
                        variant={VariantType.Outlined}
                        placeholder="Enter Name or ID"
                        defaultValue={cMoveName}
                        onChange={(e) => setFilters(Filter.create({ ...filters, cMoveName: e.target.value }))}
                        size="small"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="data-table">
                  <DataTable
                    columns={convertColumnDataType(columns)}
                    data={resultCMove}
                    defaultSortFieldId={3}
                    fixedHeader={true}
                    fixedHeaderScrollHeight="70vh"
                    customStyles={getCustomThemeDataTable(theme)}
                    progressPending={!cMoveIsLoad}
                    progressComponent={
                      <div style={{ margin: 10 }}>
                        <CircularProgress />
                      </div>
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Search;
