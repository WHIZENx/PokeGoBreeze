import { Fragment, useEffect, useState } from "react";

import pokemonData from '../../../data/pokemon.json';

import Select from "./Select";
import APIService from "../../../services/API.service";
import { convertNameRankingToOri } from "../../../util/Utils";
import { findAssetForm } from "../../../util/Compute";
import { calculateStatsBattle, calculateStatsByTag, getTypeEffective } from "../../../util/Calculate";
import { SHADOW_ATK_BONUS, STAB_MULTIPLY } from "../../../util/Constants";

const Battle = () => {

    const [data, setData] = useState(null);

    const [timelinePlayerTapPri, setTimelinePlayerTapPri] = useState([]);
    const [timelinePlayerTapSec, setTimelinePlayerTapSec] = useState([]);

    const [timelinePokemonPri, setTimelinePokemonPri] = useState([]);
    const [timelinePokemonSec, setTimelinePokemonSec] = useState([]);

    const [pokemonCurr, setPokemonCurr] = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null
    })

    const [pokemonObj, setPokemonObj] = useState({
        pokemonData: null,
        fMove: null,
        cMovePri: null,
        cMoveSec: null
    })

    const State = (timer, type, color, size) => {
        return {
            timer: timer,
            type: type,
            color: color,
            size: size
        }
    }

    const Pokemon = (data, dataObj, fMove, cMove, cMoveSec, energy, block) => {
        const level = 40;
        const iv = 15;

        return {
            hp: calculateStatsBattle(data.stats.sta, iv, level, true),
            fmove: {...fMove, pvp_power_actual: calculateStatsBattle(data.stats.atk, iv, level, true)*fMove.pvp_power*(data.pokemon.types.includes(fMove.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(fMove.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, iv, level, true)},
            cmove: {...cMove, pvp_power_actual: calculateStatsBattle(data.stats.atk, iv, level, true)*cMove.pvp_power*(data.pokemon.types.includes(cMove.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(cMove.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, iv, level, true)},
            cmoveSec: {...cMoveSec, pvp_power_actual: calculateStatsBattle(data.stats.atk, iv, level, true)*cMoveSec.pvp_power*(data.pokemon.types.includes(cMoveSec.type) ? STAB_MULTIPLY : 1)*(data.pokemon.shadow ? SHADOW_ATK_BONUS : 1)*(getTypeEffective(cMoveSec.type, dataObj.pokemon.types) : 1)/calculateStatsBattle(dataObj.stats.def, iv, level, true)},
            energy: energy ?? 0,
            block: block ?? 2
        }
    }

    const battleAnimation = () => {
        let player1 = Pokemon(pokemonCurr.pokemonData, pokemonObj.pokemonData, pokemonCurr.fMove, pokemonCurr.cMovePri, pokemonCurr.cMoveSec)
        let player2 = Pokemon(pokemonObj.pokemonData, pokemonCurr.pokemonData, pokemonObj.fMove, pokemonObj.cMovePri, pokemonObj.cMoveSec)

        // console.log(player1, player2)

        let timelineTapPri = [];
        let timelineTapSec = [];

        let timelinePri = [];
        let timelineSec = [];

        let timer = 0;
        let tapPri, fastPriDelay = 0, preChargePri, immunePri, chargedPri, chargedPriCount = 0;
        let tapSec, fastSecDelay = 0, preChargeSec, immuneSec, chargedSec, chargedSecCount = 0;
        let chargeType;
        let timelineInterval1 = setInterval(() => {
            if (!chargedPri && !chargedSec) {
                if (!preChargePri && !tapPri) {
                    tapPri = true;
                    if (!preChargeSec) timelineTapPri.push("T");
                    else timelineTapPri.push("W");
                    fastPriDelay = Math.ceil(player1.fmove.durationMs/500)-1;
                } else {
                    timelineTapPri.push("W");
                }
                if (!preChargePri && fastPriDelay === 0) {
                    tapPri = false;
                    if (!preChargeSec) player2.hp -= player1.fmove.pvp_power_actual;
                    else immunePri = true;
                    player1.energy += player1.fmove.pvp_energy;
                    timelinePri.push(State(timer, "F", player1.fmove.type.toLowerCase()));
                    if (preChargeSec && Math.ceil(player1.fmove.durationMs/500) === 1) timelineTapPri[timelineTapPri.length-1] = "T";
                } else {
                    fastPriDelay -= 1;
                    if (!preChargePri) timelinePri.push(State(timer, "W"));
                }

                if (!preChargeSec && (player1.energy >= Math.abs(player1.cmove.pvp_energy) || player1.energy >= Math.abs(player1.cmoveSec.pvp_energy))) {
                    if (player1.energy >= Math.abs(player1.cmove.pvp_energy)) {
                        chargeType = 1;
                        player1.energy += player1.cmove.pvp_energy;
                        timelinePri.push(State(timer, "P", player1.cmove.type.toLowerCase(), 2));
                    }
                    if (player1.energy >= Math.abs(player1.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player1.energy += player1.cmove.pvp_energy;
                        timelinePri.push(State(timer, "P", player1.cmoveSec.type.toLowerCase(), 2));
                    }
                    preChargePri = true;
                    chargedPriCount = 17;
                }
            } else {
                if (chargedPri) {
                    if (isDelay || chargedPriCount % 2 === 0) timelinePri.push(State(timer, "N"));
                    else {
                        if (chargeType === 1) timelinePri.push(State(timer, "P", player1.cmove.type.toLowerCase(), 2+Math.ceil(17-chargedPriCount/2)));
                        if (chargeType === 2) timelinePri.push(State(timer, "P", player1.cmoveSec.type.toLowerCase(), 2+Math.ceil(17-chargedPriCount/2)));
                    }
                } else {
                    if (!isDelay && player1.block > 0 && chargedSecCount === -1) timelinePri.push(State(timer, "B"));
                    else timelinePri.push(State(timer));
                }
                timelineTapPri.push("W");
            }

        }, 0);
        let timelineInterval2 = setInterval(() => {
            if (!chargedPri && !chargedSec) {
                if (!preChargeSec && !tapSec) {
                    tapSec = true;
                    if (!preChargePri) timelineTapSec.push("T");
                    else timelineTapSec.push("W");
                    fastSecDelay = Math.ceil(player2.fmove.durationMs/500)-1;
                } else {
                    timelineTapSec.push("W");
                }
                if (!preChargeSec && fastSecDelay === 0) {
                    tapSec = false;
                    if (!preChargePri) player1.hp -= player2.fmove.pvp_power_actual;
                    else immuneSec = true;
                    player2.energy += player2.fmove.pvp_energy;
                    timelineSec.push(State(timer, "F", player2.fmove.type.toLowerCase()));
                    if (preChargePri && Math.ceil(player2.fmove.durationMs/500) === 1) timelineTapSec[timelineTapSec.length-1] = "T";
                } else {
                    fastSecDelay -= 1;
                    if (!preChargeSec) timelineSec.push(State(timer, "W"));
                }

                if (!preChargePri && (player2.energy >= Math.abs(player2.cmove.pvp_energy) || player2.energy >= Math.abs(player2.cmoveSec.pvp_energy))) {
                    if (player2.energy >= Math.abs(player2.cmove.pvp_energy)) {
                        chargeType = 1;
                        player2.energy += player2.cmove.pvp_energy;
                        timelineSec.push(State(timer, "P", player2.cmove.type.toLowerCase(), 2))
                    }
                    if (player2.energy >= Math.abs(player2.cmoveSec.pvp_energy)) {
                        chargeType = 2;
                        player2.energy += player2.cmove.pvp_energy;
                        timelineSec.push(State(timer, "P", player2.cmoveSec.type.toLowerCase(), 2))
                    }
                    preChargeSec = true;
                    chargedSecCount = 17;
                }
            } else {
                if (chargedSec) {
                    if (isDelay || chargedSecCount % 2 === 0) timelineSec.push(State(timer, "N"));
                    else {
                        if (chargeType === 1) timelineSec.push(State(timer, "P", player2.cmove.type.toLowerCase(), 2+Math.ceil(17-chargedSecCount/2)));
                        if (chargeType === 2) timelineSec.push(State(timer, "P", player2.cmoveSec.type.toLowerCase(), 2+Math.ceil(17-chargedSecCount/2)));
                    }
                } else {
                    if (!isDelay && player2.block > 0 && chargedPriCount === -1) timelineSec.push(State(timer, "B"));
                    else timelineSec.push(State(timer));
                }
                timelineTapSec.push("W");
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
                    timelineTapPri.push(null);
                    timelineTapSec.push(null);
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
                setTimelinePokemonPri(timelinePri);
                setTimelinePokemonSec(timelineSec);

                console.log(timelinePri, timelineSec)

                setTimelinePlayerTapPri(timelineTapPri);
                setTimelinePlayerTapSec(timelineTapSec);
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

    return (
        <div className="container">
            <div className="row" style={{margin: 0}}>
                <div className="col-xl-3">
                    <Select data={data} pokemonBattle={pokemonCurr} setPokemonBattle={setPokemonCurr}/>
                </div>
                <div className="col-xl-6">
                    <div className="w-100 battle-bar">
                        <div className="d-flex element-top" style={{columnGap: 10, opacity: 0.5, width: 'max-content'}}>
                            {timelinePlayerTapPri.map((value, index) => (
                                <Fragment key={index}>
                                    {value === "T" && <div className="charge-attack"></div>}
                                    {value === "W" && <div className="wait-attack"></div>}
                                </Fragment>
                            ))}
                        </div>
                        <div className="d-flex align-items-center" style={{columnGap: 10, width: 'max-content'}}>
                            {timelinePokemonPri.map((value, index) => (
                                <Fragment key={index}>
                                    {value.type === "B" && <div className="text-success bg-success" style={{width: 12}}>0</div>}
                                    {value.type === "F" && <div className={`fast-attack ${value.color} ${value.color}-border`}></div>}
                                    {(value.type === "C" || value.type === "P" ) && <div className={`charge-attack ${value.color}-border`}></div>}
                                    {(value.type === "W" || value.type === "N" || !value.type) && <div className="wait-attack"></div>}
                                    {value.type === "X" && <div className="text-danger" style={{width: 12}}>X</div>}
                                </Fragment>
                            ))}
                        </div>
                        <div className="d-flex element-top" style={{columnGap: 10, opacity: 0.5, width: 'max-content'}}>
                            {timelinePlayerTapSec.map((value, index) => (
                                <Fragment key={index}>
                                    {value === "T" && <div className="charge-attack"></div>}
                                    {value === "W" && <div className="wait-attack"></div>}
                                </Fragment>
                            ))}
                        </div>
                        <div className="d-flex align-items-center" style={{columnGap: 10, width: 'max-content'}}>
                            {timelinePokemonSec.map((value, index) => (
                                <Fragment key={index}>
                                    {value.type === "B" && <div className="text-success bg-success" style={{width: 12}}>0</div>}
                                    {value.type === "F" && <div className={`fast-attack ${value.color} ${value.color}-border`}></div>}
                                    {(value.type === "C" || value.type === "P" ) && <div className={`charge-attack ${value.color}-border`}></div>}
                                    {(value.type === "W" || value.type === "N" || !value.type) && <div className="wait-attack"></div>}
                                    {value.type === "X" && <div className="text-danger">X</div>}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-xl-3">
                    <Select data={data} pokemonBattle={pokemonObj} setPokemonBattle={setPokemonObj}/>
                </div>
            </div>
            <div className="text-center element-top">
                <button className="btn btn-primary" onClick={() => battleAnimation()}>Battle Simulator</button>
            </div>
        </div>
    )
}

export default Battle;