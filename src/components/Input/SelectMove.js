import { useCallback, useEffect, useState } from "react";
import CardMove from "../Card/CardMove";

import data from '../../data/combat_pokemon_go_list.json';

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
                resultFirst[0].SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: value === "RETURN" ? false : true, purified: value === "RETURN" ? true : false})});
            }
            return setResultMove(simpleMove);
        };
        if (type === "FAST") {
            result.QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            result.ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        } else {
            result.CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            result.ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            result.SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: value === "RETURN" ? false : true, purified: value === "RETURN" ? true : false})});
        }
        return setResultMove(simpleMove);
    }, []);

    useEffect(() => {
        console.log(props.pokemon)
        if (props.pokemon) findMove(props.pokemon.num, props.pokemon.forme, props.moveType)
    }, [findMove, props.pokemon, props.moveType]);

    return (
        <div className=' d-flex justify-content-start'>
            <div className='card-move-input' tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                <div className='card-move-select'>
                    <CardMove value={currentMove}/>
                </div>
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