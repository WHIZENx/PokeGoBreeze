import React, { Fragment } from 'react';
import APIService from '../../../services/API.service'

const Type = (props) => {

    if (!props.arr || props.arr.length === 0) return false;

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <ul className={props.block ? '': 'element-top'} style={props.styled && { padding: 0, margin: 0 }}>
            {props.text && <p>{props.text}</p>}
            {props.arr.map((value, index) => (
                <li style={props.style} className='img-group' key={ index }>
                    {props.hideText ?
                        <img className={props.shadow ? "filter-shadow" : ""} width={props.height} height={props.height} alt='img-pokemon' src={APIService.getTypeSprite(value)}
                        onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeSprite(0)}}/>
                        :
                        <Fragment>
                            <img className={props.shadow ? "filter-shadow" : ""} width={36} height={36} alt='img-pokemon' src={APIService.getTypeSprite(value)}/>
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