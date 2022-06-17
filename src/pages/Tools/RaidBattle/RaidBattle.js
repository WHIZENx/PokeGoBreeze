import { Fragment, useCallback, useEffect, useState } from "react";
import SelectMove from "../../../components/Input/SelectMove";
import Raid from "../../../components/Raid/Raid";
import Find from "../Find";

import pokemonData from '../../../data/pokemon.json';
import combatData from '../../../data/combat.json';
import combatPokemonData from '../../../data/combat_pokemon_go_list.json';
import { calculateBattleDPS, calculateBattleDPSDefender, calculateStatsBettlePure, calculateStatsByTag, convertName, splitAndCapitalize, TimeToKill } from "../../../components/Calculate/Calculate";

const RaidBattle = () => {

    const [id, setId] = useState(1);
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

    const clearData = () => {
        setFMove(null);
        setCMove(null);
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

    const addCPokeData = useCallback((dataList, movePoke, value, vf, shadow, purified, felite, celite, shadowMove, purifiedMove) => {
        movePoke.forEach(vc => {
            const fmove = combatData.find(item => item.name === vf.replaceAll("_FAST", ""));
            const cmove = combatData.find(item => item.name === vc);
            const stats = calculateStatsByTag(value.baseStats, value.forme);
            const statsAttacker = {
                atk: calculateStatsBettlePure(stats.atk, 15, 40),
                def: calculateStatsBettlePure(stats.def, 15, 40),
                hp: calculateStatsBettlePure(stats.sta, 15, 40),
                fmove: fmove,
                cmove: cmove,
                types: value.types,
                shadow: shadow,
                WEATHER_BOOSTS: false,
            }

            const statsDefender = {
                atk: statBossATK,
                def: statBossDEF,
                hp: statBossHP,
                fmove: combatData.find(item => item.name === fMove.name.replaceAll("_FAST", "")),
                cmove: combatData.find(item => item.name === cMove.name),
                types: form.form.types,
                WEATHER_BOOSTS: false
            }
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
                ttk: ttk,
                death: Math.round(statsDefender.hp/tdo),
                shadow: shadow,
                purified: purified && purifiedMove && purifiedMove.includes(statsAttacker.cmove.name),
                mShadow: shadow && shadowMove && shadowMove.includes(statsAttacker.cmove.name),
                elite: {
                    fmove: felite,
                    cmove: celite
                },
            });
        });
    }, [cMove, fMove, form, statBossATK, statBossDEF, statBossHP]);

    const addFPokeData = useCallback((dataList, combat, movePoke, pokemon, felite) => {
        movePoke.forEach(vf => {
            addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, false, false, felite, false);
            if (!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) {
                if (combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.CINEMATIC_MOVES, pokemon, vf, true, false, felite, false);
                addCPokeData(dataList, combat.SHADOW_MOVES, pokemon, vf, true, false, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES);
                addCPokeData(dataList, combat.PURIFIED_MOVES, pokemon, vf, false, true, felite, false, combat.SHADOW_MOVES, combat.PURIFIED_MOVES);
            }
            if ((!pokemon.forme || !pokemon.forme.toLowerCase().includes("mega")) && combat.SHADOW_MOVES.length > 0) addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, true, false, felite, true);
            else addCPokeData(dataList, combat.ELITE_CINEMATIC_MOVES, pokemon, vf, false, false, felite, true);
        });
    }, [addCPokeData]);

    const calculateTopBatlle = useCallback(() => {
        let dataList = []
        Object.values(pokemonData).forEach(pokemon => {
            if (pokemon.num > 0) {
                let combatPoke = combatPokemonData.filter(item => item.ID === pokemon.num
                    && item.BASE_SPECIES === (pokemon.baseSpecies ? convertName(pokemon.baseSpecies) : convertName(pokemon.name))
                );
                let result = combatPoke.find(item => item.NAME === convertName(pokemon.name));
                if (!result) combatPoke = combatPoke[0]
                else combatPoke = result;
                if (combatPoke) {
                    addFPokeData(dataList, combatPoke, combatPoke.QUICK_MOVES, pokemon, false);
                    addFPokeData(dataList, combatPoke, combatPoke.ELITE_QUICK_MOVES, pokemon, true);
                }
            }
        });
        console.log(dataList);
    }, [addFPokeData]);

    useEffect(() => {
        document.title = "Raid Battle - Tools";
        if (form) findMove(id, form.form.name);
    }, [findMove, id, form]);

    return (
        <Fragment>
            <div className="row">
                <div className="col-lg" style={{padding: 0}}>
                    <Find title="Raid Boss" clearStats={clearData} setStatATK={setStatATK} setStatDEF={setStatDEF} setForm={onSetForm} setId={setId}/>
                </div>
                <div className="col-lg d-flex justify-content-center align-items-center" style={{padding: 0}}>
                    <div className="element-top container">
                        <h3 className="text-center text-decoration-underline">Select Boss Moveset</h3>
                        <div className="row">
                            <div className="col d-flex justify-content-center">
                                <div>
                                    <SelectMove result={resultFMove} move={fMove} setMovePokemon={setFMove}/>
                                </div>
                            </div>
                            <div className="col d-flex justify-content-center">
                                <div>
                                    <SelectMove result={resultCMove} move={cMove} setMovePokemon={setCMove}/>
                                </div>
                            </div>
                        </div>
                        <hr></hr>
                        <Raid
                            setTierBoss={setTier}
                            currForm={form}
                            id={id}
                            statATK={statATK}
                            statDEF={statDEF}
                            setStatBossATK={setStatBossATK}
                            setStatBossDEF={setStatBossDEF}
                            setStatBossHP={setStatBossHP}
                            calculateTopBatlle={calculateTopBatlle}/>
                    </div>

                </div>
            </div>
            {form &&
            <div className="text-center">
                <div>
                    <h4 className="text-decoration-underline">
                        Top 10 Pokemon Raid {splitAndCapitalize(form.form.name, "-", " ")} Tier {tier}
                    </h4>
                </div>
            </div>
            }
        </Fragment>
    )
}

export default RaidBattle;