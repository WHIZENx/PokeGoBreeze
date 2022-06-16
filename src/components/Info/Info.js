import { Fragment } from "react";
import TypeEffective from "../Effective/TypeEffective";
import WeatherTypeEffective from "../Effective/WeatherTypeEffective";
import Type from "../Sprites/Type";

import typeEffective from '../../data/type_effectiveness.json';
import weatherEffective from '../../data/weather_boosts.json';
import { splitAndCapitalize } from "../Calculate/Calculate";

const Info = (props) => {

    const getWeatherEffective = (types) => {
        let data = [];
        Object.entries(weatherEffective).forEach(([key, value]) => {
            types.forEach((type) => {
                if (value.includes(splitAndCapitalize(type.type.name, "-", " ")) && !data.includes(key)) data.push(key);
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
                value_effective *= value[splitAndCapitalize(type.type.name, "-", " ")];
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

    return (
        <Fragment>
            <h4 className='element-top info-title'><b>Infomation</b></h4>
            <h5 className='element-top'>- Pokémon Type:</h5>
            <Type arr={props.currForm ? props.currForm.form.types.map(ele => ele.type.name) : []}/>
            <WeatherTypeEffective weatherEffective={getWeatherEffective(props.currForm ? props.currForm.form.types: [])}/>
            <TypeEffective typeEffective={getTypeEffective(props.currForm ? props.currForm.form.types : [])}/>
        </Fragment>
    )
}

export default Info;