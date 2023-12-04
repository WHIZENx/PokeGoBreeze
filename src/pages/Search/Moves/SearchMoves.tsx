import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { capitalize, getCustomThemeDataTable, splitAndCapitalize } from '../../../util/Utils';

import './SearchMoves.scss';
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, useTheme } from '@mui/material';
import { TypeMove } from '../../../enums/move.enum';
import { StoreState } from '../../../store/models/state.model';
import { Combat } from '../../../core/models/combat.model';

const nameSort = (rowA: { name: string }, rowB: { name: string }) => {
  const a = rowA.name.toLowerCase().replaceAll(' plus', '+');
  const b = rowB.name.toLowerCase().replaceAll(' plus', '+');
  return a === b ? 0 : a > b ? 1 : -1;
};

const moveSort = (rowA: { type: string }, rowB: { type: string }) => {
  const a = rowA.type.toLowerCase();
  const b = rowB.type.toLowerCase();
  return a === b ? 0 : a > b ? 1 : -1;
};

const columns: any = [
  {
    name: 'id',
    selector: (row: Combat) => row.track,
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row: Combat) => <div className={'type-icon-small ' + row.type?.toLowerCase()}>{capitalize(row.type)}</div>,
    sortable: true,
    sortFunction: moveSort,
  },
  {
    name: 'Name',
    selector: (row: Combat) => (
      <Link to={'/move/' + row.track + (row.track === 281 && row.type !== 'NORMAL' ? '?type=' + row.type?.toLowerCase() : '')}>
        {splitAndCapitalize(row.name, '_', ' ').replaceAll(' Plus', '+')}
      </Link>
    ),
    sortable: true,
    sortFunction: nameSort,
    width: '180px',
  },
  {
    name: 'Power (PVE/PVP)',
    selector: (row: Combat) => `${row.pve_power}/${row.pvp_power}`,
    sortable: true,
    width: '150px',
  },
  {
    name: 'DPS',
    selector: (row: Combat) => parseFloat((row.pve_power / (row.durationMs / 1000)).toFixed(2)),
    sortable: true,
  },
];

const Search = () => {
  const theme = useTheme();
  const combat = useSelector((state: StoreState) => state.store.data?.combat ?? []);
  const types = useSelector((state: StoreState) => state.store.data?.typeEff ?? {});

  const [filters, setFilters] = useState({
    fMoveType: 'all',
    fMoveName: '',
    cMoveType: 'all',
    cMoveName: '',
  });

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const [resultFMove, setResultFMove]: [Combat[], any] = useState([]);
  const [resultCMove, setResultCMove]: [Combat[], any] = useState([]);

  useEffect(() => {
    document.title = 'Moves - Search';
  }, []);

  useEffect(() => {
    if (combat.length > 0) {
      const timeOutId = setTimeout(() => {
        setResultFMove(searchMove(TypeMove.FAST, fMoveType, fMoveName));
      }, 100);
      return () => clearTimeout(timeOutId);
    }
  }, [combat, fMoveType, fMoveName]);

  useEffect(() => {
    if (combat.length > 0) {
      const timeOutId = setTimeout(() => {
        setResultCMove(searchMove(TypeMove.CHARGE, cMoveType, cMoveName));
      }, 100);
      return () => clearTimeout(timeOutId);
    }
  }, [combat, cMoveType, cMoveName]);

  const searchMove = (category: string, type: string, name: string) => {
    return combat
      .filter((item) => item.type_move === category)
      .filter(
        (move) =>
          (splitAndCapitalize(move.name, '_', ' ').replaceAll(' Plus', '+').toLowerCase().includes(name.toLowerCase()) ||
            move.track.toString().includes(name)) &&
          (type === 'all' || type === capitalize(move.type))
      );
  };

  return (
    <div className="container" style={{ marginTop: 20, marginBottom: 20 }}>
      <div className="table-head">Movesets list in Pokémon GO</div>
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
                          onChange={(e: SelectChangeEvent) => setFilters({ ...filters, fMoveType: e.target.value })}
                        >
                          <MenuItem value="all" defaultChecked={true}>
                            All
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
                        variant="outlined"
                        placeholder="Enter Name or ID"
                        defaultValue={fMoveName}
                        onKeyUp={(e: any) => setFilters({ ...filters, fMoveName: e.target.value })}
                        size="small"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="data-table">
                  <DataTable
                    columns={columns}
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
                          onChange={(e: SelectChangeEvent) => setFilters({ ...filters, cMoveType: e.target.value })}
                        >
                          <MenuItem value="all">All</MenuItem>
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
                        variant="outlined"
                        placeholder="Enter Name or ID"
                        defaultValue={cMoveName}
                        onKeyUp={(e: any) => setFilters({ ...filters, cMoveName: e.target.value })}
                        size="small"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="data-table">
                  <DataTable
                    columns={columns}
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
