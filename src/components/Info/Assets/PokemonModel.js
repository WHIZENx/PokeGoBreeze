import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import pokemonData from '../../../data/pokemon.json';
import pokeImageList from '../../../data/assets_pokemon_go.json';

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';

import './PokemonModel.css';
import APIService from '../../../services/API.service';
import { splitAndCapitalize } from '../../Calculate/Calculate';

const PokemonModel = (props) => {

    const getImageList = useCallback(() => {
        let model = pokeImageList.find(item => item.id === props.id);
        return Array.from(new Set(model.image.map(item => item.form))).map(value => {
            return {form: value, image: model.image.filter(item => value === item.form)}
        });
    }, [props.id]);

    const [pokeAssets, setPokeAssets] = useState([]);
    const gender = useRef(Object.values(pokemonData).find(item => item.num === props.id).genderRatio);

    useEffect(() => {
        if (pokeAssets.length === 0) setPokeAssets(getImageList());
    }, [getImageList, pokeAssets.length]);

    return (
        <div>
            <h4 className="title-evo"><b>{"Assets of "+splitAndCapitalize(props.name, "_", " ")+" in Pokemon Go"}</b> <img width={36} height={36} alt='pokemon-go-icon' src={APIService.getPokemonGoIcon('Standard')}></img></h4>
            <div>
                {pokeAssets.map((assets, index) => (
                    <div key={index} className="d-inline-block group-model center">
                        {assets.image.map((value, index) => (
                        <div key={index} className="d-inline-block">
                            <div className='sub-group-model'>
                                <div className='gender'>
                                    {value.gender === 3 ?
                                        <Fragment>
                                            {(gender.current.M !== 0 || gender.current.F !== 0) &&
                                            <Fragment>
                                                {gender.current.M !== 0 && <MaleIcon sx={{ color: 'blue' }}/>}
                                                {gender.current.F !== 0 && <FemaleIcon sx={{ color: 'red' }}/>}
                                            </Fragment>
                                            }
                                        </Fragment>
                                    : <Fragment>{value.gender === 1 ?
                                        <MaleIcon sx={{ color: 'blue' }}/>
                                    :
                                        <FemaleIcon sx={{ color: 'red' }}/>
                                    }</Fragment>
                                    }
                                </div>
                                <div className='model center' style={{width: 100/(assets.image.length+assets.image.filter(item => item.shiny).length)+"%"}}>
                                    <img alt='pokemon-model' height={80} src={APIService.getPokemonModel(value.default)}></img>
                                    <span className='caption'>Default</span>
                                </div>
                                {value.shiny && <div className='model center' style={{width: 100/(assets.image.length+assets.image.filter(item => item.shiny).length)+"%"}}>
                                    <img alt='pokemon-model' height={80} src={APIService.getPokemonModel(value.shiny)}></img>
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
                <div style={{marginBottom: 15}}>Assets in Pokemon Go unavailable.</div>
                }
            </div>
            <h4 className="title-evo"><b>{"Sound of "+splitAndCapitalize(props.name, "_", " ")}</b></h4>
            {/* <h6>Pokemon Origin:</h6>
            <audio className="w-100" controls style={{height: 30}}>
                <source src={APIService.getSoundCryPokemon(props.name)} type="audio/aif"></source>
                Your browser does not support the audio element.
            </audio>
            <h6>Pokemon GO:</h6> */}
            <audio className="w-100" controls style={{height: 30}}>
                <source src={APIService.getSoundPokemonGO(props.id)} type="audio/wav"></source>
                Your browser does not support the audio element.
            </audio>
        </div>
    )
}

export default PokemonModel;