import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../utils/calculate';

import { Form } from 'react-bootstrap';
import { RAID_BOSS_TIER } from '../../utils/constants';

import ATK_LOGO from '../../assets/attack.png';
import DEF_LOGO from '../../assets/defense.png';
import HP_LOGO from '../../assets/hp.png';
import STA_LOGO from '../../assets/stamina.png';

import { getFormFromForms } from '../../utils/utils';
import {
  IStatsAtk,
  IStatsDef,
  IStatsProd,
  StatsRankingPokemonGO,
  IStatsSta,
  StatsAtk,
  StatsDef,
  StatsSta,
} from '../../core/models/stats.model';
import { IToolsComponent } from '../models/component.model';
import { PokemonClass, PokemonType, TypeAction } from '../../enums/type.enum';
import { isNotEmpty, isUndefined, toNumber } from '../../utils/extension';
import useStats from '../../composables/useStats';
import useSearch from '../../composables/useSearch';

const Tools = (props: IToolsComponent) => {
  const { statsData } = useStats();
  const { searchingToolCurrentData } = useSearch();
  const [currTier, setCurrTier] = useState(props.tier);

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(
        stats,
        props.id,
        searchingToolCurrentData?.form?.form?.formName,
        searchingToolCurrentData?.form?.form?.pokemonType
      ),
    [props.id, searchingToolCurrentData?.form?.form?.formName]
  );

  useEffect(() => {
    if (props.tier > 5 && searchingToolCurrentData?.form?.form?.pokemonType !== PokemonType.Mega) {
      setCurrTier(5);
      if (props.setTier) {
        props.setTier(5);
      }
    } else if (
      props.tier === 5 &&
      searchingToolCurrentData?.form?.form?.pokemonType === PokemonType.Mega &&
      searchingToolCurrentData?.pokemon?.pokemonClass !== PokemonClass.None
    ) {
      setCurrTier(6);
      if (props.setTier) {
        props.setTier(6);
      }
    }
  }, [
    searchingToolCurrentData?.form?.form?.formName,
    props.id,
    props.setTier,
    props.tier,
    searchingToolCurrentData?.pokemon?.pokemonClass,
  ]);

  useEffect(() => {
    if (
      statsData?.attack?.ranking &&
      statsData?.defense?.ranking &&
      statsData?.stamina?.ranking &&
      statsData?.statProd?.ranking
    ) {
      const formResult: StatsRankingPokemonGO = {
        atk: filterFormList(statsData.attack.ranking),
        def: filterFormList(statsData.defense.ranking),
        sta: filterFormList(statsData.stamina.ranking),
        prod: filterFormList(statsData.statProd.ranking),
      };

      setStatsPokemon({
        atk:
          props.isRaid && props.tier > 0 && !props.isHide && formResult.atk
            ? StatsAtk.create({ ...formResult.atk, attack: calculateRaidStat(formResult.atk.attack, props.tier) })
            : formResult.atk,
        def:
          props.isRaid && props.tier > 0 && !props.isHide && formResult.def
            ? StatsDef.create({ ...formResult.def, defense: calculateRaidStat(formResult.def.defense, props.tier) })
            : formResult.def,
        sta:
          props.isRaid && props.tier > 0 && !props.isHide && formResult.sta
            ? StatsSta.create({ ...formResult.sta, stamina: RAID_BOSS_TIER[props.tier]?.sta })
            : formResult.sta,
        prod: props.isRaid && props.tier && !props.isHide ? undefined : formResult.prod,
      });
      if (
        searchingToolCurrentData?.form?.form &&
        isNotEmpty(props.dataPoke) &&
        props.onSetStats &&
        !isUndefined(formResult.atk) &&
        !isUndefined(formResult.def) &&
        !isUndefined(formResult.sta)
      ) {
        props.onSetStats(
          TypeAction.Atk,
          props.isRaid && props.tier && !props.isHide
            ? calculateRaidStat(formResult.atk.attack, props.tier)
            : toNumber(formResult.atk.attack)
        );
        props.onSetStats(
          TypeAction.Def,
          props.isRaid && props.tier && !props.isHide
            ? calculateRaidStat(formResult.def.defense, props.tier)
            : toNumber(formResult.def.defense)
        );
        props.onSetStats(
          TypeAction.Sta,
          props.isRaid && props.tier && !props.isHide
            ? RAID_BOSS_TIER[props.tier].sta
            : toNumber(formResult.sta.stamina)
        );
      }
    }
  }, [
    filterFormList,
    searchingToolCurrentData?.form?.form,
    props.dataPoke,
    props.id,
    statsData,
    props.isRaid,
    props.tier,
    props.isHide,
  ]);

  return (
    <Fragment>
      {props.isRaid ? (
        <div className="mt-2 mb-3">
          <Form.Select
            className="w-100"
            onChange={(e) => {
              const tier = toNumber(e.target.value);
              setCurrTier(tier);
              if (props.setTier) {
                props.setTier(tier);
              }
              if (props.onClearStats) {
                props.onClearStats(true);
              }
            }}
            value={currTier}
          >
            <optgroup label="Normal Tiers">
              <option value={1}>Tier 1</option>
              <option value={3}>Tier 3</option>
              {searchingToolCurrentData?.form?.form?.pokemonType !== PokemonType.Mega && (
                <option value={5}>Tier 5</option>
              )}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {searchingToolCurrentData?.form?.form?.pokemonType === PokemonType.Mega && (
              <Fragment>
                {searchingToolCurrentData?.pokemon?.pokemonClass !== PokemonClass.None ? (
                  <optgroup label="Legendary Mega Tiers">
                    <option value={6}>Tier Mega</option>
                  </optgroup>
                ) : (
                  <optgroup label="Mega Tiers">
                    <option value={5}>Tier Mega</option>
                  </optgroup>
                )}
              </Fragment>
            )}
          </Form.Select>
          <table className="table-info">
            <thead />
            <tbody>
              <tr className="text-center">
                <td className="table-sub-header" colSpan={2}>
                  Stats
                </td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} />
                  ATK
                </td>
                <td className="text-center">{toNumber(statsPokemon?.atk?.attack)}</td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">{toNumber(statsPokemon?.def?.defense)}</td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image Logo" width={20} height={20} src={STA_LOGO} />
                  STA
                </td>
                <td className="text-center">
                  {statsPokemon?.sta
                    ? Math.floor(toNumber(statsPokemon.sta.stamina) / RAID_BOSS_TIER[props.tier].CPm)
                    : 0}
                </td>
              </tr>
              <tr>
                <td>
                  <img className="me-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
                  HP
                </td>
                <td className="text-center">{RAID_BOSS_TIER[props.tier].sta}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <Stats
          statATK={statsPokemon?.atk}
          statDEF={statsPokemon?.def}
          statSTA={statsPokemon?.sta}
          statProd={statsPokemon?.prod}
          stats={searchingToolCurrentData?.pokemon?.statsGO}
          id={props.id}
          form={searchingToolCurrentData?.pokemon?.form}
        />
      )}
    </Fragment>
  );
};

export default Tools;
