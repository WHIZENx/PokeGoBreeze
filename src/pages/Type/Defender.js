import React, {useEffect, useState} from 'react';

import data_effective from '../../type_effectiveness.json';

import './Type.css';

const Defender = () => {

    let typeList = [];
    const [types, setTypes] = useState([]);

    const [type_effective, setType_effective] = useState([]);

    const [currentTypePri, setCurrentTypePri] = useState('Bug');
    const [currentTypeSec, setCurrentTypeSec] = useState('');

    const [showTypePri, setShowTypePri] = useState(false);
    const [showTypeSec, setShowTypeSec] = useState(false);
    
    useEffect(() => {
        Object.entries(data_effective).forEach(([key, value]) => {
            typeList.push(key);
        });
        
        const results = typeList.filter(item => item !== currentTypePri && item !== currentTypeSec);
        setTypes(results);

        getTypeEffective();
        
    }, [currentTypePri, currentTypeSec]);

    const typeCollection = (type) => {
        return 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_'+type.toUpperCase()+'.png'
    }

    const changeTypePri = (value) => {
        setShowTypePri(false)
        setCurrentTypePri(value.currentTarget.dataset.id);
        getTypeEffective();
    }

    const changeTypeSec = (value) => {
        setShowTypeSec(false)
        setCurrentTypeSec(value.currentTarget.dataset.id);
        getTypeEffective();
    }

    const closeTypeSec = () => {
        setCurrentTypeSec('');
        setShowTypeSec(false);
    }

    const getTypeEffective = () => { 
        let data = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        }
        Object.entries(data_effective).forEach(([key, value]) => {
            let value_effective = 1;
            value_effective *= value[currentTypePri];
            value_effective *= (currentTypeSec === '') ? 1 : value[currentTypeSec];
            if (value_effective >= 2.56) data.very_weak.push(key);
            else if (value_effective >= 1.6) data.weak.push(key);
            else if (value_effective >= 1) data.neutral.push(key);
            else if (value_effective >= 0.625) data.resist.push(key);
            else if (value_effective >= 0.39) data.very_resist.push(key);
            else data.super_resist.push(key);
        });
        setType_effective(data);
    }

    return (
        <div className="element-top">
            <h5 className='text-center'><b>As Defender</b></h5>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div>
                        <h6 className='text-center'><b>Type 1</b></h6>
                        <div className='card-input' tabIndex={ 0 } onClick={() => setShowTypePri(true)} onBlur={() => setShowTypePri(false)}>
                            <div className='card-select'>
                                <img alt='type-logo' className='img-type' src={typeCollection(currentTypePri)}></img>
                                <b>{currentTypePri}</b>
                            </div>
                            {showTypePri &&
                                <div className="result-type">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeTypePri.bind(this)}>
                                                <img alt='type-logo' className='img-type' src={typeCollection(value)}></img>
                                                <b>{value}</b>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className="col d-flex justify-content-center">
                    <div>
                        <h6 className='text-center'><b>Type 2</b></h6>
                        <div className='card-input' tabIndex={ 0 } onClick={() => setShowTypeSec(true)} onBlur={() => setShowTypeSec(false)}>
                            {currentTypeSec === '' ?
                                <div className='type-none'>
                                    <b>None</b>
                                </div>
                            : <div className='type-sec'>
                                <div className='card-select'>
                                    <img alt='type-logo' className='img-type' src={typeCollection(currentTypeSec)}></img>
                                    <b>{currentTypeSec}</b>
                                    <b className='close' onMouseDown={closeTypeSec}><span aria-hidden="true">&times;</span></b>
                                </div>
                            </div>
                            }
                            {showTypeSec &&
                                <div className="result-type">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeTypeSec.bind(this)}>
                                                <img alt='type-logo' className='img-type' src={typeCollection(value)}></img>
                                                <b>{value}</b>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {type_effective.length !== 0 &&
                <div className='element-top'>
                    <h5 className='element-top'>- Pokémon Type Effective:</h5>
                    <h6 className='element-top'><b>Weakness</b></h6>
                    {type_effective.very_weak.length !== 0 &&
                        <ul className='element-top'>
                            <p>2.56x damage from</p>
                            {type_effective.very_weak.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    <ul className='element-top'>
                        <p>1.6x damage from</p>
                        {type_effective.weak.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                    <h6 className='element-top'><b>Resistance</b></h6>
                    {type_effective.super_resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.244x damage from</p>
                            {type_effective.super_resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={typeCollection(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
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

export default Defender;