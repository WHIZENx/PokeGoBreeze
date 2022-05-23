import { Box, FormControlLabel, Radio, RadioGroup, Slider, styled } from "@mui/material";
import { useCallback, useState } from "react";
import { calculateStatsBettle, calculateStatsBettlePure } from "../../../components/Calculate/Calculate";
import APIService from "../../../services/API.service";

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import sta_logo from '../../../assets/stamina.png';

const LevelSlider = styled(Slider)(() => ({
    '& .MuiSlider-mark': {
        backgroundColor: 'currentColor',
        height: 13,
        width: 2,
        '&.MuiSlider-markActive': {
          opacity: 1,
          backgroundColor: 'red',
          height: 13
        },
    },
}));

const TypeRadioGroup = styled(RadioGroup)(() => ({
    '&.MuiFormGroup-root, &.MuiFormGroup-row': {
        display: 'block',
    }
}));

const StatsTable = (props) => {

    const [statLevel, setStatLevel] = useState(1);
    const [statType, setStatType] = useState(null);

    const onHandleLevel = useCallback((e, v) => {
        props.setStatLevel(v);
        if(props.setStatLvATK) props.setStatLvATK(calculateStatsBettlePure(props.statATK, 15, statLevel, statType === "shadow" ? 1.2 : 1));
        if(props.setStatLvDEF) props.setStatLvDEF(calculateStatsBettlePure(props.statDEF, 15, statLevel, statType === "shadow" ? 0.8 : 1));
        if(props.setStatLvSTA) props.setStatLvSTA(calculateStatsBettlePure(props.statSTA, 15, statLevel));
        setStatLevel(v);
    }, [props, statLevel, statType]);

    const onHandleType = useCallback(v => {
        props.setStatType(v);
        setStatType(v);
        props.setStatLevel(1);
        setStatLevel(1);
    }, [props]);

    return (
        <div className="container">
            <div>
                <div className="d-flex justify-content-center center">
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
                <div className="d-flex justify-content-center center" style={{height: 80}}>
                    <Box sx={{ width: '60%', minWidth: 320 }}>
                        <div className="d-flex justify-content-between">
                                <b>Level</b>
                                <b>{statLevel}</b>
                        </div>
                        <LevelSlider
                            aria-label="Level"
                            value={statLevel}
                            defaultValue={1}
                            valueLabelDisplay="off"
                            step={0.5}
                            min={1}
                            max={statType === "lucky" ? 51 : 50}
                            onChange={onHandleLevel}
                        />
                    </Box>
                </div>
                <div className="d-flex justify-content-center center">
                    <table className="table-info" style={{width: '40%', minWidth: 270}}>
                        <thead></thead>
                        <tbody>
                            <tr className="center"><td className="table-sub-header" colSpan="2">Stats</td></tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={atk_logo}></img>ATK</td>
                                    <td className="center">{calculateStatsBettle(props.statATK, 15, statLevel, statType === "shadow" ? 1.2 : 1)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={def_logo}></img>DEF</td>
                                    <td className="center">{calculateStatsBettle(props.statDEF, 15, statLevel, statType === "shadow" ? 0.8 : 1)}</td>
                                </tr>
                                <tr>
                                    <td><img style={{marginRight: 10}} alt='img-league' width={20} height={20} src={sta_logo}></img>HP</td>
                                    <td className="center">{calculateStatsBettle(props.statSTA, 15, statLevel)}</td>
                                </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StatsTable;