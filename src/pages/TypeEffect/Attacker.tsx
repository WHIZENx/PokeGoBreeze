import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import { camelCase, getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { getPropertyName } from '../../utils/extension';
import {
  getTypeEffective as getTypeEffectiveContext,
  getSafeTypesEffective,
} from '../../utils/helpers/options-context.helpers';
import SelectTypeComponent from '../../components/Commons/Select/SelectType';

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
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Attacker</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <SelectTypeComponent
            title="Select Type"
            data={typesEffective}
            currentType={currentType}
            setCurrentType={setCurrentType}
            filterType={[currentType]}
          />
        </div>
      </div>
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Attacker;
