import { useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import { checkRankAllAvailable } from '../../../util/Utils';

import './Stats.scss';
import { StatsModel } from '../../../core/models/stats.model';

const Stats = (props: {
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
  const theme = useTheme();
  const [isAvailable, setIsAvailable]: any = useState({
    attackRank: null,
    defenseRank: null,
    staminaRank: null,
    statProdRank: null,
  });

  const [currentStats, setCurrentStats] = useState({
    atk: 0,
    def: 0,
    sta: 0,
    prod: 0,
  });

  useEffect(() => {
    setIsAvailable(
      checkRankAllAvailable(props.pokemonStats, {
        atk: props.stats || props.statATK ? (props.statATK ? props.statATK.attack : calBaseATK(props.stats?.stats, true)) : 0,
        def: props.stats || props.statDEF ? (props.statDEF ? props.statDEF.defense : calBaseDEF(props.stats?.stats, true)) : 0,
        sta: props.stats || props.statSTA ? (props.statSTA ? props.statSTA.stamina : calBaseSTA(props.stats?.stats, true)) : 0,
        prod:
          props.stats || props.statProd
            ? props.statProd
              ? props.statProd.prod
              : calBaseATK(props.stats?.stats, true) * calBaseDEF(props.stats?.stats, true) * calBaseSTA(props.stats?.stats, true)
            : 0,
      })
    );
    setCurrentStats({
      atk:
        props.stats || props.statATK
          ? props.statATK
            ? (props.statATK.attack * 100) / props.pokemonStats.attack.max_stats
            : (calBaseATK(props.stats?.stats, true) * 100) / props.pokemonStats.attack.max_stats
          : 0,
      def:
        props.stats || props.statDEF
          ? props.statDEF
            ? (props.statDEF.defense * 100) / props.pokemonStats.defense.max_stats
            : (calBaseDEF(props.stats?.stats, true) * 100) / props.pokemonStats.defense.max_stats
          : 0,
      sta:
        props.stats || props.statSTA
          ? props.statSTA
            ? (props.statSTA.stamina * 100) / props.pokemonStats.stamina.max_stats
            : (calBaseSTA(props.stats?.stats, true) * 100) / props.pokemonStats.stamina.max_stats
          : 0,
      prod:
        props.stats || props.statProd
          ? props.statProd
            ? (props.statProd.prod * 100) / props.pokemonStats.statProd.max_stats
            : (calBaseATK(props.stats?.stats, true) * calBaseDEF(props.stats?.stats, true) * calBaseSTA(props.stats?.stats, true) * 100) /
              props.pokemonStats.statProd.max_stats
          : 0,
    });
  }, [props.stats, props.statATK, props.statDEF, props.statSTA, props.statProd]);

  return (
    <div className="element-top" style={{ color: (theme.palette as any).constant.text }}>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>
            ATK {props.stats || props.statATK ? (props.statATK ? props.statATK.attack : calBaseATK(props.stats?.stats, true)) : 0}
          </span>
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
            Rank: {props.statATK ? props.statATK.rank : isAvailable.attackRank ? isAvailable.attackRank : 'Unavailable'} /{' '}
            {props.pokemonStats.attack.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>
            DEF {props.stats || props.statDEF ? (props.statDEF ? props.statDEF.defense : calBaseDEF(props.stats?.stats, true)) : 0}
          </span>
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
            Rank: {props.statDEF ? props.statDEF.rank : isAvailable.defenseRank ? isAvailable.defenseRank : 'Unavailable'} /{' '}
            {props.pokemonStats.defense.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>
            STA {props.stats || props.statSTA ? (props.statSTA ? props.statSTA.stamina : calBaseSTA(props.stats?.stats, true)) : 0}
          </span>
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
            Rank: {props.statSTA ? props.statSTA.rank : isAvailable.staminaRank ? isAvailable.staminaRank : 'Unavailable'} /{' '}
            {props.pokemonStats.stamina.max_rank}
          </span>
        </div>
      </div>
      <div className="progress position-relative">
        <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
          <span>
            Stat Prod{' '}
            {(
              (props.stats || props.statProd
                ? props.statProd
                  ? props.statProd.prod
                  : calBaseATK(props.stats?.stats, true) * calBaseDEF(props.stats?.stats, true) * calBaseSTA(props.stats?.stats, true)
                : 0) / Math.pow(10, 6)
            ).toFixed(2)}{' '}
            MM
          </span>
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
            Rank: {props.statProd ? props.statProd.rank : isAvailable.statProdRank ? isAvailable.statProdRank : 'Unavailable'} /{' '}
            {props.pokemonStats.statProd.max_rank}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
