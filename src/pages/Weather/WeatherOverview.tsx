import React from 'react';
import APIService from '../../services/api.service';
import TypeInfo from '../../components/Sprites/Type/Type';
import { getWeatherDisplayName } from '../../utils/utils';
import { safeObjectEntries } from '../../utils/extension';
import { getWeatherBoost } from '../../utils/helpers/options-context.helpers';

const WeatherOverview = () => {
  const weather = safeObjectEntries<string[]>(getWeatherBoost());

  return (
    <section className="pokemon-detail-section tw-mt-4" data-testid="all-weather-overview-section">
      <h4 className="info-title">
        <b>All weather boosts</b>
      </h4>
      <div className="tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
        {weather.map(([condition, types]) => (
          <article
            className="tw-min-w-0 tw-rounded-xl tw-border tw-border-solid tw-border-gray-300 tw-bg-table-primary tw-p-3"
            key={condition}
          >
            <div className="tw-flex tw-items-center tw-gap-2">
              <img className="tw-h-12 tw-w-12 tw-object-contain" alt="" src={APIService.getWeatherSprite(condition)} />
              <h5 className="!tw-m-0">{getWeatherDisplayName(condition)}</h5>
            </div>
            <TypeInfo arr={types} className="!tw-ml-0" isShow />
          </article>
        ))}
      </div>
    </section>
  );
};

export default WeatherOverview;
