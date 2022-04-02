import React, {useEffect, useRef, useState, useCallback} from 'react';
import APIService from '../../components/API.service'

import './Type.css';

const Attacker = () => {

    var resRef = useRef(null);
    const [types, setTypes] = useState([]);

    const [currentType, setCurrentType] = useState('Bug');
    const [showType, setShowType] = useState(false);

    const [typeEffective, setTypeEffective] = useState([]);

    const getTypeEffective = useCallback(() => {
        let data = {
            weak: [],
            very_resist: [],
            resist: [],
            neutral: []
        }
        Object.entries(resRef.current.data[currentType]).forEach(([key, value]) => {
            if (value === 1.6) data.weak.push(key);
            else if (value === 1) data.neutral.push(key);
            else if (value === 0.625) data.resist.push(key);
            else data.very_resist.push(key);
        });
        setTypeEffective(data);
    }, [currentType]);

    useEffect(() => {
        const fetchMyAPI = async () => {
            resRef.current = await APIService.getPokeJSON('type_effectiveness.json');
            const results = Object.keys(resRef.current.data).filter(item => item !== currentType);
            setTypes(results);
            getTypeEffective();
        }
        fetchMyAPI();
    }, [currentType, getTypeEffective]);

    const changeType = (value) => {
        setShowType(false)
        setCurrentType(value.currentTarget.dataset.id);
        getTypeEffective();
    }

    return (
        <div className="element-top">
            <h5 className='text-center'><b>As Attacker</b></h5>
            <h6 className='text-center'><b>Select Type</b></h6>
            <div className=' d-flex justify-content-center'>
                <div className='card-input' tabIndex={ 0 } onClick={() => setShowType(true)} onBlur={() => setShowType(false)}>
                    <div className='card-select'>
                        <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(currentType)}></img>
                        <b>{currentType}</b>
                    </div>
                    {showType &&
                        <div className="result-type">
                            <ul>
                                {types.map((value, index) => (
                                    <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeType.bind(this)}>
                                        <img alt='type-logo' className='img-type' src={APIService.getTypeSprite(value)}></img>
                                        <b>{value}</b>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    }
                </div>
                
            </div>
            {typeEffective.length !== 0 &&
            <div>
                <h5 className='element-top'>- Pokémon Type Effective:</h5>
                <h6 className='element-top'><b>Weakness</b></h6>
                <ul className='element-top'>
                    <p>1.6x damage from</p>
                    {typeEffective.weak.length !== 0 ?
                        <div>
                            {typeEffective.weak.map((value, index) => (
                                <li className='img-group' key={ index }>
                                    <img className='type-logo' alt='img-pokemon' src={APIService.getTypeSprite(value)}></img>
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

export default Attacker;