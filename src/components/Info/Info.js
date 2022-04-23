import { Fragment } from "react";
import TypeEffective from "../Effective/TypeEffective";
import WeatherTypeEffective from "../Effective/WeatherTypeEffective";
import Type from "../Sprits/Type";

import typeEffective from '../../data/type_effectiveness.json';
import weatherEffective from '../../data/weather_boosts.json';

const Info = (props) => {

    const getWeatherEffective = (types) => {
        let data = [];
        Object.entries(weatherEffective).forEach(([key, value]) => {
            types.forEach((type) => {
                if (value.includes(splitAndCapitalize(type.type.name)) && !data.includes(key)) data.push(key);
            });
        });
        return data;
    };

    const getTypeEffective = (types) => {
        let data = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        };
        Object.entries(typeEffective).forEach(([key, value]) => {
            let value_effective = 1;
            types.forEach((type) => {
                value_effective *= value[splitAndCapitalize(type.type.name)];
            });
            if (value_effective >= 2.56) data.very_weak.push(key);
            else if (value_effective >= 1.6) data.weak.push(key);
            else if (value_effective >= 1) data.neutral.push(key);
            else if (value_effective >= 0.625) data.resist.push(key);
            else if (value_effective >= 0.39) data.very_resist.push(key);
            else if (value_effective >= 0.2) data.super_resist.push(key);
            else data.neutral.push(key);
        });
        return data;
    };

    const splitAndCapitalize = (string) => {
        return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    }

    return (
        <Fragment>
            <h4 className='element-top info-title'>Infomation</h4>
            <h5 className='element-top'>- Pokémon Type:</h5>
            <Type arr={props.currForm.form.types.map(ele => ele.type.name)}/>
            <WeatherTypeEffective weatherEffective={getWeatherEffective(props.currForm.form.types)}/>
            <TypeEffective typeEffective={getTypeEffective(props.currForm.form.types)}/>
            <h5 className='element-top'>- Pokémon height: {props.data.height/10} m, weight: {props.data.weight/10} kg</h5>
        </Fragment>
    )
}

export default Info;