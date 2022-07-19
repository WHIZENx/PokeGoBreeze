import { Fragment, useEffect, useState } from "react";

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
import { Checkbox, FormControlLabel } from "@mui/material";

const Battle = () => {

    const [data, setData] = useState(null);
    const [options, setOptions] = useState({
        showTap: false,
        timelineType: 0
    });
    const {showTap} = options;

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

    const State = (timer, type, color, size, tap, block, energy, hp, dmg) => {
        return {
            timer: timer ?? 0,
            type: type,
            color: color,
            size: size ?? 12,
            tap: tap ?? false,
            block: block ?? 0,
            energy: energy ?? 0,
            hp: hp ?? 0,
            dmg: dmg ?? 0
        }
    }

    const Pokemon = (data, dataObj, fMove, cMove, cMoveSec, energy, block) => {
        return {
            hp: calculateStatsBattle(data.stats.sta, data.bestStats.IV.sta, data.bestStats.level, true),
            fmove: {...fMove, pvp_power_actual: calculateStatsBattle(data.stats.atk, data.bestStats.IV.atk, data.bestStats.level, true)*fMove.pvp_power*(data.pokemon.types.includes(fMove.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(fMove.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, dataObj.bestStats.IV.def, dataObj.bestStats.level, true)},
            cmove: {...cMove, pvp_power_actual: calculateStatsBattle(data.stats.atk, data.bestStats.IV.atk, data.bestStats.level, true)*cMove.pvp_power*(data.pokemon.types.includes(cMove.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(cMove.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, dataObj.bestStats.IV.def, dataObj.bestStats.level, true)},
            cmoveSec: {...cMoveSec, pvp_power_actual: calculateStatsBattle(data.stats.atk, data.bestStats.IV.atk, data.bestStats.level, true)*cMoveSec.pvp_power*(data.pokemon.types.includes(cMoveSec.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(cMoveSec.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, dataObj.bestStats.IV.def, dataObj.bestStats.level, true)},
            energy: energy ?? 0,
            block: block ?? 2,
            turn: Math.ceil(fMove.durationMs/500)
        }
    }

    const battleAnimation = () => {
        let player1 = Pokemon(pokemonCurr.pokemonData, pokemonObj.pokemonData, pokemonCurr.fMove, pokemonCurr.cMovePri, pokemonCurr.cMoveSec, pokemonCurr.energy, pokemonCurr.block)
        let player2 = Pokemon(pokemonObj.pokemonData, pokemonCurr.pokemonData, pokemonObj.fMove, pokemonObj.cMovePri, pokemonObj.cMoveSec, pokemonObj.energy, pokemonObj.block)

        // console.log(player1, player2)

        let timelinePri = [];
        let timelineSec = [];

        let timer = 0;
        let tapPri, fastPriDelay = 0, preChargePri, immunePri, chargedPri, chargedPriCount = 0;
        let tapSec, fastSecDelay = 0, preChargeSec, immuneSec, chargedSec, chargedSecCount = 0;
        let chargeType;
        let timelineInterval1 = setInterval(() => {
            timelinePri.push(State(timer, null, null, null, null, player1.block, player1.energy, player1.hp));
            if (!chargedPri && !chargedSec) {
                if (!preChargePri && !tapPri) {
                    tapPri = true;
                    if (!preChargeSec) timelinePri[timer].tap = true;
                    else timelinePri[timer].tap = false;
                    fastPriDelay = player1.turn-1;
                } else {
                    timelinePri[timer].tap = false;
                }
                if (!preChargePri && fastPriDelay === 0) {
                    tapPri = false;
                    if (!preChargeSec) player2.hp -= player1.fmove.pvp_power_actual;
                    else immunePri = true;
                    player1.energy += player1.fmove.pvp_energy;
                    timelinePri[timer] = {...timelinePri[timer], type: "F", color: player1.fmove.type.toLowerCase()};
                    if (preChargeSec && player1.turn === 1) timelinePri[timer].tap = true;
                } else {
                    fastPriDelay -= 1;
                    if (!preChargePri) timelinePri[timer].type = "W";
                }

                if (!preChargeSec && (player1.energy >= Math.abs(player1.cmove.pvp_energy) || player1.energy >= Math.abs(player1.cmoveSec.pvp_energy))) {
                    if (player1.energy >= Math.abs(player1.cmove.pvp_energy)) {
                        chargeType = 1;
                        player1.energy += player1.cmove.pvp_energy;
                        timelinePri[timer] = {...timelinePri[timer], type: "P", color: player1.cmove.type.toLowerCase(), size: 12};
                    }
                    if (player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player1.energy += player1.cmoveSec.pvp_energy;
                        timelinePri[timer] = {...timelinePri[timer], type: "P", color: player1.cmoveSec.type.toLowerCase(), size: 12};
                    }
                    preChargePri = true;
                    chargedPriCount = 16;
                }
            } else {
                if (chargedPri) {
                    if (isDelay || chargedPriCount % 2 === 0) timelinePri[timer].type = "N";
                    else {
                        if (chargeType === 1) timelinePri[timer] = {...timelinePri[timer], type: chargedPriCount === -1 ? "C" : "S", color: player1.cmove.type.toLowerCase(), size: timelinePri[timer-2].size+2};
                        if (chargeType === 2) timelinePri[timer] = {...timelinePri[timer], type: chargedPriCount === -1 ? "C" : "S", color: player1.cmoveSec.type.toLowerCase(), size: timelinePri[timer-2].size+2};
                    }
                    timelineSec[timer-2].size = timelinePri[timer-2].size;
                } else {
                    if (!isDelay && player1.block > 0 && chargedSecCount === -1) timelinePri[timer].type = "B";
                }
                timelinePri[timer].tap = false;
            }
        }, 0);
        let timelineInterval2 = setInterval(() => {
            timelineSec.push(State(timer, null, null, null, null, player2.block, player2.energy, player2.hp));
            if (!chargedPri && !chargedSec) {
                if (!preChargeSec && !tapSec) {
                    tapSec = true;
                    if (!preChargePri) timelineSec[timer].tap = true;
                    else timelineSec[timer].tap = false;
                    fastSecDelay = player2.turn-1;
                } else {
                    timelineSec[timer].tap = false;
                }
                if (!preChargeSec && fastSecDelay === 0) {
                    tapSec = false;
                    if (!preChargePri) player1.hp -= player2.fmove.pvp_power_actual;
                    else immuneSec = true;
                    player2.energy += player2.fmove.pvp_energy;
                    timelineSec[timer] = {...timelineSec[timer], type: "F", color: player2.fmove.type.toLowerCase()};
                    if (preChargePri && player2.turn === 1) timelineSec[timer].tap = true;
                } else {
                    fastSecDelay -= 1;
                    if (!preChargeSec) timelineSec[timer].type = "W";
                }

                if (!preChargePri && (player2.energy >= Math.abs(player2.cmove.pvp_energy) || player2.energy >= Math.abs(player2.cmoveSec.pvp_energy))) {
                    if (player2.energy >= Math.abs(player2.cmove.pvp_energy)) {
                        chargeType = 1;
                        player2.energy += player2.cmove.pvp_energy;
                        timelineSec[timer] = {...timelineSec[timer], type: "P", color: player2.cmove.type.toLowerCase(), size: 12};
                    }
                    if (player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player2.energy += player2.cmoveSec.pvp_energy;
                        timelineSec[timer] = {...timelineSec[timer], type: "P", color: player2.cmoveSec.type.toLowerCase(), size: 12};
                    }
                    preChargeSec = true;
                    chargedSecCount = 16;
                }
            } else {
                if (chargedSec) {
                    if (isDelay || chargedSecCount % 2 === 0) timelineSec[timer].type = "N";
                    else {
                        if (chargeType === 1) timelineSec[timer] = {...timelineSec[timer], type: chargedSecCount === -1 ? "C" : "S", color: player2.cmove.type.toLowerCase(), size: timelineSec[timer-2].size+2};
                        if (chargeType === 2) timelineSec[timer] = {...timelineSec[timer], type: chargedSecCount === -1 ? "C" : "S", color: player2.cmoveSec.type.toLowerCase(), size: timelineSec[timer-2].size+2};
                    }
                    timelinePri[timer-2].size = timelineSec[timer-2].size;
                } else {
                    if (!isDelay && player2.block > 0 && chargedPriCount === -1) timelineSec[timer].type = "B";
                }
                timelineSec[timer].tap = false;
            }
        }, 0);
        let isDelay = false, delay = 1;
        let turnInterval = setInterval(() => {
            timer += 1;
            if (!isDelay) {
                if (chargedPri) {
                    if (chargedPriCount >= 0) chargedPriCount--;
                    else {
                        if (player2.block === 0) {
                            if (chargeType === 1) player2.hp -= player1.cmove.pvp_power_actual;
                            if (chargeType === 2) player2.hp -= player1.cmoveSec.pvp_power_actual;
                        }
                        else player2.block -= 1;
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
                            if (chargeType === 1) player1.hp -= player2.cmove.pvp_power_actual;
                            if (chargeType === 2) player1.hp -= player2.cmoveSec.pvp_power_actual;
                        }
                        else player1.block -= 1;
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
                    if (immunePri) player2.hp -= player1.fmove.pvp_power_actual;
                    else if (immuneSec) player1.hp -= player2.fmove.pvp_power_actual;
                    immunePri = false;
                    immuneSec = false;
                } else {
                    delay -= 1;
                }
            }
            // console.log("Turn:", timer, player1.hp, player2.hp)
            if (player1.hp <= 0 || player2.hp <= 0) {
                clearInterval(timelineInterval1);
                clearInterval(timelineInterval2);
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
                setPokemonCurr({...pokemonCurr, timeline: timelinePri});
                setPokemonObj({...pokemonObj, timeline: timelineSec})

                // console.log(timelinePri, timelineSec)
            }
        }, 0);
    }

    useEffect(() => {
        const fetchPokemon = async () => {
            let file = (await APIService.getFetchUrl(APIService.getRankingFile("all", 1500, "overall"))).data;
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
    }, [])

    const clearDataPokemonCurr = () => {
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

    const clearDataPokemonObj = () => {
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

    // const calculateState = () => {

    // }

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
                        <TypeBadge find={true} title="Primary Charged Move" move={pokemon.cMovePri}/>
                        <TypeBadge find={true} title="Secondary Charged Move" move={pokemon.cMoveSec}/>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        )
    }

    return (
        <div className="container">
            <div className="row" style={{margin: 0}}>
                <div className="col-xl-3">
                    <Select data={data} pokemonBattle={pokemonCurr} setPokemonBattle={setPokemonCurr} clearData={clearDataPokemonCurr}/>
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
                        </Fragment>
                    }
                </div>
                <div className="col-xl-6">
                    {pokemonCurr.pokemonData && pokemonObj.pokemonData && pokemonCurr.timeline.length > 0 && pokemonObj.timeline.length > 0 &&
                    <Fragment>
                        <div>
                            <div className="d-flex justify-content-end">
                                <FormControlLabel control={<Checkbox checked={showTap} onChange={(event, check) => setOptions({...options, showTap: check})}/>} label="Show Tap Move" />
                                {/* <FormControlLabel control={<Switch checked={timelineType} onChange={(event, check) => setOptions({...options, timelineType: check})}/>} label="Best moveset of"/> */}
                            </div>
                            {TimeLineFit(pokemonCurr, pokemonObj, showTap)}
                            {options.type ?
                                <Fragment>{TimeLineFit(pokemonCurr, pokemonObj, showTap)}</Fragment>
                                :
                                <Fragment>{TimeLine(pokemonCurr, pokemonObj, showTap)}</Fragment>
                            }
                        </div>
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
                    </Fragment>
                    }
                </div>
                <div className="col-xl-3">
                    <Select data={data} pokemonBattle={pokemonObj} setPokemonBattle={setPokemonObj} clearData={clearDataPokemonObj}/>
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