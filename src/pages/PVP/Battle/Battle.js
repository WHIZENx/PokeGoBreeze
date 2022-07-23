import { Fragment, useCallback, useEffect, useState } from "react";

import pokemonData from '../../../data/pokemon.json';

import Select from "./Select";
import APIService from "../../../services/API.service";
import { convertNameRankingToOri, splitAndCapitalize } from "../../../util/Utils";
import { findAssetForm } from "../../../util/Compute";
import { calculateStatsBattle, calculateStatsByTag, getTypeEffective } from "../../../util/Calculate";
import { SHADOW_ATK_BONUS, STAB_MULTIPLY } from "../../../util/Constants";
import { Accordion, Form } from "react-bootstrap";
import TypeBadge from "../../../components/Sprites/TypeBadge/TypeBadge";
import { TimeLine, TimeLineFit, TimeLineVertical } from "./Timeline";
import { Checkbox, FormControlLabel, Radio, RadioGroup } from "@mui/material";

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import CircleBar from "../../../components/Sprites/ProgressBar/Circle";

const Battle = () => {

    const [data, setData] = useState(null);
    const [options, setOptions] = useState({
        showTap: false,
        timelineType: 0,
        league: 10000
    });
    const {showTap, timelineType, league} = options;

    var timelineInterval = null;
    var turnInterval = null;

    const [pokemonCurr, setPokemonCurr] = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        energy: 0,
        block: 2
    })

    const [pokemonObj, setPokemonObj] = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        energy: 0,
        block: 2
    })

    const State = (timer, type, color, size, tap, block, energy, hp, move, immune, buff) => {
        return {
            timer: timer ?? 0,
            type: type,
            move: move,
            color: color,
            size: size ?? 12,
            tap: tap ?? false,
            block: block ?? 0,
            energy: energy ?? 0,
            hp: hp ?? 0,
            dmgImmune: immune ?? false
        }
    }

    const calculateMoveDmgActual = (poke, pokeObj, move) => {
        const atkPoke = calculateStatsBattle(poke.stats.atk, poke.bestStats.IV.atk, poke.bestStats.level, true);
        const defPokeObj = calculateStatsBattle(pokeObj.stats.def, pokeObj.bestStats.IV.def, pokeObj.bestStats.level, true);
        return atkPoke*move.pvp_power*(poke.pokemon.types.includes(move.type) ? STAB_MULTIPLY : 1)*(poke.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(move.type, pokeObj.pokemon.types) : 1)/defPokeObj;
    }

    const Pokemon = (poke) => {
        return {
            hp: calculateStatsBattle(poke.pokemonData.stats.sta, poke.pokemonData.bestStats.IV.sta, poke.pokemonData.bestStats.level, true),
            stats: poke.pokemonData.stats,
            bestStats: poke.pokemonData.bestStats,
            pokemon: poke.pokemonData.pokemon,
            fmove: poke.fMove,
            cmove: poke.cMovePri,
            cmoveSec: poke.cMoveSec === "" ? null : poke.cMoveSec,
            energy: poke.energy ?? 0,
            block: poke.block ?? 2,
            turn: Math.ceil(poke.fMove.durationMs/500)
        }
    }

    const battleAnimation = () => {
        clearInterval(timelineInterval);
        clearInterval(turnInterval);

        let player1 = Pokemon(pokemonCurr);
        let player2 = Pokemon(pokemonObj);

        // console.log(player1, player2)

        let timelinePri = [];
        let timelineSec = [];

        let timer = -1;
        let tapPri, fastPriDelay = 0, preChargePri, immunePri, chargedPri, chargedPriCount = 0;
        let tapSec, fastSecDelay = 0, preChargeSec, immuneSec, chargedSec, chargedSecCount = 0;
        let chargeType;
        timelineInterval = setInterval(() => {
            timer += 1;
            timelinePri.push(State(timer, null, null, null, null, player1.block, player1.energy, player1.hp));
            timelineSec.push(State(timer, null, null, null, null, player2.block, player2.energy, player2.hp));
            if (!chargedPri && !chargedSec) {
                if (!preChargeSec && (player1.energy >= Math.abs(player1.cmove.pvp_energy) || (player1.cmoveSec && player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)))) {
                    if (player1.energy >= Math.abs(player1.cmove.pvp_energy)) {
                        chargeType = 1;
                        player1.energy += player1.cmove.pvp_energy;
                        timelinePri[timer] = {...timelinePri[timer], type: "P", color: player1.cmove.type.toLowerCase(), size: 12, move: player1.cmove};
                    }
                    if (player1.cmoveSec && player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player1.energy += player1.cmoveSec.pvp_energy;
                        timelinePri[timer] = {...timelinePri[timer], type: "P", color: player1.cmoveSec.type.toLowerCase(), size: 12, move: player2.cmoveSec};
                    }
                    if (tapSec) immuneSec = true;
                    preChargePri = true;
                    chargedPriCount = 16;
                }

                if (!preChargePri && (player2.energy >= Math.abs(player2.cmove.pvp_energy) || (player2.cmoveSec && player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)))) {
                    if (player2.energy >= Math.abs(player2.cmove.pvp_energy)) {
                        chargeType = 1;
                        player2.energy += player2.cmove.pvp_energy;
                        timelineSec[timer] = {...timelineSec[timer], type: "P", color: player2.cmove.type.toLowerCase(), size: 12, move: player2.cmove};
                    }
                    if (player2.cmoveSec && player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player2.energy += player2.cmoveSec.pvp_energy;
                        timelineSec[timer] = {...timelineSec[timer], type: "P", color: player2.cmoveSec.type.toLowerCase(), size: 12, move: player2.cmoveSec};
                    }
                    if (tapPri) immunePri = true;
                    preChargeSec = true;
                    chargedSecCount = 16;
                }

                if (!preChargePri) {
                    if (!tapPri) {
                        tapPri = true;
                        if (!preChargeSec) timelinePri[timer] = {...timelinePri[timer], tap: true, move: player1.fmove};
                        else timelinePri[timer].tap = false;
                        fastPriDelay = player1.turn-1;
                    } else {
                        if (timelinePri[timer]) timelinePri[timer].tap = false;
                    }

                    if (tapPri && fastPriDelay === 0) {
                        tapPri = false;
                        if (!preChargeSec) player2.hp -= calculateMoveDmgActual(player1, player2, player1.fmove);
                        player1.energy += player1.fmove.pvp_energy;
                        timelinePri[timer] = {...timelinePri[timer], type: "F", color: player1.fmove.type.toLowerCase(), move: player1.fmove, dmgImmune: preChargeSec, tap: preChargeSec && player1.turn === 1 ? true : timelinePri[timer].tap};
                    } else {
                        fastPriDelay -= 1;
                        if (!preChargePri) timelinePri[timer].type = "W";
                    }
                }

                if (!preChargeSec) {
                    if (!tapSec) {
                        tapSec = true;
                        if (!preChargePri) timelineSec[timer] = {...timelineSec[timer], tap: true, move: player2.fmove};
                        else timelineSec[timer].tap = false;
                        fastSecDelay = player2.turn-1;
                    } else {
                        if (timelineSec[timer]) timelineSec[timer].tap = false;
                    }

                    if (tapSec && fastSecDelay === 0) {
                        tapSec = false;
                        if (!preChargePri) player1.hp -= calculateMoveDmgActual(player2, player1, player2.fmove);
                        else immuneSec = true;
                        player2.energy += player2.fmove.pvp_energy;
                        timelineSec[timer] = {...timelineSec[timer], type: "F", color: player2.fmove.type.toLowerCase(), move: player2.fmove, dmgImmune: preChargePri, tap: preChargePri && player2.turn === 1 ? true : timelineSec[timer].tap};
                    } else {
                        fastSecDelay -= 1;
                        if (!preChargeSec) timelineSec[timer].type = "W";
                    }
                }
            } else {
                if (chargedPri) {
                    if (isDelay || chargedPriCount % 2 === 0) timelinePri[timer].type = "N";
                    else {
                        if (chargeType === 1) timelinePri[timer] = {...timelinePri[timer], type: chargedPriCount === -1 ? "C" : "S", color: player1.cmove.type.toLowerCase(), size: timelinePri[timer-2].size+2, move: player1.cmove};
                        if (chargeType === 2) timelinePri[timer] = {...timelinePri[timer], type: chargedPriCount === -1 ? "C" : "S", color: player1.cmoveSec.type.toLowerCase(), size: timelinePri[timer-2].size+2, move: player1.cmoveSec};
                    }
                    if (timelinePri[timer-2]) timelineSec[timer-2].size = timelinePri[timer-2].size;
                } else {
                    if (!isDelay && player1.block > 0 && chargedSecCount === -1) timelinePri[timer].type = "B";
                }
                if (chargedSec) {
                    if (isDelay || chargedSecCount % 2 === 0) timelineSec[timer].type = "N";
                    else {
                        if (chargeType === 1) timelineSec[timer] = {...timelineSec[timer], type: chargedSecCount === -1 ? "C" : "S", color: player2.cmove.type.toLowerCase(), size: timelineSec[timer-2].size+2, move: player2.cmove};
                        if (chargeType === 2) timelineSec[timer] = {...timelineSec[timer], type: chargedSecCount === -1 ? "C" : "S", color: player2.cmoveSec.type.toLowerCase(), size: timelineSec[timer-2].size+2, move: player2.cmoveSec};
                    }
                    if (timelineSec[timer-2]) timelinePri[timer-2].size = timelineSec[timer-2].size;
                } else {
                    if (!isDelay && player2.block > 0 && chargedPriCount === -1) timelineSec[timer].type = "B";
                }
                timelinePri[timer].tap = false;
                timelineSec[timer].tap = false;
            }
        }, 1);
        let isDelay = false, delay = 1;
        turnInterval = setInterval(() => {

            if (!isDelay) {
                if (chargedPri) {
                    if (chargedPriCount >= 0) chargedPriCount--;
                    else {
                        if (player2.block === 0) {
                            if (chargeType === 1) player2.hp -= calculateMoveDmgActual(player1, player2, player1.cmove);
                            if (chargeType === 2) player2.hp -= calculateMoveDmgActual(player1, player2, player1.cmoveSec);
                        }
                        else player2.block -= 1;
                        const moveType = chargeType === 1 ? player1.cmove : player1.cmoveSec;
                        let arrBufAtk = [], arrBufTarget = [];
                        const randInt = parseFloat((Math.random()).toFixed(3))
                        if (moveType.buffs.length > 0 && randInt > 0 && randInt <= moveType.buffs[0].buffChance) {
                            moveType.buffs.forEach((value, index) => {
                                if (value.target === "target") {
                                    player2 = {
                                        ...player2,
                                        stats: {
                                            ...player2.stats,
                                            atk: value.type === "atk" ? player2.stats.atk+value.power : player2.stats.atk,
                                            def: value.type === "def" ? player2.stats.def+value.power : player2.stats.def
                                        }
                                    }
                                    arrBufTarget.push(value);
                                } else {
                                    player1 = {
                                        ...player1,
                                        stats: {
                                            ...player1.stats,
                                            atk: value.type === "atk" ? player1.stats.atk+value.power : player1.stats.atk,
                                            def: value.type === "def" ? player1.stats.def+value.power : player1.stats.def
                                        }
                                    }
                                    arrBufAtk.push(value);
                                }
                                timelinePri[timer]["buff"] = arrBufAtk;
                                timelineSec[timer]["buff"] = arrBufTarget;
                            });
                        }
                        isDelay = true;
                        delay = 1;
                    }
                }
                else if (preChargePri) {
                    if (chargedPriCount === 16) chargedPri = true
                    else chargedPriCount--;
                }
                else if (chargedSec) {
                    if (chargedSecCount >= 0) chargedSecCount--;
                    else {
                        if (player1.block === 0) {
                            if (chargeType === 1) player1.hp -= calculateMoveDmgActual(player2, player1, player2.cmove);
                            if (chargeType === 2) player1.hp -= calculateMoveDmgActual(player2, player1, player2.cmoveSec);
                        }
                        else player1.block -= 1;
                        const moveType = chargeType === 1 ? player2.cmove : player2.cmoveSec;
                        let arrBufAtk = [], arrBufTarget = [];
                        const randInt = parseFloat((Math.random()).toFixed(3))
                        if (moveType.buffs.length > 0 && randInt > 0 && randInt <= moveType.buffs[0].buffChance) {
                            moveType.buffs.forEach((value, index) => {
                                if (value.target === "target") {
                                    player1 = {
                                        ...player1,
                                        stats: {
                                            ...player1.stats,
                                            atk: value.type === "atk" ? player1.stats.atk+value.power : player1.stats.atk,
                                            def: value.type === "def" ? player1.stats.def+value.power : player1.stats.def
                                        }
                                    }
                                    arrBufTarget.push(value);
                                } else {
                                    player2 = {
                                        ...player2,
                                        stats: {
                                            ...player2.stats,
                                            atk: value.type === "atk" ? player2.stats.atk+value.power : player2.stats.atk,
                                            def: value.type === "def" ? player2.stats.def+value.power : player2.stats.def
                                        }
                                    }
                                    arrBufAtk.push(value);
                                }
                                timelinePri[timer]["buff"] = arrBufTarget;
                                timelineSec[timer]["buff"] = arrBufAtk;
                            });
                        }
                        isDelay = true;
                        delay = 1;
                    }
                }
                else if (preChargeSec) {
                    if (chargedSecCount === 16) chargedSec = true;
                    else chargedSecCount--;
                }
            } else {
                if (delay === 0) {
                    isDelay = false;
                    if (chargedPri) {
                        chargedPri = false;
                        preChargePri = false;
                    }
                    if (chargedSec) {
                        chargedSec = false;
                        preChargeSec = false;
                    }
                    tapPri = false;
                    tapSec = false;
                    if (immunePri) {
                        player2.hp -= calculateMoveDmgActual(player1, player2, player1.fmove);
                        timelinePri[timer].dmgImmune = true;
                    }
                    else if (immuneSec) {
                        player1.hp -= calculateMoveDmgActual(player2, player1, player2.fmove);
                        timelineSec[timer].dmgImmune = true;
                    }
                    immunePri = false;
                    immuneSec = false;
                } else {
                    delay -= 1;
                }
            }
            // console.log("Turn:", timer, player1.hp, player2.hp)
            if (player1.hp <= 0 || player2.hp <= 0) {
                clearInterval(timelineInterval);
                clearInterval(turnInterval);
                // console.log(timelinePri, timelineSec);
                if (player1.hp <= 0) {
                    timelinePri.push(State(timer, "X"))
                    if (timelinePri.length === timelineSec.length) timelineSec[timelineSec.length-1] = State(timer, "Q");
                    else timelineSec.push(State(timer, "Q"))
                }
                else if (player2.hp <= 0) {
                    timelineSec.push(State(timer, "X"))
                    if (timelinePri.length === timelineSec.length) timelinePri[timelinePri.length-1] = State(timer, "Q");
                    else timelinePri.push(State(timer, "Q"))
                }
                if (timelinePri.length === timelineSec.length) {
                    setPokemonCurr({...pokemonCurr, timeline: timelinePri});
                    setPokemonObj({...pokemonObj, timeline: timelineSec});
                } else {
                    battleAnimation();
                }
                // console.log(timelinePri, timelineSec)
            }
        }, 1);
    }

    const clearData = useCallback(() => {
        setPokemonObj({
            pokemonData: null,
            fMove: null,
            cMovePri: null,
            cMoveSec: null,
            timeline: [],
            energy: 0,
            block: 2
        });
        setPokemonCurr({
            pokemonData: null,
            fMove: null,
            cMovePri: null,
            cMoveSec: null,
            timeline: [],
            energy: 0,
            block: 2
        });
    }, []);

    useEffect(() => {
        const fetchPokemon = async () => {
            let file = (await APIService.getFetchUrl(APIService.getRankingFile("all", league, "overall"))).data;
            clearData();
            pokemonData = Object.values(pokemonData);
            file = file.filter(pokemon => !pokemon.speciesId.includes("shadow") && !pokemon.speciesId.includes("_xs")).map(item => {
                const name = convertNameRankingToOri(item.speciesId, item.speciesName);
                const pokemon = pokemonData.find(pokemon => pokemon.slug === name);
                const id = pokemon.num;
                const form = findAssetForm(pokemon.num, pokemon.name);

                const stats = calculateStatsByTag(pokemon.baseStats, pokemon.forme);

                return {
                    ...item,
                    name: name,
                    pokemon: pokemon,
                    id: id,
                    form: form,
                    stats: stats
                }
            });
            setData(file)
        }
        fetchPokemon();
    }, [league, clearData])

    const clearDataPokemonCurr = (removeCMoveSec) => {
        if (removeCMoveSec) {
            setPokemonCurr({...pokemonCurr, cMoveSec: ""});
        } else {
            setPokemonObj({...pokemonObj,
                timeline: [],
            })
            setPokemonCurr({...pokemonCurr,
                pokemonData: null,
                fMove: null,
                cMovePri: null,
                cMoveSec: null,
                timeline: [],
                energy: 0,
                block: 2
            });
        }
    }

    const clearDataPokemonObj = (removeCMoveSec) => {
        if (removeCMoveSec) {
            setPokemonObj({...pokemonObj, cMoveSec: ""});
        } else {
            setPokemonCurr({...pokemonCurr,
                timeline: [],
            })
            setPokemonObj({...pokemonObj,
                pokemonData: null,
                fMove: null,
                cMovePri: null,
                cMoveSec: null,
                timeline: [],
                energy: 0,
                block: 2
            });
        }
    }

    // const calculateState = () => {

    // }

    const findBuff = (move) => {
        if (move.buffs.length === 0) return;
        return (
            <div className="bufs-container d-flex flex-row" style={{columnGap: 5}}>
                {move.buffs.map((value, index) => (
                    <div key={index} className="d-flex position-relative" style={{columnGap: 5}}>
                        <img width={15} height={15} alt="img-atk" src={value.type === "atk" ? atk_logo : def_logo}/>
                        <div className="position-absolute icon-buff">
                            {value.power === 2 ?
                            <KeyboardDoubleArrowUpIcon fontSize="small" sx={{color : value.power < 0 ? "red" : "green"}}/>
                            :
                            <Fragment>
                                {value.power === 1 ?
                                <KeyboardArrowUpIcon fontSize="small" sx={{color : value.power < 0 ? "red" : "green"}}/>
                                :
                                <Fragment>
                                    {value.power === -1 ?
                                    <KeyboardArrowDownIcon fontSize="small" sx={{color : value.power < 0 ? "red" : "green"}}/>
                                    :
                                    <KeyboardDoubleArrowDownIcon fontSize="small" sx={{color : value.power < 0 ? "red" : "green"}}/>
                                    }
                                </Fragment>
                                }
                            </Fragment>
                            }
                            <span className={(value.power < 0 ? "text-danger" : "text-success")} style={{fontSize: 12}}>{value.power}</span>
                        </div>
                        <b style={{fontSize: 12}}>{value.buffChance*100}%</b>
                    </div>
                ))}
            </div>
        )
    }

    const renderInfoPokemon = (pokemon, setPokemon) => {
        return (
            <Accordion defaultActiveKey={['0']} alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>
                        Information
                    </Accordion.Header>
                    <Accordion.Body>
                        <div className="w-100 d-flex justify-content-center">
                            <div className="position-relative filter-shadow" style={{width: 128}}>
                                <img alt='img-league' className="pokemon-sprite-raid" src={pokemon.pokemonData.form ?  APIService.getPokemonModel(pokemon.pokemonData.form) : APIService.getPokeFullSprite(pokemon.pokemonData.id)}/>
                            </div>
                        </div>
                        <h6><b>Stats</b></h6>
                        Attack: <b>{Math.floor(pokemon.pokemonData.bestStats.stats.statsATK)}</b><br/>
                        Defense: <b>{Math.floor(pokemon.pokemonData.bestStats.stats.statsDEF)}</b><br/>
                        HP: <b>{Math.floor(pokemon.pokemonData.bestStats.stats.statsSTA)}</b><br/>
                        CP: <b>{Math.floor(pokemon.pokemonData.bestStats.CP)}</b><br/>
                        <div className="element-top input-group">
                            <span className="input-group-text">Level</span>
                            <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.bestStats.level}
                            type="number"
                            step={0.5}
                            min={1}
                            max={51}
                            onInput={(e) => {
                                setPokemon({...pokemon, pokemonData: {...pokemon.pokemonData, bestStats: {...pokemon.pokemonData.bestStats, level: parseInt(e.target.value)}}});
                            }}/>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">Attack IV</span>
                            <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.bestStats.IV.atk}
                            type="number"
                            min={0}
                            max={15}
                            onInput={(e) => {
                                setPokemon({...pokemon, pokemonData: {...pokemon.pokemonData, bestStats: {...pokemon.pokemonData.bestStats, IV: {...pokemon.pokemonData.bestStats.IV, atk: parseInt(e.target.value)}}}});
                            }}/>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">Defense IV</span>
                            <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.bestStats.IV.def}
                            type="number"
                            min={0}
                            max={15}
                            onInput={(e) => {
                                setPokemon({...pokemon, pokemonData: {...pokemon.pokemonData, bestStats: {...pokemon.pokemonData.bestStats, IV: {...pokemon.pokemonData.bestStats.IV, def: parseInt(e.target.value)}}}});
                            }}/>
                        </div>
                        <div className="input-group">
                            <span className="input-group-text">HP IV</span>
                            <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.bestStats.IV.sta}
                            type="number"
                            min={0}
                            max={15}
                            onInput={(e) => {
                                setPokemon({...pokemon, pokemonData: {...pokemon.pokemonData, bestStats: {...pokemon.pokemonData.bestStats, IV: {...pokemon.pokemonData.bestStats.IV, sta: parseInt(e.target.value)}}}});
                            }}/>
                        </div>
                        <hr/>
                        <TypeBadge find={true} title="Fast Move" move={pokemon.fMove}/>
                        <div className="d-flex w-100 position-relative" style={{columnGap: 10}}>
                            <TypeBadge find={true} title="Primary Charged Move" move={pokemon.cMovePri}/>
                            {findBuff(pokemon.cMovePri)}
                        </div>
                        {pokemon.cMoveSec && pokemon.cMoveSec !== "" &&
                        <div className="d-flex w-100 position-relative" style={{columnGap: 10}}>
                            <TypeBadge find={true} title="Secondary Charged Move" move={pokemon.cMoveSec}/>
                            {findBuff(pokemon.cMoveSec)}
                        </div>
                        }
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        )
    }

    return (
        <div className="container element-top">
            <Form.Select onChange={(e) => setOptions({...options, league: parseInt(e.target.value)})} defaultValue={league}>
                <option value={500}>Little Cup</option>
                <option value={1500}>Great League</option>
                <option value={2500}>Ultra League</option>
                <option value={10000}>Master League</option>
            </Form.Select>
            <div className="row element-top" style={{margin: 0}}>
                <div className="col-xl-3">
                    <Select data={data} league={league} pokemonBattle={pokemonCurr} setPokemonBattle={setPokemonCurr} clearData={clearDataPokemonCurr}/>
                    {pokemonCurr.pokemonData &&
                        <Fragment>
                            <div className="input-group">
                                <span className="input-group-text">Energy</span>
                                <input className="form-control shadow-none" defaultValue={pokemonCurr.energy}
                                type="number"
                                min={0}
                                onInput={(e) => {
                                    setPokemonCurr({...pokemonCurr, energy: parseInt(e.target.value)});
                                }}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">Block</span>
                                <Form.Select style={{borderRadius: 0}} className="form-control" defaultValue={pokemonCurr.block}
                                    onChange={(e) => setPokemonCurr({...pokemonCurr, block: parseInt(e.target.value)})}>
                                        <option value={0}>0</option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                </Form.Select>
                            </div>
                            {renderInfoPokemon(pokemonCurr, setPokemonCurr)}
                            <div className="w-100 bg-type-moves">
                                <div className="text-center">
                                    <CircleBar type={pokemonCurr.cMovePri.type} size={80} maxEnergy={200} moveEnergy={Math.abs(pokemonCurr.cMovePri.pvp_energy)} energy={0}/>
                                    <span></span>
                                </div>
                                {pokemonCurr.cMoveSec && pokemonCurr.cMoveSec !== "" &&
                                <div className="text-center">
                                    <CircleBar type={pokemonCurr.cMoveSec.type} size={80} maxEnergy={200} moveEnergy={Math.abs(pokemonCurr.cMoveSec.pvp_energy)} energy={0}/>
                                    <span></span>
                                </div>
                                }
                            </div>
                        </Fragment>
                    }
                </div>
                <div className="col-xl-6">
                    {pokemonCurr.pokemonData && pokemonObj.pokemonData && pokemonCurr.timeline.length > 0 && pokemonObj.timeline.length > 0 &&
                    <Fragment>
                        <div className="d-flex timeline-vertical">
                            <div className="w-50">
                                <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-start" style={{gap: 10}}>
                                    <div className="position-relative filter-shadow" style={{width: 35}}>
                                        <img alt='img-league' className="sprite-type" src={pokemonCurr.pokemonData.form ?  APIService.getPokemonModel(pokemonCurr.pokemonData.form) : APIService.getPokeFullSprite(pokemonCurr.pokemonData.id)}/>
                                    </div>
                                    <b>{splitAndCapitalize(pokemonCurr.pokemonData.name, "-", " ")}</b>
                                </div>
                            </div>
                            <div className="w-50">
                                <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-end" style={{gap: 10}}>
                                    <div className="position-relative filter-shadow" style={{width: 35}}>
                                        <img alt='img-league' className="sprite-type" src={pokemonObj.pokemonData.form ?  APIService.getPokemonModel(pokemonObj.pokemonData.form) : APIService.getPokeFullSprite(pokemonObj.pokemonData.id)}/>
                                    </div>
                                    <b>{splitAndCapitalize(pokemonObj.pokemonData.name, "-", " ")}</b>
                                </div>
                            </div>
                        </div>
                        {TimeLineVertical(pokemonCurr, pokemonObj)}
                        <div>
                            {timelineType ?
                                <Fragment>{TimeLine(pokemonCurr, pokemonObj, showTap)}</Fragment>
                                :
                                <Fragment>{TimeLineFit(pokemonCurr, pokemonObj, showTap)}</Fragment>
                            }
                            <div className="d-flex justify-content-center">
                                <FormControlLabel control={<Checkbox checked={showTap} onChange={(event, check) => setOptions({...options, showTap: check})}/>} label="Show Tap Move" />
                                <RadioGroup
                                    row
                                    aria-labelledby="row-timeline-group-label"
                                    name="row-timeline-group"
                                    value={timelineType}
                                    onChange={(e) =>  setOptions({...options, timelineType: parseInt(e.target.value)})}>
                                    <FormControlLabel value={0} control={<Radio />} label={<span>Fit Timeline</span>} />
                                    <FormControlLabel value={1} control={<Radio />} label={<span>Normal Timeline</span>} />
                                </RadioGroup>
                            </div>
                        </div>
                    </Fragment>
                    }
                </div>
                <div className="col-xl-3">
                    <Select data={data} league={league} pokemonBattle={pokemonObj} setPokemonBattle={setPokemonObj} clearData={clearDataPokemonObj}/>
                    {pokemonObj.pokemonData &&
                        <Fragment>
                            <div className="input-group">
                                <span className="input-group-text">Energy</span>
                                <input className="form-control shadow-none" defaultValue={pokemonObj.energy}
                                type="number"
                                min={0}
                                onInput={(e) => {
                                    setPokemonObj({...pokemonObj, energy: parseInt(e.target.value)});
                                }}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">Block</span>
                                <Form.Select style={{borderRadius: 0}} className="form-control" defaultValue={pokemonObj.block}
                                    onChange={(e) => setPokemonObj({...pokemonObj, block: parseInt(e.target.value)})}>
                                        <option value={0}>0</option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                </Form.Select>
                            </div>
                            {renderInfoPokemon(pokemonObj)}
                            <div className="w-100 bg-type-moves">
                                <div className="text-center">
                                    <CircleBar type={pokemonObj.cMovePri.type} size={80} maxEnergy={200} moveEnergy={Math.abs(pokemonObj.cMovePri.pvp_energy)} energy={0}/>
                                    <span></span>
                                </div>
                                {pokemonObj.cMoveSec && pokemonObj.cMoveSec !== "" &&
                                <div className="text-center">
                                    <CircleBar type={pokemonObj.cMoveSec.type} size={80} maxEnergy={200} moveEnergy={Math.abs(pokemonObj.cMoveSec.pvp_energy)} energy={0}/>
                                    <span></span>
                                </div>
                                }
                            </div>
                        </Fragment>
                    }
                </div>
            </div>
            <div className="text-center element-top">
                <button className="btn btn-primary" onClick={() => battleAnimation()}>Battle Simulator</button>
            </div>
        </div>
    )
}

export default Battle;