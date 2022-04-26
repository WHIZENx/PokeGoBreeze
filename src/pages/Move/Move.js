import { useSnackbar } from "notistack";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBarCharge } from "../../components/Calculate/Calculate";
import TypeBar from "../../components/Sprits/TypeBar";

import moveData from '../../data/combat.json';
import weathers from '../../data/weather_boosts.json';
import APIService from "../../services/API.service";
import './Move.css';

const Move = (props) => {

    const params = useParams();

    const [move, setMove] = useState(null);

    const { enqueueSnackbar } = useSnackbar();

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string, split) => {
        return string.split(split).map(text => capitalize(text)).join(" ");
    }, []);

    const getWeatherEffective = (type) => {
        let result;
        Object.entries(weathers).forEach(([key, value]) => {
            if (value.includes(capitalize(type.toLowerCase()))) result = key;
        });
        return result;
    };

    const queryMove = useCallback((id) => {
        let move = moveData.find(item => item.id === parseInt(id));
        if (move) setMove(move)
        else enqueueSnackbar('Move ID: ' + id + ' Not found!', { variant: 'error' });
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (move === null) {
            const id = params.id ? params.id.toLowerCase() : props.id;
            queryMove(id);
        }
    }, [params.id, props.id, queryMove, move]);

    return (
        <Fragment>
            {move &&
            <div className={'poke-container'+(props.id ? "" : " container")}>
                <div className="d-flex align-items-center head-box">
                    <h1><b>{splitAndCapitalize(move.name.toLowerCase(), "_")}</b></h1>
                    <TypeBar type={move.type}/>
                </div>
                <hr></hr>
                <div className="row" style={{margin: 0}}>
                    <div className="col" style={{padding: 0}}>
                        <table className="table-info move-table">
                            <thead className="center">
                                <tr><th colSpan="2">{"Stats "+splitAndCapitalize(move.name.toLowerCase(), "_")+" in Pokemon Go"}</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>ID</td>
                                    <td><b>#{move.id}</b></td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td><b>{splitAndCapitalize(move.name.toLowerCase(), "_")}</b></td>
                                </tr>
                                <tr>
                                    <td>Type</td>
                                    <td><b>{splitAndCapitalize(move.type.toLowerCase(), "_")}</b></td>
                                </tr>
                                <tr>
                                    <td>Move Type</td>
                                    <td><b>{capitalize(move.type_move.toLowerCase())} Move</b></td>
                                </tr>
                                <tr className="center"><td className="table-sub-header" colSpan="2">PVE Stats</td></tr>
                                <tr>
                                    <td>PVE Power</td>
                                    <td>{move.pve_power}</td>
                                </tr>
                                <tr>
                                    <td>PVE Energy</td>
                                    <td>{move.pve_energy > 0 && "+"}{move.pve_energy}</td>
                                </tr>
                                {move.type_move === "CHARGE" && <tr>
                                    <td>PVE Bar Charge</td>
                                    <td className="d-flex align-items-center" style={{border: 'none'}}>{[...Array(getBarCharge(true, move.pve_energy)).keys()].map((value, index) => (
                                        <div key={index} className="bar-charge"></div>
                                    ))}</td>
                                </tr>}
                                <tr className="center"><td className="table-sub-header" colSpan="2">PVP Stats</td></tr>
                                <tr>
                                    <td>PVP Power</td>
                                    <td>{move.pvp_power}</td>
                                </tr>
                                <tr>
                                    <td>PVP Energy</td>
                                    <td>{move.pvp_energy > 0 && "+"}{move.pvp_energy}</td>
                                </tr>
                                {move.type_move === "CHARGE" && <tr>
                                    <td>PVP Bar Charge</td>
                                    <td className="d-flex align-items-center" style={{border: 'none'}}>{[...Array(getBarCharge(false, move.pvp_energy)).keys()].map((value, index) => (
                                        <div key={index} className="bar-charge"></div>
                                    ))}</td>
                                </tr>}
                                <tr className="center"><td className="table-sub-header" colSpan="2">Other Stats</td></tr>
                                <tr>
                                    <td>Weather Boosts</td>
                                    <td><img className="img-type-icon" height={25} alt="img-type" src={APIService.getWeatherIconSprite(getWeatherEffective(move.type))}></img></td>
                                </tr>
                                <tr>
                                    <td>Animation Duration</td>
                                    <td>{move.durationMs} ms ({move.durationMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Damage Start Window</td>
                                    <td>{move.damageWindowStartMs} ms ({move.damageWindowStartMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Damage End Window</td>
                                    <td>{move.damageWindowEndMs} ms ({move.damageWindowEndMs/1000} sec)</td>
                                </tr>
                                <tr>
                                    <td>Critical Chance</td>
                                    <td>{move.criticalChance*100}%</td>
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
                                <tr>
                                    <td>DPS (Weather)</td>
                                    <td>{((move.pvp_power*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>DPS (STAB+Weather)</td>
                                    <td>{((move.pvp_power*1.2*1.2)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>
                                {move.type_move === "FAST" &&<tr>
                                    <td>EPS</td>
                                    <td>{((move.pvp_energy)/(move.durationMs/1000)).toFixed(2)}</td>
                                </tr>}
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