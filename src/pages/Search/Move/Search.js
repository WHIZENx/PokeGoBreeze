import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import { capitalize, splitAndCapitalize } from "../../../components/Calculate/Calculate";
import combatData from '../../../data/combat.json';

import types from '../../../data/type_effectiveness.json';

import './Search.css';

const nameSort = (rowA, rowB) => {
    const a = rowA.name.toLowerCase().replaceAll(" plus", "+");
    const b = rowB.name.toLowerCase().replaceAll(" plus", "+");
    return a === b ? 0 : a > b ? 1 : -1;
};

const moveSort = (rowA, rowB) => {
    const a = rowA.type.toLowerCase();
    const b = rowB.type.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const columns = [
    {
        name: 'id',
        selector: row => row.id,
        sortable: true,
    },
    {
        name: 'Type',
        selector: row => <div className={"type-icon-small "+row.type.toLowerCase()}>{capitalize(row.type.toLowerCase())}</div>,
        sortable: true,
        sortFunction: moveSort
    },
    {
        name: 'Name',
        selector: row => <Link to={"/moves/"+row.id} target="_blank">{splitAndCapitalize(row.name, "_", " ").replaceAll(" Plus", "+")}</Link>,
        sortable: true,
        sortFunction: nameSort,
        width: '200px'
    },
    {
        name: 'Power',
        selector: row => row.pve_power,
        sortable: true,
    },
    {
        name: 'DPS',
        selector: row => parseFloat((row.pve_power/(row.durationMs/1000)).toFixed(2)),
        sortable: true,
    },
]

const Search = () => {

    const [filters, setFilters] = useState({
        fMoveType: '',
        fMoveName: '',
        cMoveType: '',
        cMoveName: '',
    })

    const {fMoveType, fMoveName, cMoveType, cMoveName} = filters;

    const [resultFMove, setResultFMove] = useState([]);
    const [resultCMove, setResultCMove] = useState([]);

    useEffect(() => {
        document.title = "Moves - Search";
        setResultFMove(combatData.filter(item => item.type_move === "FAST")
        .filter(move => (splitAndCapitalize(move.name, "_", " ").replaceAll(" Plus", "+").toLowerCase().includes(fMoveName.toLowerCase()) || move.id.toString().includes(fMoveName)) &&
        (fMoveType === '' || fMoveType === capitalize(move.type.toLowerCase()))))
        setResultCMove(combatData.filter(item => item.type_move === "CHARGE").filter(move => (splitAndCapitalize(move.name, "_", " ").replaceAll(" Plus", "+").toLowerCase().includes(cMoveName.toLowerCase()) || move.id.toString().includes(cMoveName)) &&
        (cMoveType === '' || cMoveType === capitalize(move.type.toLowerCase()))))
    }, [fMoveName, fMoveType, cMoveName, cMoveType]);

    return (
        <div className="container" style={{marginTop:20, marginBottom:20}}>
            <div className="table-head">Movesets list in Pokémon GO</div>
            <div className="row w-100" style={{margin:0}}>
                <div className="col-xl table-movesets-col" style={{padding:0}}>
                    <table className="table-info table-movesets">
                        <thead></thead>
                        <tbody>
                            <tr className="text-center"><td className="table-sub-header" colSpan="3">
                                <div className="row" style={{margin: 0}}>
                                    <div className="col-4 d-flex justify-content-center align-items-center">Fast move</div>
                                    <div className="col-4">
                                        <Form.Select style={{borderRadius: 0}} className="form-control" value={fMoveType}
                                            onChange={(e) => setFilters({...filters, fMoveType: e.target.value})}>
                                                <option value=''>All</option>
                                                {Object.keys(types).map((value, index) => (
                                                    <option key={index} value={value}>{value}</option>
                                                ))}
                                        </Form.Select>
                                    </div>
                                    <div className="col-4">
                                    <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                                        value={fMoveName}
                                        onInput={e => setFilters({...filters, fMoveName: e.target.value})}></input>
                                    </div>
                                </div>
                            </td></tr>
                            <tr><td className="data-table"><DataTable
                                columns={columns}
                                data={resultFMove}
                                defaultSortFieldId={3}
                                fixedHeader
                                fixedHeaderScrollHeight="70vh"
                            /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-xl table-movesets-col" style={{padding:0}}>
                    <table className="table-info table-movesets">
                        <thead></thead>
                        <tbody>
                            <tr className="text-center"><td className="table-sub-header" colSpan="3">
                                <div className="row" style={{margin: 0}}>
                                    <div className="col-4 d-flex justify-content-center align-items-center">Charge move</div>
                                    <div className="col-4">
                                        <Form.Select style={{borderRadius: 0}} className="form-control" value={cMoveType}
                                            onChange={(e) => setFilters({...filters, cMoveType: e.target.value})}>
                                                <option value=''>All</option>
                                                {Object.keys(types).map((value, index) => (
                                                    <option key={index} value={value}>{value}</option>
                                                ))}
                                        </Form.Select>
                                    </div>
                                    <div className="col-4">
                                    <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                                        value={cMoveName}
                                        onInput={e => setFilters({...filters, cMoveName: e.target.value})}></input>
                                    </div>
                                </div>
                            </td></tr>
                            <tr><td className="data-table"><DataTable
                                columns={columns}
                                data={resultCMove}
                                defaultSortFieldId={3}
                                fixedHeader
                                fixedHeaderScrollHeight="70vh"
                            /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Search;