import { useSnackbar } from "notistack";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import APIService from "../../services/API.service";
import FormTools from "./FormTools";

const Tools = (props) => {

    const [pokeData, setPokeData] = useState([]);
    const [formList, setFormList] = useState([]);

    const [data, setData] = useState(null);
    
    const [currForm, setCurrForm] = useState(null);

    const pokeID = useRef(null);

    const { enqueueSnackbar } = useSnackbar();

    const fetchMap = useCallback(async (data) => {
        setFormList([]);
        setPokeData([]);
        let dataPokeList = [];
        let dataFromList = [];
        await Promise.all(data.varieties.map(async (value, index) => {
            const poke_info = await APIService.getFetchUrl(value.pokemon.url);
            const poke_form = await Promise.all(poke_info.data.forms.map(async (item) => (await APIService.getFetchUrl(item.url)).data));
            dataPokeList.push(poke_info.data);
            dataFromList.push(poke_form);
        }));
        setPokeData(dataPokeList);
        dataFromList = dataFromList.map(item => {
            return item.map(item => ({form: item, name: data.varieties.find(v => item.pokemon.name.includes(v.pokemon.name)).pokemon.name, default_name: data.name}))
            .sort((a,b) => (a.form.id > b.form.id) ? 1 : ((b.form.id > a.form.id) ? -1 : 0));
        }).sort((a,b) => (a[0].form.id > b[0].form.id) ? 1 : ((b[0].form.id > a[0].form.id) ? -1 : 0));
        setFormList(dataFromList);
        const formDefault = dataFromList.map(item => {
            return item.find(item => item.form.is_default);
        });
        const isDefault = formDefault.find(item => item.form.id === data.id);
        if (formDefault) {
            setCurrForm(isDefault);
            pokeID.current = isDefault.form.id;
        }
        else {
            setCurrForm(formDefault[0]);
            pokeID.current = formDefault[0].form.id;
        }
    }, []);

    const queryPokemon = useCallback((id) => {
        APIService.getPokeSpicies(id)
        .then(res => {
            fetchMap(res.data);
            setData(res.data);
        })
        .catch(err => {
            enqueueSnackbar('Pokémon ID or name: ' + id + ' Not found!', { variant: 'error' });
        });
    }, [enqueueSnackbar, fetchMap]);

    useEffect(() => {
        queryPokemon(props.id);
    }, [props.id, queryPokemon]);

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const splitAndCapitalize = useCallback((string) => {
        return string.split("-").map(text => capitalize(text)).join(" ");
    }, []);

    const changeForm = (e) => {
        const findForm = formList.map(item => item.find(item => item.form.name === e.currentTarget.value)).find(item => item);
        setCurrForm(findForm);
    }

    return (
        <Fragment>
            <img height={200} alt="img-full-pokemon" src={APIService.getPokeFullSprite(props.id)}></img>
            <h4><b>#{props.id} {props.name}</b></h4>
            {currForm && pokeID && pokeData.length === data.varieties.length && formList.length === data.varieties.length &&
                <Fragment>
                <div className="scroll-card" style={{overflowX: (formList.reduce((a,e) => a+e.length, 0) > 3)? "scroll" : "hidden"}}>
                    {formList.map((value, index) => (
                        <Fragment key={index}>
                            {value.map((value, index) => (
                                <button value={value.form.name} key={index} className={"btn btn-form"+(value.form.id === currForm.form.id ? " form-selected" : "")} onClick={(e) => changeForm(e)}>
                                    <img width={64} height={64} onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeIconSprite(value.default_name)}} alt="img-icon-form" src={APIService.getPokeIconSprite(value.form.name)}></img>
                                    <p>{value.form.form_name === "" ? "Normal" : splitAndCapitalize(value.form.form_name, " ")}</p>
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
                <FormTools id={props.id} dataPoke={pokeData} currForm={currForm} formList={formList} stats={props.stats} onSetStats={props.onHandleSetStats}/>
                </Fragment>
            }
        </Fragment>
    )
}

export default Tools;