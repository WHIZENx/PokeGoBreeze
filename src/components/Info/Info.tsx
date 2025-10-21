import React, { useEffect, useState } from 'react';
import TypeEffectiveComponent from '../Effective/TypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, isIncludeList, isNotEmpty, safeObjectEntries, toNumber } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { camelCase, getMultiplyTypeEffect } from '../../utils/utils';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';
import useSearch from '../../composables/useSearch';
import Effective from '../Effective/Effective';
import Weather from '../Sprites/Weather';

const Info = () => {
  const { searchingMainForm } = useSearch();

  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (searchingMainForm?.form?.types && isNotEmpty(searchingMainForm?.form?.types)) {
      setTypes(searchingMainForm?.form?.types);
    }
  }, [searchingMainForm?.form?.types]);

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
    const data = new TypeEffectiveChart();
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
    <div className="tw-mb-3">
      <h4 className="tw-mt-2 info-title">
        <b>Information</b>
      </h4>
      <h5 className="tw-mt-2">
        <li>Pokémon Type</li>
      </h5>
      <TypeInfo arr={types} className="tw-ml-3" isShow />
      <Effective title="Weather Boosts">
        <Weather arr={getWeatherEffective(types)} className="tw-ml-3" />
      </Effective>
      <TypeEffectiveComponent typeEffective={getTypeEffectiveChart(types)} />
    </div>
  );
};

export default Info;
