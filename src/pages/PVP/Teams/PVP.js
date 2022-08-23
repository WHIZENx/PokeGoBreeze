import React, { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom";
import APIService from "../../../services/API.service";

import pokemonData from '../../../data/pokemon.json';
import { convertArrStats, convertName, convertNameRankingToForm, convertNameRankingToOri, findMoveTeam, getStyleSheet, splitAndCapitalize } from "../../../util/Utils";
import { computeBgType, findAssetForm } from "../../../util/Compute";
import { calculateStatsByTag, sortStatsPokemon } from "../../../util/Calculate";
import { Accordion } from "react-bootstrap";
import TypeBadge from "../../../components/Sprites/TypeBadge/TypeBadge";
import Type from "../../../components/Sprites/Type/Type";
import { leaguesTeam } from "../../../util/Constants";

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import Error from "../../Error/Error";
import { useDispatch, useSelector } from "react-redux";
import { hideSpinner, showSpinner } from "../../../store/actions/spinner.action";

const TeamPVP = () => {

    const dispatch = useDispatch();
    const dataStore = useSelector((state) => state.store.data);
    const params = useParams();

    const [rankingData, setRankingData] = useState(null);
    const [search, setSearch] = useState('');
    const statsRanking = useRef(sortStatsPokemon(convertArrStats(pokemonData)));
    const [sortedBy, setSortedBy] = useState("teamScore");
    const [sorted, setSorted] = useState(1);

    const [sortedTeamBy, setSortedTeamBy] = useState("teamScore");
    const [sortedTeam, setSortedTeam] = useState(1);

    const [found, setFound] = useState(true);
    const styleSheet = useRef(null);

    const mappingPokemonData = useCallback((data) => {
        const [speciesId, moveSet] = data.split(" ");
        const name = convertNameRankingToOri(speciesId, convertNameRankingToForm(speciesId));
        const pokemon = pokemonData.find(pokemon => pokemon.slug === name);
        const id = pokemon.num;
        const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.name);

        const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);

        if (!styleSheet.current) styleSheet.current = getStyleSheet('background-color', `.${pokemon.types[0].toLowerCase()}`)

        let combatPoke = dataStore.pokemonCombat.filter(item => item.id === pokemon.num
            && item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
        );

        const result = combatPoke.find(item => item.name === convertName(pokemon.name));
        if (!result) {
            if (combatPoke) combatPoke = combatPoke[0]
            else combatPoke = combatPoke.find(item => item.baseSpecies === convertName(pokemon.name));
        }
        else combatPoke = result;

        let fmove, cmovePri, cmoveSec, cmove;
        if (moveSet.includes("+")) {
            [fmove, cmove] = moveSet.split("+");
            [cmovePri, cmoveSec] = cmove.split("/")
        } else {
            [fmove, cmovePri, cmoveSec] = moveSet.split("/");
        }

        const fastMoveSet = combatPoke.quickMoves.concat(combatPoke.eliteQuickMoves);
        let chargedMoveSet = combatPoke.cinematicMoves
        .concat(combatPoke.eliteCinematicMoves)
        .concat(combatPoke.shadowMoves)
        .concat(combatPoke.purifiedMoves)
        fmove = dataStore.combat.find(item => item.name === findMoveTeam(fmove, fastMoveSet));
        cmovePri = dataStore.combat.find(item => item.name === findMoveTeam(cmovePri, chargedMoveSet));
        if (cmoveSec) cmoveSec = dataStore.combat.find(item => item.name === findMoveTeam(cmoveSec, chargedMoveSet));

        return {
            id: id,
            name: name,
            speciesId: speciesId,
            pokemonData: pokemon,
            form: form,
            stats: stats,
            atk: statsRanking.current.attack.ranking.find(i => i.attack === stats.atk),
            def: statsRanking.current.defense.ranking.find(i => i.defense === stats.def),
            sta: statsRanking.current.stamina.ranking.find(i => i.stamina === stats.sta),
            fmove: fmove,
            cmovePri: cmovePri,
            cmoveSec: cmoveSec,
            combatPoke: combatPoke,
            shadow: speciesId.includes("shadow"),
            purified: (cmovePri && combatPoke.purifiedMoves.includes(cmovePri.name)) || (cmoveSec && combatPoke.purifiedMoves.includes(cmoveSec.name))
        }
    }, [dataStore]);

    useEffect(() => {
        const axios = APIService;
        const cancelToken = axios.getAxios().CancelToken;
        const source = cancelToken.source();
        const fetchPokemon = async () => {
            dispatch(showSpinner());
            try {
                const cp = parseInt(params.cp);
                let file = (await axios.getFetchUrl(axios.getTeamFile("analysis", params.serie, cp), {
                    cancelToken: source.token
                })).data;
                if (params.serie === "all") document.title = `PVP Teams - ${
                    cp === 500 ? "Little Cup" :
                    cp === 1500 ? "Great League" :
                    cp === 2500 ? "Ultra League" :
                    "Master League"}`;
                else document.title = `PVP Teams - ${
                    params.serie === "remix" ?
                    cp === 500 ? "Little Cup " :
                    cp === 1500 ? "Great League " :
                    cp === 2500 ? "Ultra League " :
                    "Master League ":""}
                    ${splitAndCapitalize(params.serie, "-", " ")}`;
                pokemonData = Object.values(pokemonData);

                const performersTotalGames = file.performers.reduce((p, c) => p + c.games, 0);
                const teamsTotalGames = file.teams.reduce((p, c) => p + c.games, 0);

                file.performers = file.performers.map(item => {
                    return {
                        ...item,
                        ...mappingPokemonData(item.pokemon),
                        performersTotalGames: performersTotalGames
                    }
                });

                file.teams = file.teams.map(item => {
                    const teams = item.team.split("|");
                    let teamsData = [];
                    teams.forEach(value => {
                        teamsData.push(mappingPokemonData(value))
                    })
                    return {
                        ...item,
                        teamsTotalGames: teamsTotalGames,
                        teamData: teamsData,
                    }
                });
                setRankingData(file);
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
    }, [dispatch, params.cp, params.serie, dataStore.spinner, mappingPokemonData])

    const renderLeague = () => {
        const league = leaguesTeam.find(item => item.id === params.serie && item.cp === parseInt(params.cp))
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
            {rankingData &&
            <div className="container pvp-container element-bottom">
                {renderLeague()}
                <hr />
                <h2>Top Performer Pokémon</h2>
                <div className="input-group border-input">
                    <input type="text" className='form-control input-search' placeholder='Enter Name or ID'
                    value={search}
                    onInput={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="ranking-container card-container">
                    <div className="ranking-group w-100 ranking-header" style={{columnGap: '1rem'}}>
                        <div className="ranking-score text-black">Pokémon</div>
                        <div className="d-flex" style={{marginRight: 15, columnGap: 30}}>
                            <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSortedBy("teamScore");if (sortedBy === "teamScore") setSorted(!sorted);}}>
                                <span className={"ranking-sort ranking-score"+(sortedBy === "teamScore" ? " ranking-selected":"")}>
                                    Team Score
                                    {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                </span>
                            </div>
                            <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSortedBy("individualScore");if (sortedBy === "individualScore") setSorted(!sorted);}}>
                                <span className={"ranking-sort ranking-score"+(sortedBy === "individualScore" ? " ranking-selected":"")}>
                                    Individual Score
                                    {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                </span>
                            </div>
                            <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSortedBy("games");if (sortedBy === "games") setSorted(!sorted);}}>
                                <span className={"ranking-sort ranking-score"+(sortedBy === "games" ? " ranking-selected":"")}>
                                    Usage
                                    {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                </span>
                            </div>
                        </div>
                    </div>
                    {rankingData.performers
                    .filter(pokemon => splitAndCapitalize(pokemon.name, "-", " ").toLowerCase().includes(search.toLowerCase()))
                    .sort((a,b) => sorted ? b[sortedBy]-a[sortedBy] : a[sortedBy]-b[sortedBy]).map((value, index) => (
                        <div className="d-flex align-items-center card-ranking" key={index} style={{columnGap: '1rem', backgroundImage: computeBgType(value.pokemonData.types, value.shadow, value.purified, 1, styleSheet.current)}}>
                            <Link to={`/pvp/${params.cp}/overall/${value.speciesId.replaceAll("_", "-")}`} target="_blank"><VisibilityIcon className="view-pokemon" fontSize="large" sx={{color: 'black'}}/></Link>
                            <div className="d-flex justify-content-center">
                                <span className="position-relative filter-shadow" style={{width: 96}}>
                                    {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                    {value.purified && <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()}/>}
                                    <img alt='img-league' className="pokemon-sprite" src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}/>
                                </span>
                            </div>
                            <div className="ranking-group w-100" style={{columnGap: 15}}>
                                <div>
                                    <div className="d-flex align-items-center" style={{columnGap: 10}}>
                                        <b className='text-white text-shadow'>{splitAndCapitalize(value.name, "-", " ")}</b>
                                        <Type hideText={true} block={true} shadow={true} height={20} color={'white'} arr={value.pokemonData.types} />
                                    </div>
                                    <div className="d-flex" style={{columnGap: 10}}>
                                        <TypeBadge grow={true} find={true} title="Fast Move" color={'white'} move={value.fmove}
                                        elite={value.combatPoke.eliteQuickMoves.includes(value.fmove.name)}/>
                                        <TypeBadge grow={true} find={true} title="Primary Charged Move" color={'white'} move={value.cmovePri}
                                        elite={value.combatPoke.eliteCinematicMoves.includes(value.cmovePri.name)}
                                        shadow={value.combatPoke.shadowMoves.includes(value.cmovePri.name)}
                                        purified={value.combatPoke.purifiedMoves.includes(value.cmovePri.name)}/>
                                        {value.cmoveSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={value.cmoveSec}
                                        elite={value.combatPoke.eliteCinematicMoves.includes(value.cmoveSec.name)}
                                        shadow={value.combatPoke.shadowMoves.includes(value.cmoveSec.name)}
                                        purified={value.combatPoke.purifiedMoves.includes(value.cmoveSec.name)}/>}
                                    </div>
                                </div>
                                <div className="d-flex filter-shadow align-items-center" style={{marginRight: 35, columnGap: 30}}>
                                    <div className="text-center" style={{width: 120}}>
                                        <span className="ranking-score score-ic">{value.teamScore}</span>
                                    </div>
                                    <div className="text-center" style={{width: 160}}>
                                        <span className="ranking-score score-ic">{value.individualScore}</span>
                                    </div>
                                    <div style={{width: 'fit-content'}} className="text-center ranking-score score-ic">
                                        {(value.games*100/value.performersTotalGames).toFixed(2)}
                                        <span className="caption text-black">{value.games}/{value.performersTotalGames}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <hr />
                <h2>Top Team Pokémon</h2>
                <div className="d-grid ranking-container">
                    <div className="ranking-group w-100 ranking-header" style={{columnGap: '1rem'}}>
                        <div className="ranking-score">Team</div>
                        <div className="d-flex" style={{marginRight: 20, columnGap: 60}}>
                            <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSortedTeamBy("teamScore");if (sortedTeamBy === "teamScore") setSortedTeam(!sortedTeam);}}>
                                <span className={"ranking-sort ranking-score"+(sortedTeamBy === "teamScore" ? " ranking-selected":"")}>
                                    Team Score
                                    {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                </span>
                            </div>
                            <div className="text-center" style={{width: 'max-content'}} onClick={() => {setSortedTeamBy("games");if (sortedTeamBy === "games") setSortedTeam(!sortedTeam);}}>
                                <span className={"ranking-sort ranking-score"+(sortedTeamBy === "games" ? " ranking-selected":"")}>
                                    Usage
                                    {sortedTeam ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Accordion alwaysOpen>
                    {rankingData.teams
                    .sort((a,b) => sortedTeam ? b[sortedTeamBy]-a[sortedTeamBy] : a[sortedTeamBy]-b[sortedTeamBy]).map((value, index) => (
                        <Accordion.Item key={index} eventKey={index}>
                            <Accordion.Header>
                                <div className="d-flex align-items-center w-100 justify-content-between" style={{gap: 15}}>
                                    <div className="d-flex" style={{gap: 15}}>
                                    {value.teamData.map((value, index) => (
                                        <div className="text-center" key={index}>
                                            <div className="d-flex justify-content-center">
                                                <div className="position-relative filter-shadow" style={{width: 96}}>
                                                    {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                                    {value.purified && <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()}/>}
                                                    <img alt='img-league' className="pokemon-sprite" src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}/>
                                                </div>
                                            </div>
                                            <b className="text-black">{splitAndCapitalize(value.name, "-", " ")}</b>
                                        </div>
                                    ))}
                                    </div>
                                    <div className="d-flex align-items-center" style={{marginRight: 15, columnGap: 30}}>
                                        <div className="text-center" style={{width: 200}}>
                                            <span className="ranking-score score-ic">{value.teamScore}</span>
                                        </div>
                                        <div style={{width: 'fit-content'}} className="text-center ranking-score score-ic">
                                            {(value.games*100/value.teamsTotalGames).toFixed(2)}
                                            <span className="caption text-black">{value.games}/{value.teamsTotalGames}</span>
                                        </div>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body style={{padding: 0}}>
                                <Fragment>
                                    {value.teamData.map((value, index) => (
                                        <div className="d-flex align-items-center" key={index} style={{padding: 15, gap: '1rem', backgroundImage: computeBgType(value.pokemonData.types, value.shadow, value.purified)}}>
                                            <Link to={`/pvp/${params.cp}/overall/${value.speciesId.replaceAll("_", "-")}`} target="_blank"><VisibilityIcon className="view-pokemon" fontSize="large" sx={{color: 'black'}}/></Link>
                                            <div className="d-flex justify-content-center">
                                                <div className="position-relative filter-shadow" style={{width: 96}}>
                                                    {value.shadow && <img height={48} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                                    {value.purified && <img height={48} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()}/>}
                                                    <img alt='img-league' className="pokemon-sprite" src={value.form ? APIService.getPokemonModel(value.form) : APIService.getPokeFullSprite(value.id)}/>
                                                </div>
                                            </div>
                                            <div className="ranking-group">
                                                <div>
                                                    <div className="d-flex align-items-center" style={{columnGap: 10}}>
                                                        <b className='text-white text-shadow'>{splitAndCapitalize(value.name, "-", " ")}</b>
                                                        <Type hideText={true} block={true} shadow={true} height={20} color={'white'} arr={value.pokemonData.types} />
                                                    </div>
                                                    <div className="d-flex" style={{gap: 10}}>
                                                        <TypeBadge grow={true} find={true} title="Fast Move" color={'white'} move={value.fmove}
                                                        elite={value.combatPoke.eliteQuickMoves.includes(value.fmove.name)}/>
                                                        <TypeBadge grow={true} find={true} title="Primary Charged Move" color={'white'} move={value.cmovePri}
                                                        elite={value.combatPoke.eliteCinematicMoves.includes(value.cmovePri.name)}
                                                        shadow={value.combatPoke.shadowMoves.includes(value.cmovePri.name)}
                                                        purified={value.combatPoke.purifiedMoves.includes(value.cmovePri.name)}/>
                                                        {value.cmoveSec && <TypeBadge grow={true} find={true} title="Secondary Charged Move" color={'white'} move={value.cmoveSec}
                                                        elite={value.combatPoke.eliteCinematicMoves.includes(value.cmoveSec.name)}
                                                        shadow={value.combatPoke.shadowMoves.includes(value.cmoveSec.name)}
                                                        purified={value.combatPoke.purifiedMoves.includes(value.cmoveSec.name)}/>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Fragment>
                            </Accordion.Body>
                        </Accordion.Item>
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

export default TeamPVP