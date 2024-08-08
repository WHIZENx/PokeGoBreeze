import React from 'react';
import TypeEffective from '../Effective/TypeEffective';
import WeatherTypeEffective from '../Effective/WeatherTypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { TypeEff, TypeEffChart } from '../../core/models/type-eff.model';
import { IInfoComponent } from '../models/component.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';

const Info = (props: IInfoComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);
  const weatherEffective = useSelector((state: StoreState) => state.store.data?.weatherBoost);

  const getWeatherEffective = (types: string[]) => {
    const data: string[] = [];
    Object.entries(weatherEffective ?? new WeatherBoost()).forEach(([key, value]) => {
      types?.forEach((type) => {
        if (value.includes(type?.toUpperCase()) && !data.includes(key)) {
          data.push(key);
        }
      });
    });
    return data;
  };

  const getTypeEffective = (types: string[]) => {
    const data = TypeEffChart.create({
      very_weak: [],
      weak: [],
      super_resist: [],
      very_resist: [],
      resist: [],
      neutral: [],
    });
    Object.entries(typeEffective ?? new TypeEff()).forEach(([key, value]) => {
      if (types.length > 0) {
        let valueEffective = 1;
        types.forEach((type) => {
          valueEffective *= value[type?.toUpperCase()];
        });
        if (valueEffective >= 2.56) {
          data.very_weak?.push(key);
        } else if (valueEffective >= 1.6) {
          data.weak?.push(key);
        } else if (valueEffective === 1) {
          data.neutral?.push(key);
        } else if (valueEffective >= 0.625) {
          data.resist?.push(key);
        } else if (valueEffective >= 0.39) {
          data.very_resist?.push(key);
        } else if (valueEffective >= 0.2) {
          data.super_resist?.push(key);
        }
      }
    });
    return data;
  };

  return (
    <div style={{ marginBottom: 15 }}>
      <h4 className="element-top info-title">
        <b>Information</b>
      </h4>
      <h5 className="element-top">
        <li>Pokémon Type</li>
      </h5>
      <TypeInfo arr={props.currForm?.form.types ?? []} style={{ marginLeft: 15 }} isShow={true} />
      <WeatherTypeEffective weatherEffective={getWeatherEffective(props.currForm?.form.types ?? [])} />
      <TypeEffective typeEffective={getTypeEffective(props.currForm?.form.types ?? [])} />
    </div>
  );
};

export default Info;
