import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { Link } from 'react-router-dom';
import { capitalize, splitAndCapitalize } from '../../../util/Utils';

import './Search.css';
import { RootStateOrAny, useSelector } from 'react-redux';

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
    selector: (row: { track: number }) => row.track,
    sortable: true,
  },
  {
    name: 'Type',
    selector: (row: { type: string }) => (
      <div className={'type-icon-small ' + row.type.toLowerCase()}>{capitalize(row.type.toLowerCase())}</div>
    ),
    sortable: true,
    sortFunction: moveSort,
  },
  {
    name: 'Name',
    selector: (row: { track: number; name: string; type: string }) => (
      <Link
        to={'/moves/' + row.track + (row.track === 281 && row.type !== 'NORMAL' ? '?type=' + row.type.toLowerCase() : '')}
        target="_blank"
      >
        {splitAndCapitalize(row.name, '_', ' ').replaceAll(' Plus', '+')}
      </Link>
    ),
    sortable: true,
    sortFunction: nameSort,
    width: '200px',
  },
  {
    name: 'Power',
    selector: (row: { pve_power: any }) => row.pve_power,
    sortable: true,
  },
  {
    name: 'DPS',
    selector: (row: { pve_power: number; durationMs: number }) => parseFloat((row.pve_power / (row.durationMs / 1000)).toFixed(2)),
    sortable: true,
  },
];

const Search = () => {
  const combat = useSelector((state: RootStateOrAny) => state.store.data.combat);
  const types = useSelector((state: RootStateOrAny) => state.store.data.typeEff);

  const [filters, setFilters] = useState({
    fMoveType: '',
    fMoveName: '',
    cMoveType: '',
    cMoveName: '',
  });

  const { fMoveType, fMoveName, cMoveType, cMoveName } = filters;

  const [resultFMove, setResultFMove] = useState([]);
  const [resultCMove, setResultCMove] = useState([]);

  useEffect(() => {
    document.title = 'Moves - Search';
  }, []);

  useEffect(() => {
    setResultFMove(
      combat
        .filter((item: { type_move: string }) => item.type_move === 'FAST')
        .filter(
          (move: { name: string; track: { toString: () => string | string[] }; type: string }) =>
            (splitAndCapitalize(move.name, '_', ' ').replaceAll(' Plus', '+').toLowerCase().includes(fMoveName.toLowerCase()) ||
              move.track.toString().includes(fMoveName)) &&
            (fMoveType === '' || fMoveType === capitalize(move.type.toLowerCase()))
        )
    );
    setResultCMove(
      combat
        .filter((item: { type_move: string }) => item.type_move === 'CHARGE')
        .filter(
          (move: { name: string; track: { toString: () => string | string[] }; type: string }) =>
            (splitAndCapitalize(move.name, '_', ' ').replaceAll(' Plus', '+').toLowerCase().includes(cMoveName.toLowerCase()) ||
              move.track.toString().includes(cMoveName)) &&
            (cMoveType === '' || cMoveType === capitalize(move.type.toLowerCase()))
        )
    );
  }, [fMoveName, fMoveType, cMoveName, cMoveType, combat]);

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
                    <div className="col-4 d-flex justify-content-center align-items-center">Fast moves</div>
                    <div className="col-4">
                      <Form.Select
                        style={{ borderRadius: 0 }}
                        className="form-control"
                        value={fMoveType}
                        onChange={(e) => setFilters({ ...filters, fMoveType: e.target.value })}
                      >
                        <option value="">All</option>
                        {Object.keys(types).map((value, index) => (
                          <option key={index} value={value}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        className="form-control input-search"
                        placeholder="Enter Name or ID"
                        value={fMoveName}
                        onInput={(e: any) => setFilters({ ...filters, fMoveName: e.target.value })}
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
                    <div className="col-4 d-flex justify-content-center align-items-center">Charged moves</div>
                    <div className="col-4">
                      <Form.Select
                        style={{ borderRadius: 0 }}
                        className="form-control"
                        value={cMoveType}
                        onChange={(e) => setFilters({ ...filters, cMoveType: e.target.value })}
                      >
                        <option value="">All</option>
                        {Object.keys(types).map((value, index) => (
                          <option key={index} value={value}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-4">
                      <input
                        type="text"
                        className="form-control input-search"
                        placeholder="Enter Name or ID"
                        value={cMoveName}
                        onInput={(e: any) => setFilters({ ...filters, cMoveName: e.target.value })}
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
