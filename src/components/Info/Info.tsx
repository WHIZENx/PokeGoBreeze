import React, { Fragment } from 'react';
import TypeEffective from '../Effective/TypeEffective';
import WeatherTypeEffective from '../Effective/WeatherTypeEffective';
import Type from '../Sprites/Type/Type';

import { useSelector, RootStateOrAny } from 'react-redux';

const Info = (props: { data: { types: any }; currForm: { form: { id: any; types: any[] } } }) => {
  const typeEffective = useSelector((state: RootStateOrAny) => state.store.data.typeEff);
  const weatherEffective = useSelector((state: RootStateOrAny) => state.store.data.weatherBoost);

  const getWeatherEffective = (types: any[]) => {
    const data: string[] = [];
    Object.entries(weatherEffective).forEach(([key, value]: any) => {
      types?.forEach((type: { type: { name: string } }) => {
        if (value.includes(type.type.name.toUpperCase()) && !data.includes(key)) data.push(key);
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
      neutral: [],
    };
    Object.entries(typeEffective).forEach(([key, value]: any) => {
      let valueEffective = 1;
      types?.forEach((type: { type: { name: string } }) => {
        valueEffective *= value[type.type.name.toUpperCase()];
      });
      if (valueEffective >= 2.56) data.very_weak.push(key);
      else if (valueEffective >= 1.6) data.weak.push(key);
      else if (valueEffective === 1) data.neutral.push(key);
      else if (valueEffective >= 0.625) data.resist.push(key);
      else if (valueEffective >= 0.39) data.very_resist.push(key);
      else if (valueEffective >= 0.2) data.super_resist.push(key);
      else data.neutral.push(key);
    });
    return data;
  };

  return (
    <Fragment>
      <h4 className="element-top info-title">
        <b>Information</b>
      </h4>
      <h5 className="element-top">
        <li>Pokémon Type</li>
      </h5>
      <Type
        arr={props.currForm ? props.currForm.form.types.map((ele: { type: { name: any } }) => ele.type.name) : []}
        style={{ marginLeft: 15 }}
      />
      <WeatherTypeEffective weatherEffective={getWeatherEffective(props.currForm ? props.currForm.form.types : [])} />
      <TypeEffective typeEffective={getTypeEffective(props.currForm ? props.currForm.form.types : [])} />
    </Fragment>
  );
};

export default Info;
