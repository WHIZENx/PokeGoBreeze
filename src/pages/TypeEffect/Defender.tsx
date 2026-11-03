import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import { getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, getPropertyName, isEmpty, safeObjectEntries } from '../../utils/extension';
import { getTypeEffective as getTypeEffectiveContext } from '../../utils/helpers/options-context.helpers';
import { camelCase } from 'lodash';
import SelectTypeComponent from '../../components/Commons/Selects/SelectType';
import DualTypeQuickSelect, { TypeSlot } from '../../components/Effective/DualTypeQuickSelect';

const Defender = () => {
  const typesEffective = getTypeEffectiveContext();
  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');
  const [activeTypeSlot, setActiveTypeSlot] = useState<TypeSlot>('primary');

  const getTypeEffective = useCallback(() => {
    const data = new TypeEffectiveChart();
    safeObjectEntries<DynamicObj<number>>(typesEffective).forEach(([key, value]) => {
      let valueEffective = 1;
      valueEffective *= value[currentTypePri];
      valueEffective *= isEmpty(currentTypeSec) ? 1 : value[currentTypeSec];
      getMultiplyTypeEffect(data, valueEffective, key);
    });
    setTypeEffective(data);
  }, [currentTypePri, currentTypeSec, typesEffective]);

  useEffect(() => {
    getTypeEffective();
  }, [currentTypePri, currentTypeSec, getTypeEffective, typesEffective]);

  return (
    <section className="pokemon-detail-section !tw-overflow-visible" data-testid="type-effect-defender-section">
      <h4 className="info-title">
        <b>As Defender</b>
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
          ariaLabel="Quick select defender type"
        />
      </div>
      <div className="tw-mt-4">
        <TypeEffectiveComponent typeEffective={typeEffective} variant="summary" compactLayout showCounts />
      </div>
    </section>
  );
};

export default Defender;
