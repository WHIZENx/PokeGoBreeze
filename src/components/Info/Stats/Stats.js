import React from 'react';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../Calculate/Calculate';

import './Stats.css';

const Stats = (props) => {

    const filterRank = (type, stats) => {
        const checkRank = props.pokemonStats[type].ranking.find(item => item[type] === stats);
        if (checkRank) return ((props.pokemonStats[type].max_rank - checkRank.rank) * 100) / props.pokemonStats[type].max_rank;
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
                    <span>ATK {props.statATK ? props.statATK.attack : calBaseATK(props.stats)}</span>
                </div>
                {props.statATK ?
                <div className="progress-bar bg-danger" style={{width: calRank("attack", props.statATK.rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statATK.rank*100/props.pokemonStats.attack.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-danger" style={{width: filterRank("attack", calBaseATK(props.stats))+'%'}} role="progressbar" aria-valuenow={filterRank("attack", calBaseATK(props.stats))} aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statATK ? props.statATK.rank : "Unavailable"} / {props.pokemonStats.attack.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>DEF {props.statDEF ? props.statDEF.defense : calBaseDEF(props.stats)}</span>
                </div>
                {props.statDEF ?
                <div className="progress-bar bg-success" style={{width: calRank("defense", props.statDEF.rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statDEF.rank*100/props.pokemonStats.defense.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-success" style={{width: filterRank("defense", calBaseDEF(props.stats))+'%'}} role="progressbar" aria-valuenow={filterRank("defense", calBaseDEF(props.stats))} aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statDEF ? props.statDEF.rank : "Unavailable"} / {props.pokemonStats.defense.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>STA {props.statSTA ? props.statSTA.stamina : calBaseSTA(props.stats)}</span>
                </div>
                {props.statSTA ?
                <div className="progress-bar bg-info" style={{width: calRank("stamina", props.statSTA.rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statSTA.rank*100/props.pokemonStats.stamina.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-info" style={{width: filterRank("stamina", calBaseSTA(props.stats))+'%'}} role="progressbar" aria-valuenow={filterRank("stamina", calBaseSTA(props.stats))} aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statSTA ? props.statSTA.rank : "Unavailable"} / {props.pokemonStats.stamina.max_rank}</span>
                </div>
            </div>
        </div>
    );
}

export default Stats;