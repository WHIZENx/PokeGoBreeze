import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../util/calculate';

import { Form } from 'react-bootstrap';
import { RAID_BOSS_TIER } from '../../util/constants';

import ATK_LOGO from '../../assets/attack.png';
import DEF_LOGO from '../../assets/defense.png';
import HP_LOGO from '../../assets/hp.png';
import STA_LOGO from '../../assets/stamina.png';

import { getFormFromForms } from '../../util/utils';
import { useSelector } from 'react-redux';
import { SearchingState } from '../../store/models/state.model';
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
import { isNotEmpty, isUndefined, toNumber } from '../../util/extension';

const Tools = (props: IToolsComponent) => {
  const pokemonData = useSelector((state: SearchingState) => state.searching.pokemon);
  const currentForm = useSelector((state: SearchingState) => state.searching.form);
  const [currTier, setCurrTier] = useState(props.tier);

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(stats, props.id, currentForm?.form.formName, currentForm?.form.pokemonType),
    [props.id, currentForm?.form.formName]
  );

  useEffect(() => {
    if (props.tier > 5 && currentForm?.form.pokemonType !== PokemonType.Mega) {
      setCurrTier(5);
      if (props.setTier) {
        props.setTier(5);
      }
    } else if (props.tier === 5 && currentForm?.form.pokemonType === PokemonType.Mega && pokemonData?.pokemonClass !== PokemonClass.None) {
      setCurrTier(6);
      if (props.setTier) {
        props.setTier(6);
      }
    }
  }, [currentForm?.form.formName, props.id, props.setTier, props.tier, pokemonData?.pokemonClass]);

  useEffect(() => {
    if (props.stats) {
      const formResult: StatsRankingPokemonGO = {
        atk: filterFormList(props.stats.attack.ranking),
        def: filterFormList(props.stats.defense.ranking),
        sta: filterFormList(props.stats.stamina.ranking),
        prod: filterFormList(props.stats.statProd.ranking),
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
        currentForm &&
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
          props.isRaid && props.tier && !props.isHide ? RAID_BOSS_TIER[props.tier].sta : toNumber(formResult.sta.stamina)
        );
      }
    }
  }, [
    filterFormList,
    currentForm,
    props.dataPoke,
    props.id,
    props.stats?.attack.ranking,
    props.stats?.defense.ranking,
    props.stats?.stamina.ranking,
    props.isRaid,
    props.tier,
    props.isHide,
  ]);

  return (
    <Fragment>
      {props.isRaid ? (
        <div className="element-top" style={{ marginBottom: 15 }}>
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
              {currentForm?.form.pokemonType !== PokemonType.Mega && <option value={5}>Tier 5</option>}
            </optgroup>
            <optgroup label="Legacy Tiers">
              <option value={2}>Tier 2</option>
              <option value={4}>Tier 4</option>
            </optgroup>
            {currentForm?.form.pokemonType === PokemonType.Mega && (
              <Fragment>
                {pokemonData?.pokemonClass !== PokemonClass.None ? (
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
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={ATK_LOGO} />
                  ATK
                </td>
                <td className="text-center">{toNumber(statsPokemon?.atk?.attack)}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={DEF_LOGO} />
                  DEF
                </td>
                <td className="text-center">{toNumber(statsPokemon?.def?.defense)}</td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={STA_LOGO} />
                  STA
                </td>
                <td className="text-center">
                  {statsPokemon?.sta ? Math.floor(toNumber(statsPokemon.sta.stamina) / RAID_BOSS_TIER[props.tier].CPm) : 0}
                </td>
              </tr>
              <tr>
                <td>
                  <img style={{ marginRight: 10 }} alt="img-logo" width={20} height={20} src={HP_LOGO} />
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
          pokemonStats={props.stats}
          stats={pokemonData?.baseStats}
          id={props.id}
          form={pokemonData?.forme}
        />
      )}
    </Fragment>
  );
};

export default Tools;
