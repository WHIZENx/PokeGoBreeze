import React from 'react';
import APIService from '../../services/API.service'

const Gender = (props) => {

    // const calculateRatio = (sex, ratio) => {
    //     let maleRatio = parseInt(ratio.charAt(0));
    //     let femaleRatio = parseInt(ratio.charAt(3));
    //     let sumAll = maleRatio+femaleRatio
    //     return (sex.toLowerCase() === 'male') ? maleRatio*100/sumAll : femaleRatio*100/sumAll;
    // }

    const calculateRatio = (sex, ratio) => {
        let maleRatio = ratio.M;
        let femaleRatio = ratio.F;
        return (sex.toLowerCase() === 'male') ? maleRatio*100 : femaleRatio*100;
    }

    return (
        <div className='element-top'>
            <div className='img-gender'>
                <img width={40} height={40} alt='img-pokemon-sex' src={APIService.getGenderSprite(props.sex)}></img>
            </div>
            <div className='ratio-gender'>
                { props.ratio ? <h6>{props.sex} ratio: {calculateRatio(props.sex, props.ratio)}%</h6>
            :   <h6>{props.sex} ratio: 100%</h6>}
            </div>
            <ul>
                <li className='img-form-gender-group'>
                    <img width={96} height={96} alt='img-pokemon' src={(props.sex.toLowerCase() === 'male') ?
                        (props.default_m) ? props.default_m : props.default_f ? props.default_f : APIService.getPokeSprite(0) :
                        (props.default_f) ? props.default_f : props.default_m ? props.default_m : APIService.getPokeSprite(0)}></img>
                    <span className="caption">Default</span>
                </li>
                <li className='img-group'>
                    <img width={96} height={96} alt='img-pokemon' src={(props.sex.toLowerCase() === 'male') ?
                        (props.shiny_m) ? props.shiny_m : props.shiny_f ? props.shiny_f : APIService.getPokeSprite(0) :
                        (props.shiny_f) ? props.shiny_f : props.shiny_m ? props.shiny_m : APIService.getPokeSprite(0) }></img>
                    <span className="caption">Shiny</span>
                </li>
            </ul>

        </div>
    );
}

export default Gender;