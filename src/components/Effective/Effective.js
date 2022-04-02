import React from 'react';
import Type from '../Type/Type';

const Effective = (props) => {

    if (props.typeEffective.length === 0) return false;

    return (
        <div className="element-top">
            <div>
                <h5 className='element-top'>- Pokémon Type Effective:</h5>
                <h6 className='element-top'><b>Weakness</b></h6>
                <Type text={'2.56x damage from'} arr={props.typeEffective.very_weak} />
                <Type text={'1.6x damage from'} arr={props.typeEffective.weak} />
                <h6 className='element-top'><b>Resistance</b></h6>
                <Type text={'0.244x damage from'} arr={props.typeEffective.super_resist} />
                <Type text={'0.391x damage from'} arr={props.typeEffective.very_resist} />
                <Type text={'0.625x damage from'} arr={props.typeEffective.resist} />
                <h6 className='element-top'><b>Neutral</b></h6>
                <Type text={'1x damage from'} arr={props.typeEffective.neutral} />
            </div>
        </div>
    );
}

export default Effective;
