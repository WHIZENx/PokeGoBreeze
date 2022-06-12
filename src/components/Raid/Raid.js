import { Fragment, useState } from "react";
import { Form } from "react-bootstrap";
import { calculateRaidCP, calculateRaidStat, raidEgg, RAID_BOSS_TIER } from "../Calculate/Calculate";

import atk_logo from '../../assets/attack.png';
import def_logo from '../../assets/defense.png';
import sta_logo from '../../assets/stamina.png';

import pokemonData from '../../data/pokemon.json';

import './Raid.css';

const Raid = (props) => {

    const [tier, setTier] = useState(1);

    return (
        <Fragment>
            <h5 className='element-top'>- Raid:</h5>
            <div className="d-flex justify-content-center">
                <Form.Select className="w-50" onChange={(e) => setTier(e.target.value)} value={tier}>
                    <optgroup label="Normal Tiers">
                        <option value={1}>Tier 1</option>
                        <option value={3}>Tier 3</option>
                        <option value={5}>Tier 5</option>
                    </optgroup>
                    <optgroup label="Legacy Tiers">
                        <option value={2}>Tier 2</option>
                        <option value={4}>Tier 4</option>
                    </optgroup>
                    {props.currForm.form.form_name.includes("mega") &&
                    <optgroup label="Mega Tiers">
                        <option value={5}>Tier Mega</option>
                    </optgroup>
                    }
                </Form.Select>
            </div>
            <div className="row w-100 element-top" style={{margin: 0}}>
                <div className="col-4 center d-inline-block">
                    <h1>CP</h1>
                    <hr className="w-100"></hr>
                    <h5>{calculateRaidCP(props.statATK, props.statDEF, tier)}</h5>
                </div>
                <div className="col-4 center d-inline-block">
                    <h1>HP</h1>
                    <hr className="w-100"></hr>
                    <h5>{RAID_BOSS_TIER[tier].sta}</h5>
                </div>
                <div className="col-4 center d-inline-block">
                    <h1>LEVEL</h1>
                    <hr className="w-100"></hr>
                    <h5>{RAID_BOSS_TIER[tier].level}</h5>
                </div>
            </div>
            <div className="row element-top container" style={{margin: 0}}>
                <div className='col d-flex justify-content-center align-items-center' style={{marginBottom: 15}}>
                    <img className={parseInt(tier) === 2 || parseInt(tier) === 4 ? "img-type-icon" : ""} alt="img-raid-egg" src={raidEgg(parseInt(tier), props.currForm.form.form_name.includes("mega"), Object.values(pokemonData).find(item => item.num === props.id).pokemonClass ? true : false)}></img>
                </div>
                <div className='col d-flex justify-content-center' style={{marginBottom: 15}}>
                    <table className="table-info">
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>ATK</td>
                                    <td className="center">{calculateRaidStat(props.statATK, tier)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>DEF</td>
                                    <td className="center">{calculateRaidStat(props.statDEF, tier)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>HP</td>
                                    <td className="center">{calculateRaidStat(props.statSTA, tier)}</td>
                                </tr>
                        </tbody>
                    </table>
            </div>
            </div>



        </Fragment>
    )
}

export default Raid;