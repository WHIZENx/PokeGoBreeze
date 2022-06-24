import { Box, FormControlLabel, Radio } from "@mui/material";
import { useCallback, useState } from "react";
import { calculateStatsBattle, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from "../../../components/Calculate/Calculate";
import APIService from "../../../services/API.service";

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import sta_logo from '../../../assets/stamina.png';
import { LevelSlider, TypeRadioGroup } from "../../../util/util";

const StatsTable = ({setStatType, setStatLevel, statATK, statDEF, statSTA, setStatLvATK, setStatLvDEF, setStatLvSTA}) => {

    const [currStatLevel, setCurrStatLevel] = useState(1);
    const [currStatType, setCurrStatType] = useState(null);

    const onHandleLevel = useCallback((e, v) => {
        setStatLevel(v);
        if(setStatLvATK) setStatLvATK(calculateStatsBattle(statATK, 15, currStatLevel, false, currStatType === "shadow" ? SHADOW_ATK_BONUS : 1));
        if(setStatLvDEF) setStatLvDEF(calculateStatsBattle(statDEF, 15, currStatLevel, false, currStatType === "shadow" ? SHADOW_DEF_BONUS : 1));
        if(setStatLvSTA) setStatLvSTA(calculateStatsBattle(statSTA, 15, currStatLevel));
        setCurrStatLevel(v);
    }, [setStatLevel, setStatLvATK, setStatLvDEF, setStatLvSTA, statATK, statDEF, statSTA, currStatType, currStatLevel]);

    const onHandleType = useCallback(v => {
        setStatType(v);
        setCurrStatType(v);
        setStatLevel(1);
        setCurrStatLevel(1);
    }, [setStatType, setStatLevel]);

    return (
        <div className="container">
            <div>
                <div className="d-flex justify-content-center text-center">
                    <TypeRadioGroup
                        row
                        aria-labelledby="row-types-group-label"
                        name="row-types-group"
                        defaultValue={""}
                        onChange={(e) => onHandleType(e.target.value)}>
                        <FormControlLabel value="" control={<Radio />} label={<span>None</span>} />
                        <FormControlLabel value="lucky" control={<Radio />} label={<span><img height={32} alt="img-lucky" src={APIService.getPokeLucky()}></img> Lucky</span>} />
                        <FormControlLabel value="shadow" control={<Radio />} label={<span><img height={32} alt="img-shadow" src={APIService.getPokeShadow()}></img> Shadow</span>} />
                    </TypeRadioGroup>
                </div>
                <div className="d-flex justify-content-center text-center" style={{height: 80}}>
                    <Box sx={{ width: '60%', minWidth: 320 }}>
                        <div className="d-flex justify-content-between">
                                <b>Level</b>
                                <b>{currStatLevel}</b>
                        </div>
                        <LevelSlider
                            aria-label="Level"
                            value={currStatLevel}
                            defaultValue={1}
                            valueLabelDisplay="off"
                            step={0.5}
                            min={1}
                            max={currStatType === "lucky" ? 51 : 50}
                            onChange={onHandleLevel}
                        />
                    </Box>
                </div>
                <div className="d-flex justify-content-center text-center">
                    <table className="table-info" style={{width: '40%', minWidth: 270}}>
                        <thead></thead>
                        <tbody>
                            <tr className="text-center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>ATK</td>
                                    <td className="text-center">{calculateStatsBattle(statATK, 15, currStatLevel, true, currStatType === "shadow" ? SHADOW_ATK_BONUS : 1)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>DEF</td>
                                    <td className="text-center">{calculateStatsBattle(statDEF, 15, currStatLevel, true, currStatType === "shadow" ? SHADOW_DEF_BONUS : 1)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>HP</td>
                                    <td className="text-center">{calculateStatsBattle(statSTA, 15, currStatLevel, true)}</td>
                                </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StatsTable;