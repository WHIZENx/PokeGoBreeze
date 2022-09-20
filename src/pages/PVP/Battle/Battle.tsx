import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";

import pokemonData from '../../../data/pokemon.json';

import Select from "./Select";
import APIService from "../../../services/API.service";
import { capitalize, convertNameRankingToOri, splitAndCapitalize } from "../../../util/Utils";
import { findAssetForm } from "../../../util/Compute";
import { calculateCP, calculateStatsBattle, calculateStatsByTag, getTypeEffective } from "../../../util/Calculate";
import { SHADOW_ATK_BONUS, SHADOW_DEF_BONUS, STAB_MULTIPLY } from "../../../util/Constants";
import { Accordion, Button, Card, Form, useAccordionButton } from "react-bootstrap";
import TypeBadge from "../../../components/Sprites/TypeBadge/TypeBadge";
import { TimeLine, TimeLineFit, TimeLineVertical } from "./Timeline";
import { Checkbox, FormControlLabel, Radio, RadioGroup } from "@mui/material";

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import atk_logo from '../../../assets/attack.png';
import def_logo from '../../../assets/defense.png';
import hp_logo from '../../../assets/hp.png';
import CircleBar from "../../../components/Sprites/ProgressBar/Circle";
import ProgressBar from "../../../components/Sprites/ProgressBar/Bar";
import { useNavigate, useParams } from "react-router-dom";
import { RootStateOrAny, useDispatch, useSelector } from "react-redux";
import { hideSpinner, showSpinner } from "../../../store/actions/spinner.action";

import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useSnackbar } from "notistack";

const Battle = () => {

    const dispatch = useDispatch();
    const dataStore = useSelector((state: RootStateOrAny) => state.store.data);
    const params = useParams();
    const navigate = useNavigate();

    const { enqueueSnackbar } = useSnackbar();
    const [openBattle, setOpenBattle] = useState(false)
    const [data, setData] = useState(null);
    const [options, setOptions] = useState({
        showTap: false,
        timelineType: 0,
        league: params.cp ? parseInt(params.cp) : 500
    });
    const {showTap, timelineType, league}: any = options;

    const [leftFit, setLeftFit] = useState(0);
    const [leftNormal, setLeftNormal] = useState(0);

    const timelineFit: any = useRef();
    const timelineNormal: any = useRef();
    const timelineNormalContainer: any = useRef();
    const playLine: any = useRef();

    let timelineInterval: any;
    let turnInterval: any;

    const [pokemonCurr, setPokemonCurr]: any = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        energy: 0,
        block: 2,
        shadow: false,
        disableCMovePri: false,
        disableCMoveSec: false
    })

    const [pokemonObj, setPokemonObj]: any = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null,
        timeline: [],
        energy: 0,
        block: 2,
        shadow: false,
        disableCMovePri: false,
        disableCMoveSec: false
    })

    const [playTimeline, setPlayTimeline]: any = useState({
        pokemonCurr: {hp: 0, energyPri: 0, energySec: 0},
        pokemonObj: {hp: 0, energyPri: 0, energySec: 0}
    });

    const State = (timer: number, type: string | null, color: null, size: null, tap: null, block: null, energy: any, hp: number, move = null, immune= null) => {
        return {
            timer: timer ?? 0,
            type: type,
            move: move,
            color: color,
            size: size ?? 12,
            tap: tap ?? false,
            block: block ?? 0,
            energy: energy ?? 0,
            hp: hp ? Math.max(0, hp) : 0,
            dmgImmune: immune ?? false,
            buff: null
        }
    }

    const calculateMoveDmgActual = (
        poke: { shadow: boolean; hp?: any; stats: any; currentStats: any; pokemon: any; fmove?: any; cmove?: any; cmoveSec?: any; energy?: any; block?: any; turn?: number;},
        pokeObj: { shadow: boolean; hp?: any; stats: any; currentStats: any; pokemon: any; fmove?: any; cmove?: any; cmoveSec?: any; energy?: any; block?: any; turn?: number; },
        move: { pvp_power: number; type: string; }) => {
        const atkPoke = calculateStatsBattle(poke.stats.atk, poke.currentStats.IV.atk, poke.currentStats.level, true);
        const defPokeObj = calculateStatsBattle(pokeObj.stats.def, pokeObj.currentStats.IV.def, pokeObj.currentStats.level, true);
        poke.shadow = poke.shadow ?? false;
        pokeObj.shadow = pokeObj.shadow ?? false;
        return atkPoke
        *move.pvp_power
        *(poke.pokemon.types.includes(move.type) ? STAB_MULTIPLY(dataStore.options) : 1)
        *(poke.shadow ? SHADOW_ATK_BONUS(dataStore.options) : 1)
        *(getTypeEffective(move.type, pokeObj.pokemon.types))/(defPokeObj*(pokeObj.shadow ? SHADOW_DEF_BONUS(dataStore.options) : 1));
    }

    const Pokemon = (poke: {
        disableCMoveSec: any;
        disableCMovePri: any;
        shadow: any;
        pokemonData: any;
        fMove: any;
        cMovePri: any;
        cMoveSec: any;
        timeline?: any[];
        energy: any;
        block: any;
    }) => {
        return {
            hp: poke.pokemonData.currentStats.stats.statsSTA,
            stats: poke.pokemonData.stats,
            currentStats: poke.pokemonData.currentStats,
            bestStats: poke.pokemonData.bestStats,
            pokemon: poke.pokemonData.pokemon,
            fmove: poke.fMove,
            cmove: poke.cMovePri,
            cmoveSec: poke.cMoveSec === "" ? null : poke.cMoveSec,
            energy: poke.energy ?? 0,
            block: poke.block ?? 2,
            turn: Math.ceil(poke.fMove.durationMs/500),
            shadow: poke.shadow,
            disableCMovePri: poke.disableCMovePri,
            disableCMoveSec: poke.disableCMoveSec
        }
    }

    const battleAnimation = () => {
        if (pokemonCurr.timeline.length === 0 && pokemonObj.timeline.length === 0) arrBound.current = [];
        resetTimeLine();
        clearInterval(timelineInterval);
        clearInterval(turnInterval);

        let player1 = Pokemon(pokemonCurr);
        let player2 = Pokemon(pokemonObj);

        // console.log(pokemonCurr, player1, pokemonObj, player2)

        if (player1.disableCMovePri) {
            player1.cmove = player1.cmoveSec;
        }
        if (player1.disableCMoveSec) {
            player1.cmoveSec = player1.cmove;
        }

        if (player2.disableCMovePri) {
            player2.cmove = player2.cmoveSec;
        }
        if (player2.disableCMoveSec) {
            player2.cmoveSec = player2.cmove;
        }

        const timelinePri: {buff: any; timer: any; type: any; move: any; color: any; size: any; tap: any; block: any; energy: any; hp: number; dmgImmune: any;}[] = [];
        const timelineSec: {buff: any; timer: any; type: any; move: any; color: any; size: any; tap: any; block: any; energy: any; hp: number; dmgImmune: any; }[] = [];

        timelinePri.push(State(0, "W", null, null, null, player1.block, player1.energy, player1.hp));
        timelinePri.push(State(1, "W", null, null, null, player1.block, player1.energy, player1.hp));

        timelineSec.push(State(0, "W", null, null, null, player2.block, player2.energy, player2.hp));
        timelineSec.push(State(1, "W", null, null, null, player2.block, player2.energy, player2.hp));

        let timer = 1;
        let tapPri: boolean, fastPriDelay = 0, preChargePri: boolean, immunePri: boolean, chargedPri: boolean, chargedPriCount = 0;
        let tapSec: boolean, fastSecDelay = 0, preChargeSec: boolean, immuneSec: boolean, chargedSec: boolean, chargedSecCount = 0;
        let chargeType: number;
        timelineInterval = setInterval(() => {
            timer += 1;
            timelinePri.push(State(timer, null, null, null, null, player1.block, player1.energy, player1.hp));
            timelineSec.push(State(timer, null, null, null, null, player2.block, player2.energy, player2.hp));
            if (!chargedPri && !chargedSec) {
                if ((!player1.disableCMovePri || !player1.disableCMoveSec) && !preChargeSec && (player1.energy >= Math.abs(player1.cmove.pvp_energy) || (player1.cmoveSec && player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)))) {
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

                if ((!player2.disableCMovePri || !player2.disableCMoveSec) && !preChargePri && (player2.energy >= Math.abs(player2.cmove.pvp_energy) || (player2.cmoveSec && player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)))) {
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
                        const arrBufAtk: any[] = [], arrBufTarget: any[] = [];
                        const randInt = parseFloat((Math.random()).toFixed(3))
                        if (moveType.buffs.length > 0 && randInt > 0 && randInt <= moveType.buffs[0].buffChance) {
                            moveType.buffs.forEach((value: { target: string; type: string; power: any; }) => {
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
                                timelinePri[timer].buff = arrBufAtk;
                                timelineSec[timer].buff = arrBufTarget;
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
                        const arrBufAtk: any[] = [], arrBufTarget: any[] = [];
                        const randInt = parseFloat((Math.random()).toFixed(3))
                        if (moveType.buffs.length > 0 && randInt > 0 && randInt <= moveType.buffs[0].buffChance) {
                            moveType.buffs.forEach((value: { target: string; type: string; power: any; }) => {
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
                if (player1.hp <= 0) {
                    timelinePri.push(State(timer, "X", null, null, null, null, player1.energy, player1.hp))
                    if (player2.hp <= 0) {
                        timelineSec.push(State(timer, "X", null, null, null, null, player2.energy, player2.hp))
                    } else {
                        if (timelinePri.length === timelineSec.length) timelineSec[timelineSec.length-1] = State(timer, "Q", null, null, null, null, player2.energy, player2.hp);
                        else timelineSec.push(State(timer, "Q", null, null, null, null, player2.energy, player2.hp))
                    }
                }
                else if (player2.hp <= 0) {
                    timelineSec.push(State(timer, "X", null, null, null, null, player2.energy, player2.hp))
                    if (player1.hp <= 0) {
                        timelinePri.push(State(timer, "X", null, null, null, null, player1.energy, player1.hp))
                    } else {
                        if (timelinePri.length === timelineSec.length) timelinePri[timelinePri.length-1] = State(timer, "Q", null, null, null, null, player1.energy, player1.hp);
                        else timelinePri.push(State(timer, "Q", null, null, null, null, player1.energy, player1.hp))
                    }
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

    useEffect(() => {
        if (timelineType && arrBound.current.length === 0 && pokemonCurr.timeline.length > 0) {
            setTimeout(() => {
                for (let i = 0; i < pokemonCurr.timeline.length; i++) {
                    arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
                }
            }, 100)
        }
    }, [timelineType, pokemonCurr.timeline.length])

    const clearData = useCallback(() => {
        setPokemonObj({
            pokemonData: null,
            fMove: null,
            cMovePri: null,
            cMoveSec: null,
            timeline: [],
            energy: 0,
            block: 2,
            shadow: false,
            disableCMovePri: false,
            disableCMoveSec: false
        });
        setPokemonCurr({
            pokemonData: null,
            fMove: null,
            cMovePri: null,
            cMoveSec: null,
            timeline: [],
            energy: 0,
            block: 2,
            shadow: false,
            disableCMovePri: false,
            disableCMoveSec: false
        });
    }, []);

    useEffect(() => {
        const axios = APIService;
        const cancelToken = axios.getAxios().CancelToken;
        const source = cancelToken.source();
        const fetchPokemon = async () => {
            try {
                dispatch(showSpinner());
                clearData();
                let file = (await axios.getFetchUrl(axios.getRankingFile("all", parseInt(league), "overall"), {
                    cancelToken: source.token
                })).data;
                document.title = `PVP Battle Simalator - ${
                    parseInt(league) === 500 ? "Little Cup" :
                    parseInt(league) === 1500 ? "Great League" :
                    parseInt(league) === 2500 ? "Ultra League" :
                    "Master League"}`;

                file = file.filter((pokemon: { speciesId: string | string[]; }) => !pokemon.speciesId.includes("shadow") && !pokemon.speciesId.includes("_xs")).map((item: { speciesId: string; speciesName: string; }) => {
                    const name = convertNameRankingToOri(item.speciesId, item.speciesName);
                    const pokemon: any = Object.values(pokemonData).find((pokemon: { slug: string; }) => pokemon.slug === name);
                    const id = pokemon.num;
                    const form = findAssetForm(dataStore.assets, pokemon.num, pokemon.name);

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
                setData(file);
            } catch (e) {
                source.cancel();
            }
            dispatch(hideSpinner());
        }
        fetchPokemon();
    }, [dispatch, league, clearData, dataStore])

    const clearDataPokemonCurr = (removeCMoveSec: any) => {
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
                block: 2,
                shadow: false,
                disableCMovePri: false,
                disableCMoveSec: false
            });
        }
    }

    const clearDataPokemonObj = (removeCMoveSec: any) => {
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
                block: 2,
                shadow: false,
                disableCMovePri: false,
                disableCMoveSec: false
            });
        }
    }

    const timelinePlay: any = useRef(null);
    const [playState, setPlayState] = useState(false);
    const scrollWidth = useRef(0);
    const xFit = useRef(0);
    const xNormal = useRef(0);
    const arrBound: any = useRef([]);
    const onPlayLineMove = (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }) => {
        stopTimeLine();
        const clientX = timelineNormalContainer.current.getBoundingClientRect().left + 1;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left);
        xNormal.current = x + clientX;
        setLeftNormal(x);
        const range = pokemonCurr.timeline.length;
        overlappingNormal(range, arrBound.current);
    }

    const onPlayLineFitMove = (e: { currentTarget: { getBoundingClientRect: () => any; }; clientX: number; }) => {
        stopTimeLine();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, e.clientX - rect.left);
        xFit.current = x*100/timelineFit.current.clientWidth;
        setLeftFit(xFit.current);
        const range = pokemonCurr.timeline.length;
        const arr = []
        for (let i = 0; i < range; i++) {
            arr.push(document.getElementById(i.toString())?.getBoundingClientRect());
        }
        overlapping(range, arr);
    };

    const playTimeLine = () => {
        setPlayState(true);
        let x: number, clientX: number;
        const arr: any[] = [];
        const range = pokemonCurr.timeline.length;
        if (timelineType) {
            clientX = timelineNormalContainer.current.getBoundingClientRect().left + 1;
            timelineNormalContainer.current.scrollTo(Math.max(0, xNormal.current-clientX-(timelineNormalContainer.current.clientWidth/2)), 0);
        } else {
            x = xFit.current*timelineFit.current.clientWidth/100;
            for (let i = 0; i < range; i++) {
                arr.push(document.getElementById(i.toString())?.getBoundingClientRect());
            }
        }
        timelinePlay.current = setInterval(() => {
            if (timelineType) {
                xNormal.current += 1;
                setLeftNormal(xNormal.current - clientX);
                if ((xNormal.current - clientX) >= timelineNormalContainer.current.clientWidth/2) {
                    timelineNormalContainer.current.scrollIntoView({behavior: 'smooth'});
                    timelineNormalContainer.current.scrollTo(scrollWidth.current+1, 0);
                }
                if ((xNormal.current - clientX) > timelineNormal.current.clientWidth) stopTimeLine();
                overlappingNormal(range, arrBound.current)
            } else {
                xFit.current = x*100/timelineFit.current.clientWidth;
                setLeftFit(xFit.current);
                if (x > timelineFit.current.clientWidth) stopTimeLine();
                overlapping(range, arr);
                x += 1;
            }
        }, 0)
    }

    const stopTimeLine = () => {
        setPlayState(false);
        clearInterval(timelinePlay.current);
    }

    const resetTimeLine = () => {
        stopTimeLine();
        if (timelineType && timelineNormalContainer.current) {
            if (timelineNormalContainer.current) {
                xNormal.current = timelineNormalContainer.current.getBoundingClientRect().left + 1;
                timelineNormalContainer.current.scrollTo(0, 0);
            }
            setLeftNormal(0);
        } else {
            xFit.current = 0;
            setLeftFit(xFit.current);
        }
        setPlayTimeline({
            pokemonCurr: {hp: Math.floor(pokemonCurr.pokemonData.currentStats.stats.statsSTA), energy: 0},
            pokemonObj: {hp: Math.floor(pokemonObj.pokemonData.currentStats.stats.statsSTA), energy: 0}
        });
    }

    const overlappingNormal = (range: number, arr: any[]) => {
        const index = arr.filter((dom: { left: number; }) => dom.left <= xNormal.current).length;
        // console.log(index)
        if (index >= 0 && index < range) updateTimeine(index);
    }

    const overlapping = (range: number, arr: any[]) => {
        const rect1 = playLine.current.getBoundingClientRect();
        let index = arr.filter((dom: { left: number; }) => dom.left <= rect1.right).length;
        if (index === range) index -= 1;
        if (index >= 0 && index < range) updateTimeine(index);
    }

    const updateTimeine = (index: string | number) => {
        const pokeCurrData = pokemonCurr.timeline[index];
        const pokeObjData = pokemonObj.timeline[index];
        setPlayTimeline({
            pokemonCurr: {hp: pokeCurrData.hp, energy: pokeCurrData.energy},
            pokemonObj: {hp: pokeObjData.hp, energy: pokeObjData.energy}
        });
    }

    const onScrollTimeline = (e: { currentTarget: { scrollLeft: number; }; }) => {
        scrollWidth.current = e.currentTarget.scrollLeft;
    }

    const timelineNormalX = useRef(0);
    const onChangeTimeline = (type: number) => {
        stopTimeLine();
        let width: number, clientX;
        if (type) width = timelineFit.current.clientWidth;
        else width = timelineNormal.current.clientWidth;
        setOptions({...options, timelineType: type});
        setTimeout(() => {
            if (type) {
                clientX = timelineNormalContainer.current.getBoundingClientRect().left;
                timelineNormalX.current = clientX;
                xNormal.current = (xFit.current*timelineNormal.current.clientWidth/100) + clientX;
                setLeftNormal(xNormal.current - clientX);
                timelineNormalContainer.current.scrollTo(Math.max(0, xNormal.current-clientX-(timelineNormalContainer.current.clientWidth/2)), 0);
            } else {
                clientX = timelineNormalX.current;
                xFit.current = (xNormal.current-clientX)/width*100;
                setLeftFit(xFit.current);
            }
        }, 100)
    }

    const findBuff = (move: { buffs: any[]; }) => {
        if (move.buffs.length === 0) return;
        return (
            <div className="bufs-container d-flex flex-row" style={{columnGap: 5}}>
                {move.buffs.map((value: { type: string; power: number; buffChance: number; }, index: React.Key | null | undefined) => (
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

    const calculateStatPokemon = (e: any, type: string, pokemon: any, setPokemon: any) => {
        e.preventDefault();
        const level = parseInt((document.getElementById("level"+capitalize(type)) as HTMLInputElement).value);
        const atk = parseInt((document.getElementById("atkIV"+capitalize(type)) as HTMLInputElement).value);
        const def = parseInt((document.getElementById("defIV"+capitalize(type)) as HTMLInputElement).value);
        const sta = parseInt((document.getElementById("hpIV"+capitalize(type)) as HTMLInputElement).value);

        const cp: number = calculateCP(atk, def, sta, level);

        if (cp > parseInt(params.cp as any)) {
            enqueueSnackbar('This stats Pokemon CP is greater than ' + params.cp + ', which is not permitted by the league.', { variant: 'error' });
            return;
        }

        let stats = pokemon.pokemonData.allStats.find(
            (data: { level: number; IV: { atk: number; def: number; sta: number; }; }) =>
            data.level === level && data.IV.atk === atk && data.IV.def === def && data.IV.sta === sta
        )

        if (!stats) {
            const statsBattle = calculateStatsByTag(pokemon.pokemonData.pokemon.baseStats, pokemon.pokemonData.pokemon.forme);

            const statsATK = calculateStatsBattle(statsBattle.atk, atk, level);
            const statsDEF = calculateStatsBattle(statsBattle.def, def, level);
            const statsSTA = calculateStatsBattle(statsBattle.sta, sta, level);
            stats = {
                IV: {atk: atk, def: def, sta: sta},
                CP: cp,
                level: level,
                stats: {statsATK: statsATK, statsDEF: statsDEF, statsSTA: statsSTA},
                statsProds: statsATK*statsDEF*statsSTA,
            }
        }

        return setPokemon({
            ...pokemon,
            pokemonData: {
                ...pokemon.pokemonData,
                currentStats: stats
            }
        });
    }

    const onSetStats = (type: string, pokemon: any, setPokemon: any, isRandom: boolean) => {
        let stats: { level: string; IV: { atk: string; def: string; sta: string; }; };
        if (isRandom) {
            stats = pokemon.pokemonData.allStats[Math.floor(Math.random()*pokemon.pokemonData.allStats.length)];
        } else {
            stats = pokemon.pokemonData?.bestStats;
        }

        (document.getElementById("level"+capitalize(type)) as HTMLInputElement).value = stats.level;
        (document.getElementById("atkIV"+capitalize(type)) as HTMLInputElement).value = stats.IV.atk;
        (document.getElementById("defIV"+capitalize(type)) as HTMLInputElement).value = stats.IV.def;
        (document.getElementById("hpIV"+capitalize(type)) as HTMLInputElement).value = stats.IV.sta;

        return setPokemon({
            ...pokemon,
            pokemonData: {
                ...pokemon.pokemonData,
                currentStats: stats
            }
        });
    }

    const renderInfoPokemon = (type: string, pokemon: any, setPokemon: any) => {
        return (
            <Accordion defaultActiveKey={[]} alwaysOpen>
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
                        CP: <b>{Math.floor(pokemon.pokemonData.currentStats.CP)}</b> | Level: <b>{pokemon.pokemonData.currentStats.level}</b><br/>
                        <img style={{marginRight: 10}} alt='img-logo' width={20} height={20} src={atk_logo}/>Attack: <b>{Math.floor(pokemon.pokemonData.currentStats.stats.statsATK)}</b><br/>
                        <img style={{marginRight: 10}} alt='img-logo' width={20} height={20} src={def_logo}/>Defense: <b>{Math.floor(pokemon.pokemonData.currentStats.stats.statsDEF)}</b><br/>
                        <img style={{marginRight: 10}} alt='img-logo' width={20} height={20} src={hp_logo}/>HP: <b>{Math.floor(pokemon.pokemonData.currentStats.stats.statsSTA)}</b><br/>
                        <form onSubmit={(e: any) => {calculateStatPokemon(e, type, pokemon, setPokemon);}}>
                            <div className="element-top input-group">
                                <span className="input-group-text">Level</span>
                                <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.currentStats.level}
                                id={"level"+capitalize(type)}
                                type="number"
                                step={0.5}
                                min={1}
                                max={51}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">Attack IV</span>
                                <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.currentStats.IV.atk}
                                id={"atkIV"+capitalize(type)}
                                type="number"
                                step={1}
                                min={0}
                                max={15}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">Defense IV</span>
                                <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.currentStats.IV.def}
                                id={"defIV"+capitalize(type)}
                                type="number"
                                step={1}
                                min={0}
                                max={15}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">HP IV</span>
                                <input className="form-control shadow-none" defaultValue={pokemon.pokemonData.currentStats.IV.sta}
                                id={"hpIV"+capitalize(type)}
                                type="number"
                                step={1}
                                min={0}
                                max={15}/>
                            </div>
                            <div className="w-100 element-top">
                                <Button type="submit" className="w-100" color="primry">Calculate Stats</Button>
                            </div>
                        </form>
                        <div className="w-100 element-top">
                            <Button className="w-100" color="primry" onClick={() => onSetStats(type, pokemon, setPokemon, true)}>Set Random Stats</Button>
                        </div>
                        <div className="w-100 element-top">
                            <Button className="w-100" color="primry" onClick={() => onSetStats(type, pokemon, setPokemon, false)}>Set Best Stats</Button>
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

    const renderPokemonInfo = (type: string, pokemon: any, setPokemon: any, clearDataPokemon: any) => {
        return (
            <Fragment>
                <Select data={data} league={league} pokemonBattle={pokemon} setPokemonBattle={setPokemon} clearData={clearDataPokemon}/>
                    {pokemon.pokemonData &&
                        <Fragment>
                            <div className="input-group">
                                <span className="input-group-text">Energy</span>
                                <input className="form-control shadow-none" defaultValue={pokemon.energy}
                                type="number"
                                min={0}
                                onInput={(e: any) => {
                                    setPokemon({...pokemon, energy: parseInt(e.target.value)});
                                }}/>
                            </div>
                            <div className="input-group">
                                <span className="input-group-text">Block</span>
                                <Form.Select style={{borderRadius: 0}} className="form-control" defaultValue={pokemon.block}
                                    onChange={(e) => setPokemon({...pokemon, block: parseInt(e.target.value)})}>
                                        <option value={0}>0</option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                </Form.Select>
                            </div>
                            <div className="border-input" style={{padding: '0 8px'}}>
                                <FormControlLabel control={<Checkbox checked={pokemon.shadow ?? false} onChange={(event, check) => setPokemon({...pokemon, shadow: check})}/>}
                                label={<span><img height={32} alt="img-shadow" src={APIService.getPokeShadow()}/> Shadow</span>}/>
                            </div>
                            {renderInfoPokemon(type, pokemon, setPokemon)}
                            {pokemon.timeline.length > 0 &&
                            <div className="w-100 bg-ref-pokemon">
                                <div className="w-100 bg-type-moves">
                                    <CircleBar text={splitAndCapitalize(pokemon.cMovePri.name, "_", " ")} type={pokemon.cMovePri.type} size={80} maxEnergy={100} moveEnergy={Math.abs(pokemon.cMovePri.pvp_energy)} energy={playTimeline[type].energy ?? 0}/>
                                    {pokemon.cMoveSec && pokemon.cMoveSec !== "" &&
                                    <CircleBar text={splitAndCapitalize(pokemon.cMoveSec.name, "_", " ")} type={pokemon.cMoveSec.type} size={80} maxEnergy={100} moveEnergy={Math.abs(pokemon.cMoveSec.pvp_energy)} energy={playTimeline[type].energy ?? 0}/>
                                    }
                                </div>
                                <ProgressBar text={"HP"} height={15} hp={Math.floor(playTimeline[type].hp)} maxHp={Math.floor(pokemon.pokemonData.currentStats.stats.statsSTA)}/>
                            </div>
                            }
                        </Fragment>
                    }
            </Fragment>
        )
    }

    const CustomToggle = ({ eventKey }: any) => {
        const decoratedOnClick = useAccordionButton(eventKey)

        return (
            <div className="btn-collape-battle"  onClick={decoratedOnClick}>
                {openBattle ?
                    <RemoveCircleIcon onClick={() => {setOpenBattle(!openBattle)}} fontSize="large" color="error"/>
                :
                    <AddCircleIcon onClick={() => {setOpenBattle(!openBattle)}} fontSize="large" color="primary"/>
                }
            </div>
        );
      }

    return (
        <div className="container element-top battle-body-container">
            <Form.Select onChange={(e) => {
                navigate(`/pvp/battle/${parseInt(e.target.value)}`)
                setOptions({...options, league: parseInt(e.target.value)})
            }} defaultValue={league}>
                <option value={500}>Little Cup</option>
                <option value={1500}>Great League</option>
                <option value={2500}>Ultra League</option>
                <option value={10000}>Master League</option>
            </Form.Select>
            <div className="row element-top" style={{margin: 0}}>
                <div className="col-lg-3">
                    {renderPokemonInfo("pokemonCurr", pokemonCurr, setPokemonCurr, clearDataPokemonCurr)}
                </div>
                <div className="col-lg-6">
                    {pokemonCurr.pokemonData && pokemonObj.pokemonData && pokemonCurr.timeline.length > 0 && pokemonObj.timeline.length > 0 &&
                    <Fragment>
                        <Accordion defaultActiveKey={[]}>
                            <Card className="position-relative">
                                <Card.Header style={{padding: 0}}>
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
                                    <CustomToggle eventKey="0" />
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body style={{padding: 0}}>
                                        {TimeLineVertical(pokemonCurr, pokemonObj)}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                        <div>
                            {timelineType ?
                                <Fragment>{TimeLine(pokemonCurr, pokemonObj, timelineNormalContainer, onScrollTimeline, timelineNormal, playLine, onPlayLineMove, leftNormal, showTap)}</Fragment>
                                :
                                <Fragment>{TimeLineFit(pokemonCurr, pokemonObj, timelineFit, playLine, onPlayLineFitMove, leftFit, showTap)}</Fragment>
                            }
                            <div className="d-flex justify-content-center">
                                <FormControlLabel control={<Checkbox checked={showTap} onChange={(event, check) => setOptions({...options, showTap: check})}/>} label="Show Tap Move" />
                                <RadioGroup
                                    row
                                    aria-labelledby="row-timeline-group-label"
                                    name="row-timeline-group"
                                    value={timelineType}
                                    onChange={(e) =>  onChangeTimeline(parseInt(e.target.value))}>
                                    <FormControlLabel value={0} control={<Radio />} label={<span>Fit Timeline</span>} />
                                    <FormControlLabel value={1} control={<Radio />} label={<span>Normal Timeline</span>} />
                                </RadioGroup>
                            </div>
                            <div className="d-flex justify-content-center" style={{columnGap: 10}}>
                                <button className="btn btn-primary" onClick={() => playState ? stopTimeLine() : playTimeLine()}>{playState ?
                                <Fragment><PauseIcon /> Stop</Fragment>
                                :
                                <Fragment><PlayArrowIcon /> Play</Fragment>}</button>
                                <button className="btn btn-danger" onClick={() => resetTimeLine()}><RestartAltIcon /> Reset</button>
                            </div>
                        </div>
                    </Fragment>
                    }
                </div>
                <div className="col-lg-3">
                    {renderPokemonInfo("pokemonObj", pokemonObj, setPokemonObj, clearDataPokemonObj)}
                </div>
            </div>
            <div className="text-center element-top" style={{marginBottom: 15}}>
                <button className="btn btn-primary" onClick={() => battleAnimation()}>Battle Simulator</button>
            </div>
        </div>
    )
}

export default Battle;