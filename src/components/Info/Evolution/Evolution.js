import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";

import "./Evolution.css"

const Evolution = (props) => {

    const [dataEvo, setDataEvo] = useState(null);

    const getEvoChain = useCallback((data, arr) => {
        if (!data) return arr;
        arr.push({name: data.species.name, id: data.species.url.split("/")[6], baby: data.is_baby});
        return getEvoChain(data.evolves_to[0], arr)
    }, []);

    useEffect(() => {
        APIService.getFetchUrl(props.evolution_url)
        .then(res => {
            setDataEvo(getEvoChain(res.data.chain, []));
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

    return (
        <Fragment>
            {dataEvo &&
            <Fragment>
            <h4 className="title-evo">Pokemon Evolution:</h4>
            <ul className="ul-evo">
                {dataEvo.map((value, index) => (
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
            </Fragment>
            }
        </Fragment>
    )
}

export default Evolution;