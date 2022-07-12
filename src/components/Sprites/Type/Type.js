import React from 'react';
import APIService from '../../../services/API.service'

import './Type.css';

const Type = (props) => {

    if (!props.arr || props.arr.length === 0) return false;

    const capitalize = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className={(props.block ? '': 'element-top')+(props.shadow ? ' filter-shadow' : '')} style={props.style}>
            {props.text && <p>{props.text}</p>}
            <div className="d-inline-flex flex-wrap type-list justify-content-center align-items-center">
                {props.arr.map((value, index) => (
                    <div className='text-center d-flex' key={ index }>
                        {props.hideText ?
                            <img className={props.shadow ? "filter-shadow" : ""} width={props.height} height={props.height} alt='img-pokemon' src={APIService.getTypeSprite(value)}
                            onError={(e) => {e.onerror=null; e.target.src=APIService.getPokeSprite(0)}}/>
                            :
                            <div>
                                <img className={props.shadow ? "filter-shadow" : ""} width={36} height={36} alt='img-pokemon' src={APIService.getTypeSprite(value)}/>
                                <span className={'caption'+(props.shadow ? " text-shadow" : "")} style={{color: props.color ?? 'black'}}>{capitalize(value)}</span>
                            </div>
                        }
                    </div>
                ))
                }
            </div>
        </div>
    );
}

export default Type;