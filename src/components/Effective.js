import React, {useState, useEffect} from 'react';

const Effective = (props) => {

    const [type_effective, setType_effective] = useState(props);

    useEffect(() => {
        console.log(type_effective)
    }, [type_effective]);

    const typeCollection = (type) => {
        return 'https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_'+type.toUpperCase()+'.png'
    }

    return (
        <div className="element-top">
            {/* {type_effective.length !== 0 &&
                <div>
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
            } */}
        </div>
    );
}

export default Effective;
