import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';

import '../PVP.css';
import { Fragment, useEffect, useRef, useState } from "react";

import { capitalize, convertArrStats, convertName, convertNameRankingToOri, splitAndCapitalize } from '../../../util/Utils';
import { useParams } from "react-router-dom";
import APIService from "../../../services/API.service";
import Type from "../../../components/Sprites/Type/Type";
import { calculateCP, calculateStatsByTag, calStatsProd, sortStatsPokemon } from '../../../util/Calculate';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import loading from '../../../assets/loading.png';
import Error from '../../Error/Error';
import { Button } from 'react-bootstrap';
import { leaguesRanking } from '../../../util/Constants';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';

const PokemonPVP = () => {

    const params = useParams();

    const [rankingPoke, setRankingPoke] = useState(null);
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));
    const [spinner, setSpinner] = useState(true);
    const [found, setFound] = useState(true);

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const cp = parseInt(params.cp);
                const paramName = params.pokemon.replaceAll("-", "_").toLowerCase();
                const data = (await APIService.getFetchUrl(APIService.getRankingFile("all", cp, params.type))).data
                .find(pokemon => pokemon.speciesId === paramName);

                const name = convertNameRankingToOri(data.speciesId, data.speciesName);
                const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
                const id = pokemon.num;
                const form = findAssetForm(pokemon.num, pokemon.name);

                document.title = `#${id} ${splitAndCapitalize(name, "-", " ")} - ${
                    cp === 500 ? "Little Cup" :
                    cp === 1500 ? "Great League" :
                    cp === 2500 ? "Ultra League" :
                    "Master League"} (${capitalize(params.type)})`;

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
                    atk: statsRanking.current.attack.ranking.find(i => i.attack === stats.atk),
                    def: statsRanking.current.defense.ranking.find(i => i.defense === stats.def),
                    sta: statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta),
                    scores: data.scores,
                    combatPoke: combatPoke,
                    fmove: fmove,
                    cmovePri: cmovePri,
                    cmoveSec: cmoveSec,
                    bestStats: bestStats,
                    shadow: data.speciesName.includes("(Shadow)"),
                    purified: combatPoke.PURIFIED_MOVES.includes(cmovePri) || (cMoveDataSec && combatPoke.PURIFIED_MOVES.includes(cMoveDataSec))
                });
                setSpinner(false);
            } catch {
                setSpinner(false);
                setFound(false);
            }
        }
        fetchPokemon();
    }, [params.cp, params.type, params.pokemon]);

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
        <div style={{backgroundImage: computeBgType(rankingPoke.pokemon.types, rankingPoke.shadow, rankingPoke.purified, 0.8), paddingTop: 15, paddingBottom: 15}}>
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
                <div className="d-flex flex-wrap align-items-center justify-content-center" style={{gap: '2rem'}}>
                    <div className="position-relative filter-shadow" style={{width: 128}}>
                        {rankingPoke.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                        {rankingPoke.purified && <img height={64} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()}/>}
                        <img alt='img-league' className="pokemon-sprite-raid" src={rankingPoke.form ?  APIService.getPokemonModel(rankingPoke.form) : APIService.getPokeFullSprite(rankingPoke.id)}/>
                    </div>
                    <div>
                        <div className="d-flex flex-wrap align-items-center" style={{gap: 15}}>
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
                            {rankingPoke.cmoveSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={rankingPoke.cmoveSec}
                            elite={rankingPoke.combatPoke.ELITE_CINEMATIC_MOVES.includes(rankingPoke.cmoveSec.name)}
                            shadow={rankingPoke.combatPoke.SHADOW_MOVES.includes(rankingPoke.cmoveSec.name)}
                            purified={rankingPoke.combatPoke.PURIFIED_MOVES.includes(rankingPoke.cmoveSec.name)}/>}
                        </div>
                    </div>
                </div>
                <hr />
                {Keys(Object.values(pokemonData), rankingPoke.data, params.cp, params.type)}
            </div>
            <div className='container'>
                <hr />
            </div>
            <div className='stats-container'>
                {OverAllStats(rankingPoke, statsRanking, params.cp)}
            </div>
            <div className='container'>
                <hr />
                {TypeEffective(rankingPoke.pokemon.types)}
            </div>
            <div className='container'>
                {MoveSet(rankingPoke.data.moves, rankingPoke.combatPoke, combatData)}
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