import { useCallback, useEffect, useState } from "react";
import CardMove from "../Card/CardMove";

import data from '../../data/combat_pokemon_go_list.json';
import './Select.css';

const SelectMove = (props) => {

    const [resultMove, setResultMove] = useState(null);
    const [currentMove, setCurrentMove] = useState(null);
    const [showMove, setShowMove] = useState(false);

    const changeMove = (value) => {
        setShowMove(false);
        if (props.setCurrentPokemon) props.setCurrentPokemon({...props.filters, targetPokemon: value});
        setCurrentMove(value);
    }

    const findMove = useCallback((id, form, type) => {
        let resultFirst = data.filter(item => item.ID === id);
        form = form ? form.toLowerCase().replaceAll("-", "_").replaceAll("_standard", "").toUpperCase() : "";
        let result = resultFirst.find(item => item.NAME === form);
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
            setCurrentMove(simpleMove[0]);
            return setResultMove(simpleMove);
        };
        if (type === "FAST") {
            result.QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            result.ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        } else {
            result.CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            result.ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            result.SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
            result.PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
        }
        setCurrentMove(simpleMove[0]);
        return setResultMove(simpleMove);
    }, []);

    useEffect(() => {
        if (props.pokemon) findMove(props.pokemon.num, props.pokemon.forme, props.moveType);
        else {
            setCurrentMove(null);
            setResultMove(null);
        }
    }, [findMove, props.pokemon, props.moveType]);

    return (
        <div className={'d-flex align-items-center form-control '+(props.pokemon ? "card-select-enabled" : "card-select-disabled")} style={{padding: 0}}>
            <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                <CardMove value={currentMove}/>
                {showMove && resultMove &&
                    <div className="result-move-select">
                        <div>
                            {resultMove.map((value, index) => (
                                <div className="card-move" key={ index } onMouseDown={() => changeMove(value)}>
                                    <CardMove value={value}/>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default SelectMove;