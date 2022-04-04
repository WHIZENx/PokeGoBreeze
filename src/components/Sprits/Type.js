import React from 'react';
import APIService from '../../services/API.service'

const Type = (props) => {

    if (!props.arr) return false;

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <ul className='element-top'>
            {props.text && <p>{props.text}</p>}
            {props.arr.map((value, index) => (
                <li className='img-group' key={ index }>
                    <img width={36} height={36} alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                    <span className='caption text-black'>{capitalize(value)}</span>
                </li>
            ))
            }
        </ul>
    );
}

export default Type;