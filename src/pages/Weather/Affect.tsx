import React, { useCallback, useEffect, useState } from 'react';
import WeatherEffective from '../../components/Effective/WeatherEffective';
import { camelCase } from '../../utils/utils';
import { WeatherBoost } from '../../core/models/weather-boost.model';
import { DynamicObj, getPropertyName } from '../../utils/extension';
import { getWeatherBoost } from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Select/SelectType';
import { CardType } from '../../enums/type.enum';

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
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Weather</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <SelectTypeComponent
            title="Select Weather"
            data={weathersBoost}
            currentType={currentWeather}
            setCurrentType={setCurrentWeather}
            filterType={[currentWeather]}
            cardType={CardType.Weather}
          />
        </div>
      </div>
      <WeatherEffective weatherEffective={weatherEffective} />
    </div>
  );
};

export default Affect;
