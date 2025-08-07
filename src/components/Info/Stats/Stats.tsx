import React, { useEffect, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../utils/calculate';
import { checkRankAllAvailable, getDmgMultiplyBonus } from '../../../utils/utils';

import './Stats.scss';
import { IStatsPokemonGO, StatsPokemonGO, StatsRankPokemonGO } from '../../../core/models/stats.model';
import { IStatsComponent } from '../../models/component.model';
import { TypeAction } from '../../../enums/type.enum';
import { toFloatWithPadding, toNumber } from '../../../utils/extension';
import useStats from '../../../composables/useStats';
import StatBar from '../../Commons/Progress/StatBar';

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
  const [availableRankGO, setAvailableRankGO] = useState(new StatsRankPokemonGO());

  const [currentStats, setCurrentStats] = useState(new CurrentStats());

  useEffect(() => {
    if (statsData?.attack && statsData?.defense && statsData?.stamina && statsData?.statProd) {
      const atk = setStats(
        props.stats || props.statATK
          ? props.statATK
            ? toNumber(props.statATK.attack)
            : calBaseATK(props.stats, true)
          : 0,
        TypeAction.Atk
      );
      const def = setStats(
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
      const prod = setStats(
        props.stats || props.statProd ? (props.statProd ? toNumber(props.statProd.product) : atk * def * sta) : 0,
        TypeAction.Prod
      );
      const statsPokemonGO = StatsPokemonGO.create(atk, def, sta, prod);
      setAvailableRankGO(checkRankAllAvailable(statsData, statsPokemonGO));
      setCurrentStats({
        stats: statsPokemonGO,
        atkPercent: (atk * 100) / toNumber(statsData.attack.maxStats, 1),
        defPercent: (def * 100) / toNumber(statsData.defense.maxStats, 1),
        staPercent: (sta * 100) / toNumber(statsData.stamina.maxStats, 1),
        prodPercent: (prod * 100) / toNumber(statsData.statProd.maxStats, 1),
      });
    }
  }, [props.stats, props.statATK, props.statDEF, props.statSTA, props.statProd, props.pokemonType, statsData]);

  const setStats = (stats: number, type: TypeAction) =>
    Math.round(stats * getDmgMultiplyBonus(props.pokemonType, type));

  return (
    <div className="tw-mt-2 tw-text-black">
      <StatBar
        tag="ATK"
        color="error"
        statsPercent={currentStats.atkPercent}
        rank={
          availableRankGO.attackRank ? availableRankGO.attackRank : props.statATK ? props.statATK.rank : 'Unavailable'
        }
        pokemonStatsRank={statsData?.attack}
        currentStats={currentStats.stats.atk}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Atk}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="DEF"
        color="success"
        statsPercent={currentStats.defPercent}
        rank={
          availableRankGO.defenseRank ? availableRankGO.defenseRank : props.statDEF ? props.statDEF.rank : 'Unavailable'
        }
        pokemonStatsRank={statsData?.defense}
        currentStats={currentStats.stats.def}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Def}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="STA"
        color="info"
        statsPercent={currentStats.staPercent}
        rank={
          availableRankGO.staminaRank ? availableRankGO.staminaRank : props.statSTA ? props.statSTA.rank : 'Unavailable'
        }
        pokemonStatsRank={statsData?.stamina}
        currentStats={currentStats.stats.sta}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Sta}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatBar
        tag="Stat Prod"
        color="warning"
        statsPercent={currentStats.prodPercent}
        rank={
          availableRankGO.statProdRank
            ? availableRankGO.statProdRank
            : props.statProd
            ? props.statProd.rank
            : 'Unavailable'
        }
        pokemonStatsRank={statsData?.statProd}
        currentStats={currentStats.stats.prod}
        optionalStats={`${toFloatWithPadding(currentStats.stats.prod / Math.pow(10, 6), 2)} MM`}
        id={props.id?.toString()}
        form={props.form}
        statType={TypeAction.Prod}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
    </div>
  );
};

export default Stats;
