import { Box, FormControlLabel, Radio } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { LevelSlider, TypeRadioGroup, getKeyWithData, isSpecialMegaFormType } from '../../../utils/utils';

import APIService from '../../../services/api.service';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import { IStatsDamageTableComponent } from '../../models/page.model';
import { PokemonType } from '../../../enums/type.enum';
import { toNumber } from '../../../utils/extension';
import { maxIv, minLevel, maxLevel, maxPokemonLevel, stepLevel } from '../../../utils/helpers/options-context.helpers';
import type { DamageCalculatedStats } from '../../../services/models/tools-api.model';

const StatsDamageTable = (props: IStatsDamageTableComponent) => {
  const [currStatLevel, setCurrStatLevel] = useState(1);
  const [currStatType, setCurrStatType] = useState(PokemonType.Normal);
  const [calculatedStats, setCalculatedStats] = useState<DamageCalculatedStats[]>([]);

  useEffect(() => {
    if (props.setStatType && currStatType === PokemonType.Shadow && isSpecialMegaFormType(props.pokemonType)) {
      setCurrStatType(PokemonType.Normal);
      props.setStatType(PokemonType.Normal);
    }
  }, [props.setStatType, currStatType, props.pokemonType]);

  useEffect(() => {
    if (props.statATK === undefined || props.statDEF === undefined || props.statSTA === undefined) {
      setCalculatedStats([]);
      return;
    }
    let active = true;
    APIService.postDamageSimulator({
      mode: 'stats',
      base: { atk: props.statATK, def: props.statDEF, sta: props.statSTA },
      pokemonType: currStatType,
      iv: maxIv(),
      config: { minLevel: minLevel(), maxLevel: maxLevel(), step: stepLevel() },
    })
      .then((response) => {
        if (active && response.data.data.mode === 'stats') {
          setCalculatedStats(response.data.data.levels);
        }
      })
      .catch(() => {
        if (active) {
          setCalculatedStats([]);
        }
      });
    return () => {
      active = false;
    };
  }, [props.statATK, props.statDEF, props.statSTA, currStatType]);

  const onHandleLevel = useCallback(
    (v: number) => {
      if (props.setStatLevel) {
        props.setStatLevel(v);
      }
      setCurrStatLevel(v);
    },
    [props.setStatLevel]
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

  const displayStats = useMemo(
    () => calculatedStats.find((stats) => stats.level === currStatLevel),
    [calculatedStats, currStatLevel]
  );

  return (
    <div className="tw-container">
      <div>
        <div className="tw-flex tw-justify-center tw-text-center">
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
                <div className="tw-flex tw-items-center tw-gap-2">
                  <img height={28} alt="Image Buddy" src={APIService.getPokeBuddy()} />{' '}
                  <span>{getKeyWithData(PokemonType, PokemonType.Buddy)}</span>
                </div>
              }
            />
            <FormControlLabel
              value={PokemonType.Shadow}
              disabled={isSpecialMegaFormType(props.pokemonType)}
              control={<Radio />}
              label={
                <div className="tw-flex tw-items-center tw-gap-2">
                  <img height={32} alt="Image Shadow" src={APIService.getPokeShadow()} />{' '}
                  <span>{getKeyWithData(PokemonType, PokemonType.Shadow)}</span>
                </div>
              }
            />
          </TypeRadioGroup>
        </div>
        <div className="tw-flex tw-justify-center tw-text-center tw-h-20">
          <Box className="tw-w-3/5" sx={{ minWidth: 320 }}>
            <div className="tw-flex tw-justify-between">
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
              max={currStatType === PokemonType.Buddy ? maxLevel() : maxPokemonLevel()}
              onChange={(_, v) => onHandleLevel(v as number)}
            />
          </Box>
        </div>
        <div className="tw-flex tw-justify-center tw-text-center">
          <table className="table-info !tw-w-2/5" style={{ minWidth: 270 }}>
            <thead />
            <tbody>
              <tr className="tw-text-center">
                <td className="table-sub-header" colSpan={2}>
                  Stats
                </td>
              </tr>
              <tr>
                <td>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img className="tw-mr-2" alt="Image League" width={20} height={20} src={ATK_LOGO} />
                    <span>ATK</span>
                  </div>
                </td>
                <td className="!tw-text-center">{displayStats ? Math.floor(displayStats.atk) : '-'}</td>
              </tr>
              <tr>
                <td>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img className="tw-mr-2" alt="Image League" width={20} height={20} src={DEF_LOGO} />
                    <span>DEF</span>
                  </div>
                </td>
                <td className="!tw-text-center">{displayStats ? Math.floor(displayStats.def) : '-'}</td>
              </tr>
              <tr>
                <td>
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <img className="tw-mr-2" alt="Image League" width={20} height={20} src={HP_LOGO} />
                    <span>HP</span>
                  </div>
                </td>
                <td className="!tw-text-center">{displayStats ? Math.floor(displayStats.sta) : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsDamageTable;
