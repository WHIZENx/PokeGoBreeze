import { Fragment, useCallback, useEffect, useState } from "react";
import CardMoveSmall from "../Card/CardMoveSmall";

import data from '../../data/combat_pokemon_go_list.json';
import './Select.css';
import { splitAndCapitalize } from "../Calculate/Calculate";
import CardMove from "../Card/CardMove";

const SelectMove = ({id, form, move, setMovePokemon, clearData, pokemon, moveType, inputType, result}) => {

    const [resultMove, setResultMove] = useState(null);
    const [showMove, setShowMove] = useState(false);

    const changeMove = (value) => {
        setShowMove(false);
        const name = splitAndCapitalize(value.name.replaceAll("_PLUS","+").replace("_FAST", ""), "_", " ");
        const currentName = splitAndCapitalize(move.name.replaceAll("_PLUS","+").replace("_FAST", ""), "_", " ");
        if (currentName !== name) {
            if (setMovePokemon) setMovePokemon(value);
            if (clearData) clearData();
        }
    }

    const findMove = useCallback((id, form, type) => {
        let resultFirst = data.filter(item => item.ID === id);
        form = form ? form.toLowerCase().replaceAll("-", "_").replaceAll("_standard", "").toUpperCase() : "";
        let result = resultFirst.find(item => item.NAME.replace(item.BASE_SPECIES+"_", "") === form);
        let simpleMove = [];
        if (resultFirst.length === 1 || result == null) {
            if (type === "FAST") {
                resultFirst[0].QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
                resultFirst[0].ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            } else {
                resultFirst[0].CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
                resultFirst[0].ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
                resultFirst[0].SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
                resultFirst[0].PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
            }
            if (setMovePokemon) setMovePokemon(simpleMove[0]);
            return setResultMove(simpleMove);
        };
        if (type === "FAST") {
            result.QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            result.ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        } else {
            result.CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            result.ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            result.SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
            result.PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
        }
        if (setMovePokemon) setMovePokemon(simpleMove[0]);
        return setResultMove(simpleMove);
    }, [setMovePokemon]);

    useEffect(() => {
        if (result) setResultMove(result);
        else {
            if (pokemon && !move) findMove(pokemon.num, pokemon.forme, moveType);
            if (!pokemon) setResultMove(null);
        }
    }, [findMove, pokemon, moveType, move, result, setMovePokemon]);

    const smallInput = () => {
        return (
            <div className={'d-flex align-items-center form-control '+(pokemon ? "card-select-enabled" : "card-select-disabled")} style={{padding: 0, borderRadius: 0}}>
                <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                    <CardMoveSmall value={move} show={pokemon ? true : false}/>
                    {showMove && resultMove &&
                        <div className="result-move-select">
                            <div>
                                {resultMove.map((value, index) => (
                                    <div className="card-move" key={ index } onMouseDown={() => changeMove(value)}>
                                        <CardMoveSmall value={value}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }

    const defaultInput = () => {
        return (
            <div className='card-input' style={{marginBottom: 15}} tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                <CardMove value={move}/>
                {showMove &&
                    <div className="result-move-select-default">
                        <div>
                            {resultMove.map((value, index) => (
                                <div className="container card-pokemon" key={ index } onMouseDown={() => changeMove(value)}>
                                    <CardMove value={value}/>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        )
    }

    return (
        <Fragment>
            {inputType === "small" &&
                <Fragment>{smallInput()}</Fragment>
            }
            {!inputType &&
                <Fragment>{defaultInput()}</Fragment>
            }
        </Fragment>
    )
}

export default SelectMove;