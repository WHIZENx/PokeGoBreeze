import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.css';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../../util/Utils';
import { RootStateOrAny, useSelector } from 'react-redux';

const PokemonModel = (props: { id: any; name: string; }) => {

    const data = useSelector((state: RootStateOrAny) => state.store.data);

    const [pokeAssets, setPokeAssets]: any = useState([]);
    const gender: any = useRef(null);
    const sound: any = useRef(null);

    const getImageList = useCallback((id: any) => {
        const model = data.assets.find((item: { id: any; }) => item.id === id);
        sound.current = data.assets.find((item: { id: any; }) => item.id === id);
        const detail = data.details.find((item: { id: any; }) => item.id === id);
        gender.current = detail ? detail.gender : null;
        return model ? Array.from(new Set(model.image.map((item: { form: any; }) => item.form))).map(value => {
            return {form: value, image: model.image.filter((item: { form: any; }) => value === item.form)}
        }) : [];
    }, [data.assets]);

    useEffect(() => {
        setPokeAssets(getImageList(props.id));
    }, [getImageList, props.id]);

    return (
        <div className='element-top'>
            <h4 className="title-evo"><b>{"Assets of "+splitAndCapitalize(props.name, "_", " ")+" in Pokémon Go"}</b> <img width={36} height={36} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}/></h4>
            <div>
                {pokeAssets.map((assets: { image: { gender: number; shiny: string; default: string; }[]; form: string; }, index: React.Key | null | undefined) => (
                    <div key={index} className="d-inline-block group-model text-center">
                        {assets.image.map((value: { gender: number; shiny: string; default: string; }, index: React.Key | null | undefined) => (
                        <div key={index} className="d-inline-block" style={{width: value.gender === 3 ? '100%': 'auto'}}>
                            <div className='sub-group-model'>
                                {gender.current && !gender.current.genderlessPercent &&
                                <div className='gender'>
                                    {value.gender === 3 ?
                                    <Fragment>
                                        {gender.current.malePercent !== 0 && <MaleIcon sx={{ color: 'blue' }}/>}
                                        {gender.current.FemalePercent !== 0 && <FemaleIcon sx={{ color: 'red' }}/>}
                                    </Fragment>
                                    :
                                    <Fragment>{value.gender === 1 ?
                                        <MaleIcon sx={{ color: 'blue' }}/>
                                    :
                                        <FemaleIcon sx={{ color: 'red' }}/>
                                    }</Fragment>
                                    }
                                </div>
                                }
                                <div className='model text-center' style={{minWidth: value.shiny ? "50%" : "100%"}}>
                                    <div className='d-flex w-100 justify-content-center'>
                                        <div style={{width: 80}}>
                                            <img className='pokemon-sprite-model' alt='pokemon-model' src={APIService.getPokemonModel(value.default)}/>
                                        </div>
                                    </div>
                                    <span className='caption'>Default</span>
                                </div>
                                {value.shiny && <div className='model text-center'>
                                    <div className='d-flex w-100 justify-content-center'>
                                        <div style={{width: 80}}>
                                            <img className='pokemon-sprite-model' alt='pokemon-model' src={APIService.getPokemonModel(value.shiny)}/>
                                        </div>
                                    </div>
                                    <span className='caption'>Shiny</span>
                                </div>}
                            </div>
                        </div>
                        ))
                        }
                        <div className='desc'>{splitAndCapitalize(assets.form.toLowerCase(), "_", " ")}</div>
                    </div>
                ))
                }
                {pokeAssets.length === 0 &&
                <div style={{marginBottom: 15}}>Assets in Pokémon Go unavailable.</div>
                }
            </div>
            <h4 className="title-evo"><b>{"Sound of "+splitAndCapitalize(props.name, "_", " ")}</b></h4>
            {/* <h6>Pokémon Origin:</h6>
            <audio className="w-100" controls style={{height: 30}}>
                <source src={APIService.getSoundCryPokemon(props.name)} type="audio/aif"></source>
                Your browser does not support the audio element.
            </audio>
            <h6>Pokémon GO:</h6> */}
            {!sound.current || sound.current.sound.cry.length === 0 ?
            <div>Sound in Pokémon Go unavailable.</div>
            :
            <ul style={{margin: 0}}>
                {sound.current.sound.cry.map((value: { form: string; path: string; }, index: React.Key | null | undefined) => (
                    <li key={index} style={{listStyleType: 'disc'}}>
                        <h6>Form: {splitAndCapitalize(value.form, "_", " ")}</h6>
                        <audio src={APIService.getSoundPokemonGO(value.path)} className="w-100" controls style={{height: 30}}>
                            <source type="audio/wav"></source>
                            Your browser does not support the audio element.
                        </audio>
                    </li>
                ))
                }
            </ul>
            }
        </div>
    )
}

export default PokemonModel;