import { useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/calculate';
import { checkRankAllAvailable, getDmgMultiplyBonus } from '../../../util/utils';

import './Stats.scss';
import { IStatsPokemonGO, StatsPokemonGO, StatsRankPokemonGO } from '../../../core/models/stats.model';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import StatsBar from '../../Sprites/ProgressBar/StatsBar';
import { IStatsComponent } from '../../models/component.model';
import { TypeAction } from '../../../enums/type.enum';
import { ThemeModify } from '../../../util/models/overrides/themes.model';
import { toFloatWithPadding, toNumber } from '../../../util/extension';

interface ICurrentStats {
  stats: IStatsPokemonGO;
  atk: number;
  def: number;
  sta: number;
  prod: number;
}

class CurrentStats implements ICurrentStats {
  stats = new StatsPokemonGO();
  atk = 0;
  def = 0;
  sta = 0;
  prod = 0;

  static create(value: ICurrentStats) {
    const obj = new CurrentStats();
    Object.assign(obj, value);
    return obj;
  }
}

const Stats = (props: IStatsComponent) => {
  const data = useSelector((state: StoreState) => state.store.data);
  const theme: ThemeModify = useTheme();
  const [isAvailable, setIsAvailable] = useState(new StatsRankPokemonGO());

  const [currentStats, setCurrentStats] = useState(new CurrentStats());

  useEffect(() => {
    const atk = setStats(
      props.stats || props.statATK ? (props.statATK ? props.statATK.attack : calBaseATK(props.stats, true)) : 0,
      TypeAction.Atk
    );
    const def = setStats(
      props.stats || props.statDEF ? (props.statDEF ? props.statDEF.defense : calBaseDEF(props.stats, true)) : 0,
      TypeAction.Def
    );
    const sta = props.stats || props.statSTA ? (props.statSTA ? props.statSTA.stamina : calBaseSTA(props.stats, true)) : 0;
    const prod = setStats(
      props.stats || props.statProd
        ? props.statProd
          ? props.statProd.product
          : calBaseATK(props.stats, true) * calBaseDEF(props.stats, true) * calBaseSTA(props.stats, true)
        : 0,
      TypeAction.Prod
    );
    setIsAvailable(
      checkRankAllAvailable(props.pokemonStats, {
        atk,
        def,
        sta,
        prod,
      })
    );
    setCurrentStats({
      stats: {
        atk,
        def,
        sta,
        prod,
      },
      atk: (atk * 100) / toNumber(props.pokemonStats?.attack.maxStats, 1),
      def: (def * 100) / toNumber(props.pokemonStats?.defense.maxStats, 1),
      sta: (sta * 100) / toNumber(props.pokemonStats?.stamina.maxStats, 1),
      prod: (prod * 100) / toNumber(props.pokemonStats?.statProd.maxStats, 1),
    });
  }, [props.stats, props.statATK, props.statDEF, props.statSTA, props.statProd, props.pokemonType]);

  const setStats = (stats: number, type: TypeAction) => Math.round(stats * getDmgMultiplyBonus(props.pokemonType, data.options, type));

  return (
    <div className="element-top" style={{ color: theme.palette.constant.text }}>
      <StatsBar
        tag="ATK"
        class="bg-danger"
        statsPercent={currentStats.atk}
        rank={isAvailable.attackRank ? isAvailable.attackRank : props.statATK ? props.statATK.rank : 'Unavailable'}
        pokemonStatsRank={props.pokemonStats?.attack}
        currentStats={currentStats.stats.atk}
        id={props.id}
        form={props.form}
        statType={TypeAction.Atk}
        isDisabled={props.isDisabled}
      />
      <StatsBar
        tag="DEF"
        class="bg-success"
        statsPercent={currentStats.def}
        rank={isAvailable.defenseRank ? isAvailable.defenseRank : props.statDEF ? props.statDEF.rank : 'Unavailable'}
        pokemonStatsRank={props.pokemonStats?.defense}
        currentStats={currentStats.stats.def}
        id={props.id}
        form={props.form}
        statType={TypeAction.Def}
        isDisabled={props.isDisabled}
      />
      <StatsBar
        tag="STA"
        class="bg-info"
        statsPercent={currentStats.sta}
        rank={isAvailable.staminaRank ? isAvailable.staminaRank : props.statSTA ? props.statSTA.rank : 'Unavailable'}
        pokemonStatsRank={props.pokemonStats?.stamina}
        currentStats={currentStats.stats.sta}
        id={props.id}
        form={props.form}
        statType={TypeAction.Sta}
        isDisabled={props.isDisabled}
      />
      <StatsBar
        tag="Stat Prod"
        class="bg-warning"
        statsPercent={currentStats.prod}
        rank={isAvailable.statProdRank ? isAvailable.statProdRank : props.statProd ? props.statProd.rank : 'Unavailable'}
        pokemonStatsRank={props.pokemonStats?.statProd}
        currentStats={currentStats.stats.prod}
        optionalStats={`${toFloatWithPadding(currentStats.stats.prod / Math.pow(10, 6), 2)} MM`}
        id={props.id}
        form={props.form}
        statType={TypeAction.Prod}
        isDisabled={props.isDisabled}
      />
    </div>
  );
};

export default Stats;
