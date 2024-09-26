import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { capitalize, getCustomThemeDataTable, splitAndCapitalize } from '../../../util/utils';

import './SearchMoves.scss';
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select, TextField, useTheme } from '@mui/material';
import { TypeMove } from '../../../enums/type.enum';
import { StoreState } from '../../../store/models/state.model';
import { ICombat } from '../../../core/models/combat.model';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { TypeEff } from '../../../core/models/type-eff.model';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { TableColumnModify } from '../../../util/models/overrides/data-table.model';
import { combineClasses, convertColumnDataType, getValueOrDefault, isEqual, isInclude, isNotEmpty } from '../../../util/extension';
import { SelectType } from './enums/select-type.enum';
import { EqualMode, IncludeMode } from '../../../util/enums/string.enum';

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
      <Link to={`/move/${row.track}${row.track === 281 && row.type !== 'NORMAL' ? `?type=${row.type?.toLowerCase()}` : ''}`}>
        {splitAndCapitalize(row.name, '_', ' ')}
      </Link>
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
    selector: (row) => parseFloat((row.pvePower / (row.durationMs / 1000)).toFixed(2)),
    sortable: true,
  },
];

interface IFilter {
  fMoveType: string;
  fMoveName: string;
  cMoveType: string;
  cMoveName: string;
}

class Filter implements IFilter {
  fMoveType = SelectType.All.toString();
  fMoveName = '';
  cMoveType = SelectType.All.toString();
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
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.combat));
  const types = useSelector((state: StoreState) => state.store.data?.typeEff);

  const [filters, setFilters] = useState(new Filter());

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const [resultFMove, setResultFMove] = useState<ICombat[]>([]);
  const [resultCMove, setResultCMove] = useState<ICombat[]>([]);

  useEffect(() => {
    if (isNotEmpty(combat)) {
      const timeOutId = setTimeout(() => {
        setResultFMove(searchMove(TypeMove.FAST, fMoveType, fMoveName));
      });
      return () => clearTimeout(timeOutId);
    }
  }, [combat, fMoveType, fMoveName]);

  useEffect(() => {
    if (isNotEmpty(combat)) {
      const timeOutId = setTimeout(() => {
        setResultCMove(searchMove(TypeMove.CHARGE, cMoveType, cMoveName));
      });
      return () => clearTimeout(timeOutId);
    }
  }, [combat, cMoveType, cMoveName]);

  const searchMove = (category: string, type: string, name: string) => {
    return combat
      .filter((item) => isEqual(item.typeMove, category))
      .filter(
        (move) =>
          (isInclude(splitAndCapitalize(move.name, '_', ' '), name, IncludeMode.IncludeIgnoreCaseSensitive) ||
            isInclude(move.track, name)) &&
          (type === SelectType.All.toString() || isEqual(type, move.type, EqualMode.IgnoreCaseSensitive))
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
                          onChange={(e) => setFilters(Filter.create({ ...filters, fMoveType: e.target.value }))}
                        >
                          <MenuItem value={SelectType.All} defaultChecked={true}>
                            {SelectType.All}
                          </MenuItem>
                          {Object.keys(types ?? new TypeEff()).map((value, index) => (
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
                        variant="outlined"
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
                          onChange={(e) => setFilters(Filter.create({ ...filters, cMoveType: e.target.value }))}
                        >
                          <MenuItem value={SelectType.All}>{SelectType.All}</MenuItem>
                          {Object.keys(types ?? new TypeEff()).map((value, index) => (
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
                        variant="outlined"
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
