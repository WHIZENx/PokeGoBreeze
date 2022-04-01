import React, {useEffect, useState} from 'react';

import data_effective from '../../type_effectiveness.json';

import './Type.css';

const Attacker = () => {

    let typeList = [];
    const [types, setTypes] = useState([]);

    const [currentType, setCurrentType] = useState('Bug');
    const [showType, setShowType] = useState(false);

    const [type_effective, setType_effective] = useState([]);

    useEffect(() => {
        Object.entries(data_effective).forEach(([key, value]) => {
            typeList.push(key);
        });
        
        const results = typeList.filter(item => item !== currentType);
        setTypes(results);

        setType_effective(getTypeEffective());
        
    }, [currentType]);

    const getTypeEffective = () => { 
        let data = {
            weak: [],
            very_resist: [],
            resist: [],
            neutral: []
        }
        Object.entries(data_effective[currentType]).forEach(([key, value]) => {
            if (value === 1.6) data.weak.push(key);
            else if (value === 1) data.neutral.push(key);
            else if (value === 0.625) data.resist.push(key);
            else data.very_resist.push(key);
        });
        return data;
    }

    const typeCollection = (type) => {
        return 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_'+type.toUpperCase()+'.png'
    }

    const changeType = (value) => {
        setShowType(false)
        setCurrentType(value.currentTarget.dataset.id);
        setType_effective(getTypeEffective());
    }

    return (
        <div className="element-top">
            <h5 className='text-center'><b>As Attacker</b></h5>
            <h6 className='text-center'><b>Select Type</b></h6>
            <div className=' d-flex justify-content-center'>
                <div className='card-input' tabIndex={ 0 } onClick={() => setShowType(true)} onBlur={() => setShowType(false)}>
                    <div className='card-select'>
                        <img alt='type-logo' className='img-type' src={typeCollection(currentType)}></img>
                        <b>{currentType}</b>
                    </div>
                    {showType &&
                        <div className="result-type">
                            <ul>
                                {types.map((value, index) => (
                                    <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeType.bind(this)}>
                                        <img alt='type-logo' className='img-type' src={typeCollection(value)}></img>
                                        <b>{value}</b>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                </div>
                
            </div>
            {type_effective.length !== 0 &&
            <div>
                <h5 className='element-top'>- Pokémon Type Effective:</h5>
                <h6 className='element-top'><b>Weakness</b></h6>
                <ul className='element-top'>
                    <p>1.6x damage from</p>
                    {type_effective.weak.length !== 0 ?
                        <div>
                            {type_effective.weak.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </div>
                     : <div>
                         <li key='0'>None</li>
                       </div>
                    }
                </ul>
                <h6 className='element-top'><b>Resistance</b></h6>
                {type_effective.very_resist.length !== 0 &&
                    <ul className='element-top'>
                        <p>0.391x damage from</p>
                        {type_effective.very_resist.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                }
                {type_effective.resist.length !== 0 &&
                    <ul className='element-top'>
                        <p>0.625x damage from</p>
                        {type_effective.resist.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                }
                <h6 className='element-top'><b>Neutral</b></h6>
                <ul className='element-top'>
                    <p>1x damage from</p>
                    {type_effective.neutral.map((value, index) => (
                        <li className='img-group' key={ index }>
                            <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                            <span className='caption text-black'>{value}</span>
                        </li>
                    ))
                    }
                </ul>
            </div>
            }
        </div>
    );
}

export default Attacker;