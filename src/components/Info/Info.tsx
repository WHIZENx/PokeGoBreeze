import React, { useEffect, useState } from 'react';
import TypeEffective from '../Effective/TypeEffective';
import WeatherTypeEffective from '../Effective/WeatherTypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { useSelector } from 'react-redux';
import { SearchingState, StoreState } from '../../store/models/state.model';
import { TypeEffChart } from '../../core/models/type-eff.model';
import { isIncludeList, isNotEmpty, toNumber } from '../../util/extension';
import { IncludeMode } from '../../util/enums/string.enum';
import { getMultiplyTypeEffect } from '../../util/utils';

const Info = () => {
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);
  const weatherEffective = useSelector((state: StoreState) => state.store.data.weatherBoost);

  const formTypes = useSelector((state: SearchingState) => state.searching.mainSearching?.form?.form?.types);

  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (formTypes && isNotEmpty(formTypes)) {
      setTypes(formTypes);
    }
  }, [formTypes]);

  const getWeatherEffective = (types: string[] | undefined) => {
    const data: string[] = [];
    Object.entries(weatherEffective).forEach(([key, value]: [string, string[]]) => {
      types?.forEach((type) => {
        if (isIncludeList(value, type, IncludeMode.IncludeIgnoreCaseSensitive) && !isIncludeList(data, key)) {
          data.push(key);
        }
      });
    });
    return data;
  };

  const getTypeEffective = (types: string[] | undefined) => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    Object.entries(typeEffective).forEach(([key, value]) => {
      if (isNotEmpty(types)) {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= toNumber(value[type.toUpperCase()], 1);
        });
        getMultiplyTypeEffect(data, valueEffective, key);
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
      <TypeInfo arr={types} style={{ marginLeft: 15 }} isShow={true} />
      <WeatherTypeEffective weatherEffective={getWeatherEffective(types)} />
      <TypeEffective typeEffective={getTypeEffective(types)} />
    </div>
  );
};

export default Info;
