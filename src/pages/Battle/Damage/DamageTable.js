import { useCallback } from 'react';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

import atk_logo from '../../../assets/attack.png';
import sta_logo from '../../../assets/stamina.png';

const labels = {
    0: 'Normal',
    1: 'Nice',
    2: 'Great',
    3: 'Excellent'
};

const DamageTable = (props) => {

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string, splitBy) => {
        return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(" ");
    }, []);

    return (
        <div className="container">
            <div className="d-flex justify-content-center">
                <table className="table-info">
                    <thead></thead>
                    <tbody>
                        <tr className="center"><td className="table-sub-header" colSpan="2">Battle Result</td></tr>
                        <tr>
                            <td>Attack to</td>
                            <td>{props.result.objPoke ? splitAndCapitalize(props.result.objPoke.form.pokemon.name, "-") : "-"}</td>
                        </tr>
                        <tr>
                            <td>Move name</td>
                            <td>{props.result.move ? splitAndCapitalize(props.result.move.name, "_") : "-"}</td>
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
                            <td>Pokemon Friendship level</td>
                            <td>{props.result.battleState ? props.result.battleState.flevel : "-"}</td>
                        </tr>
                        <tr>
                            <td>Charge ability</td>
                            <td>{props.result.battleState ? labels[props.result.battleState.clevel] : "-"}</td>
                        </tr>
                        <tr>
                            <td>Damage Effective</td>
                            <td>{props.result.battleState ? "x"+props.result.battleState.effective : "-"}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>Damage Taken</td>
                            <td>{props.result.damage ? <b>{props.result.damage}</b> : "-"}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>HP Object remaining</td>
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