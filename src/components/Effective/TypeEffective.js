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
            <h5 className='element-top'>- Pokémon Type Effective:</h5>
            <h6 className='element-top'><b>Weakness</b></h6>
            {props.typeEffective.very_weak.length !== 0 || props.typeEffective.weak.length !== 0 ?
            <Fragment>
                <Type text={'2.56x damage from'} arr={props.typeEffective.very_weak} />
                <Type text={'1.6x damage from'} arr={props.typeEffective.weak} />
            </Fragment> : noneSprit()
            }
            <h6 className='element-top'><b>Resistance</b></h6>
            {props.typeEffective.super_resist.length !== 0 || props.typeEffective.very_resist.length !== 0 || props.typeEffective.resist.length !== 0 ?
            <Fragment>
            <Type text={'0.244x damage from'} arr={props.typeEffective.super_resist} />
            <Type text={'0.391x damage from'} arr={props.typeEffective.very_resist} />
            <Type text={'0.625x damage from'} arr={props.typeEffective.resist} />
            </Fragment> : noneSprit()
            }
            <h6 className='element-top'><b>Neutral</b></h6>
            <Type text={'1x damage from'} arr={props.typeEffective.neutral} />
        </div>
    );
}

export default TypeEffective;
