import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Stats from '../Info/Stats/Stats';
import { calculateRaidStat } from '../../utils/calculate';

import { RAID_BOSS_TIER } from '../../utils/constants';

import { getFormFromForms } from '../../utils/utils';
import { IStatsAtk, IStatsDef, IStatsProd, StatsRankingPokemonGO, IStatsSta } from '../../core/models/stats.model';
import { IToolsComponent } from '../models/component.model';
import { TypeAction } from '../../enums/type.enum';
import { isNotEmpty, isUndefined, toNumber } from '../../utils/extension';
import useStats from '../../composables/useStats';
import useSearch from '../../composables/useSearch';
import StatsTable from '../Commons/Tables/Stats/StatsTable';
import SelectTierMui from '../Commons/Selects/SelectTierMui';
import { normalizeRaidTier } from '../../utils/raid-tier';

const Tools = (props: IToolsComponent) => {
  const { statsData } = useStats();
  const { searchingToolCurrentData, searchingToolObjectData } = useSearch();
  const searchingToolData = props.isObjective ? searchingToolObjectData : searchingToolCurrentData;
  const [currTier, setCurrTier] = useState(props.tier);

  const [statsPokemon, setStatsPokemon] = useState<StatsRankingPokemonGO>();

  const filterFormList = useCallback(
    (stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[]) =>
      getFormFromForms(
        stats,
        props.id,
        searchingToolData?.form?.form?.formName,
        searchingToolData?.form?.form?.pokemonType
      ),
    [props.id, searchingToolData?.form?.form?.formName, searchingToolData?.form?.form?.pokemonType]
  );

  useEffect(() => {
    const normalizedTier = normalizeRaidTier(
      props.tier,
      searchingToolData?.form?.form?.pokemonType,
      searchingToolData?.pokemon?.pokemonClass
    );
    setCurrTier(normalizedTier);
    if (normalizedTier !== props.tier) {
      props.setTier?.(normalizedTier);
    }
  }, [
    searchingToolData?.form?.form?.formName,
    searchingToolData?.form?.form?.pokemonType,
    props.id,
    props.setTier,
    props.tier,
    searchingToolData?.pokemon?.pokemonClass,
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
        atk: formResult.atk,
        def: formResult.def,
        sta: formResult.sta,
        prod: props.isRaid && props.tier && !props.isHide ? undefined : formResult.prod,
      });
      if (
        searchingToolData?.form?.form &&
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
    searchingToolData?.form?.form,
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
        <div className="tw-mt-2 tw-mb-3">
          <SelectTierMui
            className="tw-text-left"
            tier={currTier}
            setTier={props.setTier}
            setCurrTier={setCurrTier}
            clearData={() => props.onClearStats?.(true)}
            pokemonType={searchingToolData?.form?.form?.pokemonType}
            pokemonClass={searchingToolData?.pokemon?.pokemonClass}
          />
          <StatsTable
            isLoadedForms={!!statsPokemon}
            tier={currTier}
            pokemonType={searchingToolData?.form?.form?.pokemonType}
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
          stats={searchingToolData?.pokemon?.statsGO}
          id={props.id}
          form={searchingToolData?.pokemon?.form}
        />
      )}
    </Fragment>
  );
};

export default Tools;
