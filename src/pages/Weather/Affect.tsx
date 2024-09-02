import React, { useCallback, useEffect, useState } from 'react';
import CardWeather from '../../components/Card/CardWeather';
import WeatherEffective from '../../components/Effective/WeatherEffective';
import { splitAndCapitalize } from '../../util/utils';
import { IWeatherAffComponent } from '../models/page.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { DynamicObj } from '../../util/models/util.model';

const Affect = (prop: IWeatherAffComponent) => {
  const [weathers, setWeathers] = useState<string[]>([]);

  const [currentWeather, setCurrentWeather] = useState('CLEAR');
  const [showWeather, setShowWeather] = useState(false);

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    setWeatherEffective(
      Object.values(((prop.weathers ?? new WeatherBoost()) as unknown as DynamicObj<string, string>)[currentWeather] ?? new WeatherBoost())
    );
  }, [currentWeather, prop.weathers]);

  useEffect(() => {
    const results = Object.keys(prop.weathers ?? new WeatherBoost()).filter((item) => item !== currentWeather);
    setWeathers(results);
    getWeatherEffective();
  }, [currentWeather, getWeatherEffective, prop.weathers]);

  const changeWeather = (value: string) => {
    setShowWeather(false);
    setCurrentWeather(value);
    getWeatherEffective();
  };

  return (
    <div className="element-top">
      <h5 className="text-center">
        <b>As Weather</b>
      </h5>
      <h6 className="text-center">
        <b>Select Weather</b>
      </h6>
      <div className=" d-flex justify-content-center">
        <div className="card-input" tabIndex={0} onClick={() => setShowWeather(true)} onBlur={() => setShowWeather(false)}>
          <div className="card-select">
            <CardWeather value={splitAndCapitalize(currentWeather, '_', ' ')} />
          </div>
          {showWeather && (
            <div className="result-weather">
              <ul>
                {weathers.map((value, index) => (
                  <li className="container card-pokemon" key={index} onMouseDown={() => changeWeather(value)}>
                    <CardWeather value={splitAndCapitalize(value, '_', ' ')} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <WeatherEffective weatherEffective={weatherEffective} />
    </div>
  );
};

export default Affect;
