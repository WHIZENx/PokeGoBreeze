/* eslint-disable react/prop-types */
import { capitalize, FormControlLabel, Switch } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import APIService from "../../../services/API.service";
import { splitAndCapitalize } from "../../../util/Utils";
import { findAssetForm } from '../../../util/Compute';
import { counterPokemon } from '../../../util/Calculate';

import './Counter.css';
import { useSelector } from "react-redux";

const Counter = ({def, form, changeForm, setLoadCounter}) => {

    const data = useSelector((state) => state.store.data);
    const [counterList, setCounterList] = useState([]);
    const [open, setOpen] = useState(false);
    const [releasedGO, setReleaseGO] = useState(true);

    const [startIndex, setStartIndex] = useState(0);
    const firstInit = 20;
    const eachCounter = 10;

    useEffect(() => {
        if (changeForm) setOpen(false);
    }, [changeForm])

    const listenScrollEvent = (ele) => {
        const scrollTop = ele.currentTarget.scrollTop;
        const fullHeight = ele.currentTarget.offsetHeight;
        if (scrollTop*0.8 >= fullHeight*(startIndex+1)) setStartIndex(startIndex+1);
    }

    const loadMetaData = () => {
        setCounterList(counterPokemon(data.options, def, form.types, data.combat, data.pokemonCombat));
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
                    <tr className="text-center"><th className="table-sub-header" colSpan="4">
                        <div className="input-group align-items-center justify-content-center">
                            <span>Best Pokémon Counter</span>
                            <FormControlLabel control={<Switch checked={releasedGO} onChange={(event, check) => setReleaseGO(check)}/>} label="Released in GO" disabled={!open}/>
                        </div>
                    </th></tr>
                    <tr className="text-center">
                        <th className="table-column-head main-move-name">Pokémon</th>
                        <th className="table-column-head main-move-counter">Fast</th>
                        <th className="table-column-head main-move-counter">Charged</th>
                        <th className="table-column-head">%</th>
                    </tr>
                </thead>
                <tbody>
                    {open ?
                    <Fragment>
                    {counterList.filter(pokemon => releasedGO ? pokemon.releasedGO : true).slice(0, firstInit + eachCounter*startIndex).map((value, index) => (
                        <Fragment key={index}>
                            <tr>
                                <td className="text-origin text-center">
                                    <Link  to={`/pokemon/${value.pokemon_id}${value.pokemon_forme ? `?form=${value.pokemon_forme.toLowerCase()}`: ""}`} target="_blank">
                                        <div className="d-flex justify-content-center">
                                            <div className="position-relative group-pokemon-sprite filter-shadow-hover">
                                                {value.cmove.shadow && <img height={30} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()}/>}
                                                {value.cmove.purified && <img height={30} alt="img-shadow" className="purified-icon" src={APIService.getPokePurified()}/>}
                                                <img className="pokemon-sprite-counter" alt="img-pokemon" src={findAssetForm(data.assets, value.pokemon_id, value.pokemon_name) ?
                                                APIService.getPokemonModel(findAssetForm(data.assets, value.pokemon_id, value.pokemon_name)) : APIService.getPokeFullSprite(value.pokemon_id)}/>
                                            </div>
                                        </div>
                                        <span className="caption text-black">#{value.pokemon_id} {splitAndCapitalize(value.pokemon_name, "-", " ")}</span>
                                    </Link>
                                </td>
                                <td className="text-origin text-center">
                                    <Link to={"../moves/"+value.fmove.id} target="_blank" className="d-grid">
                                        <div style={{verticalAlign: "text-bottom", marginRight: 5}}>
                                            <img width={28} height={28} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.fmove.type.toLowerCase()))}/>
                                        </div>
                                        <span style={{marginRight: 5, fontSize: '0.9rem'}} >{splitAndCapitalize(value.fmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                                        <span className="w-100">
                                            {value.fmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                                        </span>
                                    </Link>
                                </td>
                                <td className="text-origin text-center">
                                    <Link to={"../moves/"+value.cmove.id} target="_blank" className="d-grid">
                                        <div style={{verticalAlign: "text-bottom", marginRight: 5}}>
                                            <img width={28} height={28} alt='img-pokemon' src={APIService.getTypeSprite(capitalize(value.cmove.type.toLowerCase()))}/>
                                        </div>
                                        <span style={{marginRight: 5, fontSize: '0.9rem'}}>{splitAndCapitalize(value.cmove.name.toLowerCase(), "_", " ").replaceAll(" Plus", "+")}</span>
                                        <span className="w-100">
                                            {value.cmove.elite && <span className="type-icon-small ic elite-ic"><span>Elite</span></span>}
                                            {value.cmove.shadow && <span className="type-icon-small ic shadow-ic"><span>Shadow</span></span>}
                                            {value.cmove.purified && <span className="type-icon-small ic purified-ic"><span>Purified</span></span>}
                                        </span>
                                    </Link>
                                </td>
                                <td className="text-center">{value.ratio.toFixed(2)}</td>
                            </tr>
                        </Fragment>
                    ))
                    }
                    </Fragment>
                    :
                    <Fragment>
                        <tr className="counter-none">
                            <td className="text-origin text-center" colSpan={4}>
                                <span onClick={() => loadMetaData()} className="link-url">Click to load all best Pokémon counter</span>
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