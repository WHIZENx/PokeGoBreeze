import React, { Fragment } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import hp_logo from '../../../assets/hp.png';
import APIService from '../../../services/API.service';

import { splitAndCapitalize } from "../../../util/Utils";

const labels = {
    0: 'Normal',
    1: 'Nice',
    2: 'Great',
    3: 'Excellent'
};

const eff = {
    0.244140625: {
        label: 0.244,
        style: 'super-resistance'
    },
    0.390625: {
        label: 0.391,
        style: 'very-resistance'
    },
    0.625: {
        label: 0.625,
        style: 'resistance'
    },
    1: {
        label: 1,
        style: 'neutral'
    },
    1.6: {
        label: 1.6,
        style: 'weakness'
    },
    2.5600000000000005: {
        label: 2.56,
        style: 'super-weakness'
    }
};

const DamageTable = (props) => {

    return (
        <div className="container">
            <div className="d-flex justify-content-center">
                <table className="table-info table-result">
                    <thead></thead>
                    <tbody>
                        <tr className="text-center"><td className="table-sub-header" colSpan="2">Battle Result</td></tr>
                        <tr>
                            <td>Attacker</td>
                            <td>{props.result.objPoke ?
                            <Fragment>
                                {props.result.type === "lucky" && <img height={20} style={{marginRight: 8}} alt="img-lucky" src={APIService.getPokeLucky()}/>}
                                {props.result.type === "shadow" && <img height={20} style={{marginRight: 8}} alt="img-shadow" src={APIService.getPokeShadow()}/>}
                            {splitAndCapitalize(props.result.currPoke.form.pokemon.name, "-", " ")} <span className='d-inline-block caption'>(LV. {props.result.currLevel})</span></Fragment> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Target</td>
                            <td>{props.result.objPoke ?
                            <Fragment>
                            {props.result.typeObj === "lucky" && <img height={20} style={{marginRight: 8}} alt="img-lucky" src={APIService.getPokeLucky()}/>}
                            {props.result.typeObj === "shadow" && <img height={20} style={{marginRight: 8}} alt="img-shadow" src={APIService.getPokeShadow()}/>}
                            {splitAndCapitalize(props.result.objPoke.form.pokemon.name, "-", " ")} <span className='d-inline-block caption'>(LV. {props.result.objLevel})</span></Fragment> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Move name</td>
                            <td>{props.result.move ? splitAndCapitalize(props.result.move.name.replaceAll("_PLUS","+"), "_", " ") : "-"}</td>
                        </tr>
                        <tr>
                            <td>Move damage</td>
                            <td>{props.result.move ? props.result.move.pve_power : "-"}</td>
                        </tr>
                        <tr>
                            <td>Stab</td>
                            <td>{props.result.battleState ? props.result.battleState.stab ? <DoneIcon sx={{color: 'green'}}/> : <CloseIcon sx={{color: 'red'}}/> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Weather Boosts</td>
                            <td>{props.result.battleState ? props.result.battleState.wb ? <DoneIcon sx={{color: 'green'}}/> : <CloseIcon sx={{color: 'red'}}/> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Dodge</td>
                            <td>{props.result.battleState ? props.result.battleState.dodge ? <DoneIcon sx={{color: 'green'}}/> : <CloseIcon sx={{color: 'red'}}/> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Battle with Trainer</td>
                            <td>{props.result.battleState ? props.result.battleState.trainer ? <DoneIcon sx={{color: 'green'}}/> : <CloseIcon sx={{color: 'red'}}/> : "-"}</td>
                        </tr>
                        <tr>
                            <td>Pokémon Friendship level</td>
                            <td>{props.result.battleState ? props.result.battleState.flevel : "-"}</td>
                        </tr>
                        <tr>
                            <td>Charge ability</td>
                            <td>{props.result.battleState ? labels[props.result.battleState.clevel] : "-"}</td>
                        </tr>
                        <tr>
                            <td>Damage Effective</td>
                            <td>{props.result.battleState ? <span className={'eff-'+eff[props.result.battleState.effective].style}>{"x"+eff[props.result.battleState.effective].label}</span> : "-"}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}/>Damage Taken</td>
                            <td>{props.result.damage ? <b>{props.result.damage}</b> : "-"}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}/>Damage Reduced</td>
                            <td>{props.result.damage ?
                            <Fragment>
                            {props.result.damage < props.result.move.pve_power ?
                            <b className="text-success">{((props.result.move.pve_power-props.result.damage)*100/props.result.move.pve_power).toFixed(2)}%</b>
                            :
                            <b className="text-danger">0</b>
                            }
                            </Fragment> : "-"}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={hp_logo}/>HP Object remaining</td>
                            <td>{props.result.hp ? <b>{Math.floor(props.result.hp - props.result.damage)}
                            {Math.floor(props.result.hp - props.result.damage) > 0 ?
                            <span className='caption-small text-success'> (Alive)</span>
                            :
                            <span className='caption-small text-danger'> (Dead)</span>
                        }
                            </b> : "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DamageTable;