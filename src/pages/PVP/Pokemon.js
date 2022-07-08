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
import { computeBgColor, computeColor, findAssetForm } from '../../util/Compute';
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';
import Stats from '../../components/Info/Stats/Stats';
import TypeEffectiveSelect from '../../components/Effective/TypeEffectiveSelect';
import IVbar from '../../components/Sprites/IVBar/IVBar';

const PokemonPVP = () => {

    const params = useParams();

    const [rankingPoke, setRankingPoke] = useState(null);
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

    useEffect(() => {
        const fetchMyAPI = async () => {
            const data = (await APIService.getFetchUrl(APIService.getRankingFile(parseInt(params.cp), params.type))).data
            .find(pokemon => pokemon.speciesId === params.pokemon.toLowerCase());

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
        }
        fetchMyAPI();
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

    const renderItemList = (data, index) => {
        const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        return (
            <div className="d-flex align-items-center">
                <span className="number-count-ranking">{index+1}</span>
                <Link to={`/pvp/${params.cp}/${params.type}/${name}`} target="_blank"  className="d-inline-block position-relative" style={{width: 50, marginRight: '1rem'}}>
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
        <div className="container" style={{marginTop: 15, marginBottom: 15}}>
            {rankingPoke &&
            <Fragment>
            <div className="w-100 ranking-info element-top">
                <div className="d-flex flex-wrap align-items-center">
                    <h3 style={{marginRight: 15}}><b>#{rankingPoke.id} {splitAndCapitalize(rankingPoke.name, "-", " ")}</b></h3>
                    <Type block={true} style={{marginBottom: 0}} styled={true} arr={rankingPoke.pokemon.types} />
                </div>
                <div className="d-flex flex-wrap element-top">
                    <TypeBadge find={true} title="Fast Move" style={{marginRight: 15}} move={rankingPoke.fmove}
                    elite={rankingPoke.combatPoke.ELITE_QUICK_MOVES.includes(rankingPoke.fmove.name)}/>
                    <TypeBadge find={true} title="Primary Charged Move" style={{marginRight: 10}} move={rankingPoke.cmovePri}
                    elite={rankingPoke.combatPoke.ELITE_CINEMATIC_MOVES.includes(rankingPoke.cmovePri.name)}
                    shadow={rankingPoke.combatPoke.SHADOW_MOVES.includes(rankingPoke.cmovePri.name)}
                    purified={rankingPoke.combatPoke.PURIFIED_MOVES.includes(rankingPoke.cmovePri.name)}/>
                    {rankingPoke.cMoveDataSec && <TypeBadge find={true} title="Secondary Charged Move" move={rankingPoke.cmoveSec}
                    elite={rankingPoke.combatPoke.ELITE_CINEMATIC_MOVES.includes(rankingPoke.cmoveSec.name)}
                    shadow={rankingPoke.combatPoke.SHADOW_MOVES.includes(rankingPoke.cmoveSec.name)}
                    purified={rankingPoke.combatPoke.PURIFIED_MOVES.includes(rankingPoke.cmoveSec.name)}/>}
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
                        {rankingPoke.data.matchups.sort((a,b) => b.rating-a.rating).map((matchup, index) => (
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
                        {rankingPoke.data.counters.sort((a,b) => a.rating-b.rating).map((counter, index) => (
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
            {rankingPoke.scores ?
            <div className="row w-100" style={{margin: 0}}>
                <div className="col-lg-4 d-flex justify-content-center element-top">
                    <div>
                        <h5><b>Overall Performance</b></h5>
                        <Hexagon animation={0} borderSize={340} size={200}
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
            <div className='container'>
                <hr />
                <div className='row'>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center weakness-bg-text'><b>Weakness</b></h6>
                            <hr className='w-100'/>
                            {<TypeEffectiveSelect effect={0} types={rankingPoke.pokemon.types}/>}
                        </div>
                        <hr className='w-100' style={{margin: 0}}/>
                    </div>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center neutral-bg-text'><b>Neutral</b></h6>
                            <hr className='w-100'/>
                            {<TypeEffectiveSelect effect={1} types={rankingPoke.pokemon.types}/>}
                        </div>
                        <hr className='w-100' style={{margin: 0}}/>
                    </div>
                    <div className='col-lg-4' style={{marginBottom: 15}}>
                        <div className='h-100'>
                            <h6 className='d-flex justify-content-center resistance-bg-text'><b>Resistance</b></h6>
                            <hr className='w-100'/>
                            {<TypeEffectiveSelect effect={2} types={rankingPoke.pokemon.types}/>}
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
            </Fragment>
            }
        </div>
    )
}

export default PokemonPVP;