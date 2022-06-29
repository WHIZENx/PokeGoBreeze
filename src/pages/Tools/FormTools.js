import { Fragment, useCallback, useEffect, useState } from "react";
import Stats from "../../components/Info/Stats/Stats";
import { calBaseATK, calBaseDEF, calculateRaidStat } from "../../util/Calculate";

import { Form } from "react-bootstrap";
import { RAID_BOSS_TIER } from "../../util/Constants";

import atk_logo from '../../assets/attack.png';
import def_logo from '../../assets/defense.png';
import sta_logo from '../../assets/stamina.png';

import pokemonData from '../../data/pokemon.json';

const FormTools = ({id, currForm, formList, dataPoke, stats, setForm, onSetStats, raid, tier, setTier}) => {

    const [currDataPoke, setCurrDataPoke] = useState(null);
    const [currTier, setCurrTier] = useState(tier);

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
        const filterForm = stats.find(item => item.id === id && item.form !== "a" &&
            filterFormName(currForm.form.form_name, item.form));
        if (filterId.length === 1 && formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [currForm, filterFormName, formList.length]);

    useEffect(() => {
        if (parseInt(tier) > 5 && currForm && !currForm.form.form_name.includes("mega")) {
            setCurrTier(5);
            if (setTier) setTier(5);
        }
        else if (parseInt(tier) === 5 &&
            currForm && currForm.form.form_name.includes("mega") &&
            Object.values(pokemonData).find(item => item.num === id).pokemonClass) {
                setCurrTier(6);
                if (setTier) setTier(6);
            }
    }, [currForm, id, setTier, tier]);

    useEffect(() => {
        if (currForm && dataPoke) {
            let formATK = filterFormList(stats.attack.ranking, id);
            let formDEF = filterFormList(stats.defense.ranking, id);
            let formSTA = filterFormList(stats.stamina.ranking, id);
            setStatATK(formATK);
            setStatDEF(formDEF);
            setStatSTA(formSTA);
            setCurrDataPoke(dataPoke.find(item => item.id === id))

            if (formATK && formDEF && formSTA) {
                onSetStats("atk", formATK.attack)
                onSetStats("def", formDEF.defense)
                onSetStats("sta", formSTA.stamina)
                if (setForm) setForm(currForm)
            }
        }
    }, [filterFormList, currForm, dataPoke, id, onSetStats, setForm, stats.attack.ranking, stats.defense.ranking, stats.stamina.ranking])

    return (
        <Fragment>
            {raid ?
            <div style={{marginBottom: 15}}>
                <Form.Select className="w-100" onChange={(e) => {
                    setCurrTier(e.target.value);
                    if (setTier) setTier(e.target.value);
                    }} value={currTier}>
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
                <table className="table-info">
                    <thead></thead>
                    <tbody>
                        <tr className="text-center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}/>ATK</td>
                            <td className="text-center">{calculateRaidStat(currDataPoke || statATK ? statATK ? statATK.attack : calBaseATK(currDataPoke, true) : 0, tier)}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}/>DEF</td>
                            <td className="text-center">{calculateRaidStat(currDataPoke || statDEF ? statDEF ? statDEF.defense : calBaseDEF(currDataPoke, true) : 0, tier)}</td>
                        </tr>
                        <tr>
                            <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}/>STA</td>
                            <td className="text-center">{Math.floor(RAID_BOSS_TIER[tier].sta/RAID_BOSS_TIER[tier].CPm)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            :
            <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={stats}
                stats={currDataPoke}/>
            }
        </Fragment>

    )
}

export default FormTools;