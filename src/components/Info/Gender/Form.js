import React from 'react';
import APIService from '../../../services/API.service'

import './Form.css';

const Form = (props) => {

    const calculateRatio = (sex, ratio) => {
        let maleRatio = parseInt(ratio.charAt(0));
        let femaleRatio = parseInt(ratio.charAt(3));
        let sumAll = maleRatio+femaleRatio
        return (sex.toLowerCase() === 'male') ? maleRatio*100/sumAll : femaleRatio*100/sumAll;
    }

    return (
        <div className='element-top'>
            <img width='40' height='40' className='gender-img' alt='img-pokemon-sex' src={APIService.getGenderSprite(props.sex)}></img>
            <ul>
                <li className='img-group'>
                    <img alt='img-pokemon' src={(props.sex.toLowerCase() === 'male') ? 
                        (props.default_m) ? props.default_m : props.default_f :
                        (props.default_f) ? props.default_f : props.default_m}></img> 
                    <span className="caption">Original form</span>
                </li>
                <li className='img-group'>
                    <img alt='img-pokemon' src={(props.sex.toLowerCase() === 'male') ? 
                        (props.shiny_m) ? props.shiny_m : props.shiny_f :
                        (props.shiny_f) ? props.shiny_f : props.shiny_m}></img> 
                    <span className="caption">Shiny form</span>
                </li>
            </ul>
            { props.ratio && <h6>{props.sex} ratio: {calculateRatio(props.sex, props.ratio)}%</h6>}
        </div>
    );
}

export default Form;