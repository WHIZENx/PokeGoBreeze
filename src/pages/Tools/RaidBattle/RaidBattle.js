import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import SelectMove from "../../../components/Input/SelectMove";
import Raid from "../../../components/Raid/Raid";
import Find from "../Find";
import { Link } from "react-router-dom";

import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';
import { calculateBattleDPS, calculateBattleDPSDefender, calculateStatsBettlePure, calculateStatsByTag, convertName, findAssetForm, RAID_BOSS_TIER, splitAndCapitalize, TimeToKill } from "../../../components/Calculate/Calculate";
import { Checkbox, FormControlLabel, Switch } from "@mui/material";

import loadingImg from '../../../assets/loading.png';
import './RaidBattle.css';
import APIService from "../../../services/API.service";
import Type from "../../../components/Sprites/Type";
import TypeBadge from "../../../components/Sprites/TypeBadge";

import atk_logo from '../../../assets/attack.png';
import PokemonRaid from "../../../components/Raid/PokemonRaid";

const RaidBattle = () => {

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

    const [spinner, setSpinner] = useState(false);
    const [timeAllow, setTimeAllow] = useState(0);

    const [resultBoss, setResultBoss] = useState(null);
    const [resultAtk, setResultAtk] = useState(null);
    const [result, setResult] = useState([]);

    const [releasedGO, setReleaseGO] = useState(true);

    const [pokemonBattle, setPokemonBattle] = useState([]);

    const [countPokemonBattle, setCountPokemonBattle] = useState(1);
    const [countPokemonBattleId, setCountPokemonBattleId] = useState(0);

    const resetData = () => {
        clearData();
        initialize.current = false;
    }

    const clearData = () => {
        setResult([]);
    }

    const clearDataTarget = () => {
        setResultAtk(null)
    }

    const onSetForm = (form) => {
        setForm(form);
    }

    const findMove = useCallback((id, form, type) => {
        let resultFirst = combatPokemonData.filter(item => item.ID === id);
        form = form.replaceAll("-", "_").replaceAll("_standard", "").toUpperCase();
        let result = resultFirst.find(item => item.NAME === form);
        let simpleMove = [];
        if (resultFirst.length === 1 || result == null) {
            let simpleMove = [];
            resultFirst[0].QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            setFMove(simpleMove[0]);
            setResultFMove(simpleMove);
            simpleMove = [];
            resultFirst[0].CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            resultFirst[0].SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
            resultFirst[0].PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
            setCMove(simpleMove[0]);
            return setResultCMove(simpleMove);
        };
        simpleMove = [];
        result.QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        setFMove(simpleMove[0]);
        setResultFMove(simpleMove);
        simpleMove = [];
        result.CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        result.SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
        result.PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
        setCMove(simpleMove[0]);
        return setResultCMove(simpleMove);
    }, []);

    const addCPokeData = (dataList, movePoke, value, vf, shadow, purified, felite, celite, specialMove, pokemonTarget) => {
        movePoke.forEach(vc => {
            const fmove = combatData.find(item => item.name === vf.replaceAll("_FAST", ""));
            const cmove = combatData.find(item => item.name === vc);
            const stats = calculateStatsByTag(value.baseStats, value.forme);
            const statsAttackerTemp = {
                atk: calculateStatsBettlePure(stats.atk, 15, 40),
                def: calculateStatsBettlePure(stats.def, 15, 40),
                hp: calculateStatsBettlePure(stats.sta, 15, 40),
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
                fmove: combatData.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
                cmove: combatData.find(item => item.name === cMove.name),
                types: form.form.types.map(type => type.type.name),
                WEATHER_BOOSTS: weatherBoss
            }
            const statsAttacker = pokemonTarget ? statsDefender : statsAttackerTemp;
            statsDefender = pokemonTarget ? statsAttackerTemp : statsDefender;

            const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
            const dpsAtk = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);

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
        });
    }

    const addFPokeData = (dataList, combat, movePoke, pokemon, felite, pokemonTarget) => {
        movePoke.forEach(vf => {
            addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, false, false, felite, false, null, pokemonTarget);
            if (!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) {
                if (combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, true, false, felite, false, combat.SHADOW_MOVES, pokemonTarget);
                addCPokeData(dataList, combat.SHADOW_MOVES, pokemon, vf, true, false, felite, false, combat.SHADOW_MOVES, pokemonTarget);
                addCPokeData(dataList, combat.PURIFIED_MOVES, pokemon, vf, false, true, felite, false, combat.PURIFIED_MOVES, pokemonTarget);
            }
            if ((!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) && combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, true, false, felite, true, combat.SHADOW_MOVES, pokemonTarget);
            else addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, false, false, felite, true, null, pokemonTarget);
        });
    };

    const calculateTopBatlle = (pokemonTarget) => {
        let dataList = []
        Object.values(pokemonData).forEach(pokemon => {
            if (pokemon.forme !== "Gmax") {
                let combatPoke = combatPokemonData.filter(item => item.ID === pokemon.num
                    && item.BASE_SPECIES === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                );
                let result = combatPoke.find(item => item.NAME === convertName(pokemon.name));
                if (!result) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke) {
                    addFPokeData(dataList, combatPoke, combatPoke.QUICK_MOVES, pokemon, false, pokemonTarget);
                    addFPokeData(dataList, combatPoke, combatPoke.ELITE_QUICK_MOVES, pokemon, true, pokemonTarget);
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
            setSpinner(false);
            setResult(dataList);
        }
    }

    const calculateBossBattle = () => {
        calculateTopBatlle(true)
        calculateTopBatlle(false);
    }

    // const calculateAtkBatlle = useCallback(() => {
    //     const fmove = combatData.find(item => item.name === fmoveTargetPokemon.name.replaceAll("_FAST", ""));
    //     const cmove = combatData.find(item => item.name === cmoveTargetPokemon.name);
    //     const stats = calculateStatsByTag(dataTargetPokemon.baseStats, dataTargetPokemon.forme);
    //     const statsAttacker = {
    //         atk: calculateStatsBettlePure(stats.atk, 15, 40),
    //         def: calculateStatsBettlePure(stats.def, 15, 40),
    //         hp: calculateStatsBettlePure(stats.sta, 15, 40),
    //         fmove: fmove,
    //         cmove: cmove,
    //         types: dataTargetPokemon.types,
    //         shadow: false,
    //         WEATHER_BOOSTS: weatherCounter,
    //     }
    //     const statsDefender = {
    //         atk: statBossATK,
    //         def: statBossDEF,
    //         hp: statBossHP,
    //         fmove: combatData.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
    //         cmove: combatData.find(item => item.name === cMove.name),
    //         types: form.form.types.map(type => type.type.name),
    //         WEATHER_BOOSTS: weatherBoss
    //     }

    //     const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
    //     const dpsAtk = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);

    //     const ttkAtk = enableTimeAllow ? Math.min(timeAllow, TimeToKill(Math.floor(statsDefender.hp), dpsAtk)) : TimeToKill(Math.floor(statsDefender.hp), dpsAtk); // Time to Attacker kill Defender
    //     const ttkDef = enableTimeAllow ? Math.min(timeAllow, TimeToKill(Math.floor(statsAttacker.hp), dpsDef)) : TimeToKill(Math.floor(statsAttacker.hp), dpsDef); // Time to Defender kill Attacker

    //     const timeKill = Math.min(ttkAtk, ttkDef);

    //     const tdoAtk = dpsAtk*(enableTimeAllow ? timeKill : ttkDef);
    //     const tdoDef = dpsDef*(enableTimeAllow ? timeKill : ttkAtk);

    //     const flag = ttkDef > ttkAtk; // true=Win, false=Loss

    //     console.log(timeKill, flag, dpsDef, dpsAtk)

    //     setResultAtk({
    //         pokemon: dataTargetPokemon,
    //         fmove: statsAttacker.fmove,
    //         cmove: statsAttacker.cmove,
    //         dpsDef: dpsDef,
    //         dpsAtk: dpsAtk,
    //         tdoAtk: tdoAtk,
    //         tdoDef: tdoDef,
    //         multiDpsTdo: Math.pow(dpsAtk,3)*tdoAtk,
    //         ttkAtk: ttkAtk,
    //         ttkDef: ttkDef,
    //         attackHp: Math.floor(statsAttacker.hp),
    //         attackHpRemain: Math.floor(statsAttacker.hp)-(enableTimeAllow ? timeKill : ttkDef)*dpsDef,
    //         defendHpRemain: Math.floor(statsDefender.hp)-(enableTimeAllow ? timeKill : ttkAtk)*dpsAtk,
    //         death: Math.floor(statsDefender.hp/tdoAtk),
    //         flag: flag
    //     });
    // }, [enableTimeAllow, cMove, cmoveTargetPokemon, dataTargetPokemon, fMove, fmoveTargetPokemon, form, statBossATK, statBossDEF, statBossHP, timeAllow, weatherBoss, weatherCounter])

    useEffect(() => {
        document.title = "Raid Battle - Tools";
        if (form) {
            // if (dataTargetPokemon && fmoveTargetPokemon && cmoveTargetPokemon && !resultAtk) calculateAtkBatlle();
            if (!initialize.current) {
                findMove(id, form.form.name);
                initialize.current = true;
            }
        }
    }, [findMove, id, form, resultAtk]);

    const handleCalculate = () => {
        setSpinner(true);
        clearData();
        clearDataTarget();
        setTimeout(() => {
            calculateBossBattle();
        }, 500);
    }

    const calculateHpBar = () => {
        const dps = pokemonBattle && resultAtk ?  Math.round(resultAtk.dpsAtk)*100/statBossHP : 0;
        const percent = pokemonBattle && resultAtk ? Math.round(resultAtk.defendHpRemain)*100/statBossHP : 100;
        return (
            <div className="progress position-relative" style={{marginTop: 20, minWidth: 'auto'}}>
                <div className="progress-bar bg-success" style={{width: percent+'%'}} role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"></div>
                <div className="progress-bar bg-danger" style={{width: (100-percent)+'%'}} role="progressbar" aria-valuenow={100-percent} aria-valuemin="0" aria-valuemax="100"></div>
                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                    <span>HP: {pokemonBattle && resultAtk ? `${Math.round(resultAtk.defendHpRemain)} / ${statBossHP}` : `${statBossHP}`}</span>
                </div>
                {pokemonBattle && resultAtk &&
                <div className="justify-content-start align-items-center d-flex position-absolute h-100 w-100">
                    <div className="line-dps position-relative" style={{width: `calc(${dps}% + 2px`}}>
                        <span className="line-left"><b>|</b></span>
                        <hr className="w-100"></hr>
                        <span className="line-right"><b>|</b></span>
                    </div>
                    <span className="box-text dps-text">
                        <span>DPS: {Math.round(resultAtk.dpsAtk)}</span>
                    </span>
                </div>
                }
            </div>
        )
    }

    console.log(pokemonBattle)

    return (
        <Fragment>
            <div className='loading-group-spin position-fixed' style={{display: !spinner ? "none" : "block"}}></div>
            <div className="loading-spin text-center position-fixed" style={{display: !spinner ? "none" : "block"}}>
                <img className="loading" width={64} height={64} alt='img-pokemon' src={loadingImg}></img>
                <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
            </div>
            <div className="row" style={{margin: 0, overflowX: "hidden"}}>
                <div className="col-lg" style={{padding: 0}}>
                    <Find title="Raid Boss" clearStats={resetData} setStatATK={setStatATK} setStatDEF={setStatDEF} setForm={onSetForm} setName={setName} setId={setId}/>
                </div>
                <div className="col-lg d-flex justify-content-center align-items-center" style={{padding: 0}}>
                    <div className="element-top">
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
                                    <h6 className='text-center'><b>Charge Moves</b></h6>
                                    <SelectMove clearData={clearData} result={resultCMove} move={cMove} setMovePokemon={setCMove}/>
                                </div>
                            </div>
                        </div>
                        <hr></hr>
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
                        <hr></hr>
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
                                    onInput={(e) => setTimeAllow(parseInt(e.target.value))}></input>
                            </div>
                        </div>
                        <div className="text-center element-top"><button className="btn btn-primary w-50" onClick={() => handleCalculate()}>Search</button></div>
                    </div>
                </div>
            </div>
            <hr></hr>
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
                                        {value.shadow && <img height={64} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}></img>}
                                        <img className="pokemon-sprite-raid" alt="img-pokemon" src={findAssetForm(value.pokemon.num, value.pokemon.name) ?
                                        APIService.getPokemonModel(findAssetForm(value.pokemon.num, value.pokemon.name)) : APIService.getPokeFullSprite(value.pokemon.num)}></img>
                                    </Link>
                                </div>
                                <span className="d-flex justify-content-center w-100"><b>#{value.pokemon.num} {splitAndCapitalize(value.pokemon.name, "-", " ")}</b></span>
                                <span className="d-block element-top">DPS: <b>{value.dpsAtk.toFixed(2)}</b></span>
                                <span className="d-block">Total Damage Output: <b>{value.tdoAtk.toFixed(2)}</b></span>
                                <span className="d-block">Death: <b className={value.death === 0 ? "text-success" : "text-danger"}>{value.death}</b></span>
                                <span className="d-block">Time to Kill <span className="d-inline-block caption">(Boss)</span>: <b>{value.ttkAtk.toFixed(2)} sec</b></span>
                                <span className="d-block">Time is Killed: <b>{value.ttkDef.toFixed(2)} sec</b></span>
                                <hr></hr>
                                <div className="container" style={{marginBottom: 15}}>
                                    <TypeBadge title="Fast Move" move={value.fmove} elite={value.elite.fmove}/>
                                    <TypeBadge title="Charge Move" move={value.cmove} elite={value.elite.cmove} shadow={value.mShadow} purified={value.purified} />
                                </div>
                            </div>
                        ))
                        }
                    </div>
                    <div className="row" style={{marginLeft: 0, marginRight: 0, marginBottom: 15}}>
                        <div className="col-lg-5 justify-content-center" style={{marginBottom: 20}}>
                            {[...Array(countPokemonBattle).keys()].map((value, index) => (
                                <div className={index === 0 ? "" : "element-top"} key={index}>
                                    {pokemonBattle[index] && pokemonBattle[index].index}
                                    <PokemonRaid index={pokemonBattle[index] ? pokemonBattle[index].index : countPokemonBattleId} clearData={clearDataTarget} data={pokemonBattle} setData={setPokemonBattle}/>
                                    {index > 0 && <button className="btn btn-danger w-100" onClick={() => {
                                        setPokemonBattle([...pokemonBattle].filter(item => item.index !== pokemonBattle[index].index));
                                        setCountPokemonBattle(countPokemonBattle-1);
                                    }}>Delete Pokemon</button>}
                                </div>
                            ))}
                            <button className="btn btn-primary w-100 element-top" onClick={() => {
                                setCountPokemonBattle(countPokemonBattle+1);
                                setCountPokemonBattleId(countPokemonBattleId+1);
                            }}>Add Pokemon</button>
                            {/* <span className="input-group-text justify-content-center"><b>Pokémon Battle</b></span>
                            <SelectPokemon clearData={clearDataTarget}
                                            setCurrentPokemon={setDataTargetPokemon}
                                            setFMovePokemon={setFmoveTargetPokemon}
                                            setCMovePokemon={setCmoveTargetPokemon}/>
                            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
                            <SelectMove inputType={"small"} clearData={clearDataTarget} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFmoveTargetPokemon} moveType="FAST"/>
                            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
                            <SelectMove inputType={"small"} clearData={clearDataTarget} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCmoveTargetPokemon} moveType="CHARGE"/> */}
                        </div>
                        <div className="col-lg-7 stats-boss h-100">
                            <div className="d-flex flex-wrap align-items-center">
                                <h3 style={{marginRight: 15}}><b>#{id} {form ? splitAndCapitalize(form.form.name, "-", " ") : name.toLowerCase()} Tier {tier}</b></h3>
                                <Type styled={true} arr={form.form.types.map(type => type.type.name)} />
                            </div>
                            <div className="d-inline-block" style={{marginRight: 15}}>
                                <TypeBadge title="Fast Move" move={fMove} elite={fMove.elite}/>
                            </div>
                            <div className="d-inline-block">
                                <TypeBadge title="Charge Move" move={cMove} elite={cMove.elite} shadow={cMove.shadow} purified={cMove.purified} />
                            </div>
                            {calculateHpBar()}
                            {/* <h5 className="text-decoration-underline">{pokemonBattle.length > 0 ? splitAndCapitalize(pokemonBattle.dataTargetPokemon.name, "-", " ") : "Pokemon"} at (Level: 40 - 15/15/15)</h5> */}
                            <div className="row" style={{margin: 0}}>
                                {pokemonBattle && resultAtk ?
                                <Fragment>
                                <div className="col-lg-6" style={{marginBottom: 20}}>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <img style={{marginRight: 10}} alt="atk" width={20} height={20} src={atk_logo}></img>
                                        <h4 style={{margin: 0}}>{splitAndCapitalize(form.form.name, "-", " ")}</h4>
                                    </div>
                                    <span className="d-block element-top">DPS: <b>{resultAtk.dpsAtk.toFixed(2)}</b></span>
                                    <span className="d-block">Total Damage Output: <b>{resultAtk.tdoAtk.toFixed(2)}</b></span>
                                    <span className="d-block">HP Remaining: <b>{Math.round(resultAtk.attackHp)} - <span className="text-warning">{Math.min(Math.round(resultAtk.attackHp), Math.round(resultAtk.attackHp)-Math.round(resultAtk.attackHpRemain))}</span> = <span className={Math.round(resultAtk.attackHpRemain) === 0 ? "text-danger" : "text-success"}>{Math.max(0, Math.round(resultAtk.attackHpRemain))}</span></b></span>
                                    <span className="d-block">Time to Kill: <b>{resultAtk.ttkAtk.toFixed(2)} sec</b></span>
                                    <hr></hr>
                                    <div className="d-flex justify-content-center">
                                        <h5 className={resultAtk.ttkDef > resultAtk.ttkAtk ? "text-success" : "text-danger"}>{resultAtk.ttkDef > resultAtk.ttkAtk ? "Win" : "Loss"}</h5>
                                    </div>
                                </div>
                                <div className="col-lg-6" style={{marginBottom: 20}}>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <img className="img-type-icon" style={{marginRight: 10}} alt="atk" width={20} height={20} src={APIService.getRaidSprite("ic_raid_small")}></img>
                                        <h4 style={{margin: 0}}>{splitAndCapitalize(resultAtk.pokemon.name, "-", " ")}</h4>
                                    </div>
                                    <span className="d-block element-top">DPS: <b>{resultAtk.dpsDef.toFixed(2)}</b></span>
                                    <span className="d-block">Total Damage Output: <b>{resultAtk.tdoDef.toFixed(2)}</b></span>
                                    <span className="d-block">HP Remaining: <b><span className={Math.round(resultAtk.defendHpRemain) === 0 ? "text-danger" : "text-success"}>{Math.round(resultAtk.defendHpRemain)}</span></b></span>
                                    <span className="d-block">Time to Kill: <b>{resultAtk.ttkDef.toFixed(2)} sec</b></span>
                                    <hr></hr>
                                    <div className="d-flex justify-content-center">
                                        <h5 className={resultAtk.ttkDef < resultAtk.ttkAtk ? "text-success" : "text-danger"}>{resultAtk.ttkDef < resultAtk.ttkAtk ? "Win" : "Loss"}</h5>
                                    </div>
                                </div>
                                </Fragment>
                                :
                                <Fragment>
                                <div className="col-lg-6" style={{marginBottom: 20}}>
                                    <span className="d-block element-top">DPS: <b>{resultBoss.minDPS.toFixed(2)} - {resultBoss.maxDPS.toFixed(2)}</b></span>
                                    <span className="d-block">Average DPS: <b>{((resultBoss.minDPS+resultBoss.maxDPS)/2).toFixed(2)}</b></span>
                                    <span className="d-block">Total Damage Output: <b>{resultBoss.minTDO.toFixed(2)} - {resultBoss.maxTDO.toFixed(2)}</b></span>
                                    <span className="d-block">Average Total Damage Output: <b>{((resultBoss.minTDO+resultBoss.maxTDO)/2).toFixed(2)}</b></span>
                                    <span className="d-block">Boss HP Remaining: <b>{Math.round(resultBoss.minHP)} - {Math.round(resultBoss.maxHP)}</b></span>
                                    <span className="d-block">Boss Average HP Remaining: <b>{Math.round((resultBoss.minHP+resultBoss.maxHP)/2)}</b></span>
                                </div>
                                <div className="col-lg-6 d-flex flex-wrap justify-content-center align-items-center" style={{marginBottom: 20}}>
                                    <h2 style={{margin: 0}}>Suggested players</h2>
                                    <hr className="w-100"></hr>
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
                                </Fragment>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default RaidBattle;