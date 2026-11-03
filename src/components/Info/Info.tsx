import React, { useEffect, useRef } from 'react';
import TypeEffectiveComponent from '../Effective/TypeEffective';
import TypeInfo from '../Sprites/Type/Type';

import { TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, isIncludeList, isNotEmpty, safeObjectEntries, toNumber } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';
import { camelCase, getMultiplyTypeEffect } from '../../utils/utils';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';
import useSearch from '../../composables/useSearch';
import Weather from '../Sprites/Weather';
import Chip from '@mui/material/Chip';

const Info = ({ isLoading = false }: { isLoading?: boolean }) => {
  const { searchingMainForm } = useSearch();
  const requestedTypes = searchingMainForm?.form?.types ?? [];
  const lastLoadedTypes = useRef(requestedTypes);

  useEffect(() => {
    if (!isLoading && isNotEmpty(requestedTypes)) {
      lastLoadedTypes.current = requestedTypes;
    }
  }, [isLoading, requestedTypes]);

  const types = isLoading ? lastLoadedTypes.current : requestedTypes;

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
    <div
      className="tw-mb-3"
      data-testid="pokemon-information"
      data-information-types={types.join(',')}
      aria-busy={isLoading}
    >
      <h4 className="tw-mt-2 info-title">
        <b>Information</b>
      </h4>
      <div
        className={`tw-transition-opacity tw-duration-200 ${isLoading ? 'tw-pointer-events-none tw-opacity-60' : ''}`}
      >
        <div className="tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-12 lg:tw-items-start">
          <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-2 lg:tw-col-span-3">
            <div className="tw-min-w-0">
              <h5 className="!tw-m-0 tw-mb-1.5 tw-pb-1">
                <Chip component="span" label="Pokémon Type" size="small" variant="outlined" />
              </h5>
              <TypeInfo arr={types} className="!tw-ml-0" isShow />
            </div>
            <div className="tw-min-w-0">
              <h5 className="!tw-m-0 tw-mb-1.5 tw-pb-1">
                <Chip component="span" label="Weather Boosts" size="small" variant="outlined" />
              </h5>
              <Weather arr={getWeatherEffective(types)} className="!tw-ml-0" />
            </div>
          </div>
          <div className="tw-min-w-0 lg:tw-col-span-9">
            <TypeEffectiveComponent typeEffective={getTypeEffectiveChart(types)} variant="summary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
