import React, { useCallback, useEffect, useState } from 'react';
import { camelCase } from '../../utils/utils';
import { WeatherBoost } from '../../core/models/weather-boost.model';
import { DynamicObj, getPropertyName } from '../../utils/extension';
import { getWeatherBoost } from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Commons/Selects/SelectType';
import { CardType } from '../../enums/type.enum';
import Effective from '../../components/Effective/Effective';
import TypeInfo from '../../components/Sprites/Type/Type';
import QuickWeatherSelect from '../../components/Effective/QuickWeatherSelect';

const Affect = () => {
  const weathersBoost = getWeatherBoost();

  const [currentWeather, setCurrentWeather] = useState(camelCase(getPropertyName(weathersBoost, (o) => o.clear)));

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    setWeatherEffective(
      Object.values((weathersBoost as unknown as DynamicObj<string>)[currentWeather] ?? new WeatherBoost())
    );
  }, [currentWeather, weathersBoost]);

  useEffect(() => {
    getWeatherEffective();
  }, [currentWeather, getWeatherEffective, weathersBoost]);

  return (
    <section className="pokemon-detail-section !tw-overflow-visible" data-testid="weather-by-condition-section">
      <h4 className="info-title">
        <b>As Weather</b>
      </h4>
      <div className="tw-flex tw-justify-center">
        <SelectTypeComponent
          title="Select Weather"
          data={weathersBoost}
          currentType={currentWeather}
          setCurrentType={setCurrentWeather}
          filterType={[currentWeather]}
          cardType={CardType.Weather}
        />
      </div>
      <div className="tw-mx-auto tw-mt-4 tw-max-w-2xl">
        <QuickWeatherSelect weather={Object.keys(weathersBoost)} value={currentWeather} onChange={setCurrentWeather} />
      </div>
      <div className="tw-mt-4 tw-rounded-lg tw-bg-table-primary tw-p-2 tw-text-center">
        <strong className="tw-block tw-text-medium">{weatherEffective.length}</strong>
        <span className="tw-text-caption">Boosted types</span>
      </div>
      <Effective title="Types Pokémon for Boosts">
        <TypeInfo arr={weatherEffective} className="!tw-ml-0" isShow />
      </Effective>
    </section>
  );
};

export default Affect;
