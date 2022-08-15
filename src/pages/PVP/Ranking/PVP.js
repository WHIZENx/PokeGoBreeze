import pokemonData from '../../../data/pokemon.json';

import Type from "../../../components/Sprites/Type/Type";

import '../PVP.css';
import React, { useState, useEffect, Fragment, useRef } from "react";

import { convertNameRankingToOri, splitAndCapitalize, convertArrStats, convertName, capitalize } from '../../../util/Utils';
import { calculateStatsByTag, sortStatsPokemon } from '../../../util/Calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import { computeBgType, findAssetForm } from "../../../util/Compute";
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import update from 'immutability-helper';
import { Link, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { leaguesRanking } from '../../../util/Constants';

import Error from '../../Error/Error';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';

import { useDispatch, useSelector } from "react-redux";
import { hideSpinner, showSpinner } from "../../../store/actions/spinner.action";

const RankingPVP = () => {

    const dispatch = useDispatch();
    const dataStore = useSelector((state) => state.store.data);
    const params = useParams();

    const [rankingData, setRankingData] = useState(null);
    const [storeStats, setStoreStats] = useState(null);
    const sortedBy = useRef("score");
    const [sorted, setSorted] = useState(1);

    const [search, setSearch] = useState('');
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));

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
        const axios = APIService;
        const cancelToken = axios.getAxios().CancelToken;
        const source = cancelToken.source();
        const fetchPokemon = async () => {
            dispatch(showSpinner());
            try {
                const cp = parseInt(params.cp);
                let file = (await APIService.getFetchUrl(APIService.getRankingFile(params.serie, cp, params.type)), {
                    cancelToken: source.token
                }).data;
                if (params.serie === "all") document.title = `PVP Ranking - ${
                    cp === 500 ? "Little Cup" :
                    cp === 1500 ? "Great League" :
                    cp === 2500 ? "Ultra League" :
                    "Master League"}`;
                else document.title = `PVP Ranking - ${
                    params.serie === "remix" ?
                    cp === 500 ? "Little Cup " :
                    cp === 1500 ? "Great League " :
                    cp === 2500 ? "Ultra League " :
                    "Master League ":""}
                    ${splitAndCapitalize(params.serie, "-", " ")} (${capitalize(params.type)})`;
                pokemonData = Object.values(pokemonData);
                file = file.map(item => {
                    const name = convertNameRankingToOri(item.speciesId, item.speciesName);
                    const pokemon = pokemonData.find(pokemon => pokemon.slug === name);
                    const id = pokemon.num;
                    const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.name);

                    const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);

                    let fmoveData = item.moveset[0], cMoveDataPri = item.moveset[1], cMoveDataSec = item.moveset[2];
                    if (fmoveData.includes("HIDDEN_POWER")) fmoveData = "HIDDEN_POWER";
                    if (cMoveDataPri === "FUTURE_SIGHT") cMoveDataPri = "FUTURESIGHT";
                    if (cMoveDataSec === "FUTURE_SIGHT") cMoveDataSec = "FUTURESIGHT";
                    if (cMoveDataPri === "TECHNO_BLAST_DOUSE") cMoveDataPri = "TECHNO_BLAST_WATER";
                    if (cMoveDataSec === "TECHNO_BLAST_DOUSE") cMoveDataSec = "TECHNO_BLAST_WATER";

                    let fmove = dataStore.combat.find(item => item.name === fmoveData);
                    const cmovePri = dataStore.combat.find(item => item.name === cMoveDataPri);
                    if (cMoveDataSec) var cmoveSec = dataStore.combat.find(item => item.name === cMoveDataSec);

                    if (item.moveset[0].includes("HIDDEN_POWER")) fmove = {...fmove, type: item.moveset[0].split("_")[2]}

                    let combatPoke = dataStore.pokemonCombat.filter(item => item.id === pokemon.num
                        && item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                    );
                    const result = combatPoke.find(item => item.name === convertName(pokemon.name));
                    if (!result) {
                        if (combatPoke) combatPoke = combatPoke[0]
                        else combatPoke = combatPoke.find(item => item.BASE_SPECIES === convertName(pokemon.name));
                    }
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
                        combatPoke: combatPoke,
                        shadow: item.speciesName.includes("(Shadow)"),
                        purified: combatPoke.purifiedMoves.includes(cmovePri) || (cMoveDataSec && combatPoke.purifiedMoves.includes(cMoveDataSec))
                    }
                })
                setRankingData(file);
                setStoreStats(file.map(i => false));
            } catch (e) {
                setFound(false);
            }
            dispatch(hideSpinner());
        }
        fetchPokemon();

        return () => {
            source.cancel();
            if (dataStore.spinner) dispatch(hideSpinner());
        }
    }, [dispatch, params.serie, params.cp, params.type, dataStore]);

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
                                {data.shadow && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                {data.purified && <img height={28} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()}/>}
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
                <Accordion.Body style={{padding: 0, backgroundImage: computeBgType(data.pokemon.types, data.shadow, data.purified, 0.8)}}>
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
                                elite={data.combatPoke.cinematicMoves.includes(data.fmove.name)}/>
                                <TypeBadge grow={true} find={true} title="Primary Charged Move" color={'white'} move={data.cmovePri}
                                elite={data.combatPoke.eliteCinematicMoves.includes(data.cmovePri.name)}
                                shadow={data.combatPoke.shadowMoves.includes(data.cmovePri.name)}
                                purified={data.combatPoke.purifiedMoves.includes(data.cmovePri.name)}/>
                                {data.cmoveSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={data.cmoveSec}
                                elite={data.combatPoke.eliteCinematicMoves.includes(data.cmoveSec.name)}
                                shadow={data.combatPoke.shadowMoves.includes(data.cmoveSec.name)}
                                purified={data.combatPoke.purifiedMoves.includes(data.cmoveSec.name)}/>}
                            </div>
                            <hr />
                            {Keys(dataStore.assets, Object.values(pokemonData), data, params.cp, params.type)}
                        </div>
                        <div className='container'>
                            <hr />
                        </div>
                        <div className='stats-container'>
                            {OverAllStats(data, statsRanking, params.cp)}
                        </div>
                        <div className='container'>
                            <hr />
                            {TypeEffective(data.pokemon.types)}
                        </div>
                        <div className='container'>
                            {MoveSet(data.moves, data.combatPoke, dataStore.combat)}
                        </div>
                    </div>
                    <LeaveToggle eventKey={key} />
                    </Fragment>
                    }
                </Accordion.Body>
            </Accordion.Item>
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
        {rankingData && storeStats &&
        <div className="container pvp-container element-bottom">
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
            <div className="ranking-container">
                <div className="ranking-group w-100 ranking-header" style={{columnGap: '1rem'}}>
                    <div></div>
                    <div className="d-flex" style={{marginRight: 15}}>
                        <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSorted(!sorted);}}>
                            <span className={"ranking-sort ranking-score"+(sortedBy.current === "score" ? " ranking-selected":"")}>
                                Score
                                {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                            </span>
                        </div>
                    </div>
                </div>
                <Accordion alwaysOpen >
                    {rankingData
                    .filter(pokemon => splitAndCapitalize(convertNameRankingToOri(pokemon.speciesId, pokemon.speciesName), "-", " ").toLowerCase().includes(search.toLowerCase()))
                    .sort((a,b) => sorted ? b[sortedBy.current]-a[sortedBy.current] : a[sortedBy.current]-b[sortedBy.current]).map((value, index) => (
                        <Fragment key={index}>
                            {renderItem(value, index)}
                        </Fragment>
                    ))}
                </Accordion>
            </div>

        </div>
        }
        </Fragment>
        }
        </Fragment>
    )
}

export default RankingPVP;