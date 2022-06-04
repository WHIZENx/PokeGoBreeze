import { capitalize } from "@mui/material";
import { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";
import { encounterPokemon, findAssetForm, splitAndCapitalize } from "../../Calculate/Calculate";

import './Encounter.css';

const Encounter = (props) => {

    const [encounterList, setEncounterList] = useState([]);
    const encounterResult = useRef(null);

    const [startIndex, setStartIndex] = useState(0);
    let firstInit = 20;
    let eachCounter = 10;

    useEffect(() => {
        setStartIndex(0);
        setEncounterList(encounterPokemon(props.def, props.form.types))
    }, [props.def, props.form])

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*0.8 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    return (
        <div className="table-encounter-container" ref={encounterResult} onScroll={listenScrollEvent.bind(this)}>
            <table className="table-info table-encounter">
                <colgroup className="main-name" />
                <colgroup className="main-move-encounter" />
                <colgroup className="main-move-encounter" />
                <colgroup />
                <thead>
                    <tr className="center"><th className="table-sub-header" colSpan="4">Best Pokemon Encounter</th></tr>
                    <tr className="center">
                        <th className="table-column-head main-move-name">Pokemon</th>
                        <th className="table-column-head main-move-encounter">Fast</th>
                        <th className="table-column-head main-move-encounter">Charge</th>
                        <th className="table-column-head">%</th>
                    </tr>
                </thead>
                <tbody>
                    {encounterList.slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                        <Fragment key={index}>
                            <tr>
                                <td className="text-origin center">
                                    <Link to={"../pokemon/"+value.pokemon_id} target="_blank">
                                        <div className="position-relative">
                                            {value.cmove.shadow && <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}></img>}
                                            {value.cmove.purified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()}></img>}
                                            <img alt="img-pokemon" height={64} src={findAssetForm(value.pokemon_id, value.pokemon_name) ?
                                            APIService.getPokemonModel(findAssetForm(value.pokemon_id, value.pokemon_name)) : APIService.getPokeFullSprite(value.pokemon_id)}></img>
                                        </div>
                                        <span className="caption text-black">#{value.pokemon_id} {splitAndCapitalize(value.pokemon_name, "-", " ")}</span>
                                    </Link>
                                </td>
                                <td className="text-origin center">
                                    <Link to={"../moves/"+value.fmove.id} target="_blank" className="d-grid">
                                        <div style={{verticalAlign: "text-bottom", marginRight: 5}}>
                                            <img width={28} height={28} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.fmove.type.toLowerCase()))}></img>
                                        </div>
                                        <span style={{marginRight: 5}} >{splitAndCapitalize(value.fmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
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
                                        <span style={{marginRight: 5}}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
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
                </tbody>
            </table>
        </div>
    )
}

export default Encounter;