import React, {useEffect, useRef, useState, useCallback} from 'react';
import APIService from '../../components/API.service'

import './Type.css';

const Defender = () => {

    var resRef = useRef([]);
    const [types, setTypes] = useState([]);

    const [typeEffective, setTypeEffective] = useState([]);

    const [currentTypePri, setCurrentTypePri] = useState('Bug');
    const [currentTypeSec, setCurrentTypeSec] = useState('');

    const [showTypePri, setShowTypePri] = useState(false);
    const [showTypeSec, setShowTypeSec] = useState(false);

    const getTypeEffective = useCallback(() => {
        let data = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        }
        Object.entries(resRef.current.data).forEach(([key, value]) => {
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
        setTypeEffective(data);
    }, [currentTypePri, currentTypeSec]);
    
    useEffect(() => {
        const fetchMyAPI = async () => {
            resRef.current = await APIService.getPokeJSON('type_effectiveness.json');
            const results = Object.keys(resRef.current.data).filter(item => item !== currentTypePri && item !== currentTypeSec);
            setTypes(results);
            getTypeEffective();
        }
        fetchMyAPI()
        
    }, [currentTypePri, currentTypeSec, getTypeEffective]);

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
        setShowTypeSec(false);
        setCurrentTypeSec('');
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
                                <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(currentTypePri)}></img>
                                <b>{currentTypePri}</b>
                            </div>
                            {showTypePri &&
                                <div className="result-type">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeTypePri.bind(this)}>
                                                <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(value)}></img>
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
                                    <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(currentTypeSec)}></img>
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
                                                <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(value)}></img>
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
            {typeEffective.length !== 0 &&
                <div className='element-top'>
                    <h5 className='element-top'>- Pokémon Type Effective:</h5>
                    <h6 className='element-top'><b>Weakness</b></h6>
                    {typeEffective.very_weak.length !== 0 &&
                        <ul className='element-top'>
                            <p>2.56x damage from</p>
                            {typeEffective.very_weak.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    <ul className='element-top'>
                        <p>1.6x damage from</p>
                        {typeEffective.weak.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                <span className='caption text-black'>{value}</span>
                            </li>
                        ))
                        }
                    </ul>
                    <h6 className='element-top'><b>Resistance</b></h6>
                    {typeEffective.super_resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.244x damage from</p>
                            {typeEffective.super_resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    {typeEffective.very_resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.391x damage from</p>
                            {typeEffective.very_resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    {typeEffective.resist.length !== 0 &&
                        <ul className='element-top'>
                            <p>0.625x damage from</p>
                            {typeEffective.resist.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
                                    <span className='caption text-black'>{value}</span>
                                </li>
                            ))
                            }
                        </ul>
                    }
                    <h6 className='element-top'><b>Neutral</b></h6>
                    <ul className='element-top'>
                        <p>1x damage from</p>
                        {typeEffective.neutral.map((value, index) => (
                            <li className='img-group' key={ index }>
                                <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
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