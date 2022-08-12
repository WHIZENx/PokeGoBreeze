/* eslint-disable react/prop-types */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable'
import Stats from '../Stats/Stats'

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { capitalize, reversedCapitalize, splitAndCapitalize } from '../../../util/Utils';
import { regionList } from '../../../util/Constants';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';
import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner } from '../../../store/actions/spinner.action';

const Form = ({
    onChangeForm,
    setOnChangeForm,
    onSetPrev,
    onSetNext,
    onSetReForm,
    setVersion,
    region,
    setRegion,
    setWH,
    formName,
    setFormName,
    id_default,
    pokeData,
    pokemonRaito,
    formList,
    ratio,
    stats,
    species,
    onSetIDPoke,
    paramForm
}) => {

    const dispatch = useDispatch();
    const spinner = useSelector((state) => state.spinner);

    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const findFirst = useCallback(() => {
        return formList.map(item => {
            return item.find(item => item.form.is_default)
        })[0];
    }, [formList]);

    const findDefaultForm = useCallback(() => {
        return formList.map(item => {
            return item.find(item => item.form.is_default)
        }).find(item => item.id === id_default);
    }, [formList, id_default]);

    const findForm = useCallback(() => {
        let form = paramForm;
        if (id_default === 555 && form === "galar") form += "-standard"
        return formList.map(form => {
            let curFrom = form.find(item => form && (item.form.form_name === form || item.form.name === item.default_name+"-"+form));
            curFrom = curFrom ?? form.find(item => item.form.is_default);
            if (paramForm && curFrom.form.form_name !== paramForm.toLowerCase()) {
                const changeForm = form.find(item => item.form.form_name === paramForm.toLowerCase());
                if (changeForm) curFrom = changeForm;
            }
            return curFrom;
        }).find(item => {
            return form ? item.form.form_name === form || item.form.name === item.default_name+"-"+form : item.id === id_default
        });
    }, [formList, id_default, paramForm]);

    const [currForm, setCurrForm] = useState(null);
    const defaultStats = {atk : 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0}
    const [dataPoke, setDataPoke] = useState({
        stats: {atk : 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0},
        species: {url: ""},
        types: []
    });
    const [pokeID, setPokeID] = useState(null);
    const [statATK, setStatATK] = useState(null);
    const [statDEF, setStatDEF] = useState(null);
    const [statSTA, setStatSTA] = useState(null);

    const filterFormName = useCallback((form, formStats) => {
        form = form === "" || form === "standard" ? "Normal" : form.includes("mega") ? form.toLowerCase() : capitalize(form);
        formStats = formStats.includes("Mega") ? formStats.toLowerCase() : formStats.replaceAll("_", "-");
        formStats = formStats === "Hero" ? "Normal" : formStats;
        return form.toLowerCase().includes(formStats.toLowerCase());
    }, []);

    const filterFormList = useCallback((formName, stats, id, formLength) => {
        const filterId = stats.filter(item => item.id === id);
        const firstFilter = stats.find(item => item.id === id &&
            formName.toLowerCase() === item.form.toLowerCase());
        if (firstFilter) return firstFilter;
        const filterForm = stats.find(item => item.id === id &&
            filterFormName(formName, item.form));
        if (filterId.length === 1 && formLength === 1 && !filterForm) return filterId[0];
        else if (filterId.length === formLength && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [filterFormName]);

    useEffect(() => {
        if (!region && formName) {
            let findForm = formList.map(item => item.find(item => item.form.name === reversedCapitalize(formName, "-", " "))).find(item => item);
            if (!findForm) findForm = formList.map(item => item.find(item => item.form.form_name === "normal" || item.form.form_name === "standard" || item.form.form_name === "incarnate")).find(item => item);
            let region = Object.values(regionList).find(item => findForm.form.form_name.includes(item.toLowerCase()));
            if (findForm.form.form_name !== "" && region) setRegion(region);
            else setRegion(regionList[parseInt(species.generation.url.split("/")[6])]);
        }
    }, [formList, region, setRegion, species.generation.url, formName])

    useEffect(() => {
        if (currForm && pokeID) {
            dispatch(hideSpinner());
        }
    }, [currForm, pokeID, dispatch]);

    useEffect(() => {
        if (currForm && pokeID && onSetPrev && onSetNext && !spinner) {
            onSetPrev(true);
            onSetNext(true);
        }
    }, [currForm, pokeID, onSetNext, onSetPrev, spinner]);

    useEffect(() => {
        if (currForm && currForm.form && pokeID) {
            setStatATK(filterFormList(currForm.form.form_name, stats.attack.ranking, id_default, formList.length));
            setStatDEF(filterFormList(currForm.form.form_name, stats.defense.ranking, id_default, formList.length));
            setStatSTA(filterFormList(currForm.form.form_name, stats.stamina.ranking, id_default, formList.length));
            setPokeID(findDefaultForm() ? currForm.form.id : findFirst().form.id);
        }
    }, [currForm, pokeID, filterFormList, findDefaultForm, findFirst, id_default,
        stats.attack.ranking, stats.defense.ranking, stats.stamina.ranking, formList.length]);

    useEffect(() => {
        if (!onChangeForm || (!currForm && id_default && pokeData && formList.length > 0 && pokeData.length > 0)) {
            setCurrForm(findForm() ?? findFirst());
            setPokeID(findFirst() ? findFirst().form.id : id_default);
            setDataPoke(pokeData.find(item => item.id === id_default));
        }
    }, [currForm, findForm, findFirst, setPokeID, id_default, formList.length, onChangeForm, pokeData])

    const changeForm = (name, form) => {
        if (setOnChangeForm) setOnChangeForm(true);
        if (params.id) {
            searchParams.set("form", form);
            setSearchParams(searchParams);
            onSetReForm(true)
        }
        const findData = pokeData.find(item => name === item.name);
        const findForm = formList.map(item => item.find(item => item.form.name === name)).find(item => item);
        setCurrForm(findForm);
        let region = Object.values(regionList).find(item => findForm.form.form_name.includes(item.toLowerCase()));
        if (findForm.form.form_name !== "" && region) setRegion(region);
        else setRegion(regionList[parseInt(species.generation.url.split("/")[6])]);
        setFormName(splitAndCapitalize(findForm.form.name, "-", " "));
        if (findData && findForm) {
            let oriForm = findData;
            oriForm.types = findForm.form.types;
            setDataPoke(oriForm);
            setWH(prevWH => ({...prevWH, weight: oriForm.weight, height: oriForm.height}));
        } else if (findForm) {
            let oriForm = pokeData[0];
            oriForm.types = findForm.form.types;
            setDataPoke(oriForm);
            setWH(prevWH => ({...prevWH, weight: oriForm.weight, height: oriForm.height}));
        } else if (findData) {
            setDataPoke(findData);
            setWH(prevWH => ({...prevWH, weight: findData.weight, height: findData.height}));
        } else {
            setDataPoke(pokeData[0]);
            setWH(prevWH => ({...prevWH, weight: pokeData[0].weight, height: pokeData[0].height}));
        }
        setVersion(findForm.form.version_group.name);
    }

    return (
        <Fragment>
            <div className='form-container'>
                <div className='scroll-form'>
                    {formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button key={index} className={"btn btn-form "+((currForm && pokeID === currForm.form.id && value.form.id === currForm.form.id) || (currForm && pokeID !== currForm.form.id && value.form.id === currForm.form.id) ? "form-selected" : "")} onClick={() => changeForm(value.form.name, value.form.form_name)}>
                                    <div className='d-flex w-100 justify-content-center'>
                                        <div style={{width: 64}}>
                                            <img className='pokemon-sprite-medium' onError={(e) => {
                                                e.onerror=null;
                                                APIService.getFetchUrl(e.target.currentSrc)
                                                .then(() => {
                                                    e.target.src=APIService.getPokeIconSprite(value.default_name);
                                                })
                                                .catch(() => {
                                                    e.target.src=APIService.getPokeIconSprite("unknown-pokemon");
                                                });
                                            }} alt="img-icon-form" src={APIService.getPokeIconSprite(value.form.name)}/>
                                        </div>
                                    </div>
                                    <p>{value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, "-", " ")}</p>
                                    {value.form.id === pokeID &&
                                        <b><small>(Default)</small></b>
                                    }
                                </button>
                            ))
                            }
                        </Fragment>
                    ))
                    }
                </div>
            </div>
            {ratio.M !== 0 || ratio.F !== 0 ?
            <Fragment>
            {ratio.M !== 0 && <Fragment><Gender ratio={ratio} sex='Male' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/></Fragment>}
            {ratio.M !== 0 && ratio.F !== 0 && <hr/>}
            {ratio.F !== 0 && <Fragment><Gender ratio={ratio} sex='Female' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/></Fragment>}
            </Fragment>
            : <Gender sex='Genderless' default_m={currForm && currForm.form.sprites.front_default} shiny_m={currForm && currForm.form.sprites.front_shiny} default_f={currForm && currForm.form.sprites.front_female} shiny_f={currForm && currForm.form.sprites.front_shiny_female}/>
            }
            <Stats statATK={statATK}
                statDEF={statDEF}
                statSTA={statSTA}
                pokemonStats={stats}
                stats={dataPoke}/>
            <hr className='w-100'/>
            <div className="row w-100" style={{margin:0}}>
                <div className="col-md-5" style={{padding:0}}>
                    <Info data={dataPoke} currForm={currForm} />
                    <h5 className='element-top'><li>Raid</li></h5>
                    <Raid
                    currForm={currForm}
                    id={id_default}
                    statATK={statATK ? statATK.attack : calBaseATK((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statDEF={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)}/>
                </div>
                <div className="col-md-7" style={{padding:0}}>
                    <TableMove data={dataPoke} form={currForm && currForm.form}
                    statATK={statATK ? statATK.attack : calBaseATK((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statDEF={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)}
                    statSTA={statSTA ? statSTA.stamina : calBaseSTA((dataPoke ? dataPoke.stats : defaultStats), true)}/>
                    <Counter changeForm={changeForm} def={statDEF ? statDEF.defense : calBaseDEF((dataPoke ? dataPoke.stats : defaultStats), true)} form={currForm && currForm.form}/>
                </div>
            </div>
            <hr className="w-100"/>
            {formList.filter(item => item[0].form.form_name.includes("mega")).map(item => item[0].form).length > 0 && currForm && !currForm.form.form_name.includes("gmax") ?
            <div className='row w-100' style={{margin:0}}>
                <div className='col-xl' style={{padding:0}}>
                <Evolution gen={parseInt(species.generation.url.split("/")[6])} onSetIDPoke={onSetIDPoke} evolution_url={species.evolution_chain ? species.evolution_chain.url : []} id={id_default} forme={currForm && currForm.form} formDefault={currForm && pokeID === currForm.form.id} eqForm={formList.length === 1 && species.pokedex_numbers.length > 1}/>
                </div>
                <div className='col-xl' style={{padding:0}}>
                    <Mega formList={formList} id={id_default}/>
                </div>
            </div>
            :
            <Evolution gen={parseInt(species.generation.url.split("/")[6])} onSetIDPoke={onSetIDPoke} evolution_url={species.evolution_chain ? species.evolution_chain.url : []} id={id_default} forme={currForm && currForm.form} formDefault={currForm && pokeID === currForm.form.id} region={regionList[parseInt(species.generation.url.split("/")[6])]}/>
            }
        </Fragment>

    )
}

export default Form;