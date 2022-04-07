import { Fragment, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";

import "./Evolution.css"

const Evolution = (props) => {

    const arrEvo = useRef([]);

    const getEvoChain = useCallback((data) => {
        if (data.length === 0) return false;
        arrEvo.current.push(data.map(item => {
            return {name: item.species.name, id: item.species.url.split("/")[6], baby: item.is_baby}
        }));
        return data.map(item => getEvoChain(item.evolves_to))
    }, [arrEvo]);

    useEffect(() => {
        APIService.getFetchUrl(props.evolution_url)
        .then(res => {
            arrEvo.current = [];
            getEvoChain([res.data.chain]);
        })
    }, [props.evolution_url, getEvoChain]);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = (string, join) => {
        return string.split("-").map(text => capitalize(text)).join(join);
    };

    const handlePokeID = (id) => {
        if (id !== props.id.toString()) {
            props.onSetPrev(false);
            props.onSetNext(false);
            props.onSetIDPoke(parseInt(id));
        }
    };

    const setHeightEvo = () => {
        return 160 * Math.max(...arrEvo.current.map(item => item.length));
    }

    return (
        <Fragment>
            { arrEvo.current.length > 0 &&
            <Fragment>
            <h4 className="title-evo">Pokemon Evolution:</h4>
            <div className="evo-container">
                <ul className="ul-evo" style={{height:setHeightEvo()}}>
                    {arrEvo.current.map((value, index) => (
                        <li key={index} className='img-form-gender-group li-evo'>
                            <ul className="ul-evo">
                                {value.map((value, index) => (
                                    <li key={index} className='img-form-gender-group li-evo'>
                                        {props.onSetIDPoke ?
                                        <div className="select-evo" onClick={() => {handlePokeID(value.id)}}>
                                            <img width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(value.id)}></img>
                                            <b>{splitAndCapitalize(value.name)}</b>
                                            { value.baby && <span className="caption text-danger">(Baby)</span>}
                                            <p>{ value.id === props.id.toString() && <span className="caption">Current</span>}</p>
                                        </div>
                                        :
                                        <Link className="select-evo" to={"/pokemon/"+value.name} onClick={() => {handlePokeID(value.id)}}>
                                            <img width="96" height="96" alt="img-pokemon" src={APIService.getPokeSprite(value.id)}></img>
                                            <b>{splitAndCapitalize(value.name)}</b>
                                            { value.baby && <span className="caption text-danger">(Baby)</span>}
                                            <p>{ value.id === props.id.toString() && <span className="caption">Current</span>}</p>
                                        </Link>
                                        }
                                    </li>
                                ))
                                }
                            </ul>
                        </li>
                    ))
                    }
                </ul>
            </div>
            </Fragment>
            }
        </Fragment>
    )
}

export default Evolution;