import React, { useCallback, useEffect, useState } from 'react';
import CardType from '../../components/Card/CardType';
import WeatherTypeEffective from '../../components/Effective/WeatherTypeEffective';

const Effect = (prop) => {

    const [types, setTypes] = useState([]);

    const [currentTypePri, setCurrentTypePri] = useState('Bug');
    const [currentTypeSec, setCurrentTypeSec] = useState('');

    const [showTypePri, setShowTypePri] = useState(false);
    const [showTypeSec, setShowTypeSec] = useState(false);

    const [weatherEffective, setWeatherEffective] = useState([]);

    const getWeatherEffective = useCallback(() => {
        let data = [];
        Object.entries(prop.weathers).forEach(([key, value]) => {
            if (value.includes(currentTypePri) && !data.includes(key)) data.push(key);
            if (currentTypeSec !== '' && value.includes(currentTypeSec) && !data.includes(key)) data.push(key);
        });
        setWeatherEffective(data);
    }, [currentTypePri, currentTypeSec, prop.weathers]);

    useEffect(() => {
        const results = Object.keys(prop.types).filter(item => item !== currentTypePri && item !== currentTypeSec);
        setTypes(results);
        getWeatherEffective();
    }, [currentTypePri, currentTypeSec, getWeatherEffective, prop.types]);

    const changeTypePri = (value) => {
        setShowTypePri(false)
        setCurrentTypePri(value.currentTarget.dataset.id);
        getWeatherEffective();
    }

    const changeTypeSec = (value) => {
        setShowTypeSec(false)
        setCurrentTypeSec(value.currentTarget.dataset.id);
        getWeatherEffective();
    }

    const closeTypeSec = () => {
        setShowTypeSec(false);
        setCurrentTypeSec('');
    }

    return (
        <div className="element-top">
            <h5 className='text-center'><b>As Pokémon Types</b></h5>
            <div className="row">
                <div className="col d-flex justify-content-center">
                    <div>
                        <h6 className='text-center'><b>Type 1</b></h6>
                        <div className='card-input' style={{marginBottom: 15}} tabIndex={ 0 } onClick={() => setShowTypePri(true)} onBlur={() => setShowTypePri(false)}>
                            <div className='card-select'>
                            <CardType value={currentTypePri}/>
                            </div>
                            {showTypePri &&
                                <div className="result-type result-weather">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeTypePri.bind(this)}>
                                                <CardType value={value}/>
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
                        <div className='card-input' style={{marginBottom: 15}} tabIndex={ 0 } onClick={() => setShowTypeSec(true)} onBlur={() => setShowTypeSec(false)}>
                            {currentTypeSec === '' ?
                                <div className='type-none'>
                                    <b>None</b>
                                </div>
                            : <div className='type-sec'>
                                <div className='card-select'>
                                    <CardType value={currentTypeSec}/>
                                    <button type="button" className='btn-close btn-close-white remove-close' onMouseDown={closeTypeSec} aria-label="Close"></button>
                                </div>
                            </div>
                            }
                            {showTypeSec &&
                                <div className="result-type result-weather">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } data-id={value} onMouseDown={changeTypeSec.bind(this)}>
                                                <CardType value={value}/>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <WeatherTypeEffective weatherEffective={weatherEffective}/>
        </div>
    );
}

export default Effect;