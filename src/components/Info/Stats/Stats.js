import React from 'react';

import './Stats.css';

const Stats = (props) => {

    return (
        <div className='element-top'>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>ATK {props.statATK ? props.statATK.attack : "Unavailable"}</span>
                </div>
                {props.statATK ?
                <div className="progress-bar bg-danger" style={{width: 100-(props.statATK.rank*100/props.pokemonStats.attack.max_rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statATK.rank*100/props.pokemonStats.attack.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-danger" style={{width: '0%'}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statATK ? props.statATK.rank : "Unavailable"} / {props.pokemonStats.attack.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>DEF {props.statDEF ? props.statDEF.defense : "Unavailable"}</span>
                </div>
                {props.statDEF ?
                <div className="progress-bar bg-success" style={{width: 100-(props.statDEF.rank*100/props.pokemonStats.defense.max_rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statDEF.rank*100/props.pokemonStats.defense.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-success" style={{width: '0%'}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statDEF ? props.statDEF.rank : "Unavailable"} / {props.pokemonStats.defense.max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>STA {props.statSTA ? props.statSTA.stamina : "Unavailable"}</span>
                </div>
                {props.statSTA ?
                <div className="progress-bar bg-info" style={{width: 100-(props.statSTA.rank*100/props.pokemonStats.stamina.max_rank)+'%'}} role="progressbar" aria-valuenow={100-(props.statSTA.rank*100/props.pokemonStats.stamina.max_rank)} aria-valuemin="0" aria-valuemax="100"></div>
                : <div className="progress-bar bg-info" style={{width: '0%'}} role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                }
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statSTA ? props.statSTA.rank : "Unavailable"} / {props.pokemonStats.stamina.max_rank}</span>
                </div>
            </div>
        </div>
    );
}

export default Stats;