import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';

import Type from "../../../components/Sprites/Type/Type";
import Stats from '../../../components/Info/Stats/Stats';

import '../PVP.css';
import Hexagon from "../../../components/Sprites/Hexagon/Hexagon";
import { useState, useEffect, Fragment, useRef } from "react";

import { convertNameRankingToOri, splitAndCapitalize, convertArrStats, convertName } from '../../../util/Utils';
import { calculateStatsByTag, calStatsProd, calculateCP, sortStatsPokemon } from '../../../util/Calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import { computeBgType, computeCandyBgColor, computeCandyColor, findAssetForm } from "../../../util/Compute";
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import update from 'immutability-helper';
import { Link, useParams } from 'react-router-dom';
import IVbar from '../../../components/Sprites/IVBar/IVBar';
import TypeEffectiveSelect from '../../../components/Effective/TypeEffectiveSelect';
import CloseIcon from '@mui/icons-material/Close';
import { leaguesRanking } from '../../../util/Constants';

import loading from '../../../assets/loading.png';
import Error from '../../Error/Error';

import VisibilityIcon from '@mui/icons-material/Visibility';

const RankingPVP = () => {

    const params = useParams();

    const [rankingData, setRankingData] = useState(null);
    const [storeStats, setStoreStats] = useState(null);

    const [search, setSearch] = useState('');
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

    const [spinner, setSpinner] = useState(true);
    const [found, setFound] = useState(true);

    const LeaveToggle = ({ eventKey }) => {
        const decoratedOnClick = useAccordionButton(eventKey, () => <></>);

        return (
          <div className='accordion-footer' onClick={decoratedOnClick}>
            <span className='text-danger'>Close <CloseIcon sx={{color: 'red'}}/></span>
          </div>
        );
    }

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                let file = (await APIService.getFetchUrl(APIService.getRankingFile(params.serie, parseInt(params.cp), params.type))).data;
                pokemonData = Object.values(pokemonData);
                file = file.map(item => {
                    const name = convertNameRankingToOri(item.speciesId, item.speciesName);
                    const pokemon = pokemonData.find(pokemon => pokemon.slug === name);
                    const id = pokemon.num;
                    const form = findAssetForm(pokemon.num, pokemon.name);

                    const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);

                    let fmoveData = item.moveset[0], cMoveDataPri = item.moveset[1], cMoveDataSec = item.moveset[2];
                    if (fmoveData.includes("HIDDEN_POWER")) fmoveData = "HIDDEN_POWER";
                    if (cMoveDataPri === "FUTURE_SIGHT") cMoveDataPri = "FUTURESIGHT";
                    if (cMoveDataSec === "FUTURE_SIGHT") cMoveDataSec = "FUTURESIGHT";
                    if (cMoveDataPri === "TECHNO_BLAST_DOUSE") cMoveDataPri = "TECHNO_BLAST_WATER";
                    if (cMoveDataSec === "TECHNO_BLAST_DOUSE") cMoveDataSec = "TECHNO_BLAST_WATER";

                    let fmove = combatData.find(item => item.name === fmoveData);
                    const cmovePri = combatData.find(item => item.name === cMoveDataPri);
                    if (cMoveDataSec) var cmoveSec = combatData.find(item => item.name === cMoveDataSec);

                    if (item.moveset[0].includes("HIDDEN_POWER")) fmove = {...fmove, type: item.moveset[0].split("_")[2]}

                    let combatPoke = combatPokemonData.filter(item => item.ID === pokemon.num
                        && item.BASE_SPECIES === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                    );
                    const result = combatPoke.find(item => item.NAME === convertName(pokemon.name));
                    if (!result) combatPoke = combatPoke[0]
                    else combatPoke = result;
                    return {
                        ...item,
                        id: id,
                        name: name,
                        form: form,
                        pokemon: pokemon,
                        stats: stats,
                        atk: statsRanking.current.attack.ranking.find(i => i.attack === stats.atk),
                        def: statsRanking.current.defense.ranking.find(i => i.defense === stats.def),
                        sta: statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta),
                        fmove: fmove,
                        cmovePri: cmovePri,
                        cmoveSec: cmoveSec,
                        combatPoke: combatPoke
                    }
                })
                setRankingData(file);
                setStoreStats(file.map(i => false));
                setSpinner(false);
            } catch {
                setSpinner(false);
                setFound(false);
            }
        }
        fetchPokemon();
    }, [params.serie, params.cp, params.type]);

    const convertNameRankingToForm = (name) => {
        return rankingData.find(pokemon => pokemon.speciesId === name).speciesName;
    }

    const calculateStatsTopRank = (stats) => {
        const maxCP = parseInt(params.cp);

        if (maxCP === 10000) {
            const cp = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 50);
            const buddyCP = calculateCP(stats.atk+15, stats.def+15, stats.sta+15, 51);
            return {
                "50": {cp: cp},
                "51": {cp: buddyCP},
            };
        } else {
            const minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
            const allStats = calStatsProd(stats.atk, stats.def, stats.sta, minCP, maxCP);
            return allStats[allStats.length-1];
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

    const onSearch = (value) => {
        setSearch(value)
    }

    const renderItem = (data, key) => {
        return (
            <Accordion.Item eventKey={key}>
                <Accordion.Header onClick={() => {
                if (!storeStats[key]) setStoreStats(update(storeStats, {[key]: {$set: true}}))
                }}>
                    <div className="d-flex align-items-center w-100" style={{gap: '1rem'}}>
                        <Link to={`/pvp/${params.cp}/overall/${data.speciesId.replaceAll("_", "-")}`} target="_blank"><VisibilityIcon className="view-pokemon" fontSize="large" sx={{color: 'black'}}/></Link>
                        <div className="d-flex justify-content-center">
                            <span className="position-relative" style={{width: 50}}>
                                {data.speciesName.includes("(Shadow)") && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                <img alt='img-league' className="pokemon-sprite-accordion" src={data.form ?  APIService.getPokemonModel(data.form) : APIService.getPokeFullSprite(data.id)}/>
                            </span>
                        </div>
                        <div className="ranking-group w-100">
                            <b>{splitAndCapitalize(data.name, "-", " ")}</b>
                            <div style={{marginRight: 15}}>
                                <span className="ranking-score score-ic">{data.score}</span>
                            </div>
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Body style={{padding: 0, backgroundImage: computeBgType(data.pokemon.types, data.speciesName.includes("(Shadow)"), 0.8)}}>
                    {storeStats[key] &&
                    <Fragment>
                    <div className="pokemon-ranking-body ranking-body">
                        <div className="w-100 ranking-info element-top">
                            <div className="d-flex flex-wrap align-items-center" style={{columnGap: 15}}>
                                <h3 className='text-white text-shadow'><b>#{data.id} {splitAndCapitalize(data.name, "-", " ")}</b></h3>
                                <Type shadow={true} block={true} color={'white'} arr={data.pokemon.types} />
                            </div>
                            <div className="d-flex flex-wrap element-top" style={{columnGap: 10}}>
                                <TypeBadge grow={true} find={true} title="Fast Move" color={'white'} move={data.fmove}
                                elite={data.combatPoke.ELITE_QUICK_MOVES.includes(data.fmove.name)}/>
                                <TypeBadge grow={true} find={true} title="Primary Charged Move" color={'white'} move={data.cmovePri}
                                elite={data.combatPoke.ELITE_CINEMATIC_MOVES.includes(data.cmovePri.name)}
                                shadow={data.combatPoke.SHADOW_MOVES.includes(data.cmovePri.name)}
                                purified={data.combatPoke.PURIFIED_MOVES.includes(data.cmovePri.name)}/>
                                {data.cMoveDataSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={data.cmoveSec}
                                elite={data.combatPoke.ELITE_CINEMATIC_MOVES.includes(data.cmoveSec.name)}
                                shadow={data.combatPoke.SHADOW_MOVES.includes(data.cmoveSec.name)}
                                purified={data.combatPoke.PURIFIED_MOVES.includes(data.cmoveSec.name)}/>}
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
                                    {data.matchups.sort((a,b) => b.rating-a.rating).map((matchup, index) => (
                                        <Fragment key={index}>{renderItemList(matchup, 0, index)}</Fragment>
                                    ))}
                                </div>
                                <div className="col-lg-6 element-top" style={{padding: 0}}>
                                    <div className="title-item-ranking">
                                        <h4 className='text-white text-shadow'>Best Counters</h4>
                                        <div style={{marginRight: 15}}>
                                            <span className="ranking-score score-ic">Rating</span>
                                        </div>
                                    </div>
                                    {data.counters.sort((a,b) => a.rating-b.rating).map((counter, index) => (
                                        <Fragment key={index}>{renderItemList(counter, 1, index)}</Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className='container'>
                            <hr />
                        </div>
                        <div className='stats-container'>
                        {data.scores ?
                        <div className="row w-100" style={{margin: 0}}>
                            <div className="col-lg-4 d-flex justify-content-center element-top">
                                <div>
                                    <h5><b>Overall Performance</b></h5>
                                    <Hexagon animation={0} borderSize={320} size={180}
                                    stats={{
                                        lead: data.scores[0],
                                        atk: data.scores[4],
                                        cons: data.scores[5],
                                        closer: data.scores[1],
                                        charger: data.scores[3],
                                        switching: data.scores[2]
                                    }}/>
                                </div>
                            </div>
                            <div className="col-lg-8 container status-ranking element-top">
                                <div>
                                    <h5><b>Overall Stats</b></h5>
                                    <Stats statATK={data.atk}
                                        statDEF={data.def}
                                        statSTA={data.sta}
                                        pokemonStats={statsRanking.current}/>
                                </div>
                                <div>
                                    <h5><b>Top Rank League</b></h5>
                                    {renderTopStats(data.stats, key, data.id)}
                                </div>
                            </div>
                        </div>
                        :
                        <div className="w-100 container status-ranking element-top">
                            <div>
                                <h5><b>Overall Stats</b></h5>
                                <Stats statATK={data.atk}
                                    statDEF={data.def}
                                    statSTA={data.sta}
                                    pokemonStats={statsRanking.current}/>
                            </div>
                            <div>
                                <h5 className='element-top'><b>Top Rank League</b></h5>
                                {renderTopStats(data.stats, key, data.id)}
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
                                        {<TypeEffectiveSelect effect={0} types={data.pokemon.types}/>}
                                    </div>
                                    <hr className='w-100' style={{margin: 0}}/>
                                </div>
                                <div className='col-lg-4' style={{marginBottom: 15}}>
                                    <div className='h-100'>
                                        <h6 className='d-flex justify-content-center neutral-bg-text'><b>Neutral</b></h6>
                                        <hr className='w-100'/>
                                        {<TypeEffectiveSelect effect={1} types={data.pokemon.types}/>}
                                    </div>
                                    <hr className='w-100' style={{margin: 0}}/>
                                </div>
                                <div className='col-lg-4' style={{marginBottom: 15}}>
                                    <div className='h-100'>
                                        <h6 className='d-flex justify-content-center resistance-bg-text'><b>Resistance</b></h6>
                                        <hr className='w-100'/>
                                        {<TypeEffectiveSelect effect={2} types={data.pokemon.types}/>}
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
                                            <Fragment key={index}>{findMove(value.moveId, value.uses, data.combatPoke)}</Fragment>
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
                                            <Fragment key={index}>{findMove(value.moveId, value.uses, data.combatPoke)}</Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <LeaveToggle eventKey={key} />
                    </Fragment>
                    }
                </Accordion.Body>
            </Accordion.Item>
        )
    }

    const renderItemList = (data, type, index) => {
        const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
        const pokemon = Object.values(pokemonData).find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(pokemon.num, pokemon.name);

        return (
            <Link to={`/pvp/${params.cp}/${params.type}/${data.opponent.replaceAll("_", "-")}`} target="_blank" className="list-item-ranking" style={{backgroundImage: computeBgType(pokemon.types, data.opponent.includes("_shadow"))}}>
                <div className="container d-flex align-items-center" style={{columnGap: 10}}>
                    <div className="d-flex justify-content-center">
                        <span className="position-relative filter-shadow" style={{width: 50}}>
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

    const renderTopStats = (stats, key, id) => {
        const maxCP = parseInt(params.cp);
        const currStats = calculateStatsTopRank(stats);
        return (
            <ul className='element-top'>
                <li className='element-top'>
                    CP: <b>{maxCP === 10000 ? `${currStats["50"].cp}-${currStats["51"].cp}` : `${currStats.CP}`}</b>
                </li>
                <li className={currStats.level <= 40 ? 'element-top' : ''}>
                    Level: <b>{maxCP === 10000 ? "50-51" : `${currStats.level}`} </b>
                    {(currStats.level > 40 || maxCP === 10000) &&
                    <b>
                    (
                        <div className="position-relative d-inline-block filter-shadow">
                            <div className="bg-poke-xl-candy" style={{background: computeCandyBgColor(id), width: 30, height: 30}}></div>
                            <div className="poke-xl-candy" style={{background: computeCandyColor(id), width: 30, height: 30}}></div>
                        </div>
                        XL Candy required)</b>
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
        const league = leaguesRanking.find(item => item.id === params.serie && item.cp === parseInt(params.cp))
        return (
            <Fragment>
                {league &&
                <div className='d-flex flex-wrap align-items-center element-top' style={{columnGap: 10}}>
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
        {rankingData && storeStats &&
        <div className="container pvp-container">
            {renderLeague()}
            <hr />
            <div className='element-top ranking-link-group'>
                <Button className={(params.type.toLowerCase() === 'overall' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/overall`}>Overall</Button >
                <Button className={(params.type.toLowerCase() === 'leads' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/leads`}>Leads</Button>
                <Button className={(params.type.toLowerCase() === 'closers' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/closers`}>Closers</Button>
                <Button className={(params.type.toLowerCase() === 'switches' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/switches`}>Switches</Button>
                <Button className={(params.type.toLowerCase() === 'chargers' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/chargers`}>Chargers</Button>
                <Button className={(params.type.toLowerCase() === 'attackers' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/attackers`}>Attackers</Button>
                <Button className={(params.type.toLowerCase() === 'consistency' ? " active" : "")} href={`pvp/rankings/${params.serie}/${params.cp}/consistency`}>Consistency</Button>
            </div>
            <div className="input-group border-input">
                <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                value={search}
                onInput={e => onSearch(e.target.value)}
                />
            </div>
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
        </Fragment>
        }
        </Fragment>
    )
}

export default RankingPVP;