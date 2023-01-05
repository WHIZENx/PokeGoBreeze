import React, { useEffect, useRef, useState } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import { checkRankAllAvailable } from '../../../util/Utils';

import './Stats.css';

const Stats = (props: {
  pokemonStats: {
    [x: string]: {
      max_stats: number;
      max_rank: number;
      ranking: any[];
    };
  };
  stats?: { stats: any };
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
}) => {
  const isAvailable: any = useRef(
    checkRankAllAvailable(props.pokemonStats, {
      atk: props.stats || props.statATK ? (props.statATK ? props.statATK.rank : calBaseATK(props.stats?.stats, true)) : -1,
      def: props.stats || props.statDEF ? (props.statDEF ? props.statDEF.rank : calBaseDEF(props.stats?.stats, true)) : -1,
      sta: props.stats || props.statSTA ? (props.statSTA ? props.statSTA.rank : calBaseSTA(props.stats?.stats, true)) : -1,
    })
  );

  const [currentStats, setCurrentStats] = useState({
    atk: 0,
    def: 0,
    sta: 0,
  });

  useEffect(() => {
    setCurrentStats({
      atk:
        props.stats || props.statATK
          ? props.statATK
            ? (props.statATK.attack * 100) / props.pokemonStats.attack.max_stats
            : calBaseATK(props.stats?.stats, true)
          : 0,
      def:
        props.stats || props.statDEF
          ? props.statDEF
            ? (props.statDEF.defense * 100) / props.pokemonStats.defense.max_stats
            : calBaseDEF(props.stats?.stats, true)
          : 0,
      sta:
        props.stats || props.statSTA
          ? props.statSTA
            ? (props.statSTA.stamina * 100) / props.pokemonStats.stamina.max_stats
            : calBaseSTA(props.stats?.stats, true)
          : 0,
    });
  }, [props.stats, props.statATK, props.statDEF, props.statSTA]);

  return (
    <div className="element-top">
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
            Rank: {props.statATK ? props.statATK.rank : isAvailable.current.attackRank ? isAvailable.current.attackRank : 'Unavailable'} /{' '}
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
            Rank: {props.statDEF ? props.statDEF.rank : isAvailable.current.defenseRank ? isAvailable.current.defenseRank : 'Unavailable'} /{' '}
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
            Rank: {props.statSTA ? props.statSTA.rank : isAvailable.current.staminaRank ? isAvailable.current.staminaRank : 'Unavailable'} /{' '}
            {props.pokemonStats.stamina.max_rank}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Stats;
