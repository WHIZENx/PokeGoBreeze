import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import SelectMove from "../../../components/Input/SelectMove";
import Raid from "../../../components/Raid/Raid";
import Find from "../../../components/Select/Find/Find";
import { Link } from "react-router-dom";

import pokemonData from '../../../data/pokemon.json';

import { convertName, splitAndCapitalize } from "../../../util/Utils";
import { findAssetForm } from '../../../util/Compute';
import { RAID_BOSS_TIER } from '../../../util/Constants';
import { calculateBattleDPS, calculateBattleDPSDefender, calculateStatsBattle, calculateStatsByTag, TimeToKill } from '../../../util/Calculate';

import { Badge, Checkbox, FormControlLabel, Switch } from "@mui/material";

import './RaidBattle.css';
import APIService from "../../../services/API.service";
import Type from "../../../components/Sprites/Type/Type";
import TypeBadge from "../../../components/Sprites/TypeBadge/TypeBadge";

import PokemonRaid from "../../../components/Raid/PokemonRaid";

import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

import { useSnackbar } from "notistack";
import { Modal, Button } from "react-bootstrap";

import update from 'immutability-helper';
import { useDispatch, useSelector } from "react-redux";
import { hideSpinner, showSpinner } from "../../../store/actions/spinner.action";

const RaidBattle = () => {

    const dispatch = useDispatch();
    const data = useSelector((state) => state.store.data);

    const [id, setId] = useState(1);
    const [name, setName] = useState('');
    const [form, setForm] = useState(null);

    const initialize = useRef(false);

    const [statATK, setStatATK] = useState(0);
    const [statDEF, setStatDEF] = useState(0);

    const [statBossATK, setStatBossATK] = useState(0);
    const [statBossDEF, setStatBossDEF] = useState(0);
    const [statBossHP, setStatBossHP] = useState(0);

    const [tier, setTier] = useState(1);

    const [fMove, setFMove] = useState(null);
    const [cMove, setCMove] = useState(null);

    const [resultFMove, setResultFMove] = useState(null);
    const [resultCMove, setResultCMove] = useState(null);

    const [options, setOptions] = useState({
        weatherBoss: false,
        weatherCounter: false,
        released: true,
        enableTimeAllow: true
    });

    const {weatherBoss, weatherCounter, released, enableTimeAllow} = options;

    const [timeAllow, setTimeAllow] = useState(0);

    const [resultBoss, setResultBoss] = useState(null);
    const [resultRaid, setResultRaid] = useState(null);
    const [result, setResult] = useState([]);

    const [releasedGO, setReleaseGO] = useState(true);

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setTrainerBattle(update(trainerBattle, {[trainerBattleId] : {pokemons: {$set: tempPokemonBattle}}}));
        setShow(false);
    }

    const handleSave = () => {
        setTrainerBattle(update(trainerBattle, {[trainerBattleId] : {pokemons: {$set: pokemonBattle}}}));
        setShow(false);
    }

    const handleShow = (pokemons, id) => {
        setShow(true);
        setTrainerBattleId(id);
        setPokemonBattle(pokemons);
        setTempPokemonBattle(Array.from(pokemons));
    }

    const initDataPoke = {
        dataTargetPokemon: null,
        fmoveTargetPokemon: null,
        cmoveTargetPokemon: null
    }
    const initTrainer = {
        pokemons: [initDataPoke],
        trainerId: 1
    }

    const [trainerBattle, setTrainerBattle] = useState([initTrainer]);

    const [trainerBattleId, setTrainerBattleId] = useState(null);
    const [pokemonBattle, setPokemonBattle] = useState([]);
    const [tempPokemonBattle, setTempPokemonBattle] = useState([]);
    const [countTrainer, setCountTrainer] = useState(1);

    const { enqueueSnackbar } = useSnackbar();

    const resetData = () => {
        clearData();
        initialize.current = false;
    }

    const clearData = () => {
        setResult([]);
    }

    const clearDataTarget = () => {
        setResultRaid(null)
    }

    const onSetForm = (form) => {
        setForm(form);
    }

    const onCopyPokemon = (index) => {
        setPokemonBattle(update(pokemonBattle, {$push: [pokemonBattle[index]]}));
    }

    const onRemovePokemon = (index) => {
        setPokemonBattle(update(pokemonBattle, {$splice: [[index, 1]]}))
    }

    const findMove = useCallback((id, form) => {
        let resultFirst = data.pokemonCombat.filter(item => item.id === id);
        form = form.replaceAll("-", "_").replaceAll("_standard", "").toUpperCase();
        let result = resultFirst.find(item => item.name === form);
        let simpleMove = [];
        if (resultFirst.length === 1 || result == null) {
            if (resultFirst.length === 0) {
                setFMove("");
                setResultFMove("");
                setCMove("");
                return setResultCMove("");
            }
            let simpleMove = [];
            resultFirst[0].quickMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].eliteQuickMoves.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            setFMove(simpleMove[0]);
            setResultFMove(simpleMove);
            simpleMove = [];
            resultFirst[0].cinematicMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].eliteCinematicMoves.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            resultFirst[0].shadowMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
            resultFirst[0].purifiedMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
            setCMove(simpleMove[0]);
            return setResultCMove(simpleMove);
        }
        simpleMove = [];
        result.quickMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.eliteQuickMoves.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        setFMove(simpleMove[0]);
        setResultFMove(simpleMove);
        simpleMove = [];
        result.cinematicMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.eliteCinematicMoves.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        result.shadowMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
        result.purifiedMoves.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
        setCMove(simpleMove[0]);
        return setResultCMove(simpleMove);
    }, [data.pokemonCombat]);

    const addCPokeData = (dataList, movePoke, value, vf, shadow, purified, felite, celite, specialMove, pokemonTarget) => {
        movePoke.forEach(vc => {
            const fmove = data.combat.find(item => item.name === vf.replaceAll("_FAST", ""));
            const cmove = data.combat.find(item => item.name === vc);
            if (fmove && cmove) {
                const stats = calculateStatsByTag(value.baseStats, value.forme);
                const statsAttackerTemp = {
                    atk: calculateStatsBattle(stats.atk, 15, 40),
                    def: calculateStatsBattle(stats.def, 15, 40),
                    hp: calculateStatsBattle(stats.sta, 15, 40),
                    fmove: fmove,
                    cmove: cmove,
                    types: value.types,
                    shadow: shadow,
                    WEATHER_BOOSTS: weatherCounter,
                }
                let statsDefender = {
                    atk: statBossATK,
                    def: statBossDEF,
                    hp: statBossHP,
                    fmove: data.combat.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
                    cmove: data.combat.find(item => item.name === cMove.name),
                    types: form.form.types.map(type => type.type.name),
                    WEATHER_BOOSTS: weatherBoss
                }
                const statsAttacker = pokemonTarget ? statsDefender : statsAttackerTemp;
                statsDefender = pokemonTarget ? statsAttackerTemp : statsDefender;

                const dpsDef = calculateBattleDPSDefender(data.options, statsAttacker, statsDefender);
                const dpsAtk = calculateBattleDPS(data.options, statsAttacker, statsDefender, dpsDef);

                const ttkAtk = TimeToKill(Math.floor(statsDefender.hp), dpsAtk); // Time to Attacker kill Defender
                const ttkDef = TimeToKill(Math.floor(statsAttacker.hp), dpsDef); // Time to Defender kill Attacker

                const tdoAtk = dpsAtk*ttkDef;
                const tdoDef = dpsDef*ttkAtk;

                dataList.push({
                    pokemon: value,
                    fmove: statsAttacker.fmove,
                    cmove: statsAttacker.cmove,
                    dpsDef: dpsDef,
                    dpsAtk: dpsAtk,
                    tdoAtk: tdoAtk,
                    tdoDef: tdoDef,
                    multiDpsTdo: Math.pow(dpsAtk,3)*tdoAtk,
                    ttkAtk: ttkAtk,
                    ttkDef: ttkDef,
                    attackHpRemain: Math.floor(statsAttacker.hp)-Math.min(timeAllow, ttkDef)*dpsDef,
                    defendHpRemain: Math.floor(statsDefender.hp)-Math.min(timeAllow, ttkAtk)*dpsAtk,
                    death: Math.floor(statsDefender.hp/tdoAtk),
                    shadow: shadow,
                    purified: purified && specialMove && specialMove.includes(statsAttacker.cmove.name),
                    mShadow: shadow && specialMove && specialMove.includes(statsAttacker.cmove.name),
                    elite: {
                        fmove: felite,
                        cmove: celite
                    },
                });
            }
        });
    }

    const addFPokeData = (dataList, combat, movePoke, pokemon, felite, pokemonTarget) => {
        movePoke.forEach(vf => {
            addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, false, false, felite, false, null, pokemonTarget);
            if (!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) {
                if (combat.shadowMoves.length > 0) addCPokeData(dataList, combat.cinematicMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves, pokemonTarget);
                addCPokeData(dataList, combat.shadowMoves, pokemon, vf, true, false, felite, false, combat.shadowMoves, pokemonTarget);
                addCPokeData(dataList, combat.purifiedMoves, pokemon, vf, false, true, felite, false, combat.purifiedMoves, pokemonTarget);
            }
            if ((!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) && combat.shadowMoves.length > 0) addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, true, false, felite, true, combat.shadowMoves, pokemonTarget);
            else addCPokeData(dataList, combat.eliteCinematicMoves, pokemon, vf, false, false, felite, true, null, pokemonTarget);
        });
    };

    const calculateTopBatlle = (pokemonTarget) => {
        let dataList = []
        Object.values(pokemonData).forEach(pokemon => {
            if (pokemon.forme !== "Gmax") {
                let combatPoke = data.pokemonCombat.filter(item => item.id === pokemon.num
                    && item.baseSpecies === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                );
                let result = combatPoke.find(item => item.name === convertName(pokemon.name));
                if (!result) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke) {
                    addFPokeData(dataList, combatPoke, combatPoke.quickMoves, pokemon, false, pokemonTarget);
                    addFPokeData(dataList, combatPoke, combatPoke.eliteQuickMoves, pokemon, true, pokemonTarget);
                }
            }
        });
        if (pokemonTarget) {
            const sortedDPS = dataList.sort((a, b) => a.dpsAtk - b.dpsAtk);
            const sortedTDO = dataList.sort((a, b) => a.tdoAtk - b.tdoAtk);
            const sortedHP = dataList.sort((a, b) => a.attackHpRemain - b.attackHpRemain);
            let result = {
                minDPS: sortedDPS[0].dpsAtk,
                maxDPS: sortedDPS[dataList.length-1].dpsAtk,
                minTDO: sortedTDO[0].tdoAtk,
                maxTDO: sortedTDO[dataList.length-1].tdoAtk,
                minHP: sortedHP[0].attackHpRemain,
                maxHP: sortedHP[dataList.length-1].attackHpRemain
            }
            setResultBoss(result)
        } else {
            const group = dataList.reduce((result, obj) => {
                (result[obj.pokemon.name] = result[obj.pokemon.name] || []).push(obj);
                return result;
            }, {});
            dataList = Object.values(group).map(pokemon => pokemon.reduce((p, c) => p.tdoAtk > c.tdoAtk ? p : c)).sort((a,b) => b.tdoAtk - a.tdoAtk);
            dispatch(hideSpinner());
            setResult(dataList);
        }
    }

    const calculateBossBattle = () => {
        calculateTopBatlle(true)
        calculateTopBatlle(false);
    }

    const calculateDPSBatlle = (pokemon, HpRemain, timer) => {
        const fmove = data.combat.find(item => item.name === pokemon.fmoveTargetPokemon.name.replaceAll("_FAST", ""));
        const cmove = data.combat.find(item => item.name === pokemon.cmoveTargetPokemon.name);

        if (fmove && cmove) {
            const stats = calculateStatsByTag(pokemon.dataTargetPokemon.baseStats, pokemon.dataTargetPokemon.forme);
            const statsAttacker = {
                atk: calculateStatsBattle(stats.atk, 15, 40),
                def: calculateStatsBattle(stats.def, 15, 40),
                hp: calculateStatsBattle(stats.sta, 15, 40),
                fmove: fmove,
                cmove: cmove,
                types: pokemon.dataTargetPokemon.types,
                shadow: false,
                WEATHER_BOOSTS: weatherCounter,
            }
            const statsDefender = {
                atk: statBossATK,
                def: statBossDEF,
                hp: Math.floor(HpRemain),
                fmove: data.combat.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
                cmove: data.combat.find(item => item.name === cMove.name),
                types: form.form.types.map(type => type.type.name),
                WEATHER_BOOSTS: weatherBoss
            }

            const dpsDef = calculateBattleDPSDefender(data.options, statsAttacker, statsDefender);
            const dpsAtk = calculateBattleDPS(data.options, statsAttacker, statsDefender, dpsDef);

            const ttkAtk = enableTimeAllow ? Math.min(timeAllow-timer, TimeToKill(Math.floor(statsDefender.hp), dpsAtk)) : TimeToKill(Math.floor(statsDefender.hp), dpsAtk);
            const ttkDef = enableTimeAllow ? Math.min(timeAllow-timer, TimeToKill(Math.floor(statsAttacker.hp), dpsDef)) : TimeToKill(Math.floor(statsAttacker.hp), dpsDef);

            const timeKill = Math.min(ttkAtk, ttkDef);

            const tdoAtk = dpsAtk*(enableTimeAllow ? timeKill : ttkDef);
            const tdoDef = dpsDef*(enableTimeAllow ? timeKill : ttkAtk);

            return {
                pokemon: pokemon.dataTargetPokemon,
                fmove: statsAttacker.fmove,
                cmove: statsAttacker.cmove,
                atk: statsAttacker.atk,
                def: statsAttacker.def,
                hp: statsAttacker.hp,
                dpsAtk: dpsAtk,
                dpsDef: dpsDef,
                tdoAtk: tdoAtk,
                tdoDef: tdoDef,
                ttkAtk: ttkAtk,
                ttkDef: ttkDef,
                timer: timeKill,
                defHpRemain: Math.floor(statsDefender.hp)-tdoAtk,
            }
        }
    }

    const calculateTrainerBatlle = (trainerBattle) => {
        const trainer = trainerBattle.map(trainer => trainer.pokemons);
        const trainerNoPokemon = trainer.filter(pokemons => pokemons.filter(pokemon => !pokemon.dataTargetPokemon).length > 0);
        if (trainerNoPokemon.length > 0) {
            enqueueSnackbar('Please select Pokémon to raid battle!', { variant: 'error' });
            return;
        }
        enqueueSnackbar('Simulator battle raid successfully!', { variant: 'success' });

        let turn = []
        trainer.forEach((pokemons, id) => {
            pokemons.forEach((pokemon, index) => {
                turn[index] = turn[index] ?? [];
                turn[index].push({...trainer[id][index], trainerId: id})
            })
        })
        let result = [];
        let timer = 0, bossHp = statBossHP;
        turn.forEach(group => {
            let dataList = {
                pokemon: [],
                summary: {
                    dpsAtk: 0,
                    dpsDef: 0,
                    tdoAtk: 0,
                    tdoDef: 0,
                    timer: timer,
                    bossHp: Math.max(0, bossHp)
                }
            }
            group.forEach(pokemon => {
                if (pokemon.dataTargetPokemon) {
                    const stat = calculateDPSBatlle(pokemon, dataList.summary.bossHp, timer)
                    dataList.pokemon.push({...stat, trainerId: pokemon.trainerId});

                    if (enableTimeAllow) {
                        dataList.summary.timer = Math.min(timeAllow, dataList.summary.timer);
                    }
                }
            })

            dataList.summary.tdoAtk = Math.min(dataList.summary.bossHp, dataList.pokemon.reduce((prev, curr) => prev + curr.tdoAtk, 0));
            dataList.summary.dpsAtk = dataList.pokemon.reduce((prev, curr) => prev + curr.dpsAtk, 0);
            dataList.summary.tdoDef = dataList.pokemon.reduce((prev, curr) => prev + curr.tdoDef, 0);
            dataList.summary.dpsDef = dataList.pokemon.reduce((prev, curr) => prev + curr.dpsDef, 0);

            const sumHp = dataList.pokemon.reduce((prev, curr) => prev + curr.hp, 0);

            const ttkAtk = enableTimeAllow ? Math.min(timeAllow-timer, TimeToKill(Math.floor(dataList.summary.bossHp), dataList.summary.dpsAtk)) : TimeToKill(Math.floor(dataList.summary.bossHp), dataList.summary.dpsAtk);
            const ttkDef = enableTimeAllow ? Math.min(timeAllow-timer, TimeToKill(Math.floor(sumHp), dataList.summary.dpsDef)) : TimeToKill(Math.floor(sumHp), dataList.summary.dpsDef);
            const timeKill = Math.min(ttkAtk, ttkDef);

            bossHp -= dataList.summary.tdoAtk;
            timer += timeKill;
            dataList.summary.timer = timer;

            dataList.pokemon = dataList.pokemon.map(pokemon => {
                const tdoAtk = dataList.summary.tdoAtk/dataList.summary.dpsAtk*pokemon.dpsAtk;
                return {...pokemon,
                    tdoAtk: tdoAtk,
                    atkHpRemain: dataList.summary.tdoAtk >= dataList.summary.bossHp ?
                    Math.max(0, Math.floor(pokemon.hp)-Math.min(timeKill, pokemon.ttkDef)*pokemon.dpsDef)
                    :
                    Math.max(0, Math.floor(pokemon.hp)-Math.max(timeKill, pokemon.ttkDef)*pokemon.dpsDef),
                }
            });
            result.push(dataList);
        });
        setResultRaid(result);
    }

    useEffect(() => {
        document.title = "Raid Battle - Tools";
    }, []);

    useEffect(() => {
        if (form && !initialize.current) {
            findMove(id, form.form.name);
            initialize.current = true;
        }
    }, [findMove, id, form]);

    const handleCalculate = () => {
        dispatch(showSpinner());
        clearData();
        clearDataTarget();
        setTimeout(() => {
            calculateBossBattle();
        }, 500);
    }

    const calculateHpBar = (bossHp, tdo, sumDps) => {
        const dps = sumDps*100/bossHp;
        const percent = Math.floor(bossHp-tdo)*100/Math.floor(bossHp);
        return (
            <Fragment>
            <div className="progress position-relative">
                <div className="progress-bar bg-success" style={{marginTop: 0, width: percent+'%'}} role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"></div>
                <div className="progress-bar bg-danger" style={{marginTop: 0, width: (100-percent)+'%'}} role="progressbar" aria-valuenow={100-percent} aria-valuemin="0" aria-valuemax="100"></div>
                <div className="justify-content-start align-items-center d-flex position-absolute h-100 w-100">
                    <div className="line-dps position-relative" style={{width: `calc(${dps}% + 2px`}}>
                        <span className="line-left"><b>|</b></span>
                        <hr className="w-100"/>
                        <span className="line-right"><b>|</b></span>
                        <div className="caption text-dps">DPS</div>
                    </div>
                </div>
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>HP: {`${Math.floor(bossHp-tdo)} / ${Math.floor(bossHp)}`}</span>
                </div>
            </div>
            </Fragment>
        )
    }

    const resultBattle = (bossHp, timer) => {
        const status = enableTimeAllow && timer >= timeAllow ? 1 : bossHp === 0 ? 0 : 2;
        return (
            <td colSpan={3} className={"text-center bg-"+(status === 0 ? "success" : "danger")}>
                <span className="text-white">{status === 0 ? "WIN" : status === 1 ? "TIME OUT": "LOSS"}</span>
            </td>
        )
    }

    return (
        <Fragment>
            <div className="row" style={{margin: 0, overflowX: "hidden"}}>
                <div className="col-lg" style={{padding: 0}}>
                    <Find hide={true} title="Raid Boss" clearStats={resetData} setStatATK={setStatATK} setStatDEF={setStatDEF} setForm={onSetForm} setName={setName} setId={setId}/>
                </div>
                <div className="col-lg d-flex justify-content-center align-items-center" style={{padding: 0}}>
                    <div className="element-top position-relative">
                        {(resultFMove === "" || resultCMove === "") &&
                        <div className="position-absolute w-100 h-100" style={{zIndex: 2}}>
                            <div className="moveset-error"></div>
                            <span className="moveset-error-msg">Moveset not Available</span>
                        </div>
                        }
                        <h3 className="text-center text-decoration-underline">Select Boss Moveset</h3>
                        <div className="row element-top">
                            <div className="col d-flex justify-content-center">
                                <div>
                                    <h6 className='text-center'><b>Fast Moves</b></h6>
                                    <SelectMove clearData={clearData} result={resultFMove} move={fMove} setMovePokemon={setFMove}/>
                                </div>
                            </div>
                            <div className="col d-flex justify-content-center">
                                <div>
                                    <h6 className='text-center'><b>Charged Moves</b></h6>
                                    <SelectMove clearData={clearData} result={resultCMove} move={cMove} setMovePokemon={setCMove}/>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <Raid
                            clearData={clearData}
                            setTierBoss={setTier}
                            setTimeAllow={setTimeAllow}
                            currForm={form}
                            id={id}
                            statATK={statATK}
                            statDEF={statDEF}
                            setStatBossATK={setStatBossATK}
                            setStatBossDEF={setStatBossDEF}
                            setStatBossHP={setStatBossHP}/>
                        <hr/>
                        <div className="row align-items-center element-top" style={{margin: 0}}>
                            <div className="col-6 d-flex justify-content-end">
                                <FormControlLabel control={<Checkbox checked={weatherBoss} onChange={(event, check) => setOptions({...options, weatherBoss: check})}/>} label="Boss Weather Boost" />
                            </div>
                            <div className="col-6">
                                <FormControlLabel control={<Checkbox checked={released} onChange={(event, check) => setOptions({...options, released: check})}/>} label="Only Release in Pokémon GO" />
                            </div>
                        </div>
                        <div className="row align-items-center element-top" style={{margin: 0}}>
                            <div className="col-6 d-flex justify-content-end" style={{paddingRight: 0}}>
                                <FormControlLabel control={<Switch checked={enableTimeAllow} onChange={(event, check) => setOptions({...options, enableTimeAllow: check})}/>} label="Time Allow"/>
                            </div>
                            <div className="col-6" style={{paddingLeft: 0}}>
                                <input type="number" className="form-control" value={RAID_BOSS_TIER[tier].timer} placeholder="Battle Time" aria-label="Battle Time" min={0} disabled={!enableTimeAllow}
                                    onInput={(e) => setTimeAllow(parseInt(e.target.value))}/>
                            </div>
                        </div>
                        {resultFMove !== "" && resultCMove !== "" && <div className="text-center element-top"><button className="btn btn-primary w-50" onClick={() => handleCalculate()}>Search</button></div>}
                    </div>
                </div>
            </div>
            <hr/>
            {result.length > 0 &&
            <Fragment>
                <div className="container">
                    <div className="d-flex flex-wrap align-items-center justify-content-between">
                        <h4>Top Counters (Level: 40 - 15/15/15)</h4>
                        <div>
                            <FormControlLabel control={<Switch checked={releasedGO} onChange={(event, check) => setReleaseGO(check)}/>} label="Released in GO"/>
                        </div>
                    </div>
                    <div className="top-raid-group">
                        {result.filter(value => releasedGO ? value.pokemon.releasedGO : true).slice(0, 10).map((value, index) => (
                            <div className="top-raid-pokemon" key={index}>
                                <div className="d-flex justify-content-center w-100">
                                    <Link to={`/pokemon/${value.pokemon.num}${value.pokemon.forme ? `?form=${value.pokemon.forme.toLowerCase()}`: ""}`} className="sprite-raid position-relative">
                                        {value.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                        <img className="pokemon-sprite-raid" alt="img-pokemon" src={findAssetForm(data.assets, value.pokemon.num, value.pokemon.name) ?
                                        APIService.getPokemonModel(findAssetForm(data.assets, value.pokemon.num, value.pokemon.name)) : APIService.getPokeFullSprite(value.pokemon.num)}/>
                                    </Link>
                                </div>
                                <span className="d-flex justify-content-center w-100"><b>#{value.pokemon.num} {splitAndCapitalize(value.pokemon.name, "-", " ")}</b></span>
                                <span className="d-block element-top">DPS: <b>{value.dpsAtk.toFixed(2)}</b></span>
                                <span className="d-block">Total Damage Output: <b>{value.tdoAtk.toFixed(2)}</b></span>
                                <span className="d-block">Death: <b className={value.death === 0 ? "text-success" : "text-danger"}>{value.death}</b></span>
                                <span className="d-block">Time to Kill <span className="d-inline-block caption">(Boss)</span>: <b>{value.ttkAtk.toFixed(2)} sec</b></span>
                                <span className="d-block">Time is Killed: <b>{value.ttkDef.toFixed(2)} sec</b></span>
                                <hr/>
                                <div className="container" style={{marginBottom: 15}}>
                                    <TypeBadge title="Fast Move" move={value.fmove} elite={value.elite.fmove}/>
                                    <TypeBadge title="Charged Move" move={value.cmove} elite={value.elite.cmove} shadow={value.mShadow} purified={value.purified} />
                                </div>
                            </div>
                        ))
                        }
                    </div>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, marginBottom: 15}}>
                        <div className="col-lg-5 justify-content-center" style={{marginBottom: 20}}>
                            {trainerBattle.map((trainer, index) => (
                                <div className="trainer-battle d-flex align-items-center position-relative" key={index}>
                                    <Badge color="primary" overlap="circular" badgeContent={"Trainer "+(index+1)} anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}>
                                    <img width={80} height={80} alt="img-trainer" src={APIService.getTrainerModel(trainer.trainerId%294)}/>
                                    </Badge>
                                    <button className="btn btn-primary" style={{marginRight: 10}} onClick={() => handleShow(trainer.pokemons, index)}>
                                        <EditIcon fontSize="small"/>
                                    </button>
                                    <div className="pokemon-battle-group">
                                    {trainer.pokemons.map((pokemon, index) => (
                                        <div key={index} className="pokemon-battle">
                                            {pokemon.dataTargetPokemon ?
                                            <span><img className="pokemon-sprite-battle" alt="img-pokemon" src={APIService.getPokeIconSprite(pokemon.dataTargetPokemon.sprite, true)}/></span>
                                            :
                                            <span><AddIcon fontSize="large" sx={{color: 'lightgray'}}/></span>
                                            }
                                        </div>
                                    ))}
                                    </div>
                                    <span className="d-flex ic-group">
                                        <span className="ic-copy bg-primary text-white" title="Copy" style={{marginRight: 5}}
                                        onClick={() => {
                                            setCountTrainer(countTrainer+1);
                                            setTrainerBattle(update(trainerBattle, {$push: [{...trainerBattle[index], trainerId: countTrainer+1}]}));
                                        }}>
                                            <ContentCopyIcon sx={{fontSize: 14}}/>
                                        </span>
                                        <span className={"ic-remove text-white "+(index > 0 ? "bg-danger" : "click-none bg-secondary")} title="Remove"
                                        onClick={() => {
                                            if (index > 0) setTrainerBattle(update(trainerBattle, {$splice: [[index, 1]]}))
                                            }}>
                                            <DeleteIcon sx={{fontSize: 14}}/>
                                        </span>
                                    </span>

                                </div>
                            ))
                            }
                            <div className="text-center element-top">
                                <button  className="btn btn-primary" onClick={() => calculateTrainerBatlle(trainerBattle)}>
                                    Raid Battle
                                </button>
                            </div>
                            <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
                                <RemoveCircleIcon className={"cursor-pointer link-danger "+(trainerBattle.length > 1 ? "" : "click-none")} fontSize="large" onClick={() => {
                                    if (trainerBattle.length > 1) setTrainerBattle(update(trainerBattle, {$splice: [[trainerBattle.length-1]]}));
                                }}/>
                                <div className="count-pokemon">
                                    {trainerBattle.length}
                                </div>
                                <AddCircleIcon className="cursor-pointer link-success" fontSize="large" onClick={() => {
                                    setCountTrainer(countTrainer+1);
                                    setTrainerBattle(update(trainerBattle, {$push: [{...initTrainer, trainerId: countTrainer+1}]}));
                                }}/>
                            </div>
                        </div>
                        <div className="col-lg-7 stats-boss h-100">
                            <div className="d-flex flex-wrap align-items-center" style={{columnGap: 15}}>
                                <h3><b>#{id} {form ? splitAndCapitalize(form.form.name, "-", " ") : name.toLowerCase()} Tier {tier}</b></h3>
                                <Type arr={form.form.types.map(type => type.type.name)} />
                            </div>
                            <div className="d-flex flex-wrap align-items-center" style={{columnGap: 15}}>
                                <TypeBadge title="Fast Move" move={fMove} elite={fMove.elite}/>
                                <TypeBadge title="Charged Move" move={cMove} elite={cMove.elite} shadow={cMove.shadow} purified={cMove.purified} />
                            </div>
                            <hr/>
                            <div className="row" style={{margin: 0}}>
                                <div className="col-lg-6" style={{marginBottom: 20}}>
                                    <span className="d-block element-top">DPS: <b>{resultBoss.minDPS.toFixed(2)} - {resultBoss.maxDPS.toFixed(2)}</b></span>
                                    <span className="d-block">Average DPS: <b>{((resultBoss.minDPS+resultBoss.maxDPS)/2).toFixed(2)}</b></span>
                                    <span className="d-block">Total Damage Output: <b>{resultBoss.minTDO.toFixed(2)} - {resultBoss.maxTDO.toFixed(2)}</b></span>
                                    <span className="d-block">Average Total Damage Output: <b>{((resultBoss.minTDO+resultBoss.maxTDO)/2).toFixed(2)}</b></span>
                                    <span className="d-block">Boss HP Remaining: <b>{Math.round(resultBoss.minHP)} - {Math.round(resultBoss.maxHP)}</b></span>
                                    <span className="d-block">Boss Average HP Remaining: <b>{Math.round((resultBoss.minHP+resultBoss.maxHP)/2)}</b></span>
                                </div>
                                <div className="col-lg-6 d-flex flex-wrap justify-content-center align-items-center" style={{marginBottom: 20}}>
                                    <h2 className="text-center" style={{margin: 0}}>Suggested players</h2>
                                    <hr className="w-100"/>
                                    <div className="d-inline-block text-center">
                                        <h3 className="d-block" style={{margin: 0}}>{Math.ceil(statBossHP/(statBossHP-Math.round(resultBoss.minHP)))}</h3>
                                        {Math.ceil(statBossHP/(statBossHP-Math.round(resultBoss.minHP))) === 1 ?
                                        <span className="caption text-success">Easy</span>
                                        :
                                        <span className="caption text-danger">Hard</span>
                                        }
                                    </div>
                                    <h3 style={{marginBottom: 15, marginLeft: 10, marginRight: 10}}> - </h3>
                                    <div className="d-inline-block text-center">
                                        <h3 className="d-block" style={{margin: 0}}>{Math.ceil(statBossHP/(statBossHP-Math.round((resultBoss.minHP+resultBoss.maxHP)/2)))}+</h3>
                                        <span className="caption text-success">Easy</span>
                                    </div>
                                </div>
                            </div>
                            {resultRaid &&
                            <Fragment>
                            <hr/>
                            <h5 className="text-decoration-underline">Pokémon at (Level: 40 - 15/15/15)</h5>
                                <ul className="element-top" style={{listStyleType: 'initial'}}>
                                    {resultRaid.map((result, turn) => (
                                        <li style={{marginBottom: 15}} key={turn}>
                                            <h4><b>Pokémon Round {turn+1}</b></h4>
                                            <div className="w-100" style={{overflowX: 'auto'}}>
                                                <table className="table-info table-round-battle">
                                                    <thead className="text-center">
                                                        <tr className="table-header">
                                                            <th>Trainer ID</th>
                                                            <th>Pokémon</th>
                                                            <th>DPS</th>
                                                            <th>TDO</th>
                                                            <th>TTD</th>
                                                            <th>HP</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-center">
                                                    {result.pokemon.map((data, index) => (
                                                        <tr key={index}>
                                                            <td>#{data.trainerId+1}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center table-pokemon">
                                                                    <img className="pokemon-sprite-battle" height={36} alt="img-pokemon" src={APIService.getPokeIconSprite(data.pokemon.sprite, true)}/>
                                                                    <span className="caption">{splitAndCapitalize(data.pokemon.name, "-", " ")}</span>
                                                                </div>
                                                            </td>
                                                            <td>{data.dpsAtk.toFixed(2)}</td>
                                                            <td>{Math.floor(data.tdoAtk) === 0 ? "-" : data.tdoAtk.toFixed(2)}</td>
                                                            <td>{Math.floor(data.atkHpRemain) === 0 ? data.ttkDef.toFixed(2) : "-"}</td>
                                                            <td><b><span className={Math.floor(data.atkHpRemain) === 0 ? "text-danger" : "text-success"}>{Math.max(0, Math.floor(data.atkHpRemain))}</span> / {Math.floor(data.hp)}</b></td>
                                                        </tr>
                                                    ))}
                                                    {(((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) || (turn === 0)) || (!enableTimeAllow && result.summary.timer <= timeAllow)) &&
                                                    <tr>
                                                        <td colSpan={6}>
                                                            {calculateHpBar(result.summary.bossHp, result.summary.tdoAtk, result.summary.dpsAtk)}
                                                        </td>
                                                    </tr>
                                                    }
                                                    <tr className="text-summary">
                                                        <td colSpan={2}>
                                                            Total DPS: {result.summary.dpsAtk.toFixed(2)}
                                                        </td>
                                                        <td className="text-center" colSpan={2}>
                                                            Total TDO: {result.summary.tdoAtk.toFixed(2)}
                                                        </td>
                                                        <td colSpan={2}>
                                                            Boss HP Remain: {Math.floor(result.summary.bossHp-result.summary.tdoAtk)}
                                                        </td>
                                                    </tr>
                                                    {(((turn > 0 && Math.floor(result.summary.tdoAtk) > 0) || (turn === 0)) || (!enableTimeAllow && result.summary.timer <= timeAllow)) &&
                                                    <tr className="text-summary">
                                                        <td colSpan={3}>
                                                            <TimerIcon /> Time To Battle Remain: {result.summary.timer.toFixed(2)} {enableTimeAllow && `/ ${timeAllow}`}
                                                        </td>
                                                        {resultBattle(Math.floor(result.summary.bossHp-result.summary.tdoAtk), result.summary.timer)}
                                                    </tr>
                                                    }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                </Fragment>
                            }
                        </div>
                    </div>
                </div>
            </Fragment>
            }
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                <Modal.Title>Trainer #{trainerBattleId !== null ? trainerBattleId+1 : 0}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{overflowY: "auto", maxHeight: "60vh"}}>
                    {trainerBattleId !== null &&
                    <Fragment>
                        {pokemonBattle.map((pokemon, index) => (
                        <div className={""+(index === 0 ? "" : "element-top")} key={index}>
                            <PokemonRaid controls={true} id={index} pokemon={pokemon} data={pokemonBattle} setData={setPokemonBattle} onCopyPokemon={onCopyPokemon} onRemovePokemon={onRemovePokemon}/>
                        </div>
                        ))}
                    </Fragment>
                    }
                    </div>
                    <div className="d-flex flex-wrap justify-content-center align-items-center element-top">
                    <RemoveCircleIcon className={"cursor-pointer link-danger "+(pokemonBattle.length > 1 ? "" : "click-none")} fontSize="large" onClick={() => {
                        if (pokemonBattle.length > 1) {
                            setPokemonBattle(update(pokemonBattle, {$splice: [[pokemonBattle.length-1]]}));
                        }
                    }}/>
                    <div className="count-pokemon">
                        {pokemonBattle.length}
                    </div>
                    <AddCircleIcon className="cursor-pointer link-success" fontSize="large" onClick={() => {
                        setPokemonBattle(update(pokemonBattle, {$push: [initDataPoke]}));
                    }}/>
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={handleSave}>Save changes</Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    )
}

export default RaidBattle;