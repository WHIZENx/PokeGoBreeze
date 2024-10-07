import { Box, FormControlLabel, Radio } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { LevelSlider, TypeRadioGroup, capitalize } from '../../../util/utils';
import { calculateStatsBattle } from '../../../util/calculate';

import APIService from '../../../services/API.service';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import { useSelector } from 'react-redux';
import { MAX_IV, MAX_LEVEL, MIN_LEVEL, SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/constants';
import { StoreState } from '../../../store/models/state.model';
import { IStatsTableComponent } from '../../models/page.model';
import { toNumber } from '../../../util/extension';
import { PokemonType } from './enums/damage.enum';

const StatsTable = (props: IStatsTableComponent) => {
  const globalOptions = useSelector((state: StoreState) => state.store?.data?.options);

  const [currStatLevel, setCurrStatLevel] = useState(1);
  const [currStatType, setCurrStatType] = useState(PokemonType.None.toString());

  const onHandleLevel = useCallback(
    (v: number) => {
      if (props.setStatLevel) {
        props.setStatLevel(v);
      }
      if (props.setStatLvATK) {
        props.setStatLvATK(
          calculateStatsBattle(
            props.statATK,
            MAX_IV,
            currStatLevel,
            false,
            currStatType === PokemonType.Shadow ? SHADOW_ATK_BONUS(globalOptions) : 1
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
            currStatType === PokemonType.Shadow ? SHADOW_DEF_BONUS(globalOptions) : 1
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
        props.setStatLevel(toNumber(v));
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
            defaultValue={PokemonType.None}
            onChange={(e) => onHandleType(e.target.value)}
          >
            <FormControlLabel value={PokemonType.None} control={<Radio />} label={<span>{capitalize(PokemonType.None)}</span>} />
            <FormControlLabel
              value={PokemonType.Buddy}
              control={<Radio />}
              label={
                <span>
                  <img height={28} alt="img-buddy" src={APIService.getPokeBuddy()} /> {capitalize(PokemonType.Buddy)}
                </span>
              }
            />
            <FormControlLabel
              value={PokemonType.Shadow}
              control={<Radio />}
              label={
                <span>
                  <img height={32} alt="img-shadow" src={APIService.getPokeShadow()} /> {capitalize(PokemonType.Shadow)}
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
              max={currStatType === PokemonType.Buddy ? MAX_LEVEL : MAX_LEVEL - 1}
              onChange={(_, v) => onHandleLevel(v as number)}
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
                    currStatType === PokemonType.Shadow ? SHADOW_ATK_BONUS(globalOptions) : 1
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
                    currStatType === PokemonType.Shadow ? SHADOW_DEF_BONUS(globalOptions) : 1
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
