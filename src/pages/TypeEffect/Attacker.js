import React, {useEffect, useState, useCallback} from 'react';
import Effective from '../../components/Effective/Effective';
import APIService from '../../services/API.service'

const Attacker = (prop) => {

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
        Object.entries(prop.types[currentType]).forEach(([key, value]) => {
            if (value === 1.6) data.weak.push(key);
            else if (value === 1) data.neutral.push(key);
            else if (value === 0.625) data.resist.push(key);
            else data.very_resist.push(key);
        });
        setTypeEffective(data);
    }, [currentType, prop.types]);

    useEffect(() => {
        const results = Object.keys(prop.types).filter(item => item !== currentType);
        setTypes(results);
        getTypeEffective();
    }, [currentType, getTypeEffective, prop.types]);

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
            <Effective typeEffective={typeEffective}/>
        </div>
    );
}

export default Attacker;