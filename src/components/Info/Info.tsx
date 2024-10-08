import React from 'react';
import TypeEffective from '../Effective/TypeEffective';
import WeatherTypeEffective from '../Effective/WeatherTypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { TypeEff, TypeEffChart } from '../../core/models/type-eff.model';
import { IInfoComponent } from '../models/component.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { getValueOrDefault, isIncludeList, isNotEmpty } from '../../util/extension';
import { IncludeMode } from '../../util/enums/string.enum';

const Info = (props: IInfoComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data?.typeEff);
  const weatherEffective = useSelector((state: StoreState) => state.store.data?.weatherBoost);

  const getWeatherEffective = (types: string[]) => {
    const data: string[] = [];
    Object.entries(weatherEffective ?? new WeatherBoost()).forEach(([key, value]: [string, string[]]) => {
      types.forEach((type) => {
        if (isIncludeList(value, type, IncludeMode.IncludeIgnoreCaseSensitive) && !isIncludeList(data, key)) {
          data.push(key);
        }
      });
    });
    return data;
  };

  const getTypeEffective = (types: string[]) => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    Object.entries(typeEffective ?? new TypeEff()).forEach(([key, value]) => {
      if (isNotEmpty(types)) {
        let valueEffective = 1;
        types.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective >= 2.56) {
          data.veryWeak?.push(key);
        } else if (valueEffective >= 1.6) {
          data.weak?.push(key);
        } else if (valueEffective === 1) {
          data.neutral?.push(key);
        } else if (valueEffective >= 0.625) {
          data.resist?.push(key);
        } else if (valueEffective >= 0.39) {
          data.veryResist?.push(key);
        } else if (valueEffective >= 0.2) {
          data.superResist?.push(key);
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
      <TypeInfo arr={getValueOrDefault(Array, props.currForm?.form.types)} style={{ marginLeft: 15 }} isShow={true} />
      <WeatherTypeEffective weatherEffective={getWeatherEffective(getValueOrDefault(Array, props.currForm?.form.types))} />
      <TypeEffective typeEffective={getTypeEffective(getValueOrDefault(Array, props.currForm?.form.types))} />
    </div>
  );
};

export default Info;
