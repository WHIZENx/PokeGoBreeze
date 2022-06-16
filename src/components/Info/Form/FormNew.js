import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable'
import Stats from '../Stats/Stats'

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { calBaseATK, calBaseDEF, calBaseSTA, capitalize, regionList, splitAndCapitalize } from '../../Calculate/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';

const Form = (props) => {

    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const findFirst = useCallback(() => {
        return props.formList.map(item => {
            return item.find(item => item.form.is_default)
        })[0];
    }, [props.formList]);

    const findDefaultForm = useCallback(() => {
        return props.formList.map(item => {
            return item.find(item => item.form.is_default)
        }).find(item => item.id === props.id_default);
    }, [props.formList, props.id_default]);

    const findForm = useCallback(() => {
        let form = props.paramForm;
        if (props.id_default === 555 && form === "galar") form += "-standard"
        return props.formList.map(form => {
            let curFrom = form.find(item => form && (item.form.form_name === form || item.form.name === item.default_name+"-"+form));
            return curFrom ? curFrom : form.find(item => item.form.is_default)
        }).find(item => form ? item.form.form_name === form || item.form.name === item.default_name+"-"+form : item.id === props.id_default);
    }, [props.formList, props.id_default, props.paramForm]);

    const [currForm, setCurrForm] = useState(null);
    const defaultStats = {stats: {atk : 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0}}
    const [dataPoke, setDataPoke] = useState({
        stats: {atk : 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0},
        species: {url: ""},
        types: []
    });
    const pokeID = useRef(null);

    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" || form === "standard" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((stats, id) => {
        const filterId = stats.filter(item => item.id === id);
        const firstFilter = stats.find(item => item.id === id &&
            currForm.form.form_name.toLowerCase() === item.form.toLowerCase());
        if (firstFilter) return firstFilter;
        const filterForm = stats.find(item => item.id === id &&
            filterFormName(currForm.form.form_name, item.form));
        if (filterId.length === 1 && props.formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === props.formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [currForm, props.formList, filterFormName]);

    useEffect(() => {
        if (props.id_default && props.pokeData && props.formList.length > 0 && props.pokeData.length > 0) {
            setCurrForm(findForm() ? findForm() : findFirst());
            pokeID.current = findFirst().form.id;
            setDataPoke(props.pokeData.find(item => item.id === props.id_default));

            if (currForm && dataPoke) {
                setStatATK(filterFormList(props.stats.attack.ranking, props.id_default));
                setStatDEF(filterFormList(props.stats.defense.ranking, props.id_default));
                setStatSTA(filterFormList(props.stats.stamina.ranking, props.id_default));
                if (!pokeID.current) {
                    pokeID.current = findDefaultForm() ? currForm.form.id : findFirst().form.id;
                }
                if (props.setSpinner) setTimeout(() => {props.setSpinner(false)}, 300);
                if (props.onSetPrev && props.onSetNext) {
                    setTimeout(() => {
                        props.onSetPrev(true);
                        props.onSetNext(true);
                    }, 300);
                }
            }
        }
    }, [filterFormList, props, currForm, dataPoke, findForm, findFirst, findDefaultForm])

    const changeForm = (name, form) => {
        if (props.setOnChangeForm) props.setOnChangeForm(true);
        if (params.id) {
            searchParams.set("form", form);
            setSearchParams(searchParams);
            props.onSetReForm(true)
        }
        const findData = props.pokeData.find(item => name === item.name);
        const findForm = props.formList.map(item => item.find(item => item.form.name === name)).find(item => item);
        setCurrForm(findForm);
        let region = Object.values(regionList).find(item => findForm.form.form_name.includes(item.toLowerCase()));
        if (findForm.form.form_name !== "" && region) props.setRegion(region);
        else props.setRegion(regionList[parseInt(props.species.generation.url.split("/")[6])]);
        props.setFormName(splitAndCapitalize(findForm.form.name, "-", " "));
        if (findData && findForm) {
            let oriForm = findData;
            oriForm.types = findForm.form.types;
            setDataPoke(oriForm);
            props.setWH(prevWH => ({...prevWH, weight: oriForm.weight, height: oriForm.height}));
        } else if (findForm) {
            let oriForm = props.pokeData[0];
            oriForm.types = findForm.form.types;
            setDataPoke(oriForm);
            props.setWH(prevWH => ({...prevWH, weight: oriForm.weight, height: oriForm.height}));
        } else if (findData) {
            setDataPoke(findData);
            props.setWH(prevWH => ({...prevWH, weight: findData.weight, height: findData.height}));
        } else {
            setDataPoke(props.pokeData[0]);
            props.setWH(prevWH => ({...prevWH, weight: props.pokeData[0].weight, height: props.pokeData[0].height}));
        }
        props.setVersion(findForm.form.version_group.name);
    }

    return (
        <Fragment>
            <div className='form-container'>
                <div className='scroll-form'>
                    {props.formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button key={index} className={"btn btn-form"+(currForm && value.form.id === currForm.form.id ? " form-selected" : "")} onClick={() => changeForm(value.form.name, value.form.form_name)}>
                                    <img width={64} height={64} onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(value.default_name)}} alt="img-icon-form" src={APIService.getPokeIconSprite(value.form.name)}></img>
                                    <p>{value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, "-", " ")}</p>
                                    {value.form.id === pokeID.current &&
                                        <b><small className=''> (Default)</small></b>
                                    }
                                </button>
                            ))
                            }
                        </Fragment>
                    ))
                    }
                </div>
            </div>
            {props.ratio.M !== 0 || props.ratio.F !== 0 ?
            <Fragment>
            {props.ratio.M !== 0 && <Fragment><Gender ratio={props.ratio} sex='Male' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/></Fragment>}
            {props.ratio.M !== 0 && props.ratio.F !== 0 && <hr></hr>}
            {props.ratio.F !== 0 && <Fragment><Gender ratio={props.ratio} sex='Female' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/></Fragment>}
            </Fragment>
            : <Gender sex='Genderless' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/>
            }
            <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={props.stats}
                stats={dataPoke}/>
            <hr className='w-100'></hr>
            <div className="row w-100" style={{margin:0}}>
                <div className="col-md-5" style={{padding:0}}>
                    <Info data={dataPoke} currForm={currForm} />
                    <Raid
                    currForm={currForm}
                    id={props.id_default}
                    statATK={statATK ? statATK.attack : calBaseATK((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statDEF={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)}/>
                </div>
                <div className="col-md-7" style={{padding:0}}>
                    <TableMove data={dataPoke} form={currForm && currForm.form}
                    statATK={statATK ? statATK.attack : calBaseATK((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statDEF={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statSTA={statSTA ? statSTA.stamina : calBaseSTA((dataPoke ? dataPoke.stats : defaultStats), true)}/>
                    <Counter def={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)} form={currForm && currForm.form}/>
                </div>
            </div>
            <hr className="w-100"></hr>
            {props.formList.filter(item => item[0].form.form_name.includes("mega")).map(item => item[0].form).length > 0 && currForm && !currForm.form.form_name.includes("gmax") ?
            <div className='row w-100' style={{margin:0}}>
                <div className='col-xl' style={{padding:0}}>
                <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={props.species.evolution_chain.url} id={props.id_default} form={currForm && currForm.form} formDefault={currForm && pokeID.current === currForm.form.id} eqForm={props.formList.length === 1 && props.species.pokedex_numbers.length > 1}/>
                </div>
                <div className='col-xl' style={{padding:0}}>
                    <Mega formList={props.formList} id={props.id_default}/>
                </div>
            </div>
            :
            <Evolution onSetPrev={props.onSetPrev} onSetNext={props.onSetNext} onSetIDPoke={props.onSetIDPoke} evolution_url={props.species.evolution_chain.url} id={props.id_default} form={currForm && currForm.form} formDefault={currForm && pokeID.current === currForm.form.id} region={regionList[parseInt(props.species.generation.url.split("/")[6])]}/>
            }
        </Fragment>

    )
}

export default Form;