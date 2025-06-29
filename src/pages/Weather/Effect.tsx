import React, { useCallback, useEffect, useState } from 'react';
import CardType from '../../components/Card/CardType';
import WeatherTypeEffective from '../../components/Effective/WeatherTypeEffective';
import { camelCase, getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import { getPropertyName, isEmpty, isEqual, isIncludeList, isNotEmpty } from '../../utils/extension';
import { EffectiveType } from '../../components/Effective/enums/type-effective.enum';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';

const Effect = () => {
  const weathersBoost = getWeatherBoost();
  const typesEffective = getTypeEffective();

  const [types, setTypes] = useState<string[]>([]);

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');

  const [showTypePri, setShowTypePri] = useState(false);
  const [showTypeSec, setShowTypeSec] = useState(false);

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    const data: string[] = [];
    Object.entries(weathersBoost).forEach(([key, value]: [string, string[]]) => {
      if (isIncludeList(value, currentTypePri) && !isIncludeList(data, key)) {
        data.push(key);
      }
      if (isNotEmpty(currentTypeSec) && isIncludeList(value, currentTypeSec) && !isIncludeList(data, key)) {
        data.push(key);
      }
    });
    setWeatherEffective(data);
  }, [currentTypePri, currentTypeSec, weathersBoost]);

  useEffect(() => {
    const results = Object.keys(typesEffective).filter(
      (item) => !isEqual(item, currentTypePri) && !isEqual(item, currentTypeSec)
    );
    setTypes(results);
    getWeatherEffective();
  }, [currentTypePri, currentTypeSec, getWeatherEffective, typesEffective]);

  const changeTypePri = (value: string) => {
    setShowTypePri(false);
    setCurrentTypePri(camelCase(value));
    getWeatherEffective();
  };

  const changeTypeSec = (value: string) => {
    setShowTypeSec(false);
    setCurrentTypeSec(camelCase(value));
    getWeatherEffective();
  };

  const closeTypeSec = () => {
    setShowTypeSec(false);
    setCurrentTypeSec('');
  };

  return (
    <div className="mt-2">
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
              className="card-input mb-3"
              tabIndex={0}
              onClick={() => setShowTypePri(true)}
              onBlur={() => setShowTypePri(false)}
            >
              <div className="card-select">
                <CardType value={splitAndCapitalize(currentTypePri, /(?=[A-Z])/, ' ')} />
              </div>
              {showTypePri && (
                <div className="result-type result-type-weather">
                  <ul>
                    {types.map((value, index) => (
                      <li className="container card-pokemon" key={index} onMouseDown={() => changeTypePri(value)}>
                        <CardType value={splitAndCapitalize(value, /(?=[A-Z])/, ' ')} />
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
              className="card-input mb-3"
              tabIndex={0}
              onClick={() => setShowTypeSec(true)}
              onBlur={() => setShowTypeSec(false)}
            >
              {isEmpty(currentTypeSec) ? (
                <div className="type-none">
                  <b>{getKeyWithData(EffectiveType, EffectiveType.None)}</b>
                </div>
              ) : (
                <div className="type-sec">
                  <div className="card-select">
                    <CardType value={splitAndCapitalize(currentTypeSec, /(?=[A-Z])/, ' ')} />
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
                        <CardType value={splitAndCapitalize(value, /(?=[A-Z])/, ' ')} />
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
