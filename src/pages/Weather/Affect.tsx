import React, { useCallback, useEffect, useState } from 'react';
import CardWeather from '../../components/Card/CardWeather';
import WeatherEffective from '../../components/Effective/WeatherEffective';
import { camelCase, splitAndCapitalize } from '../../utils/utils';
import { WeatherBoost } from '../../core/models/weather-boost.model';
import { DynamicObj, getPropertyName, isEqual } from '../../utils/extension';
import { getWeatherBoost } from '../../utils/helpers/options-context.helpers';

const Affect = () => {
  const weathersBoost = getWeatherBoost();
  const [weathers, setWeathers] = useState<string[]>([]);

  const [currentWeather, setCurrentWeather] = useState(camelCase(getPropertyName(weathersBoost, (o) => o.clear)));
  const [showWeather, setShowWeather] = useState(false);

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    setWeatherEffective(
      Object.values((weathersBoost as unknown as DynamicObj<string>)[currentWeather] ?? new WeatherBoost())
    );
  }, [currentWeather, weathersBoost]);

  useEffect(() => {
    const results = Object.keys(weathersBoost).filter((item) => !isEqual(item, currentWeather));
    setWeathers(results);
    getWeatherEffective();
  }, [currentWeather, getWeatherEffective, weathersBoost]);

  const changeWeather = (value: string) => {
    setShowWeather(false);
    setCurrentWeather(camelCase(value));
    getWeatherEffective();
  };

  return (
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Weather</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <div>
            <h6 className="text-center">
              <b>Select Weather</b>
            </h6>
            <div className=" d-flex justify-content-center">
              <div
                className="card-input mb-3"
                tabIndex={0}
                onClick={() => setShowWeather(true)}
                onBlur={() => setShowWeather(false)}
              >
                <div className="card-select">
                  <CardWeather value={splitAndCapitalize(currentWeather, /(?=[A-Z])/, ' ')} />
                </div>
                {showWeather && (
                  <div className="result-weather">
                    <ul>
                      {weathers.map((value, index) => (
                        <li className="container card-pokemon" key={index} onMouseDown={() => changeWeather(value)}>
                          <CardWeather value={splitAndCapitalize(value, /(?=[A-Z])/, ' ')} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <WeatherEffective weatherEffective={weatherEffective} />
    </div>
  );
};

export default Affect;
