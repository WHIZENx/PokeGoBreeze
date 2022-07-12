import pokemonData from '../../data/pokemon.json';
import combatData from '../../data/combat.json';
import combatPokemonData from '../../data/combat_pokemon_go_list.json';

import './PVP.css';
import Hexagon from "../../components/Sprites/Hexagon/Hexagon";
import { Fragment, useEffect, useRef, useState } from "react";

import { convertArrStats, convertName, convertNameRankingToForm, convertNameRankingToOri, splitAndCapitalize } from '../../util/Utils';
import { Link, useParams } from "react-router-dom";
import APIService from "../../services/API.service";
import Type from "../../components/Sprites/Type/Type";
import { calculateCP, calculateStatsByTag, calStatsProd, sortStatsPokemon } from '../../util/Calculate';
import { computeBgType, computeCandyBgColor, computeCandyColor, findAssetForm } from '../../util/Compute';
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';
import Stats from '../../components/Info/Stats/Stats';
import TypeEffectiveSelect from '../../components/Effective/TypeEffectiveSelect';
import IVbar from '../../components/Sprites/IVBar/IVBar';

import loading from '../../assets/loading.png';
import Error from '../Error/Error';
import { Button } from 'react-bootstrap';
import { leaguesRanking } from '../../util/Constants';

const PokemonPVP = () => {

    const params = useParams();

    const [rankingPoke, setRankingPoke] = useState(null);
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));
    const [spinner, setSpinner] = useState(true);
    const [found, setFound] = useState(true);

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const paramName = params.pokemon.replaceAll("-", "_").toLowerCase();
                const data = (await APIService.getFetchUrl(APIService.getRankingFile("all", parseInt(params.cp), params.type))).data
                .find(pokemon => pokemon.speciesId === paramName);

                const name = convertNameRankingToOri(data.speciesId, data.speciesName);
                const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
                const id = pokemon.num;
                const form = findAssetForm(pokemon.num, pokemon.name);

                const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);

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

                const maxCP = parseInt(params.cp);

                let bestStats;
                if (maxCP === 10000) {
                    const cp = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 50);
                    const buddyCP = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 51);
                    bestStats = {
                        "50": {cp: cp},
                        "51": {cp: buddyCP},
                    };
                } else {
                    const minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
                    const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, maxCP);
                    bestStats = allStats[allStats.length-1];
                }

                setRankingPoke({
                    data: data,
                    id: id,
                    name: name,
                    pokemon: pokemon,
                    form: form,
                    stats: stats,
                    scores: data.scores,
                    fmove: fmove,
                    cmovePri: cmovePri,
                    cmoveSec: cmoveSec,
                    combatPoke: combatPoke,
                    bestStats: bestStats
                });
                setSpinner(false);
            } catch {
                setSpinner(false);
                setFound(false);
            }
        }
        fetchPokemon();
    }, [params.cp, params.type, params.pokemon]);

    const findMove = (name, uses, combatList) => {
        const oldName = name;
        if (name.includes("HIDDEN_POWER")) name = "HIDDEN_POWER";
        let move = combatData.find(move => move.name === name);
        if (oldName.includes("HIDDEN_POWER")) move = {...move, type: oldName.split("_")[2]};

        let elite = false;
        if (combatList.ELITE_QUICK_MOVES.includes(name)) elite = true;
        if (combatList.ELITE_CINEMATIC_MOVES.includes(name)) elite = true;

        return (
            <Link to={`/moves/${move.id}`} target="_blank" className={(move.type.toLowerCase())+' filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'}>
                <div className='d-flex' style={{columnGap: 10}}>
                    <img className="filter-shadow" width={24} height={24} alt='img-pokemon' src={APIService.getTypeSprite(move.type)}/>
                    <span className='filter-shadow'>{splitAndCapitalize(oldName, "_", " ")} {elite && <b className="filter-shadow">*</b>}</span>
                </div>
                <div>
                    <span className="ranking-score score-ic filter-shadow">{uses}</span>
                </div>
            </Link>
        )
    }

    const renderItemList = (data, type, index) => {
        const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        return (
            <Link to={`/pvp/${params.cp}/${params.type}/${data.opponent.replaceAll("_", "-")}`} target="_blank" className="list-item-ranking" style={{backgroundImage: computeBgType(pokemon.types)}}>
                <div className="container d-flex align-items-center" style={{columnGap: 10}}>
                    <div className="d-flex justify-content-center">
                        <span className="d-inline-block position-relative filter-shadow" style={{width: 50}}>
                            {data.opponent.includes("_shadow") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                            <img alt='img-league' className="pokemon-sprite-accordion" src={ form ? APIService.getPokemonModel(form) :APIService.getPokeFullSprite(id)}/>
                        </span>
                    </div>
                    <div>
                        <b className='text-white text-shadow'>#{id} {splitAndCapitalize(name, "-", " ")}</b>
                        <Type shadow={true} hideText={true} height={20} arr={pokemon.types} />
                    </div>
                </div>
                <div style={{marginRight: 15}}>
                    <span className="ranking-score score-ic text-white text-shadow filter-shadow" style={{backgroundColor: type === 0 ? 'lightgreen' : 'lightcoral'}}>{data.rating}</span>
                </div>
            </Link>
        )
    }

    const renderTopStats = (stats, id) => {
        const maxCP = parseInt(params.cp);
        const currStats = rankingPoke.bestStats;
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
                            <div className="bg-poke-xl-candy" style={{background: computeCandyBgColor(id), width: 30, height: 30}}></div>
                            <div className="poke-xl-candy" style={{background: computeCandyColor(id), width: 30, height: 30}}></div>
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

    const renderLeague = () => {
        const league = leaguesRanking.find(item => item.id === "all" && item.cp === parseInt(params.cp))
        return (
            <Fragment>
                {league &&
                <div className='d-flex flex-wrap align-items-center filter-shadow text-shadow text-white' style={{columnGap: 10}}>
                    <img alt='img-league' width={64} height={64} src={!league.logo ?
                        league.cp === 500 ? APIService.getPokeOtherLeague("GBL_littlecup")
                        :
                        league.cp === 1500 ? APIService.getPokeLeague("great_league")
                        :
                        league.cp === 2500 ? APIService.getPokeLeague("ultra_league")
                        :
                        APIService.getPokeLeague("master_league") : league.logo}/>
                    <h2><b>{league.name}</b></h2>
                </div>
                }
            </Fragment>
        )
    }

    return (
        <Fragment>
        {!found ?
        <Error />
        :
        <Fragment>
        <div className='position-fixed loading-group-spin' style={{display: spinner ? "block" : "none"}}></div>
        <div className="position-fixed loading-spin text-center" style={{display: spinner ? "block" : "none"}}>
            <img className="loading" width={64} height={64} alt='img-pokemon' src={loading}/>
            <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
        </div>
        {rankingPoke &&
        <Fragment>
        <div style={{backgroundImage: computeBgType(rankingPoke.pokemon.types, rankingPoke.data.speciesName.includes("(Shadow)"), 0.8), paddingTop: 15, paddingBottom: 15}}>
        <div className="pokemon-ranking-body container pvp-container">
            {renderLeague()}
            <hr />
            <div className='ranking-link-group' style={{paddingTop: 10}}>
                <Button className={(params.type.toLowerCase() === 'overall' ? " active" : "")} href={`pvp/${params.cp}/overall/${params.pokemon}`}>Overall</Button >
                <Button className={(params.type.toLowerCase() === 'leads' ? " active" : "")} href={`pvp/${params.cp}/leads/${params.pokemon}`}>Leads</Button>
                <Button className={(params.type.toLowerCase() === 'closers' ? " active" : "")} href={`pvp/${params.cp}/closers/${params.pokemon}`}>Closers</Button>
                <Button className={(params.type.toLowerCase() === 'switches' ? " active" : "")} href={`pvp/${params.cp}/switches/${params.pokemon}`}>Switches</Button>
                <Button className={(params.type.toLowerCase() === 'chargers' ? " active" : "")} href={`pvp/${params.cp}/chargers/${params.pokemon}`}>Chargers</Button>
                <Button className={(params.type.toLowerCase() === 'attackers' ? " active" : "")} href={`pvp/${params.cp}/attackers/${params.pokemon}`}>Attackers</Button>
                <Button className={(params.type.toLowerCase() === 'consistency' ? " active" : "")} href={`pvp/${params.cp}/consistency/${params.pokemon}`}>Consistency</Button>
            </div>
            <div className="w-100 ranking-info element-top">
                <div className="d-flex flex-wrap align-items-center justify-content-center" style={{columnGap: '2rem'}}>
                    <div className="position-relative filter-shadow" style={{width: 128}}>
                        {rankingPoke.data.speciesName.includes("(Shadow)") && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                        <img alt='img-league' className="pokemon-sprite-raid" src={rankingPoke.form ?  APIService.getPokemonModel(rankingPoke.form) : APIService.getPokeFullSprite(rankingPoke.id)}/>
                    </div>
                    <div>
                        <div className="d-flex flex-wrap align-items-center" style={{columnGap: 15}}>
                            <h3 className='text-white text-shadow'><b>#{rankingPoke.id} {splitAndCapitalize(rankingPoke.name, "-", " ")}</b></h3>
                            <Type shadow={true} block={true} color={'white'} arr={rankingPoke.pokemon.types} />
                        </div>
                        <div className="d-flex flex-wrap element-top" style={{columnGap: 10}}>
                            <TypeBadge grow={true} find={true} title="Fast Move" color={'white'} move={rankingPoke.fmove}
                            elite={rankingPoke.combatPoke.ELITE_QUICK_MOVES.includes(rankingPoke.fmove.name)}/>
                            <TypeBadge grow={true} find={true} title="Primary Charged Move" color={'white'} move={rankingPoke.cmovePri}
                            elite={rankingPoke.combatPoke.ELITE_CINEMATIC_MOVES.includes(rankingPoke.cmovePri.name)}
                            shadow={rankingPoke.combatPoke.SHADOW_MOVES.includes(rankingPoke.cmovePri.name)}
                            purified={rankingPoke.combatPoke.PURIFIED_MOVES.includes(rankingPoke.cmovePri.name)}/>
                            {rankingPoke.cMoveDataSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={rankingPoke.cmoveSec}
                            elite={rankingPoke.combatPoke.ELITE_CINEMATIC_MOVES.includes(rankingPoke.cmoveSec.name)}
                            shadow={rankingPoke.combatPoke.SHADOW_MOVES.includes(rankingPoke.cmoveSec.name)}
                            purified={rankingPoke.combatPoke.PURIFIED_MOVES.includes(rankingPoke.cmoveSec.name)}/>}
                        </div>
                    </div>
                </div>
                <hr />
                <div className="row" style={{margin: 0}}>
                    <div className="col-lg-6 element-top" style={{padding: 0}}>
                        <div className="title-item-ranking">
                            <h4 className='text-white text-shadow'>Best Matchups</h4>
                            <div style={{marginRight: 15}}>
                                <span className="ranking-score score-ic">Rating</span>
                            </div>
                        </div>
                        {rankingPoke.data.matchups.sort((a,b) => b.rating-a.rating).map((matchup, index) => (
                            <Fragment key={index}>{renderItemList(matchup, 1, index)}</Fragment>
                        ))}
                    </div>
                    <div className="col-lg-6 element-top" style={{padding: 0}}>
                        <div className="title-item-ranking">
                            <h4 className='text-white text-shadow'>Best Counters</h4>
                            <div style={{marginRight: 15}}>
                                <span className="ranking-score score-ic">Rating</span>
                            </div>
                        </div>
                        {rankingPoke.data.counters.sort((a,b) => a.rating-b.rating).map((counter, index) => (
                            <Fragment key={index}>{renderItemList(counter, 0, index)}</Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <div className='container'>
                <hr />
            </div>
            <div className='stats-container'>
            {rankingPoke.scores ?
            <div className="row w-100" style={{margin: 0}}>
                <div className="col-lg-4 d-flex justify-content-center element-top">
                    <div>
                        <h5><b>Overall Performance</b></h5>
                        <Hexagon animation={1} borderSize={340} size={200}
                        defaultStats={{
                            lead: 0,
                            atk: 0,
                            cons: 0,
                            closer: 0,
                            charger: 0,
                            switching: 0
                        }}
                        stats={{
                            lead: rankingPoke.scores[0],
                            atk: rankingPoke.scores[4],
                            cons: rankingPoke.scores[5],
                            closer: rankingPoke.scores[1],
                            charger: rankingPoke.scores[3],
                            switching: rankingPoke.scores[2]
                        }}/>
                    </div>
                </div>
                <div className="col-lg-8 container status-ranking element-top">
                    <div>
                        <h5><b>Overall Stats</b></h5>
                        <Stats statATK={statsRanking.current.attack.ranking.find(i => i.attack === rankingPoke.stats.atk)}
                            statDEF={statsRanking.current.defense.ranking.find(i => i.defense === rankingPoke.stats.def)}
                            statSTA={statsRanking.current.stamina.ranking.find(i => i.stamina === rankingPoke.stats.sta)}
                            pokemonStats={statsRanking.current}/>
                    </div>
                    <div>
                        <h5><b>Top Rank League</b></h5>
                        {renderTopStats(rankingPoke.stats, rankingPoke.id)}
                    </div>
                </div>
            </div>
            :
            <div className="w-100 container status-ranking element-top">
                <div>
                    <h5><b>Overall Stats</b></h5>
                    <Stats statATK={statsRanking.current.attack.ranking.find(i => i.attack === rankingPoke.stats.atk)}
                        statDEF={statsRanking.current.defense.ranking.find(i => i.defense === rankingPoke.stats.def)}
                        statSTA={statsRanking.current.stamina.ranking.find(i => i.stamina === rankingPoke.stats.sta)}
                        pokemonStats={statsRanking.current}/>
                </div>
                <div>
                    <h5 className='element-top'><b>Top Rank League</b></h5>
                    {renderTopStats(rankingPoke.stats, rankingPoke.id)}
                </div>
            </div>
            }
            </div>
            <div className='container'>
                <hr />
                <div className='row text-white'>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center weakness-bg-text'><b>Weakness</b></h6>
                            <hr className='w-100'/>
                            <TypeEffectiveSelect block={true} effect={0} types={rankingPoke.pokemon.types}/>
                        </div>
                        <hr className='w-100' style={{margin: 0}}/>
                    </div>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center neutral-bg-text'><b>Neutral</b></h6>
                            <hr className='w-100'/>
                            <TypeEffectiveSelect block={true} effect={1} types={rankingPoke.pokemon.types}/>
                        </div>
                        <hr className='w-100' style={{margin: 0}}/>
                    </div>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center resistance-bg-text'><b>Resistance</b></h6>
                            <hr className='w-100'/>
                            <TypeEffectiveSelect block={true} effect={2} types={rankingPoke.pokemon.types}/>
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
                            {rankingPoke.data.moves.fastMoves.map(move => {
                                if (!move.uses) move.uses = 0;
                                return move;
                            }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                                <Fragment key={index}>{findMove(value.moveId, value.uses, rankingPoke.combatPoke)}</Fragment>
                            ))}
                        </div>
                    </div>
                    <div className='col-xl-6' style={{padding: 0, backgroundColor: 'lightgray'}}>
                        <div className='moves-title'>Charged Moves</div>
                        <div className='type-rank-list'>
                            {rankingPoke.data.moves.chargedMoves.map(move => {
                                if (move.moveId === "FUTURE_SIGHT") move.moveId = "FUTURESIGHT";
                                if (move.moveId === "TECHNO_BLAST_DOUSE") move.moveId = "TECHNO_BLAST_WATER";
                                if (!move.uses) move.uses = 0;
                                return move;
                            }).sort((a,b) => b.uses-a.uses).map((value, index) => (
                                <Fragment key={index}>{findMove(value.moveId, value.uses, rankingPoke.combatPoke)}</Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </Fragment>
        }
        </Fragment>
        }
        </Fragment>
    )
}

export default PokemonPVP;