import { Box, FormControlLabel, Radio } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { LevelSlider, TypeRadioGroup, capitalize } from '../../../util/Utils';
import { calculateStatsBattle } from '../../../util/Calculate';

import APIService from '../../../services/API.service';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import { useSelector } from 'react-redux';
import { FORM_SHADOW, MAX_IV, MAX_LEVEL, MIN_LEVEL, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/Constants';
import { StoreState } from '../../../store/models/state.model';
import { IStatsTableComponent } from '../../models/page.model';

const StatsTable = (props: IStatsTableComponent) => {
  const globalOptions = useSelector((state: StoreState) => state.store?.data?.options);

  const [currStatLevel, setCurrStatLevel] = useState(1);
  const [currStatType, setCurrStatType]: [string | undefined, React.Dispatch<React.SetStateAction<string | undefined>>] = useState();

  const onHandleLevel = useCallback(
    (_: Event, v: number | number[]) => {
      if (props.setStatLevel) {
        props.setStatLevel(v as number);
      }
      if (props.setStatLvATK) {
        props.setStatLvATK(
          calculateStatsBattle(
            props.statATK,
            MAX_IV,
            currStatLevel,
            false,
            currStatType?.toUpperCase() === FORM_SHADOW ? SHADOW_ATK_BONUS(globalOptions) : 1
          )
        );
      }
      if (props.setStatLvDEF) {
        props.setStatLvDEF(
          calculateStatsBattle(
            props.statDEF,
            MAX_IV,
            currStatLevel,
            false,
            currStatType?.toUpperCase() === FORM_SHADOW ? SHADOW_DEF_BONUS(globalOptions) : 1
          )
        );
      }
      if (props.setStatLvSTA) {
        props.setStatLvSTA(calculateStatsBattle(props.statSTA, MAX_IV, currStatLevel));
      }
      setCurrStatLevel(v as number);
    },
    [
      globalOptions,
      props.setStatLevel,
      props.setStatLvATK,
      props.setStatLvDEF,
      props.setStatLvSTA,
      props.statATK,
      props.statDEF,
      props.statSTA,
      currStatType,
      currStatLevel,
    ]
  );

  const onHandleType = useCallback(
    (v: string) => {
      if (props.setStatLevel) {
        props.setStatLevel(parseInt(v));
      }
      setCurrStatType(v);
      if (props.setStatLevel) {
        props.setStatLevel(1);
      }
      setCurrStatLevel(1);
    },
    [props.setStatType, props.setStatLevel]
  );

  return (
    <div className="container">
      <div>
        <div className="d-flex justify-content-center text-center">
          <TypeRadioGroup
            row={true}
            aria-labelledby="row-types-group-label"
            name="row-types-group"
            defaultValue={''}
            onChange={(e) => onHandleType(e.target.value)}
          >
            <FormControlLabel value="" control={<Radio />} label={<span>None</span>} />
            <FormControlLabel
              value="buddy"
              control={<Radio />}
              label={
                <span>
                  <img height={28} alt="img-buddy" src={APIService.getPokeBuddy()} /> Buddy
                </span>
              }
            />
            <FormControlLabel
              value="shadow"
              control={<Radio />}
              label={
                <span>
                  <img height={32} alt="img-shadow" src={APIService.getPokeShadow()} /> {capitalize(FORM_SHADOW)}
                </span>
              }
            />
          </TypeRadioGroup>
        </div>
        <div className="d-flex justify-content-center text-center" style={{ height: 80 }}>
          <Box sx={{ width: '60%', minWidth: 320 }}>
            <div className="d-flex justify-content-between">
              <b>Level</b>
              <b>{currStatLevel}</b>
            </div>
            <LevelSlider
              aria-label="Level"
              value={currStatLevel}
              defaultValue={MIN_LEVEL}
              valueLabelDisplay="off"
              step={0.5}
              min={MIN_LEVEL}
              max={currStatType === 'buddy' ? MAX_LEVEL : MAX_LEVEL - 1}
              onChange={onHandleLevel}
            />
          </Box>
        </div>
        <div className="d-flex justify-content-center text-center">
          <table className="table-info" style={{ width: '40%', minWidth: 270 }}>
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  Stats
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={ATK_LOGO} />
                  ATK
                </td>
                <td className="text-center">
                  {calculateStatsBattle(
                    props.statATK,
                    MAX_IV,
                    currStatLevel,
                    true,
                    currStatType?.toUpperCase() === FORM_SHADOW ? SHADOW_ATK_BONUS(globalOptions) : 1
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">
                  {calculateStatsBattle(
                    props.statDEF,
                    MAX_IV,
                    currStatLevel,
                    true,
                    currStatType?.toUpperCase() === FORM_SHADOW ? SHADOW_DEF_BONUS(globalOptions) : 1
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-league" width={20} height={20} src={HP_LOGO} />
                  HP
                </td>
                <td className="text-center">{calculateStatsBattle(props.statSTA, MAX_IV, currStatLevel, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsTable;
