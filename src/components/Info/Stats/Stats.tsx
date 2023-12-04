import { useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import { checkRankAllAvailable } from '../../../util/Utils';

import './Stats.scss';
import { StatsModel } from '../../../core/models/stats.model';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import { SHADOW_ATK_BONUS, SHADOW_DEF_BONUS } from '../../../util/Constants';

const Stats = (props: {
  isShadow?: boolean;
  pokemonStats: StatsModel;
  stats?: { stats: StatsModel };
  statATK?: {
    attack: number;
    rank: number;
  };
  statDEF?: {
    defense: number;
    rank: number;
  };
  statSTA?: {
    stamina: number;
    rank: number;
  };
  statProd?: {
    prod: number;
    rank: number;
  };
}) => {
  const data = useSelector((state: StoreState) => state.store.data);
  const theme = useTheme();
  const [isAvailable, setIsAvailable]: any = useState({
    attackRank: null,
    defenseRank: null,
    staminaRank: null,
    statProdRank: null,
  });

  const [currentStats, setCurrentStats] = useState({
    stats: {
      atk: 0,
      def: 0,
      sta: 0,
      prod: 0,
    },
    atk: 0,
    def: 0,
    sta: 0,
    prod: 0,
  });

  useEffect(() => {
    const atk = setShadowStats(
      props.stats || props.statATK ? (props.statATK ? props.statATK?.attack : calBaseATK(props.stats?.stats, true)) : 0,
      'atk'
    );
    const def = setShadowStats(
      props.stats || props.statDEF ? (props.statDEF ? props.statDEF?.defense : calBaseDEF(props.stats?.stats, true)) : 0,
      'def'
    );
    const sta = props.stats || props.statSTA ? (props.statSTA ? props.statSTA?.stamina : calBaseSTA(props.stats?.stats, true)) : 0;
    const prod = setShadowStats(
      props.stats || props.statProd
        ? props.statProd
          ? props.statProd.prod
          : calBaseATK(props.stats?.stats, true) * calBaseDEF(props.stats?.stats, true) * calBaseSTA(props.stats?.stats, true)
        : 0
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
      atk: (atk * 100) / props.pokemonStats?.attack.max_stats,
      def: (def * 100) / props.pokemonStats?.defense.max_stats,
      sta: (sta * 100) / props.pokemonStats?.stamina.max_stats,
      prod: (prod * 100) / props.pokemonStats?.statProd.max_stats,
    });
  }, [props.stats, props.statATK, props.statDEF, props.statSTA, props.statProd, props.isShadow]);

  const setShadowStats = (stats: number, type?: string) => {
    if (props.isShadow) {
      return Math.round(
        stats *
          (type === 'atk'
            ? SHADOW_ATK_BONUS(data?.options)
            : type === 'def'
            ? SHADOW_DEF_BONUS(data?.options)
            : SHADOW_ATK_BONUS(data?.options) * SHADOW_DEF_BONUS(data?.options))
      );
    }
    return stats;
  };

  return (
    <div className="element-top" style={{ color: (theme.palette as any).constant.text }}>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>ATK {currentStats.stats.atk}</span>
        </div>
        <div
          className="progress-bar bg-danger"
          style={{
            width: currentStats.atk + '%',
          }}
          role="progressbar"
          aria-valuenow={currentStats.atk}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="box-text rank-text justify-content-end d-flex position-absolute">
          <span>
            Rank: {isAvailable.attackRank ? isAvailable.attackRank : props.statATK ? props.statATK.rank : 'Unavailable'} /{' '}
            {props.pokemonStats?.attack.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>DEF {currentStats.stats.def}</span>
        </div>
        <div
          className="progress-bar bg-success"
          style={{
            width: currentStats.def + '%',
          }}
          role="progressbar"
          aria-valuenow={currentStats.def}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="box-text rank-text justify-content-end d-flex position-absolute">
          <span>
            Rank: {isAvailable.defenseRank ? isAvailable.defenseRank : props.statDEF ? props.statDEF.rank : 'Unavailable'} /{' '}
            {props.pokemonStats?.defense.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>STA {currentStats.stats.sta}</span>
        </div>
        <div
          className="progress-bar bg-info"
          style={{
            width: currentStats.sta + '%',
          }}
          role="progressbar"
          aria-valuenow={currentStats.sta}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="box-text rank-text justify-content-end d-flex position-absolute">
          <span>
            Rank: {isAvailable.staminaRank ? isAvailable.staminaRank : props.statSTA ? props.statSTA.rank : 'Unavailable'} /{' '}
            {props.pokemonStats?.stamina.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>Stat Prod {(currentStats.stats.prod / Math.pow(10, 6)).toFixed(2)} MM</span>
        </div>
        <div
          className="progress-bar bg-warning"
          style={{
            width: currentStats.prod + '%',
          }}
          role="progressbar"
          aria-valuenow={currentStats.prod}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        <div className="box-text rank-text justify-content-end d-flex position-absolute">
          <span>
            Rank: {isAvailable.statProdRank ? isAvailable.statProdRank : props.statProd ? props.statProd.rank : 'Unavailable'} /{' '}
            {props.pokemonStats?.statProd.max_rank}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
