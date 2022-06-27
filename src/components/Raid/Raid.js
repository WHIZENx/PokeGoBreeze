import { Fragment, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { calculateRaidCP, calculateRaidStat, raidEgg, RAID_BOSS_TIER } from "../Calculate/Calculate";

import atk_logo from '../../assets/attack.png';
import def_logo from '../../assets/defense.png';
import sta_logo from '../../assets/stamina.png';

import pokemonData from '../../data/pokemon.json';

const Raid = ({clearData, setTierBoss, currForm, id, statATK, statDEF, setStatBossATK, setStatBossDEF, setStatBossHP, setTimeAllow}) => {

    const [tier, setTier] = useState(1);

    useEffect(() => {
        if (parseInt(tier) > 5 && currForm && !currForm.form.form_name.includes("mega")) setTier(5);
        else if (parseInt(tier) === 5 &&
            currForm && currForm.form.form_name.includes("mega") &&
            Object.values(pokemonData).find(item => item.num === id).pokemonClass) setTier(6);
        if (setTierBoss) setTierBoss(parseInt(tier));
        if (setStatBossATK && setStatBossDEF && setStatBossHP) {
            setStatBossATK(calculateRaidStat(statATK, tier));
            setStatBossDEF(calculateRaidStat(statDEF, tier));
            setStatBossHP(RAID_BOSS_TIER[tier].sta);
        }
        if (setTimeAllow) setTimeAllow(RAID_BOSS_TIER[tier].timer)
    }, [tier, currForm, id, setTierBoss, setStatBossATK, setStatBossDEF, setStatBossHP, statATK, statDEF, setTimeAllow]);

    return (
        <Fragment>
            <div className="d-flex justify-content-center">
                <Form.Select className="w-50" onChange={(e) => {
                    setTier(e.target.value);
                    if (clearData) clearData();
                    }} value={tier}>
                    <optgroup label="Normal Tiers">
                        <option value={1}>Tier 1</option>
                        <option value={3}>Tier 3</option>
                        {currForm && !currForm.form.form_name.includes("mega") && <option value={5}>Tier 5</option>}
                    </optgroup>
                    <optgroup label="Legacy Tiers">
                        <option value={2}>Tier 2</option>
                        <option value={4}>Tier 4</option>
                    </optgroup>
                    {currForm && currForm.form.form_name.includes("mega") &&
                    <Fragment>
                        {Object.values(pokemonData).find(item => item.num === id).pokemonClass ?
                        <optgroup label="Legendary Mega Tiers">
                            <option value={6}>Tier Mega</option>
                        </optgroup>
                        :
                        <optgroup label="Mega Tiers">
                            <option value={5}>Tier Mega</option>
                        </optgroup>
                        }
                    </Fragment>
                    }
                </Form.Select>
            </div>
            <div className="row w-100 element-top" style={{margin: 0}}>
                <div className="col-4 text-center d-inline-block">
                    <h1>CP</h1>
                    <hr className="w-100"></hr>
                    <h5>{calculateRaidCP(statATK, statDEF, tier)}</h5>
                </div>
                <div className="col-4 text-center d-inline-block">
                    <h1>HP</h1>
                    <hr className="w-100"></hr>
                    <h5>{RAID_BOSS_TIER[tier].sta}</h5>
                </div>
                <div className="col-4 text-center d-inline-block">
                    <h1>LEVEL</h1>
                    <hr className="w-100"></hr>
                    <h5>{RAID_BOSS_TIER[tier].level}</h5>
                </div>
            </div>
            <div className="row element-top container" style={{margin: 0}}>
                <div className='col d-flex justify-content-center align-items-center' style={{marginBottom: 15}}>
                    <img className={parseInt(tier) === 2 ? "img-type-icon" : ""} alt="img-raid-egg" src={raidEgg(parseInt(tier), currForm && currForm.form.form_name.includes("mega"))}></img>
                </div>
                <div className='col d-flex justify-content-center' style={{marginBottom: 15}}>
                    <table className="table-info">
                        <thead></thead>
                        <tbody>
                            <tr className="text-center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                            <tr>
                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>ATK</td>
                                <td className="text-center">{calculateRaidStat(statATK, tier)}</td>
                            </tr>
                            <tr>
                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>DEF</td>
                                <td className="text-center">{calculateRaidStat(statDEF, tier)}</td>
                            </tr>
                            <tr>
                                <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>STA</td>
                                <td className="text-center">{Math.floor(RAID_BOSS_TIER[tier].sta/RAID_BOSS_TIER[tier].CPm)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Fragment>
    )
}

export default Raid;