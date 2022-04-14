import React, { Fragment } from 'react';
import APIService from '../../services/API.service'

const Type = (props) => {

    if (!props.arr || props.arr.length === 0) return false;

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <ul className='element-top' style={props.styled && { padding: 0, margin: 0 }}>
            {props.text && <p>{props.text}</p>}
            {props.arr.map((value, index) => (
                <li className='img-group' key={ index }>
                    {props.height ?
                        <img width={props.height} height={props.height} alt='img-pokemon' src={APIService.getTypeSprite(value)}
                        onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeSprite(0)}}></img>
                        :
                        <Fragment>
                            <img width={36} height={36} alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                            <span className='caption text-black'>{capitalize(value)}</span>
                        </Fragment>
                    }
                </li>
            ))
            }
        </ul>
    );
}

export default Type;