import { Fragment, useCallback, useEffect, useState } from "react";
import SelectMove from "../../../components/Input/SelectMove";
import Raid from "../../../components/Raid/Raid";
import Find from "../Find";
import { Link } from "react-router-dom";

import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';
import { calculateAvgDPS, calculateBattleDPS, calculateBattleDPSDefender, calculateStatsBettlePure, calculateStatsByTag, convertName, DEFAULT_POKEMON_DEF_OBJ, findAssetForm, RAID_BOSS_TIER, splitAndCapitalize, TimeToKill } from "../../../components/Calculate/Calculate";
import { Checkbox, FormControlLabel, Switch } from "@mui/material";

import loadingImg from '../../../assets/loading.png';
import './RaidBattle.css';
import APIService from "../../../services/API.service";
import Type from "../../../components/Sprites/Type";
import TypeBadge from "../../../components/Sprites/TypeBadge";
import SelectPokemon from "../../../components/Input/SelectPokemon";

const RaidBattle = () => {

    const [id, setId] = useState(1);
    const [name, setName] = useState('');
    const [form, setForm] = useState(null);

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
    const [result, setResult] = useState([]);

    const [releasedGO, setReleaseGO] = useState(true);

    const [dataTargetPokemon, setDataTargetPokemon] = useState(null);
    const [fmoveTargetPokemon, setFmoveTargetPokemon] = useState(null);
    const [cmoveTargetPokemon, setCmoveTargetPokemon] = useState(null);

    const clearData = () => {
        setResult([]);
    }

    const clearDataTarget = () => {
        return timeAllow;
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

    const addCPokeData = (dataList, movePoke, value, vf, shadow, purified, felite, celite, shadowMove, purifiedMove, pokemonTarget) => {
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
            statsDefender = pokemonTarget ? statsAttacker : statsDefender;

            const dpsDef = calculateBattleDPSDefender(statsAttacker, statsDefender);
            const dps = calculateBattleDPS(statsAttacker, statsDefender, dpsDef);
            const ttk = TimeToKill(Math.floor(statsAttacker.hp), dpsDef);
            const tdo = dps*ttk;

            dataList.push({
                pokemon: value,
                fmove: statsAttacker.fmove,
                cmove: statsAttacker.cmove,
                dps: dps,
                tdo: tdo,
                multiDpsTdo: Math.pow(dps,3)*tdo,
                ttk: TimeToKill(Math.floor(statsDefender.hp), dps),
                death: Math.floor(statsDefender.hp/tdo),
                shadow: shadow,
                purified: purified && purifiedMove && purifiedMove.includes(statsAttacker.cmove.name),
                mShadow: shadow && shadowMove && shadowMove.includes(statsAttacker.cmove.name),
                elite: {
                    fmove: felite,
                    cmove: celite
                },
            });
        });
    }

    const addFPokeData = (dataList, combat, movePoke, pokemon, felite, pokemonTarget) => {
        movePoke.forEach(vf => {
            addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, false, false, felite, false, pokemonTarget);
            if (!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) {
                if (combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, true, false, felite, false, pokemonTarget);
                addCPokeData(dataList, combat.SHADOW_MOVES, pokemon, vf, true, false, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES, pokemonTarget);
                addCPokeData(dataList, combat.PURIFIED_MOVES, pokemon, vf, false, true, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES, pokemonTarget);
            }
            if ((!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) && combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, true, false, felite, true, pokemonTarget);
            else addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, false, false, felite, true, pokemonTarget);
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
        const group = dataList.reduce((result, obj) => {
            (result[obj.pokemon.name] = result[obj.pokemon.name] || []).push(obj);
            return result;
        }, {});
        dataList = Object.values(group).map(pokemon => pokemon.reduce((p, c) => p.ttk > c.ttk ? c : p)).sort((a,b) => a.ttk - b.ttk);
        if (pokemonTarget) setResultBoss(dataList)
        else {
            setSpinner(false);
            setResult(dataList);
        }
    }

    const calculateBossBattle = () => {
        // calculateTopBatlle(true)
        const statsBoss = {
            atk: statBossATK,
            def: statBossDEF,
            hp: statBossHP,
            fmove: combatData.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
            cmove: combatData.find(item => item.name === cMove.name),
            types: form.form.types.map(type => type.type.name),
            WEATHER_BOOSTS: weatherBoss
        }

        const dps = calculateAvgDPS(statsBoss.fmove, statsBoss.cmove,
            statsBoss.atk,
            statsBoss.def,
            statsBoss.hp,
            statsBoss.types,
            {
                WEATHER_BOOSTS: weatherBoss,
                POKEMON_DEF_OBJ: DEFAULT_POKEMON_DEF_OBJ
            },
            false);
        setResultBoss({
            pokemon: form,
            fmove: statsBoss.fmove,
            cmove: statsBoss.cmove,
            dps: dps,
            purified: cMove.purified,
            shadow: cMove.shadow,
            elite: {
                fmove: fMove.elite,
                cmove: cMove.elite
            }
        });
        calculateTopBatlle(false);
    }

    useEffect(() => {
        document.title = "Raid Battle - Tools";
        if (form) findMove(id, form.form.name);
    }, [findMove, id, form]);

    const handleCalculate = () => {
        setSpinner(true);
        setTimeout(() => {
            calculateBossBattle();
        }, 500);
    }

    return (
        <Fragment>
            <div className='loading-group-spin position-fixed' style={{display: !spinner ? "none" : "block"}}></div>
            <div className="loading-spin text-center position-fixed" style={{display: !spinner ? "none" : "block"}}>
                <img className="loading" width={64} height={64} alt='img-pokemon' src={loadingImg}></img>
                <span className='caption text-black' style={{fontSize: 18}}><b>Loading...</b></span>
            </div>
            <div className="row" style={{margin: 0, overflowX: "hidden"}}>
                <div className="col-lg" style={{padding: 0}}>
                    <Find title="Raid Boss" clearStats={clearData} setStatATK={setStatATK} setStatDEF={setStatDEF} setForm={onSetForm} setName={setName} setId={setId}/>
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
                            <div className="col-6 d-flex justify-content-end" style={{padding: 0}}>
                                <FormControlLabel control={<Switch checked={enableTimeAllow} onChange={(event, check) => setOptions({...options, enableTimeAllow: check})}/>} label="Time Allow"/>
                            </div>
                            <div className="col-6" style={{padding: 0}}>
                                <input type="number" className="form-control" value={RAID_BOSS_TIER[tier].timer} placeholder="Battle Time" aria-label="Battle Time" min={0} disabled={enableTimeAllow}
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
                                <span className="d-block element-top">DPS: <b>{value.dps.toFixed(2)}</b></span>
                                <span className="d-block">Total Damage: <b>{value.tdo.toFixed(2)}</b></span>
                                <span className="d-block">Death: <b className={value.death === 0 ? "text-success" : "text-danger"}>{value.death}</b></span>
                                <span className="d-block">Time to Kill: <b>{value.ttk.toFixed(2)} sec</b></span>
                                <hr></hr>
                                <div className="container" style={{marginBottom: 15}}>
                                    <TypeBadge title="Fast Move" move={value.fmove} elite={value.elite.fmove}/>
                                    <TypeBadge title="Charge Move" move={value.cmove} elite={value.elite.cmove} shadow={value.mShadow} purified={value.purified} />
                                </div>
                            </div>
                        ))
                        }
                    </div>
                    <div className="row" style={{margin: 0}}>
                        <div className="col-lg-5 justify-content-center" style={{margin: 0}}>
                            <span className="input-group-text justify-content-center"><b>Pokémon Battle</b></span>
                            <SelectPokemon clearData={clearDataTarget}
                                            setCurrentPokemon={setDataTargetPokemon}
                                            setFMovePokemon={setFmoveTargetPokemon}
                                            setCMovePokemon={setCmoveTargetPokemon}/>
                            <span className="input-group-text justify-content-center"><b>Fast Move</b></span>
                            <SelectMove inputType={"small"} clearData={clearDataTarget} pokemon={dataTargetPokemon} move={fmoveTargetPokemon} setMovePokemon={setFmoveTargetPokemon} moveType="FAST"/>
                            <span className="input-group-text justify-content-center"><b>Charge Move</b></span>
                            <SelectMove inputType={"small"} clearData={clearDataTarget} pokemon={dataTargetPokemon} move={cmoveTargetPokemon} setMovePokemon={setCmoveTargetPokemon} moveType="CHARGE"/>
                        </div>
                        <div className="col-lg-7">
                            <div className="d-flex flex-wrap align-items-center">
                            <h3 style={{marginRight: 15}}><b>#{id} {form ? splitAndCapitalize(form.form.name, "-", " ") : name.toLowerCase()} Tier {tier}</b></h3>
                            <Type styled={true} arr={resultBoss.pokemon.form.types.map(type => type.type.name)} />
                            </div>
                            <div className="d-inline-block" style={{marginRight: 15}}>
                                <TypeBadge title="Fast Move" move={resultBoss.fmove} elite={resultBoss.elite.fmove}/>
                            </div>
                            <div className="d-inline-block">
                                <TypeBadge title="Charge Move" move={resultBoss.cmove} elite={resultBoss.elite.cmove} shadow={resultBoss.shadow} purified={resultBoss.purified} />
                            </div>
                            <div className="progress position-relative" style={{marginTop: 20, minWidth: 'auto'}}>
                                <div className="progress-bar bg-success" style={{width: '100%'}} role="progressbar" aria-valuenow={100} aria-valuemin="0" aria-valuemax="100"></div>
                                <div className="box-text rank-text justify-content-end d-flex position-absolute">
                                    <span>HP: {statBossHP}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{marginBottom: 500}}></div>
                </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default RaidBattle;