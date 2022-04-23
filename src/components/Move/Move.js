import { Fragment, useCallback, useEffect, useState } from 'react';
import data from '../../data/combat_pokemon_go_list.json';
import combat from '../../data/combat.json';
import CardType from '../Card/CardType';

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
        if (resultFirst.length === 1 || result == null) {
            setCountFM(resultFirst[0].QUICK_MOVES.length);
            setResultMove(resultFirst[0].QUICK_MOVES.concat(resultFirst[0].CINEMATIC_MOVES));
            return;
        };
        setCountFM(result.QUICK_MOVES.length);
        setResultMove(result.QUICK_MOVES.concat(result.CINEMATIC_MOVES));
        return;
    }, []);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string) => {
        return string.split("_").map(text => capitalize(text.toLowerCase().replaceAll("fast", ""))).join(" ");
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
        setCurrentMove(value.currentTarget.dataset.id);
        props.setMove(findMoveData(value.currentTarget.dataset.id));
    }

    return (
        <Fragment>
            <h6 className='text-center'><b>{props.text}</b></h6>
                <div className='d-flex justify-content-center'>
                    <div className='card-input' tabIndex={ 0 } onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
                        <div className='card-select'>
                            {currentMove ?
                            <CardType value={findType(currentMove)} name={splitAndCapitalize(currentMove)}/>
                            :
                            <CardType />
                            }
                        </div>
                        {showMove &&
                            <div className="result-type result-move">
                                <ul>
                                    {resultMove &&
                                        <Fragment>
                                            {resultMove.map((value, index) => (
                                                <Fragment key={ index }>
                                                {index === 0 &&
                                                <li className='card-header'><b>Fast Moves</b></li>
                                                }
                                                {index === countFM &&
                                                <li className='card-header'><b>Charge Moves</b></li>
                                                }
                                                {value !== currentMove &&
                                                <li className="container card-pokemon" data-id={value} onMouseDown={changeMove.bind(this)}>
                                                    <CardType value={findType(value)} name={splitAndCapitalize(value)}/>
                                                </li>
                                                }
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