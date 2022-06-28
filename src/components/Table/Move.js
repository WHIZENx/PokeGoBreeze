import { Fragment, useCallback, useEffect, useState } from 'react';
import data from '../../data/combat_pokemon_go_list.json';
import combat from '../../data/combat.json';
import CardType from '../Card/CardType';
import { splitAndCapitalize } from '../../util/Utils';

const Move = (props) => {
    const [countFM, setCountFM] = useState(0);
    const [resultMove, setResultMove] = useState(null);
    const [currentMove, setCurrentMove] = useState(null);
    const [showMove, setShowMove] = useState(false);

    const findMoveData = useCallback((move) => {
        return combat.find(item => item.name === move.replaceAll("_FAST", ""));
    }, []);

    const findMove = useCallback((id, form) => {
        let resultFirst = data.filter(item => item.ID === id);
        form = form.replaceAll("-", "_").replaceAll("_standard", "").toUpperCase();
        let result = resultFirst.find(item => item.NAME === form);
        let simpleMove = [];
        if (resultFirst.length === 1 || result == null) {
            resultFirst[0].QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            setCountFM(simpleMove.length);
            resultFirst[0].CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
            resultFirst[0].ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
            resultFirst[0].SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
            resultFirst[0].PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
            return setResultMove(simpleMove);
        };
        result.QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.ELITE_QUICK_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        setCountFM(simpleMove.length);
        result.CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: false})});
        result.ELITE_CINEMATIC_MOVES.forEach(value => {simpleMove.push({name: value, elite: true, shadow: false, purified: false})});
        result.SHADOW_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: true, purified: false})});
        result.PURIFIED_MOVES.forEach(value => {simpleMove.push({name: value, elite: false, shadow: false, purified: true})});
        return setResultMove(simpleMove);
    }, []);

    useEffect(() => {
        findMove(props.id, props.form);
        if (!props.move) setCurrentMove(null);
    }, [props.id, props.form, findMove, props.move]);

    const findType = (move) => {
        return findMoveData(move).type;
    }

    const changeMove = (value) => {
        setShowMove(false)
        setCurrentMove(resultMove.find(item => item.name === value.currentTarget.dataset.id));
        props.setMove(findMoveData(resultMove.find(item => item.name === value.currentTarget.dataset.id).name));
    }

    return (
        <Fragment>
            <h6 className='text-center'><b>{props.text}</b></h6>
                <div className='d-flex justify-content-center'>
                    <div className='card-input' tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                        <div className='card-select'>
                            {currentMove ?
                            <CardType value={findType(currentMove.name)} name={splitAndCapitalize(currentMove.name.replaceAll("_PLUS","+").replaceAll("_FAST", ""), "_", " ")} elite={currentMove.elite} shadow={currentMove.shadow} purified={currentMove.purified}/>
                            :
                            <CardType />
                            }
                        </div>
                        {showMove &&
                            <div className="result-type result-move">
                                <ul>
                                    {resultMove &&
                                        <Fragment>
                                            {resultMove.filter(value => props.selectDefault || (!props.selectDefault && value.name !== currentMove.name) ).map((value, index) => (
                                                <Fragment key={ index }>
                                                {index === 0 &&
                                                <li className='card-header'><b>Fast Moves</b></li>
                                                }
                                                {index === countFM &&
                                                <li className='card-header'><b>Charge Moves</b></li>
                                                }
                                                <li className="container card-pokemon" data-id={value.name} onMouseDown={changeMove.bind(this)}>
                                                    <CardType value={findType(value.name)} name={splitAndCapitalize(value.name.replaceAll("_PLUS","+").replaceAll("_FAST", ""), "_", " ")} elite={value.elite} shadow={value.shadow}  purified={value.purified}/>
                                                </li>
                                                </Fragment>
                                            ))
                                            }
                                        </Fragment>
                                    }
                                </ul>
                            </div>
                        }
                    </div>
                </div>
        </Fragment>
    )
}

export default Move;