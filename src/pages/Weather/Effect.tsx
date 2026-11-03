import React, { useCallback, useEffect, useState } from 'react';
import { getPropertyName, isIncludeList, isNotEmpty, safeObjectEntries } from '../../utils/extension';
import { getWeatherBoost, getTypeEffective } from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Commons/Selects/SelectType';
import { camelCase } from '../../utils/utils';
import Effective from '../../components/Effective/Effective';
import Weather from '../../components/Sprites/Weather';
import DualTypeQuickSelect, { TypeSlot } from '../../components/Effective/DualTypeQuickSelect';

const Effect = () => {
  const weathersBoost = getWeatherBoost();
  const typesEffective = getTypeEffective();

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');
  const [activeTypeSlot, setActiveTypeSlot] = useState<TypeSlot>('primary');

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
    <section className="pokemon-detail-section !tw-overflow-visible" data-testid="weather-by-type-section">
      <h4 className="info-title">
        <b>As Pokémon Types</b>
      </h4>
      <div className="tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2">
        <div className="tw-flex tw-min-w-0 tw-justify-center">
          <SelectTypeComponent
            title="Type 1"
            data={typesEffective}
            currentType={currentTypePri}
            setCurrentType={setCurrentTypePri}
            filterType={[currentTypePri, currentTypeSec]}
          />
        </div>
        <div className="tw-flex tw-min-w-0 tw-justify-center">
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
      <div className="tw-mx-auto tw-max-w-xl">
        <DualTypeQuickSelect
          types={Object.keys(typesEffective)}
          primaryType={currentTypePri}
          secondaryType={currentTypeSec}
          activeSlot={activeTypeSlot}
          onActiveSlotChange={setActiveTypeSlot}
          onPrimaryTypeChange={setCurrentTypePri}
          onSecondaryTypeChange={setCurrentTypeSec}
          ariaLabel="Quick select boosted Pokémon type"
        />
      </div>
      <div className="tw-mt-4 tw-rounded-lg tw-bg-table-primary tw-p-2 tw-text-center">
        <strong className="tw-block tw-text-medium">{weatherEffective.length}</strong>
        <span className="tw-text-caption">Matching weather</span>
      </div>
      <Effective title="Weather Boosts">
        <Weather arr={weatherEffective} className="!tw-ml-0" />
      </Effective>
    </section>
  );
};

export default Effect;
