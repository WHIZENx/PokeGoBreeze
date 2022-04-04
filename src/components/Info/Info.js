import { Fragment, useCallback } from "react";
import TypeEffective from "../Effective/TypeEffective";
import WeatherTypeEffective from "../Effective/WeatherTypeEffective";
import Type from "../Sprits/Type";

const Info = (props) => {

    const getWeatherEffective =(types) => {
        let data = [];
        Object.entries(props.weatherEffective).forEach(([key, value]) => {
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
        Object.entries(props.typeEffective).forEach(([key, value]) => {
            let value_effective = 1;
            types.forEach((type) => {
                value_effective *= value[splitAndCapitalize(type.type.name)];
            });
            if (value_effective >= 2.56) data.very_weak.push(key);
            else if (value_effective >= 1.6) data.weak.push(key);
            else if (value_effective >= 1) data.neutral.push(key);
            else if (value_effective >= 0.625) data.resist.push(key);
            else if (value_effective >= 0.39) data.very_resist.push(key);
            else data.super_resist.push(key);
        });
        return data;
    };

    const splitAndCapitalize = (string) => {
        return string.split("-").map(text => text.charAt(0).toUpperCase() + text.slice(1)).join(" ");
    }

    return (
        <Fragment>
            <h4 className='element-top'>Infomation</h4>
            <h5 className='element-top'>- Pokémon Type:</h5>
            <Type arr={props.data.types.map(ele => ele.type.name)}/>
            <WeatherTypeEffective weatherEffective={getWeatherEffective(props.data.types)}/>
            <TypeEffective typeEffective={getTypeEffective(props.data.types)}/>
            <h5 className='element-top'>- Pokémon height: {props.data.height}, weight: {props.data.weight}</h5>
        </Fragment>
    )
}

export default Info;