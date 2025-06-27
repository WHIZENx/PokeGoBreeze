import { Box, FormControlLabel, Radio } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import {
  LevelSlider,
  TypeRadioGroup,
  getDmgMultiplyBonus,
  getKeyWithData,
  isSpecialMegaFormType,
} from '../../../utils/utils';
import { calculateStatsBattle } from '../../../utils/calculate';

import APIService from '../../../services/api.service';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import { IStatsTableComponent } from '../../models/page.model';
import { PokemonType, TypeAction } from '../../../enums/type.enum';
import { toNumber } from '../../../utils/extension';
import { maxIv, minLevel, maxLevel, stepLevel } from '../../../utils/helpers/context.helpers';

const StatsTable = (props: IStatsTableComponent) => {
  const [currStatLevel, setCurrStatLevel] = useState(1);
  const [currStatType, setCurrStatType] = useState(PokemonType.Normal);

  useEffect(() => {
    if (props.setStatType && currStatType === PokemonType.Shadow && isSpecialMegaFormType(props.pokemonType)) {
      setCurrStatType(PokemonType.Normal);
      props.setStatType(PokemonType.Normal);
    }
  }, [props.setStatType, currStatType, props.pokemonType]);

  const onHandleLevel = useCallback(
    (v: number) => {
      if (props.setStatLevel) {
        props.setStatLevel(v);
      }
      if (props.setStatLvATK) {
        props.setStatLvATK(
          calculateStatsBattle(
            props.statATK,
            maxIv(),
            currStatLevel,
            false,
            getDmgMultiplyBonus(currStatType, TypeAction.Atk)
          )
        );
      }
      if (props.setStatLvDEF) {
        props.setStatLvDEF(
          calculateStatsBattle(
            props.statDEF,
            maxIv(),
            currStatLevel,
            false,
            getDmgMultiplyBonus(currStatType, TypeAction.Def)
          )
        );
      }
      if (props.setStatLvSTA) {
        props.setStatLvSTA(calculateStatsBattle(props.statSTA, maxIv(), currStatLevel));
      }
      setCurrStatLevel(v);
    },
    [
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
    (v: PokemonType) => {
      if (props.setStatType) {
        props.setStatType(v);
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
            row
            aria-labelledby="row-types-group-label"
            name="row-types-group"
            value={currStatType}
            onChange={(e) => onHandleType(toNumber(e.target.value))}
          >
            <FormControlLabel
              value={PokemonType.Normal}
              control={<Radio />}
              label={<span>{getKeyWithData(PokemonType, PokemonType.Normal)}</span>}
            />
            <FormControlLabel
              value={PokemonType.Buddy}
              control={<Radio />}
              label={
                <span>
                  <img height={28} alt="Image Buddy" src={APIService.getPokeBuddy()} />{' '}
                  {getKeyWithData(PokemonType, PokemonType.Buddy)}
                </span>
              }
            />
            <FormControlLabel
              value={PokemonType.Shadow}
              disabled={isSpecialMegaFormType(props.pokemonType)}
              control={<Radio />}
              label={
                <span>
                  <img height={32} alt="Image Shadow" src={APIService.getPokeShadow()} />{' '}
                  {getKeyWithData(PokemonType, PokemonType.Shadow)}
                </span>
              }
            />
          </TypeRadioGroup>
        </div>
        <div className="d-flex justify-content-center text-center" style={{ height: 80 }}>
          <Box className="w-pct-60" sx={{ minWidth: 320 }}>
            <div className="d-flex justify-content-between">
              <b>Level</b>
              <b>{currStatLevel}</b>
            </div>
            <LevelSlider
              aria-label="Level"
              value={currStatLevel}
              defaultValue={minLevel()}
              valueLabelDisplay="off"
              step={stepLevel()}
              min={minLevel()}
              max={currStatType === PokemonType.Buddy ? maxLevel() : maxLevel() - 1}
              onChange={(_, v) => onHandleLevel(v as number)}
            />
          </Box>
        </div>
        <div className="d-flex justify-content-center text-center">
          <table className="table-info w-pct-40" style={{ minWidth: 270 }}>
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  Stats
                </td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                  ATK
                </td>
                <td className="text-center">
                  {calculateStatsBattle(
                    props.statATK,
                    maxIv(),
                    currStatLevel,
                    true,
                    getDmgMultiplyBonus(currStatType, TypeAction.Atk)
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">
                  {calculateStatsBattle(
                    props.statDEF,
                    maxIv(),
                    currStatLevel,
                    true,
                    getDmgMultiplyBonus(currStatType, TypeAction.Def)
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                  HP
                </td>
                <td className="text-center">{calculateStatsBattle(props.statSTA, maxIv(), currStatLevel, true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsTable;
