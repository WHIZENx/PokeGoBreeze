import React, { useEffect, useState } from 'react';
import TypeEffectiveComponent from '../Effective/TypeEffective';
import WeatherTypeEffective from '../Effective/WeatherTypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { useSelector } from 'react-redux';
import { SearchingState } from '../../store/models/state.model';
import { TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, isIncludeList, isNotEmpty, safeObjectEntries, toNumber } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { camelCase, getMultiplyTypeEffect } from '../../utils/utils';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';

const Info = () => {
  const formTypes = useSelector((state: SearchingState) => state.searching.mainSearching?.form?.form?.types);

  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (formTypes && isNotEmpty(formTypes)) {
      setTypes(formTypes);
    }
  }, [formTypes]);

  const getWeatherEffective = (types: string[] | undefined) => {
    const data: string[] = [];
    safeObjectEntries(getWeatherBoost()).forEach(([key, value]) => {
      types?.forEach((type) => {
        if (isIncludeList(value, type, IncludeMode.IncludeIgnoreCaseSensitive) && !isIncludeList(data, key)) {
          data.push(key);
        }
      });
    });
    return data;
  };

  const getTypeEffectiveChart = (types: string[] | undefined) => {
    const data = TypeEffectiveChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    safeObjectEntries<DynamicObj<number>>(getTypeEffective()).forEach(([key, value]) => {
      if (isNotEmpty(types)) {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= toNumber(value[camelCase(type)] || value[type.toLowerCase()], 1);
        });
        getMultiplyTypeEffect(data, valueEffective, key);
      }
    });
    return data;
  };

  return (
    <div className="mb-3">
      <h4 className="mt-2 info-title">
        <b>Information</b>
      </h4>
      <h5 className="mt-2">
        <li>Pokémon Type</li>
      </h5>
      <TypeInfo arr={types} className="ms-3" isShow />
      <WeatherTypeEffective weatherEffective={getWeatherEffective(types)} />
      <TypeEffectiveComponent typeEffective={getTypeEffectiveChart(types)} />
    </div>
  );
};

export default Info;
