import { capitalize } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";
import { counterPokemon, findAssetForm, splitAndCapitalize } from "../../Calculate/Calculate";

import './Counter.css';

const Counter = (props) => {

    const [counterList, setCounterList] = useState([]);
    const [open, setOpen] = useState(false);

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;

    useEffect(() => {
        setOpen(false);
    }, [props.def, props.form])

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*0.8 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const loadMetaData = () => {
        setCounterList(counterPokemon(props.def, props.form.types));
        setOpen(true);
    }

    return (
        <div className="table-counter-container" onScroll={listenScrollEvent.bind(this)}>
            <table className="table-info table-counter">
                <colgroup className="main-name" />
                <colgroup className="main-move-counter" />
                <colgroup className="main-move-counter" />
                <colgroup />
                <thead>
                    <tr className="center"><th className="table-sub-header" colSpan="4">Best Pokemon Counter</th></tr>
                    <tr className="center">
                        <th className="table-column-head main-move-name">Pokemon</th>
                        <th className="table-column-head main-move-counter">Fast</th>
                        <th className="table-column-head main-move-counter">Charge</th>
                        <th className="table-column-head">%</th>
                    </tr>
                </thead>
                <tbody>
                    {open ?
                    <Fragment>
                    {counterList.slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                        <Fragment key={index}>
                            <tr>
                                <td className="text-origin center">
                                    <Link  to={`/pokemon/${value.pokemon_id}${value.pokemon_forme ? `?form=${value.pokemon_forme.toLowerCase()}`: ""}`} target="_blank">
                                        <div className="d-flex justify-content-center">
                                            <div className="position-relative group-pokemon-sprite">
                                                {value.cmove.shadow && <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}></img>}
                                                {value.cmove.purified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()}></img>}
                                                <img className="pokemon-sprite-counter" alt="img-pokemon" src={findAssetForm(value.pokemon_id, value.pokemon_name) ?
                                                APIService.getPokemonModel(findAssetForm(value.pokemon_id, value.pokemon_name)) : APIService.getPokeFullSprite(value.pokemon_id)}></img>
                                            </div>
                                        </div>
                                        <span className="caption text-black">#{value.pokemon_id} {splitAndCapitalize(value.pokemon_name, "-", " ")}</span>
                                    </Link>
                                </td>
                                <td className="text-origin center">
                                    <Link to={"../moves/"+value.fmove.id} target="_blank" className="d-grid">
                                        <div style={{verticalAlign: "text-bottom", marginRight: 5}}>
                                            <img width={28} height={28} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.fmove.type.toLowerCase()))}></img>
                                        </div>
                                        <span style={{marginRight: 5, fontSize: '0.9rem'}} >{splitAndCapitalize(value.fmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                                        <span className="w-100">
                                            {value.fmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                                        </span>
                                    </Link>
                                </td>
                                <td className="text-origin center">
                                    <Link to={"../moves/"+value.cmove.id} target="_blank" className="d-grid">
                                        <div style={{verticalAlign: "text-bottom", marginRight: 5}}>
                                            <img width={28} height={28} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.cmove.type.toLowerCase()))}></img>
                                        </div>
                                        <span style={{marginRight: 5, fontSize: '0.9rem'}}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                                        <span className="w-100">
                                            {value.cmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                                            {value.cmove.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}
                                            {value.cmove.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}
                                        </span>
                                    </Link>
                                </td>
                                <td className="center">{value.ratio.toFixed(2)}</td>
                            </tr>
                        </Fragment>
                    ))
                    }
                    </Fragment>
                    :
                    <Fragment>
                        <tr style={{height: 627}}>
                            <td className="text-origin center" colSpan={4}>
                                <span onClick={() => loadMetaData()} className="link-url">Click to load all best pokemon counter</span>
                            </td>
                        </tr>
                    </Fragment>
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Counter;