import React, { useEffect, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../utils/calculate';
import { checkRankAllAvailable, getDmgMultiplyBonus } from '../../../utils/utils';

import './Stats.scss';
import { IStatsPokemonGO, StatsPokemonGO, StatsRankPokemonGO } from '../../../core/models/stats.model';
import StatsBar from '../../Sprites/ProgressBar/StatsBar';
import { IStatsComponent } from '../../models/component.model';
import { TypeAction } from '../../../enums/type.enum';
import { toFloatWithPadding, toNumber } from '../../../utils/extension';

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
  const [availableRankGO, setAvailableRankGO] = useState(new StatsRankPokemonGO());

  const [currentStats, setCurrentStats] = useState(new CurrentStats());

  useEffect(() => {
    if (
      props.pokemonStats &&
      props.pokemonStats.attack &&
      props.pokemonStats.defense &&
      props.pokemonStats.stamina &&
      props.pokemonStats.statProd
    ) {
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
      setAvailableRankGO(checkRankAllAvailable(props.pokemonStats, statsPokemonGO));
      setCurrentStats({
        stats: statsPokemonGO,
        atkPercent: (atk * 100) / toNumber(props.pokemonStats.attack.maxStats, 1),
        defPercent: (def * 100) / toNumber(props.pokemonStats.defense.maxStats, 1),
        staPercent: (sta * 100) / toNumber(props.pokemonStats.stamina.maxStats, 1),
        prodPercent: (prod * 100) / toNumber(props.pokemonStats.statProd.maxStats, 1),
      });
    }
  }, [props.stats, props.statATK, props.statDEF, props.statSTA, props.statProd, props.pokemonType, props.pokemonStats]);

  const setStats = (stats: number, type: TypeAction) =>
    Math.round(stats * getDmgMultiplyBonus(props.pokemonType, type));

  return (
    <div className="mt-2 text-black">
      <StatsBar
        tag="ATK"
        class="bg-danger"
        statsPercent={currentStats.atkPercent}
        rank={
          availableRankGO.attackRank ? availableRankGO.attackRank : props.statATK ? props.statATK.rank : 'Unavailable'
        }
        pokemonStatsRank={props.pokemonStats?.attack}
        currentStats={currentStats.stats.atk}
        id={props.id}
        form={props.form}
        statType={TypeAction.Atk}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatsBar
        tag="DEF"
        class="bg-success"
        statsPercent={currentStats.defPercent}
        rank={
          availableRankGO.defenseRank ? availableRankGO.defenseRank : props.statDEF ? props.statDEF.rank : 'Unavailable'
        }
        pokemonStatsRank={props.pokemonStats?.defense}
        currentStats={currentStats.stats.def}
        id={props.id}
        form={props.form}
        statType={TypeAction.Def}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatsBar
        tag="STA"
        class="bg-info"
        statsPercent={currentStats.staPercent}
        rank={
          availableRankGO.staminaRank ? availableRankGO.staminaRank : props.statSTA ? props.statSTA.rank : 'Unavailable'
        }
        pokemonStatsRank={props.pokemonStats?.stamina}
        currentStats={currentStats.stats.sta}
        id={props.id}
        form={props.form}
        statType={TypeAction.Sta}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
      <StatsBar
        tag="Stat Prod"
        class="bg-warning"
        statsPercent={currentStats.prodPercent}
        rank={
          availableRankGO.statProdRank
            ? availableRankGO.statProdRank
            : props.statProd
            ? props.statProd.rank
            : 'Unavailable'
        }
        pokemonStatsRank={props.pokemonStats?.statProd}
        currentStats={currentStats.stats.prod}
        optionalStats={`${toFloatWithPadding(currentStats.stats.prod / Math.pow(10, 6), 2)} MM`}
        id={props.id}
        form={props.form}
        statType={TypeAction.Prod}
        isDisabled={props.isDisabled}
        pokemonType={props.pokemonType}
      />
    </div>
  );
};

export default Stats;
