import React, {useEffect, useState, useCallback} from 'react';
import TypeEffective from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';

const Defender = (prop) => {

    const [types, setTypes] = useState(null);

    const [typeEffective, setTypeEffective] = useState(null);

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
        Object.entries(prop.types).forEach(([key, value]) => {
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
    }, [currentTypePri, currentTypeSec, prop.types]);

    useEffect(() => {
        const results = Object.keys(prop.types).filter(item => item !== currentTypePri && item !== currentTypeSec);
        setTypes(results);
        getTypeEffective();
    }, [currentTypePri, currentTypeSec, getTypeEffective, prop.types]);

    const changeTypePri = (value) => {
        setShowTypePri(false)
        setCurrentTypePri(value);
        getTypeEffective();
    }

    const changeTypeSec = (value) => {
        setShowTypeSec(false)
        setCurrentTypeSec(value);
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
                        <div className='card-input' style={{marginBottom: 15}} tabIndex={ 0 } onClick={() => setShowTypePri(true)} onBlur={() => setShowTypePri(false)}>
                            <div className='card-select'>
                            <CardType value={currentTypePri}/>
                            </div>
                            {showTypePri &&
                                <div className="result-type">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } onMouseDown={() => changeTypePri(value)}>
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
                                <div className="result-type">
                                    <ul>
                                        {types.map((value, index) => (
                                            <li className="container card-pokemon" key={ index } onMouseDown={() => changeTypeSec(value)}>
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
            <TypeEffective typeEffective={typeEffective}/>
        </div>
    );
}

export default Defender;