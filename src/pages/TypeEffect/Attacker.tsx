import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import { camelCase, getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { getPropertyName } from '../../utils/extension';
import {
  getTypeEffective as getTypeEffectiveContext,
  getSafeTypesEffective,
} from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Commons/Selects/SelectType';
import QuickTypeSelect from '../../components/Effective/QuickTypeSelect';

const Attacker = () => {
  const typesEffective = getTypeEffectiveContext();
  const [currentType, setCurrentType] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));

  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const getTypeEffective = useCallback(() => {
    const data = new TypeEffectiveChart();
    getSafeTypesEffective(currentType).forEach(([key, value]) => getMultiplyTypeEffect(data, value, key));
    setTypeEffective(data);
  }, [currentType, typesEffective]);

  useEffect(() => {
    getTypeEffective();
  }, [currentType, getTypeEffective, typesEffective]);

  return (
    <section className="pokemon-detail-section !tw-overflow-visible" data-testid="type-effect-attacker-section">
      <h4 className="info-title">
        <b>As Attacker</b>
      </h4>
      <div className="tw-flex tw-justify-center">
        <SelectTypeComponent
          title="Select Type"
          data={typesEffective}
          currentType={currentType}
          setCurrentType={setCurrentType}
          filterType={[currentType]}
        />
      </div>
      <div className="tw-mx-auto tw-mt-4 tw-max-w-xl">
        <QuickTypeSelect
          types={Object.keys(typesEffective)}
          value={currentType}
          onChange={setCurrentType}
          ariaLabel="Quick select attack type"
        />
      </div>
      <div className="tw-mt-4">
        <TypeEffectiveComponent
          typeEffective={typeEffective}
          perspective="attacker"
          variant="summary"
          compactLayout
          showCounts
        />
      </div>
    </section>
  );
};

export default Attacker;
