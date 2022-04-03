import React from 'react';

import './Stats.css';

const Stats = (props) => {

    return (
        <div className='element-top'>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>ATK {props.statATK.attack}</span>
                </div>
                <div className="progress-bar bg-danger" style={{width: 100-(props.statATK.rank*100/props.attack_max_rank)+'%'}} role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statATK.rank} / {props.attack_max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>DEF {props.statDEF.defense}</span>
                </div>
                <div className="progress-bar bg-success" style={{width: 100-(props.statDEF.rank*100/props.defense_max_rank)+'%'}} role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statDEF.rank} / {props.defense_max_rank}</span>
                </div>
            </div>
            <div className="progress position-relative">
                <div className="box-text stats-text justify-content-start d-flex position-absolute w-100">
                    <span>STA {props.statSTA.stamina}</span>
                </div>
                <div className="progress-bar bg-info" style={{width: 100-(props.statSTA.rank*100/props.stamina_max_rank)+'%'}} role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>Rank: {props.statSTA.rank} / {props.stamina_max_rank}</span>
                </div>
            </div>
        </div>
    );
}

export default Stats;