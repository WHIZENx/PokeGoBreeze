import React, { useRef } from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';

import './Stats.css';

const Stats = (props) => {

    const isAvailable = useRef({attack: {bool: false, rank: null}, defense: {bool: false, rank: null}, stamina: {bool: false, rank: null}});

    const filterRank = (type, stats) => {
        const checkRank = props.pokemonStats[type].ranking.find(item => item[type] === stats);
        if (checkRank) {
            isAvailable.current[type].bool = true;
            isAvailable.current[type].rank = checkRank.rank;
            return ((props.pokemonStats[type].max_rank-checkRank.rank+1) * 100) / props.pokemonStats[type].max_rank;
        }
        let avgRank = props.pokemonStats[type].max_rank - props.pokemonStats[type].ranking.find(item => item[type] > stats).rank;
        if (avgRank < 1) avgRank = 1;
        const ratioRank = (avgRank * 100) / props.pokemonStats[type].max_rank;
        if (ratioRank > 100) return 100;
        return ratioRank;
    }

    const calRank = (type, rank) => {
        return (props.pokemonStats[type].max_rank-rank+1)*100/props.pokemonStats[type].max_rank
    }

    return (
        <div className='element-top'>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>ATK {props.stats || props.statATK ? props.statATK ? props.statATK.attack : calBaseATK(props.stats.stats, true) : 0}</span>
                </div>
                {props.stats || props.statATK ?
                props.statATK ?
                <div className="progress-bar bg-danger" style={{width: calRank("attack", props.statATK.rank)+'%'}} role="progressbar" aria-valuenow={calRank("attack", props.statATK.rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-danger" style={{width: filterRank("attack", calBaseATK(props.stats.stats, true))+'%'}} role="progressbar" aria-valuenow={filterRank("attack", calBaseATK(props.stats.stats, true))} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-danger" style={{width: 0}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statATK ? props.statATK.rank : isAvailable.current["attack"].bool ? isAvailable.current["attack"].rank : "Unavailable"} / {props.pokemonStats.attack.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>DEF {props.stats || props.statDEF ? props.statDEF ? props.statDEF.defense : calBaseDEF(props.stats.stats, true) : 0}</span>
                </div>
                {props.stats || props.statDEF ?
                props.statDEF ?
                <div className="progress-bar bg-success" style={{width: calRank("defense", props.statDEF.rank)+'%'}} role="progressbar" aria-valuenow={calRank("defense", props.statDEF.rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-success" style={{width: filterRank("defense", calBaseDEF(props.stats.stats, true))+'%'}} role="progressbar" aria-valuenow={filterRank("defense", calBaseDEF(props.stats.stats, true))} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-success" style={{width: 0}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statDEF ? props.statDEF.rank : isAvailable.current["defense"].bool ? isAvailable.current["defense"].rank : "Unavailable"} / {props.pokemonStats.defense.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>STA {props.stats || props.statSTA ? props.statSTA ? props.statSTA.stamina : calBaseSTA(props.stats.stats, true) : 0}</span>
                </div>
                {props.stats || props.statSTA ?
                props.statSTA ?
                <div className="progress-bar bg-info" style={{width: calRank("stamina", props.statSTA.rank)+'%'}} role="progressbar" aria-valuenow={calRank("stamina", props.statSTA.rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-info" style={{width: filterRank("stamina", calBaseSTA(props.stats.stats, true))+'%'}} role="progressbar" aria-valuenow={filterRank("stamina", calBaseSTA(props.stats.stats, true))} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-info" style={{width: 0}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statSTA ? props.statSTA.rank : isAvailable.current["stamina"].bool ? isAvailable.current["stamina"].rank : "Unavailable"} / {props.pokemonStats.stamina.max_rank}</span>
                </div>
            </div>
        </div>
    );
}

export default Stats;