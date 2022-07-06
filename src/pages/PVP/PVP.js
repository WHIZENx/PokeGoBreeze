import pokemonData from '../../data/pokemon.json';
import combatData from '../../data/combat.json';

import Type from "../../components/Sprites/Type/Type";
import Stats from '../../components/Info/Stats/Stats';

import './PVP.css';
import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
import { useState, useEffect, Fragment, useRef } from "react";

import { convertNameRankingToOri, splitAndCapitalize, convertArrStats } from '../../util/Utils';
import { calculateStatsByTag, sortStatsPokemon } from '../../util/Calculate';
import { Accordion } from 'react-bootstrap';

import ranking500OverAll from '../../data/pvp/overall/rankings-500.json';
import ranking1500OverAll from '../../data/pvp/overall/rankings-1500.json';
import ranking2500OverAll from '../../data/pvp/overall/rankings-2500.json';
import ranking10000OverAll from '../../data/pvp/overall/rankings-10000.json';

import APIService from '../../services/API.service';
import { findAssetForm } from "../../util/Compute";
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';

const PVP = ({cp}) => {

    const findRanking = (cp, type) => {
        if (cp === 500) return ranking500OverAll;
        else if (cp === 1500) return ranking1500OverAll;
        else if (cp === 2500) return ranking2500OverAll;
        else if (cp === 10000) return ranking10000OverAll;
    }

    const [rankingOverAll, setRankingOverAll] = useState(null);

    const [search, setSearch] = useState('');
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

    useEffect(() => {
        setRankingOverAll(findRanking(cp));
    }, [cp])

    const convertNameRankingToForm = (name) => {
        return rankingOverAll.find(pokemon => pokemon.speciesId === name).speciesName;
    }

    const renderItem = (data, key) => {
        const name = convertNameRankingToOri(data.speciesId, data.speciesName);
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);
        const scores = rankingOverAll.find(pokemon => pokemon.speciesId === data.speciesId).scores;

        let fmoveData = data.moveset[0], cMoveDataPri = data.moveset[1], cMoveDataSec = data.moveset[2];
        if (fmoveData.includes("HIDDEN_POWER")) fmoveData = "HIDDEN_POWER";
        if (cMoveDataPri === "FUTURE_SIGHT") cMoveDataPri = "FUTURESIGHT";
        if (cMoveDataSec === "FUTURE_SIGHT") cMoveDataSec = "FUTURESIGHT";
        let fmove = combatData.find(item => item.name === fmoveData);
        const cmovePri = combatData.find(item => item.name === cMoveDataPri);
        if (cMoveDataSec) var cmoveSec = combatData.find(item => item.name === cMoveDataSec);

        if (data.moveset[0].includes("HIDDEN_POWER")) fmove = {...fmove, type: data.moveset[0].split("_")[2]}

        return (
            <Accordion.Item eventKey={key}>
                <Accordion.Header>
                    <span className="d-inline-block position-relative" style={{width: 50, marginRight: '2rem'}}>
                        {data.speciesName.includes("(Shadow)") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                        <img alt='img-league' className="pokemon-sprite-accordion" src={form ?  APIService.getPokemonModel(form) : APIService.getPokeFullSprite(id)}/>
                    </span>
                    <div className="ranking-group w-100">
                        <b>{splitAndCapitalize(name, "-", " ")}</b>
                        <div style={{marginRight: 15}}>
                            <span className="ranking-score score-ic">{data.score}</span>
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Body className="ranking-body">
                    <div className="w-100 ranking-info element-top">
                        <div className="d-flex flex-flow align-items-center">
                            <h3 style={{marginRight: 15}}><b>#{id} {splitAndCapitalize(name, "-", " ")}</b></h3>
                            <Type block={true} style={{marginBottom: 0}} styled={true} arr={pokemon.types} />
                        </div>
                        <div className="d-flex flex-wrap element-top">
                            <TypeBadge find={true} title="Fast Move" style={{marginRight: 15}} move={fmove}/>
                            <TypeBadge find={true} title="Primary Charge Move" style={{marginRight: 10}} move={cmovePri}/>
                            {data.moveset[2] && <TypeBadge find={true} title="Secondary Charge Move" move={cmoveSec}/>}
                        </div>
                        <hr />
                        <div className="row" style={{margin: 0}}>
                            <div className="col-lg-6 element-top" style={{padding: 0}}>
                                <div className="title-item-ranking">
                                    <h4>Best Matchups</h4>
                                    <div style={{marginRight: 15}}>
                                        <span className="ranking-score score-ic">Rating</span>
                                    </div>
                                </div>
                                {data.matchups.sort((a,b) => b.rating-a.rating).map((matchup, index) => (
                                    <div className="list-item-ranking" key={index}>
                                        {renderItemList(matchup, index)}
                                        <div style={{marginRight: 15}}>
                                            <span className="ranking-score score-ic">{matchup.rating}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="col-lg-6 element-top" style={{padding: 0}}>
                                <div className="title-item-ranking">
                                    <h4>Best Counters</h4>
                                    <div style={{marginRight: 15}}>
                                        <span className="ranking-score score-ic">Rating</span>
                                    </div>
                                </div>
                                {data.counters.sort((a,b) => b.rating-a.rating).map((counter, index) => (
                                    <div className="list-item-ranking" key={index}>
                                        {renderItemList(counter, index)}
                                        <div style={{marginRight: 15}}>
                                            <span className="ranking-score score-ic">{counter.rating}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h4 className="element-top" style={{marginRight: 15}}><b>Overall Stats</b></h4>
                    </div>
                    <div className="row w-100">
                        <div className="col-lg-4 d-flex justify-content-center element-top">
                            <Hexagon animation={0} size={200}
                            stats={{
                                lead: scores[0],
                                atk: scores[4],
                                cons: scores[5],
                                closer: scores[1],
                                charger: scores[3],
                                switching: scores[2]
                            }}/>
                        </div>
                        <div className="col-lg-8 container">
                            <Stats statATK={statsRanking.current.attack.ranking.find(i => i.attack === stats.atk)}
                                statDEF={statsRanking.current.defense.ranking.find(i => i.defense === stats.def)}
                                statSTA={statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta)}
                                pokemonStats={statsRanking.current}/>
                        </div>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        )
    }

    const renderItemList = (data, index) => {
        const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        return (
            <div className="d-flex align-items-center">
                <span className="number-count-ranking">{index+1}</span>
                <span className="d-inline-block position-relative" style={{width: 50, marginRight: '1rem'}}>
                    {data.opponent.includes("_shadow") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                    <img alt='img-league' className="pokemon-sprite-accordion" src={ form ? APIService.getPokemonModel(form) :APIService.getPokeFullSprite(id)}/>
                </span>
                <div>
                    <b>#{id} {splitAndCapitalize(name, "-", " ")}</b>
                    <Type hideText={true} block={true} style={{marginBottom: 0}} styled={true} height={20} arr={pokemon.types} />
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div>
                {rankingOverAll &&
                <Fragment>
                    <div className="input-group border-input element-top">
                        <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                        value={search}
                        onInput={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <Accordion alwaysOpen className="ranking-container">
                            {rankingOverAll
                            .filter(pokemon => splitAndCapitalize(convertNameRankingToOri(pokemon.speciesId, pokemon.speciesName), "-", " ").toLowerCase().includes(search.toLowerCase()))
                            .sort((a,b) => b.score-a.score).slice(0, 2000).map((value, index) => (
                                <Fragment key={index}>
                                    {renderItem(value, index)}
                                </Fragment>
                            ))}
                        </Accordion>
                    </div>
                </Fragment>
                }
            </div>
        </div>
    )
}

export default PVP;