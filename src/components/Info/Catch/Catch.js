import React, { useState } from 'react';
import APIService from '../../services/API.service';

const Catch = (props) => {

    const [catchPoke, setCatchPoke] = useState(null);

    // useEffect(() => {
    //     const fetchMyAPI = async () => {
    //         const res = await APIService.getPokeJSON('shiny_pokemon.json')
    //     }
    //     fetchMyAPI()
    //     if (!typeEffective) {
    //         APIService.getPokeJSON('type_effectiveness.json')
    //         .then(res => {
    //             setTypeEffective(res.data);
    //         })
    //         .catch(err => {
    //             enqueueSnackbar(err, { variant: 'error' })
    //         })
    //     }
    // }, [typeEffective, enqueueSnackbar]);

    return (
        <div className='element-top'>
            <img width='40' height='40' alt='img-pokemon-sex' src={APIService.getGenderSprite(props.sex)}></img>
            <ul>
                <li className='img-group'>
                    <img alt='img-pokemon' src={(props.sex === 'male') ? 
                        (props.default_m) ? props.default_m : props.default_f :
                        (props.default_f) ? props.default_f : props.default_m}></img> 
                    <span className="caption">Original form</span>
                </li>
                <li className='img-group'>
                    <img alt='img-pokemon' src={(props.sex === 'male') ? 
                        (props.shiny_m) ? props.shiny_m : props.shiny_f :
                        (props.shiny_f) ? props.shiny_f : props.shiny_m}></img> 
                    <span className="caption">Shiny form</span>
                </li>
            </ul>
        </div>
    );
}

export default Catch;