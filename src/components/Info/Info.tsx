import React, { Fragment } from "react";
import TypeEffective from "../Effective/TypeEffective";
import WeatherTypeEffective from "../Effective/WeatherTypeEffective";
import Type from "../Sprites/Type/Type";

import typeEffective from '../../data/type_effectiveness.json';
import weatherEffective from '../../data/weather_boosts.json';
import { splitAndCapitalize } from "../../util/Utils";

const Info = (props: any) => {

    const getWeatherEffective = (types: any[]) => {
        const data: string[] = [];
        Object.entries(weatherEffective).forEach(([key, value]) => {
            types.forEach((type: { type: { name: string; }; }) => {
                if (value.includes(splitAndCapitalize(type.type.name, "-", " ")) && !data.includes(key)) data.push(key);
            });
        });
        return data;
    };

    const getTypeEffective = (types: any[]) => {
        const data: any = {
            very_weak: [],
            weak: [],
            super_resist: [],
            very_resist: [],
            resist: [],
            neutral: []
        };
        Object.entries(typeEffective).forEach(([key, value]) => {
            let value_effective = 1;
            types.forEach((type: { type: { name: string; }; }) => {
                value_effective *= (value as any)[splitAndCapitalize(type.type.name, "-", " ")];
            });
            if (value_effective >= 2.56) data.very_weak.push(key);
            else if (value_effective >= 1.6) data.weak.push(key);
            else if (value_effective === 1) data.neutral.push(key);
            else if (value_effective >= 0.625) data.resist.push(key);
            else if (value_effective >= 0.39) data.very_resist.push(key);
            else if (value_effective >= 0.2) data.super_resist.push(key);
            else data.neutral.push(key);
        });
        return data;
    };

    return (
        <Fragment>
            <h4 className='element-top info-title'><b>Information</b></h4>
            <h5 className='element-top'><li>Pokémon Type</li></h5>
            <Type arr={props.currForm ? props.currForm.form.types.map((ele: { type: { name: any; }; }) => ele.type.name) : []} style={{marginLeft: 15}}/>
            <WeatherTypeEffective weatherEffective={getWeatherEffective(props.currForm ? props.currForm.form.types: [])}/>
            <TypeEffective typeEffective={getTypeEffective(props.currForm ? props.currForm.form.types : [])}/>
        </Fragment>
    )
}

export default Info;