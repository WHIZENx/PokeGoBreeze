import React, { useCallback, useEffect, useState } from 'react';
import CardType from '../../components/Card/CardType';
import WeatherTypeEffective from '../../components/Effective/WeatherTypeEffective';
import { capitalize } from '../../util/utils';
import { IWeatherEffComponent } from '../models/page.model';
import { TypeEff } from '../../core/models/type-eff.model';
import { WeatherBoost } from '../../core/models/weatherBoost.model';
import { isEmpty } from '../../util/extension';

const Effect = (prop: IWeatherEffComponent) => {
  const [types, setTypes] = useState<string[]>([]);

  const [currentTypePri, setCurrentTypePri] = useState('BUG');
  const [currentTypeSec, setCurrentTypeSec] = useState('');

  const [showTypePri, setShowTypePri] = useState(false);
  const [showTypeSec, setShowTypeSec] = useState(false);

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    const data: string[] = [];
    Object.entries(prop.weathers ?? new WeatherBoost()).forEach(([key, value]) => {
      if (value.includes(currentTypePri) && !data.includes(key)) {
        data.push(key);
      }
      if (!isEmpty(currentTypeSec) && value.includes(currentTypeSec) && !data.includes(key)) {
        data.push(key);
      }
    });
    setWeatherEffective(data);
  }, [currentTypePri, currentTypeSec, prop.weathers]);

  useEffect(() => {
    const results = Object.keys(prop.types ?? new TypeEff()).filter((item) => item !== currentTypePri && item !== currentTypeSec);
    setTypes(results);
    getWeatherEffective();
  }, [currentTypePri, currentTypeSec, getWeatherEffective, prop.types]);

  const changeTypePri = (value: string) => {
    setShowTypePri(false);
    setCurrentTypePri(value);
    getWeatherEffective();
  };

  const changeTypeSec = (value: string) => {
    setShowTypeSec(false);
    setCurrentTypeSec(value);
    getWeatherEffective();
  };

  const closeTypeSec = () => {
    setShowTypeSec(false);
    setCurrentTypeSec('');
  };

  return (
    <div className="element-top">
      <h5 className="text-center">
        <b>As Pokémon Types</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <div>
            <h6 className="text-center">
              <b>Type 1</b>
            </h6>
            <div
              className="card-input"
              style={{ marginBottom: 15 }}
              tabIndex={0}
              onClick={() => setShowTypePri(true)}
              onBlur={() => setShowTypePri(false)}
            >
              <div className="card-select">
                <CardType value={capitalize(currentTypePri)} />
              </div>
              {showTypePri && (
                <div className="result-type result-type-weather">
                  <ul>
                    {types.map((value, index) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeTypePri(value)}>
                        <CardType value={capitalize(value)} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col d-flex justify-content-center">
          <div>
            <h6 className="text-center">
              <b>Type 2</b>
            </h6>
            <div
              className="card-input"
              style={{ marginBottom: 15 }}
              tabIndex={0}
              onClick={() => setShowTypeSec(true)}
              onBlur={() => setShowTypeSec(false)}
            >
              {isEmpty(currentTypeSec) ? (
                <div className="type-none">
                  <b>None</b>
                </div>
              ) : (
                <div className="type-sec">
                  <div className="card-select">
                    <CardType value={capitalize(currentTypeSec)} />
                    <button
                      type="button"
                      className="btn-close btn-close-white remove-close"
                      onMouseDown={closeTypeSec}
                      aria-label="Close"
                    />
                  </div>
                </div>
              )}
              {showTypeSec && (
                <div className="result-type result-type-weather">
                  <ul>
                    {types.map((value, index) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeTypeSec(value)}>
                        <CardType value={capitalize(value)} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <WeatherTypeEffective weatherEffective={weatherEffective} />
    </div>
  );
};

export default Effect;
