/* eslint-disable react/prop-types */
import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import Type from '../Sprites/Type/Type';

const TypeEffective = (props) => {

    if (!props.typeEffective) return false;

    const noneSprit = () => {
        return (
            <ul className='element-top'>
                <li className='img-group' key={ 0 }>
                    <img height={50} alt='img-pokemon' src={APIService.getPokeSprite(0)}/>
                    <span className='caption text-black'>None</span>
                </li>
            </ul>
        )
    }

    return (
        <div className="element-top">
            <h5 className='element-top'><li>Pokémon Type Effective</li></h5>
            <h6 className='element-top'><b>Weakness</b></h6>
            {props.typeEffective.very_weak.length !== 0 || props.typeEffective.weak.length !== 0 ?
            <Fragment>
                <Type text={'2.56x damage from'} arr={props.typeEffective.very_weak} style={{marginLeft: 15}}/>
                <Type text={'1.6x damage from'} arr={props.typeEffective.weak} style={{marginLeft: 15}}/>
            </Fragment> : noneSprit()
            }
            <h6 className='element-top'><b>Resistance</b></h6>
            {props.typeEffective.super_resist.length !== 0 || props.typeEffective.very_resist.length !== 0 || props.typeEffective.resist.length !== 0 ?
            <Fragment>
            <Type text={'0.244x damage from'} arr={props.typeEffective.super_resist} style={{marginLeft: 15}}/>
            <Type text={'0.391x damage from'} arr={props.typeEffective.very_resist} style={{marginLeft: 15}}/>
            <Type text={'0.625x damage from'} arr={props.typeEffective.resist} style={{marginLeft: 15}}/>
            </Fragment> : noneSprit()
            }
            <h6 className='element-top'><b>Neutral</b></h6>
            <Type text={'1x damage from'} arr={props.typeEffective.neutral} style={{marginLeft: 15}}/>
        </div>
    );
}

export default TypeEffective;
