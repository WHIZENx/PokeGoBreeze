import React, { useCallback, useEffect, useState } from 'react';
import { getPropertyName, isIncludeList, isNotEmpty, safeObjectEntries } from '../../utils/extension';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Select/SelectType';
import { camelCase } from '../../utils/utils';
import Effective from '../../components/Effective/Effective';
import Weather from '../../components/Sprites/Weather';

const Effect = () => {
  const weathersBoost = getWeatherBoost();
  const typesEffective = getTypeEffective();

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');

  const [weatherEffective, setWeatherEffective] = useState<string[]>([]);

  const getWeatherEffective = useCallback(() => {
    const data: string[] = [];
    safeObjectEntries(weathersBoost).forEach(([key, value]) => {
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
    getWeatherEffective();
  }, [currentTypePri, currentTypeSec, getWeatherEffective, typesEffective]);

  return (
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Pokémon Types</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <SelectTypeComponent
            title="Type 1"
            data={typesEffective}
            currentType={currentTypePri}
            setCurrentType={setCurrentTypePri}
            filterType={[currentTypePri, currentTypeSec]}
          />
        </div>
        <div className="col d-flex justify-content-center">
          <SelectTypeComponent
            title="Type 2"
            data={typesEffective}
            currentType={currentTypeSec}
            setCurrentType={setCurrentTypeSec}
            filterType={[currentTypeSec, currentTypePri]}
            isShowRemove
          />
        </div>
      </div>
      <Effective title="Weather Boosts">
        <Weather arr={weatherEffective} className="ms-3" />
      </Effective>
    </div>
  );
};

export default Effect;
