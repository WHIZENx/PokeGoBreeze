import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import { getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, getPropertyName, isEmpty, safeObjectEntries } from '../../utils/extension';
import { getTypeEffective as getTypeEffectiveContext } from '../../utils/helpers/options-context.helpers';
import { camelCase } from 'lodash';
import SelectTypeComponent from '../../components/Input/SelectType';

const Defender = () => {
  const typesEffective = getTypeEffectiveContext();
  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');

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
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Defender</b>
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
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Defender;
