import React, { useEffect, useMemo, useRef } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../utils/calculate';
import { checkRankAllAvailable, getDmgMultiplyBonus } from '../../../utils/utils';

import './Stats.scss';
import { IStatsPokemonGO, StatsPokemonGO, StatsRankPokemonGO } from '../../../core/models/stats.model';
import { IStatsComponent } from '../../models/component.model';
import { TypeAction } from '../../../enums/type.enum';
import { toFloatWithPadding, toNumber } from '../../../utils/extension';
import useStats from '../../../composables/useStats';
import StatBar from '../../Commons/Progress/StatBar';
import { pokemonGoBaseStatProduct } from '../../../utils/pokemon-go-stats';

interface ICurrentStats {
  stats: IStatsPokemonGO;
  atkPercent: number;
  defPercent: number;
  staPercent: number;
  prodPercent: number;
}

class CurrentStats implements ICurrentStats {
  stats = new StatsPokemonGO();
  atkPercent = 0;
  defPercent = 0;
  staPercent = 0;
  prodPercent = 0;

  static create(value: ICurrentStats) {
    const obj = new CurrentStats();
    Object.assign(obj, value);
    return obj;
  }
}

const Stats = (props: IStatsComponent) => {
  const { statsData } = useStats();
  const isTheoretical = [props.statATK, props.statDEF, props.statSTA, props.statProd].some(
    (stat) => stat?.source === 'pokeapi-theoretical'
  );

  const computedStats = useMemo(() => {
    if (statsData?.attack && statsData?.defense && statsData?.stamina && statsData?.statProd) {
      const applyStatModifier = (stats: number, type: TypeAction) =>
        Math.round(stats * getDmgMultiplyBonus(props.pokemonType, type));
      const atk = applyStatModifier(
        props.stats || props.statATK
          ? props.statATK
            ? toNumber(props.statATK.attack)
            : calBaseATK(props.stats, true)
          : 0,
        TypeAction.Atk
      );
      const def = applyStatModifier(
        props.stats || props.statDEF
          ? props.statDEF
            ? toNumber(props.statDEF.defense)
            : calBaseDEF(props.stats, true)
          : 0,
        TypeAction.Def
      );
      const sta =
        props.stats || props.statSTA
          ? props.statSTA
            ? toNumber(props.statSTA.stamina)
            : calBaseSTA(props.stats, true)
          : 0;
      const hasComponentStats = Boolean(props.stats || props.statATK || props.statDEF || props.statSTA);
      const prod = hasComponentStats
        ? pokemonGoBaseStatProduct(atk, def, sta)
        : applyStatModifier(props.statProd ? toNumber(props.statProd.product) : 0, TypeAction.Prod);
      const statsPokemonGO = StatsPokemonGO.create(atk, def, sta, prod);
      return {
        availableRankGO: isTheoretical ? new StatsRankPokemonGO() : checkRankAllAvailable(statsData, statsPokemonGO),
        currentStats: CurrentStats.create({
          stats: statsPokemonGO,
          atkPercent: (atk * 100) / toNumber(statsData.attack.maxStats, 1),
          defPercent: (def * 100) / toNumber(statsData.defense.maxStats, 1),
          staPercent: (sta * 100) / toNumber(statsData.stamina.maxStats, 1),
          prodPercent: (prod * 100) / toNumber(statsData.statProd.maxStats, 1),
        }),
        fallbackRanks: {
          atk: props.statATK?.rank ?? 'Unavailable',
          def: props.statDEF?.rank ?? 'Unavailable',
          sta: props.statSTA?.rank ?? 'Unavailable',
          prod: props.statProd?.rank ?? 'Unavailable',
        },
      };
    }
    return {
      availableRankGO: new StatsRankPokemonGO(),
      currentStats: new CurrentStats(),
      fallbackRanks: {
        atk: props.statATK?.rank ?? 'Unavailable',
        def: props.statDEF?.rank ?? 'Unavailable',
        sta: props.statSTA?.rank ?? 'Unavailable',
        prod: props.statProd?.rank ?? 'Unavailable',
      },
    };
  }, [
    props.stats,
    props.statATK,
    props.statDEF,
    props.statSTA,
    props.statProd,
    props.pokemonType,
    statsData,
    isTheoretical,
  ]);
  const lastLoadedStats = useRef(computedStats);

  useEffect(() => {
    if (!props.isLoading) {
      lastLoadedStats.current = computedStats;
    }
  }, [computedStats, props.isLoading]);

  const { availableRankGO, currentStats, fallbackRanks } = props.isLoading ? lastLoadedStats.current : computedStats;

  return (
    <div className="tw-mt-2 tw-text-black" data-testid="pokemon-stats-ranking" aria-busy={props.isLoading}>
      <div className="tw-h-4 tw-text-right tw-text-extra-small tw-text-gray-500 dark:tw-text-gray-400">
        {props.isLoading ? 'Loading stats…' : isTheoretical ? 'Theoretical Pokémon GO stats' : ''}
      </div>
      <StatBar
        tag="ATK"
        color="error"
        statsPercent={currentStats.atkPercent}
        rank={availableRankGO.attackRank ?? fallbackRanks.atk}
        pokemonStatsRank={statsData?.attack}
        currentStats={currentStats.stats.atk}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Atk}
        isDisabled={props.isDisabled || isTheoretical}
        isLoading={props.isLoading}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="DEF"
        color="success"
        statsPercent={currentStats.defPercent}
        rank={availableRankGO.defenseRank ?? fallbackRanks.def}
        pokemonStatsRank={statsData?.defense}
        currentStats={currentStats.stats.def}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Def}
        isDisabled={props.isDisabled || isTheoretical}
        isLoading={props.isLoading}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="STA"
        color="info"
        statsPercent={currentStats.staPercent}
        rank={availableRankGO.staminaRank ?? fallbackRanks.sta}
        pokemonStatsRank={statsData?.stamina}
        currentStats={currentStats.stats.sta}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Sta}
        isDisabled={props.isDisabled || isTheoretical}
        isLoading={props.isLoading}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="Stat Prod"
        color="warning"
        statsPercent={currentStats.prodPercent}
        rank={availableRankGO.statProdRank ?? fallbackRanks.prod}
        pokemonStatsRank={statsData?.statProd}
        currentStats={currentStats.stats.prod}
        optionalStats={`${toFloatWithPadding(currentStats.stats.prod / Math.pow(10, 6), 2)} MM`}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Prod}
        isDisabled={props.isDisabled || isTheoretical}
        isLoading={props.isLoading}
        pokemonType={props.pokemonType}
      />
    </div>
  );
};

export default Stats;
