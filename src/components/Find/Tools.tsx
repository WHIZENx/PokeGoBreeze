import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../utils/calculate';

import { RAID_BOSS_TIER } from '../../utils/constants';

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
import SelectTier from '../Commons/Select/SelectTier';
import StatsTable from '../Commons/Table/Stats/StatsTable';

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
          <SelectTier
            className="w-100"
            tier={currTier}
            setTier={props.setTier}
            setCurrTier={setCurrTier}
            clearData={() => props.onClearStats?.(true)}
            pokemonType={searchingToolCurrentData?.form?.form?.pokemonType}
            pokemonClass={searchingToolCurrentData?.pokemon?.pokemonClass}
          />
          <StatsTable
            isLoadedForms={!!statsPokemon}
            tier={currTier}
            pokemonType={searchingToolCurrentData?.form?.form?.pokemonType}
            statATK={statsPokemon?.atk?.attack}
            statDEF={statsPokemon?.def?.defense}
            statSTA={statsPokemon?.sta?.stamina}
            isShowHp
          />
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
