import { useEffect } from "react";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import combatData from '../../../data/combat.json';

import './Search.css';

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const splitAndCapitalize = (string, splitBy) => {
    return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(" ");
};

const nameSort = (rowA, rowB) => {
    const a = rowA.name.toLowerCase();
    const b = rowB.name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const moveSort = (rowA, rowB) => {
    const a = rowA.type.toLowerCase();
    const b = rowB.type.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const columnsF = [
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
        selector: row => <Link to={"/moves/"+row.id} target="_blank">{splitAndCapitalize(row.name, "_")}</Link>,
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

    useEffect(() => {
        document.title = "Moves - Search";
    }, []);

    return (
        <div className="container" style={{marginTop:20, marginBottom:20}}>
            <div className="table-head">Movesets list in Pokémon GO</div>
            <div className="row w-100" style={{margin:0}}>
                <div className="col-xl table-movesets-col" style={{padding:0}}>
                    <table className="table-info table-movesets">
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="3">Fast move</td></tr>
                            <tr><td className="data-table"><DataTable
                                columns={columnsF}
                                data={combatData.filter(item => item.type_move === "FAST")}
                                defaultSortFieldId={3}
                            /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="col-xl table-movesets-col" style={{padding:0}}>
                    <table className="table-info table-movesets">
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="3">Charge move</td></tr>
                            <tr><td className="data-table"><DataTable
                                columns={columnsF}
                                data={combatData.filter(item => item.type_move === "CHARGE")}
                                defaultSortFieldId={3}
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