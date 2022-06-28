import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Info from '../Info';

import TableMove from '../../Table/Move/MoveTable'
import Stats from '../Stats/Stats'

import './Form.css';
import APIService from '../../../services/API.service';
import Evolution from '../Evolution/Evolution';
import Gender from '../Gender';
import Mega from '../Mega/Mega';
import { capitalize, splitAndCapitalize } from '../../../util/Utils';
import { regionList } from '../../../util/Constants';
import { calBaseATK, calBaseDEF, calBaseSTA } from '../../../util/Calculate';
import Counter from '../../Table/Counter/Counter';
import { useParams, useSearchParams } from 'react-router-dom';
import Raid from '../../Raid/Raid';

const Form = ({
    setSpinner,
    onChangeForm,
    setOnChangeForm,
    onSetPrev,
    onSetNext,
    onSetReForm,
    setVersion,
    setRegion,
    setWH,
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

    const findForm = () => {
        let form = paramForm;
        if (id_default === 555 && form === "galar") form += "-standard"
        return formList.map(form => {
            let curFrom = form.find(item => form && (item.form.form_name === form || item.form.name === item.default_name+"-"+form));
            return curFrom ?? form.find(item => item.form.is_default)
        }).find(item => form ? item.form.form_name === form || item.form.name === item.default_name+"-"+form : item.id === id_default);
    }

    const [currForm, setCurrForm] = useState(findForm());
    const [dataPoke, setDataPoke] = useState(pokeData.find(item => item.id === id_default));
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
        if (filterId.length === 1 && formList.length === 1 && !filterForm) return filterId[0];
        else if (filterId.length === formList.length && !filterForm) return stats.find(item => item.id === id && item.form === "Normal");
        else return filterForm;
    }, [currForm, formList, filterFormName]);

    useEffect(() => {
        if (!currForm) {
            setCurrForm(findFirst());
            pokeID.current = findFirst().form.id;
        } else {
            setStatATK(filterFormList(stats.attack.ranking, id_default));
            setStatDEF(filterFormList(stats.defense.ranking, id_default));
            setStatSTA(filterFormList(stats.stamina.ranking, id_default));
            if (!pokeID.current) {
                pokeID.current = findDefaultForm() ? currForm.form.id : findFirst().form.id;
            }
        }
        if (currForm && dataPoke && onSetPrev && onSetNext) {
            onSetPrev(true);
            onSetNext(true);
        }
    }, [filterFormList, currForm, dataPoke, findFirst, findDefaultForm,
        id_default, onSetNext, onSetPrev, stats.attack.ranking, stats.defense.ranking, stats.stamina.ranking])

    const changeForm = (e) => {
        const [name, form] = e.currentTarget.value.split("=");
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
                {currForm && pokeID.current &&
                    <Fragment>
                    {formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button value={value.form.name+"="+value.form.form_name} key={index} className={"btn btn-form"+(value.form.id === currForm.form.id ? " form-selected" : "")} onClick={(e) => changeForm(e)}>
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
                    </Fragment>
                }
                </div>
            {dataPoke && currForm &&
            <Fragment>
                {ratio.M !== 0 || ratio.F !== 0 ?
                <Fragment>
                {ratio.M !== 0 && <Fragment><Gender ratio={ratio} sex='Male' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                {ratio.M !== 0 && ratio.F !== 0 && <hr></hr>}
                {ratio.F !== 0 && <Fragment><Gender ratio={ratio} sex='Female' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/></Fragment>}
                </Fragment>
                : <Gender sex='Genderless' default_m={currForm.form.sprites.front_default} shiny_m={currForm.form.sprites.front_shiny} default_f={currForm.form.sprites.front_female} shiny_f={currForm.form.sprites.front_shiny_female}/>
                }
                <Stats statATK={statATK}
                    statDEF={statDEF}
                    statSTA={statSTA}
                    pokemonStats={stats}
                    stats={dataPoke}/>
                <hr className='w-100'></hr>
                <div className="row w-100" style={{margin:0}}>
                    <div className="col-md-5" style={{padding:0}}>
                        <Info data={dataPoke} currForm={currForm} />
                        <Raid
                        currForm={currForm}
                        id={id_default}
                        statATK={statATK ? statATK.attack : calBaseATK(dataPoke.stats, true)}
                        statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)}/>
                    </div>
                    <div className="col-md-7" style={{padding:0}}>
                        <TableMove data={dataPoke} form={currForm.form}
                        statATK={statATK ? statATK.attack : calBaseATK(dataPoke.stats, true)}
                        statDEF={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)}
                        statSTA={statSTA ? statSTA.stamina : calBaseSTA(dataPoke.stats, true)}/>
                        <Counter def={statDEF ? statDEF.defense : calBaseDEF(dataPoke.stats, true)} form={currForm.form}/>
                    </div>
                </div>
            </Fragment>
            }
            </div>
            {dataPoke && currForm &&
            <Fragment>
            <hr className="w-100"></hr>
            {formList.filter(item => item[0].form.form_name.includes("mega")).map(item => item[0].form).length > 0 && !currForm.form.form_name.includes("gmax") ?
            <div className='row w-100' style={{margin:0}}>
                <div className='col-xl' style={{padding:0}}>
                <Evolution onSetPrev={onSetPrev} onSetNext={onSetNext} onSetIDPoke={onSetIDPoke} evolution_url={species.evolution_chain.url} id={id_default} form={currForm.form} formDefault={pokeID.current === currForm.form.id} eqForm={formList.length === 1 && species.pokedex_numbers.length > 1}/>
                </div>
                <div className='col-xl' style={{padding:0}}>
                    <Mega formList={formList} id={id_default}/>
                </div>
            </div>
            :
            <Evolution onSetPrev={onSetPrev} onSetNext={onSetNext} onSetIDPoke={onSetIDPoke} evolution_url={species.evolution_chain.url} id={id_default} form={currForm.form} formDefault={pokeID.current === currForm.form.id} region={regionList[parseInt(species.generation.url.split("/")[6])]}/>
            }
            </Fragment>
            }
            </Fragment>
    )
}

export default Form;