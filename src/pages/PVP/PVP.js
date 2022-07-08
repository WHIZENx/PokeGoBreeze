import pokemonData from '../../data/pokemon.json';
import combatData from '../../data/combat.json';
import combatPokemonData from '../../data/combat_pokemon_go_list.json';

import Type from "../../components/Sprites/Type/Type";
import Stats from '../../components/Info/Stats/Stats';

import './PVP.css';
import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
import { useState, useEffect, Fragment, useRef } from "react";

import { convertNameRankingToOri, splitAndCapitalize, convertArrStats, convertName } from '../../util/Utils';
import { calculateStatsByTag, calStatsProd, calculateCP, sortStatsPokemon } from '../../util/Calculate';
import { Accordion } from 'react-bootstrap';

import APIService from '../../services/API.service';
import { computeBgColor, computeColor, findAssetForm } from "../../util/Compute";
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';

import update from 'immutability-helper';
import { Link, useParams } from 'react-router-dom';
import IVbar from '../../components/Sprites/IVBar/IVBar';
import TypeEffectiveSelect from '../../components/Effective/TypeEffectiveSelect';

const PVP = () => {

    const params = useParams();

    const [rankingData, setRankingData] = useState(null);
    const [countRank, setCountRank] = useState(null);
    const [storeStats, setStoreStats] = useState(null);

    const [search, setSearch] = useState('');
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

    useEffect(() => {
        const fetchMyAPI = async () => {
            const file = (await APIService.getFetchUrl(APIService.getRankingFile(parseInt(params.cp), params.type))).data;
            setRankingData(file);
            setCountRank(file.map(i => false));
            setStoreStats(file.map(i => null))
        }
        fetchMyAPI();
    }, [params.cp, params.type]);

    const convertNameRankingToForm = (name) => {
        return rankingData.find(pokemon => pokemon.speciesId === name).speciesName;
    }

    const calculateStatsTopRank = (key, stats) => {
        setCountRank(update(countRank, {[key]: {$set: true}}));
        const store = storeStats[key];
        if (!store) {
            const maxCP = parseInt(params.cp);

            if (maxCP === 10000) {
                const cp = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 50);
                const buddyCP = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 51);
                setStoreStats(update(storeStats, {[key]: {$set: {
                    "50": {cp: cp},
                    "51": {cp: buddyCP},
                }}}));
            } else {
                const minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
                const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, maxCP);
                setStoreStats(update(storeStats, {[key]: {$set: allStats[allStats.length-1]}}));
            }
        }
    }

    const findMove = (name, uses, combatList) => {
        const oldName = name;
        if (name.includes("HIDDEN_POWER")) name = "HIDDEN_POWER";
        let move = combatData.find(move => move.name === name);
        if (oldName.includes("HIDDEN_POWER")) move = {...move, type: oldName.split("_")[2]};

        let elite = false;
        if (combatList.ELITE_QUICK_MOVES.includes(name)) elite = true;
        if (combatList.ELITE_CINEMATIC_MOVES.includes(name)) elite = true;

        return (
            <div className={(move.type.toLowerCase())+' type-rank-item d-flex align-items-center justify-content-between'}>
                <div>
                    <img style={{marginRight: 15}} className="filter-shadow" width={24} height={24} alt='img-pokemon' src={APIService.getTypeSprite(move.type)}/>
                    <span className='filter-shadow'>{splitAndCapitalize(oldName, "_", " ")} {elite && <b className="filter-shadow">*</b>}</span>
                </div>
                <div>
                    <span className="ranking-score score-ic filter-shadow">{uses}</span>
                </div>
            </div>
        )
    }

    const renderItem = (data, key) => {
        const name = convertNameRankingToOri(data.speciesId, data.speciesName);
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);
        const scores = rankingData.find(pokemon => pokemon.speciesId === data.speciesId).scores;

        let fmoveData = data.moveset[0], cMoveDataPri = data.moveset[1], cMoveDataSec = data.moveset[2];
        if (fmoveData.includes("HIDDEN_POWER")) fmoveData = "HIDDEN_POWER";
        if (cMoveDataPri === "FUTURE_SIGHT") cMoveDataPri = "FUTURESIGHT";
        if (cMoveDataSec === "FUTURE_SIGHT") cMoveDataSec = "FUTURESIGHT";
        if (cMoveDataPri === "TECHNO_BLAST_DOUSE") cMoveDataPri = "TECHNO_BLAST_WATER";
        if (cMoveDataSec === "TECHNO_BLAST_DOUSE") cMoveDataSec = "TECHNO_BLAST_WATER";

        let fmove = combatData.find(item => item.name === fmoveData);
        const cmovePri = combatData.find(item => item.name === cMoveDataPri);
        if (cMoveDataSec) var cmoveSec = combatData.find(item => item.name === cMoveDataSec);

        if (data.moveset[0].includes("HIDDEN_POWER")) fmove = {...fmove, type: data.moveset[0].split("_")[2]}

        let combatPoke = combatPokemonData.filter(item => item.ID === pokemon.num
            && item.BASE_SPECIES === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
        );
        const result = combatPoke.find(item => item.NAME === convertName(pokemon.name));
        if (!result) combatPoke = combatPoke[0]
        else combatPoke = result;

        return (
            <Accordion.Item eventKey={key}>
                <Accordion.Header onClick={() => {
                if (countRank[key]) setTimeout(() => {setCountRank(update(countRank, {[key]: {$set: false}}))}, 500)
                else calculateStatsTopRank(key, stats)
                }}>
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
                    {countRank[key] && storeStats[key] &&
                    <Fragment>
                    <div className="w-100 ranking-info element-top">
                        <div className="d-flex flex-wrap align-items-center">
                            <h3 style={{marginRight: 15}}><b>#{id} {splitAndCapitalize(name, "-", " ")}</b></h3>
                            <Type block={true} style={{marginBottom: 0}} styled={true} arr={pokemon.types} />
                        </div>
                        <div className="d-flex flex-wrap element-top">
                            <TypeBadge find={true} title="Fast Move" style={{marginRight: 15}} move={fmove}
                            elite={combatPoke.ELITE_QUICK_MOVES.includes(fmove.name)}/>
                            <TypeBadge find={true} title="Primary Charged Move" style={{marginRight: 10}} move={cmovePri}
                            elite={combatPoke.ELITE_CINEMATIC_MOVES.includes(cmovePri.name)}
                            shadow={combatPoke.SHADOW_MOVES.includes(cmovePri.name)}
                            purified={combatPoke.PURIFIED_MOVES.includes(cmovePri.name)}/>
                            {cMoveDataSec && <TypeBadge find={true} title="Secondary Charged Move" move={cmoveSec}
                            elite={combatPoke.ELITE_CINEMATIC_MOVES.includes(cmoveSec.name)}
                            shadow={combatPoke.SHADOW_MOVES.includes(cmoveSec.name)}
                            purified={combatPoke.PURIFIED_MOVES.includes(cmoveSec.name)}/>}
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
                                {data.counters.sort((a,b) => a.rating-b.rating).map((counter, index) => (
                                    <div className="list-item-ranking" key={index}>
                                        {renderItemList(counter, index)}
                                        <div style={{marginRight: 15}}>
                                            <span className="ranking-score score-ic">{counter.rating}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className='container'>
                        <hr />
                    </div>
                    {scores ?
                    <div className="row w-100" style={{margin: 0}}>
                        <div className="col-lg-4 d-flex justify-content-center element-top">
                            <div>
                                <h5><b>Overall Performance</b></h5>
                                <Hexagon animation={0} borderSize={340} size={200}
                                stats={{
                                    lead: scores[0],
                                    atk: scores[4],
                                    cons: scores[5],
                                    closer: scores[1],
                                    charger: scores[3],
                                    switching: scores[2]
                                }}/>
                            </div>
                        </div>
                        <div className="col-lg-8 container status-ranking element-top">
                            <div>
                                <h5><b>Overall Stats</b></h5>
                                <Stats statATK={statsRanking.current.attack.ranking.find(i => i.attack === stats.atk)}
                                    statDEF={statsRanking.current.defense.ranking.find(i => i.defense === stats.def)}
                                    statSTA={statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta)}
                                    pokemonStats={statsRanking.current}/>
                            </div>
                            <div>
                                <h5><b>Top Rank League</b></h5>
                                {renderTopStats(stats, key, id)}
                            </div>
                        </div>
                    </div>
                    :
                    <div className="w-100 container status-ranking element-top">
                        <div>
                            <h5><b>Overall Stats</b></h5>
                            <Stats statATK={statsRanking.current.attack.ranking.find(i => i.attack === stats.atk)}
                                statDEF={statsRanking.current.defense.ranking.find(i => i.defense === stats.def)}
                                statSTA={statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta)}
                                pokemonStats={statsRanking.current}/>
                        </div>
                        <div>
                            <h5 className='element-top'><b>Top Rank League</b></h5>
                            {renderTopStats(stats, key, id)}
                        </div>
                    </div>
                    }
                    <div className='container'>
                        <hr />
                        <div className='row'>
                            <div className='col-lg-4' style={{marginBottom: 15}}>
                                <div className='h-100'>
                                    <h6 className='d-flex justify-content-center weakness-bg-text'><b>Weakness</b></h6>
                                    <hr className='w-100'/>
                                    {<TypeEffectiveSelect effect={0} types={pokemon.types}/>}
                                </div>
                                <hr className='w-100' style={{margin: 0}}/>
                            </div>
                            <div className='col-lg-4' style={{marginBottom: 15}}>
                                <div className='h-100'>
                                    <h6 className='d-flex justify-content-center neutral-bg-text'><b>Neutral</b></h6>
                                    <hr className='w-100'/>
                                    {<TypeEffectiveSelect effect={1} types={pokemon.types}/>}
                                </div>
                                <hr className='w-100' style={{margin: 0}}/>
                            </div>
                            <div className='col-lg-4' style={{marginBottom: 15}}>
                                <div className='h-100'>
                                    <h6 className='d-flex justify-content-center resistance-bg-text'><b>Resistance</b></h6>
                                    <hr className='w-100'/>
                                    {<TypeEffectiveSelect effect={2} types={pokemon.types}/>}
                                </div>
                                <hr className='w-100' style={{margin: 0}}/>
                            </div>
                        </div>
                    </div>
                    <div className='container'>
                        <div className='row' style={{margin: 0}}>
                            <div className='col-xl-6' style={{padding: 0, backgroundColor: 'lightgray'}}>
                                <div className='moves-title'>Fast Moves</div>
                                <div className='type-rank-list'>
                                    {data.moves.fastMoves.map(move => {
                                        if (!move.uses) move.uses = 0;
                                        return move;
                                    }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                                        <Fragment key={index}>{findMove(value.moveId, value.uses, combatPoke)}</Fragment>
                                    ))}
                                </div>
                            </div>
                            <div className='col-xl-6' style={{padding: 0, backgroundColor: 'lightgray'}}>
                                <div className='moves-title'>Charged Moves</div>
                                <div className='type-rank-list'>
                                    {data.moves.chargedMoves.map(move => {
                                        if (move.moveId === "FUTURE_SIGHT") move.moveId = "FUTURESIGHT";
                                        if (move.moveId === "TECHNO_BLAST_DOUSE") move.moveId = "TECHNO_BLAST_WATER";
                                        if (!move.uses) move.uses = 0;
                                        return move;
                                    }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                                        <Fragment key={index}>{findMove(value.moveId, value.uses, combatPoke)}</Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </Fragment>
                    }
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
                <Link to={`/pvp/${params.cp}/${params.type}/${name}`} target="_blank" className="d-inline-block position-relative" style={{width: 50, marginRight: '1rem'}}>
                    {data.opponent.includes("_shadow") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                    <img alt='img-league' className="pokemon-sprite-accordion" src={ form ? APIService.getPokemonModel(form) :APIService.getPokeFullSprite(id)}/>
                </Link>
                <div>
                    <b>#{id} {splitAndCapitalize(name, "-", " ")}</b>
                    <Type hideText={true} block={true} style={{marginBottom: 0}} styled={true} height={20} arr={pokemon.types} />
                </div>
            </div>
        )
    }

    const renderTopStats = (stats, key, id) => {
        const maxCP = parseInt(params.cp);
        const currStats = storeStats[key];
        return (
            <ul className='element-top'>
                <li className='element-top'>
                    CP: <b>{maxCP === 10000 ? `${currStats["50"].cp}-${currStats["51"].cp}` : `${currStats.CP}`}</b>
                </li>
                <li className={currStats.level <= 40 ? 'element-top' : ''}>
                    Level: <b>{maxCP === 10000 ? "50-51" : `${currStats.level}`} </b>
                    {(currStats.level > 40 || maxCP === 10000) &&
                    <b>
                    (Need XL Candy
                        <div className="position-relative d-inline-block filter-shadow">
                            <div className="bg-poke-xl-candy" style={{background: computeBgColor(id), width: 30, height: 30}}></div>
                            <div className="poke-xl-candy" style={{background: computeColor(id), width: 30, height: 30}}></div>
                        </div>
                    )</b>
                    }
                </li>
                <li className='element-top'>
                    <IVbar title="Attack" iv={maxCP === 10000 ? 15 : currStats.IV.atk} style={{maxWidth: 500}}/>
                    <IVbar title="Defense" iv={maxCP === 10000 ? 15 : currStats.IV.def} style={{maxWidth: 500}}/>
                    <IVbar title="HP" iv={maxCP === 10000 ? 15 : currStats.IV.sta} style={{maxWidth: 500}}/>
                </li>
            </ul>
        )
    }

    return (
        <div className="container">
            <div className='element-top ranking-link-group'>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'overall' ? " active" : "")} href={`pvp/${params.cp}/overall`}>Overall</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'leads' ? " active" : "")} href={`pvp/${params.cp}/leads`}>Leads</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'closers' ? " active" : "")} href={`pvp/${params.cp}/closers`}>Closers</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'switches' ? " active" : "")} href={`pvp/${params.cp}/switches`}>Switches</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'chargers' ? " active" : "")} href={`pvp/${params.cp}/chargers`}>Chargers</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'attackers' ? " active" : "")} href={`pvp/${params.cp}/attackers`}>Attackers</a>
                <a type='button' className={'btn btn-primary'+(params.type.toLowerCase() === 'consistency' ? " active" : "")} href={`pvp/${params.cp}/consistency`}>Consistency</a>
            </div>
            <div className="input-group border-input">
                <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                value={search}
                onInput={e => setSearch(e.target.value)}
                />
            </div>
            {rankingData && countRank && storeStats &&
                <div>
                    <Accordion alwaysOpen className="ranking-container">
                        {rankingData
                        .filter(pokemon => splitAndCapitalize(convertNameRankingToOri(pokemon.speciesId, pokemon.speciesName), "-", " ").toLowerCase().includes(search.toLowerCase()))
                        .sort((a,b) => b.score-a.score).map((value, index) => (
                            <Fragment key={index}>
                                {renderItem(value, index)}
                            </Fragment>
                        ))}
                    </Accordion>
                </div>
            }
        </div>
    )
}

export default PVP;