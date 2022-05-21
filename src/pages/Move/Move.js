import { useSnackbar } from "notistack";
import { Fragment, useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Link, useParams } from "react-router-dom";
import { getBarCharge, queryTopMove } from "../../components/Calculate/Calculate";
import TypeBar from "../../components/Sprits/TypeBar";

import moveData from '../../data/combat.json';
import weathers from '../../data/weather_boosts.json';
import APIService from "../../services/API.service";
import './Move.css';

import CircleIcon from '@mui/icons-material/Circle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const splitAndCapitalize = (string, split) => {
    return string.split(split).map(text => capitalize(text)).join(" ");
};

const nameSort = (rowA, rowB) => {
    const a = rowA.name.toLowerCase();
    const b = rowB.name.toLowerCase();
    return a === b ? 0 : a > b ? 1 : -1;
};

const columns = [
    {
        name: 'ID',
        selector: row => row.num,
        sortable: true,
        width: '20%',
        maxWidth: '100px',
    },
    {
        name: 'Name',
        selector: row => <Link to={"/pokemon/"+row.num} target="_blank"><img height={48} alt='img-pokemon' style={{marginRight: 10}}
        src={APIService.getPokeIconSprite(row.sprite, true)}
        onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(row.baseSpecies)}}></img>
        {splitAndCapitalize(row.name, "-")}</Link>,
        sortable: true,
        sortFunction: nameSort
    },
    {
        name: 'DPS',
        selector: row => parseFloat(row.dps.toFixed(2)),
        sortable: true,
        width: '20%',
        maxWidth: '200px',
    },
]

const Move = (props) => {

    const params = useParams();

    const [move, setMove] = useState(null);
    const [topList, setTopList] = useState([]);

    const { enqueueSnackbar } = useSnackbar();

    const getWeatherEffective = (type) => {
        return (Object.entries(weathers).find(([key, value]) => {
            return value.includes(capitalize(type.toLowerCase()))
        }))[0];
    };

    const queryMove = useCallback((id) => {
        let move = moveData.find(item => item.id === parseInt(id));
        if (move) {
            setMove(move)
            document.title =  `#${move.id} - ${splitAndCapitalize(move.name.toLowerCase(), "_")}`;
        }
        else {
            enqueueSnackbar('Move ID: ' + id + ' Not found!', { variant: 'error' });
            if (params.id) document.title = `#${params.id} - Not Found`
        }
    }, [enqueueSnackbar, params.id]);

    useEffect(() => {
        if (move === null) {
            const id = params.id ? params.id.toLowerCase() : props.id;
            queryMove(id);
        } else setTopList(queryTopMove(move));
    }, [params.id, props.id, queryMove, move]);

    return (
        <Fragment>
            {move &&
            <div className={'poke-container'+(props.id ? "" : " container")}>
                <div className="h-100 head-box">
                    <h1 className="d-inline-block" style={{marginRight: 15}}><b>{splitAndCapitalize(move.name.toLowerCase(), "_")}</b></h1>
                    <div className="d-inline-block"><TypeBar type={move.type}/></div>
                </div>
                <hr></hr>
                <div className="row" style={{margin: 0}}>
                    <div className="col" style={{padding: 0}}>
                        <table className="table-info move-table">
                            <thead className="center">
                                <tr><th colSpan="3">{"Stats "+splitAndCapitalize(move.name.toLowerCase(), "_")+" in Pokemon Go"}</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>ID</td>
                                    <td colSpan="2"><b>#{move.id}</b></td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td colSpan="2"><b>{splitAndCapitalize(move.name.toLowerCase(), "_")}</b></td>
                                </tr>
                                <tr>
                                    <td>Type</td>
                                    <td colSpan="2"><div style={{width: 'fit-content'}} className={"type-icon-small "+move.type.toLowerCase()}>{capitalize(move.type.toLowerCase())}</div></td>
                                </tr>
                                <tr>
                                    <td>Move Type</td>
                                    <td colSpan="2"><b>{capitalize(move.type_move.toLowerCase())} Move</b></td>
                                </tr>
                                <tr className="center"><td className="table-sub-header" colSpan="3">PVE Stats</td></tr>
                                <tr>
                                    <td>PVE Power</td>
                                    <td colSpan="2">{move.pve_power}</td>
                                </tr>
                                <tr>
                                    <td>PVE Power (Weather)</td>
                                    <td colSpan="2">{move.pve_power*1.2} <span className="text-success d-inline-block caption">+{(move.pve_power*0.2).toFixed(2)}</span></td>
                                </tr>
                                <tr>
                                    <td>PVE Energy</td>
                                    <td colSpan="2">{move.pve_energy > 0 && "+"}{move.pve_energy}</td>
                                </tr>
                                {move.type_move === "CHARGE" && <tr>
                                    <td>PVE Bar Charge</td>
                                    <td colSpan="2" className="d-flex align-items-center" style={{border: 'none'}}>{[...Array(getBarCharge(true, move.pve_energy)).keys()].map((value, index) => (
                                        <div style={{width: ((120-(5*(Math.max(1, getBarCharge(true, move.pve_energy)))))/getBarCharge(true, move.pve_energy))}} key={index} className={"bar-charge "+move.type.toLowerCase()}></div>
                                    ))}</td>
                                </tr>}
                                <tr className="center"><td className="table-sub-header" colSpan="3">PVP Stats</td></tr>
                                <tr>
                                    <td>PVP Power</td>
                                    <td colSpan="2">{move.pvp_power}</td>
                                </tr>
                                <tr>
                                    <td>PVP Energy</td>
                                    <td colSpan="2">{move.pvp_energy > 0 && "+"}{move.pvp_energy}</td>
                                </tr>
                                {move.type_move === "CHARGE" && <tr>
                                    <td>PVP Bar Charge</td>
                                    <td colSpan="2" className="d-flex align-items-center" style={{border: 'none'}}>{[...Array(getBarCharge(false, move.pvp_energy)).keys()].map((value, index) => (
                                        <div style={{width: ((120-(5*(Math.max(1, getBarCharge(false, move.pvp_energy)))))/getBarCharge(false, move.pvp_energy))}} key={index} className={"bar-charge "+move.type.toLowerCase()}></div>
                                    ))}</td>
                                </tr>}
                                {move.buffs.length > 0 &&
                                    <Fragment>
                                    <tr className="center"><td className="table-sub-header" colSpan="3">PVP Buffs</td></tr>
                                    {move.buffs.map((value, index) => (
                                        <tr key={index}>
                                            <td className="target-buff"><CircleIcon sx={{fontSize: "5px"}}/> {capitalize(value.target)}</td>
                                            <td>
                                                {value.power > 0 ? <ArrowUpwardIcon sx={{color: "green"}} /> : <ArrowDownwardIcon sx={{color: "red"}} />}
                                                <span className="d-inline-block caption">
                                                    {value.type === "atk" ? "Attack " : "Defense "}
                                                    <span className={"buff-power " + (value.power > 0 ? "text-success" : "text-danger")}>
                                                        <b>{value.power > 0 && "+"}{value.power}</b>
                                                    </span>
                                                </span>
                                            </td>
                                            <td>{value.buffChance*100}%</td>
                                        </tr>
                                    ))
                                    }
                                    </Fragment>
                                }

                                <tr className="center"><td className="table-sub-header" colSpan="3">Other Stats</td></tr>
                                <tr>
                                    <td>Weather Boosts</td>
                                    <td colSpan="2"><img className="img-type-icon" height={25} alt="img-type" src={APIService.getWeatherIconSprite(getWeatherEffective(move.type))}></img></td>
                                </tr>
                                <tr>
                                    <td>Animation Duration</td>
                                    <td colSpan="2">{move.durationMs} ms ({move.durationMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Damage Start Window</td>
                                    <td colSpan="2">{move.damageWindowStartMs} ms ({move.damageWindowStartMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Damage End Window</td>
                                    <td colSpan="2">{move.damageWindowEndMs} ms ({move.damageWindowEndMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Critical Chance</td>
                                    <td colSpan="2">{move.criticalChance*100}%</td>
                                </tr>
                                <tr className="center"><td className="table-sub-header" colSpan="3">Effect</td></tr>
                                <tr>
                                    <td>Sound</td>
                                    <td colSpan="2">
                                        <audio className="w-100" controls style={{height: 30}}>
                                            <source src={APIService.getSoundMove(move.sound)} type="audio/wav"></source>
                                            Your browser does not support the audio element.
                                        </audio>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col" style={{padding: 0}}>
                        <table className="table-info move-damage-table">
                            <thead className="center">
                                <tr><th colSpan="2">{"Damage "+splitAndCapitalize(move.name.toLowerCase(), "_")+" Simulator"}</th></tr>
                            </thead>
                            <tbody>
                                <tr className="center"><td className="table-sub-header" colSpan="2">PVE Stats</td></tr>
                                <tr>
                                    <td>DPS</td>
                                    <td>{((move.pve_power)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>DPS (STAB)</td>
                                    <td>{((move.pve_power*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>DPS (Weather)</td>
                                    <td>{((move.pve_power*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>DPS (STAB+Weather)</td>
                                    <td>{((move.pve_power*1.2*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                {move.type_move === "FAST" &&<tr>
                                    <td>EPS</td>
                                    <td>{((move.pve_energy)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>}
                                <tr className="center"><td className="table-sub-header" colSpan="2">PVP Stats</td></tr>
                                <tr>
                                    <td>DPS</td>
                                    <td>{((move.pvp_power)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>DPS (STAB)</td>
                                    <td>{((move.pvp_power*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr className="center"><td className="table-sub-header" colSpan="2">{"Pokemon Top in move "+splitAndCapitalize(move.name.toLowerCase(), "_")}</td></tr>
                                <tr>
                                    <td colSpan={2} style={{padding: 0}}><DataTable
                                        columns={columns}
                                        data={topList}
                                        pagination
                                        defaultSortFieldId={3}
                                        defaultSortAsc={false}
                                        highlightOnHover
                                        striped
                                        fixedHeader
                                        fixedHeaderScrollHeight="35vh"
                                    /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            }
        </Fragment>
    )
}

export default Move;