import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { camelCase, capitalize, getMultiplyTypeEffect, safeObjectEntries, splitAndCapitalize } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { ITypeModel, TypeModel } from '../../core/models/type.model';
import { DynamicObj, getPropertyName } from '../../utils/extension';
import { getTypes } from '../../utils/helpers/options-context.helpers';
import { getTypeEffective as getTypeEffectiveContext } from '../../utils/helpers/options-context.helpers';

const Attacker = () => {
  const typesEffective = getTypeEffectiveContext();
  const [currentType, setCurrentType] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [showType, setShowType] = useState(false);

  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const getTypeEffective = useCallback(() => {
    const data = TypeEffectiveChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    safeObjectEntries((typesEffective as unknown as DynamicObj<ITypeModel>)[currentType], new TypeModel()).forEach(
      ([key, value]) => getMultiplyTypeEffect(data, value, key)
    );
    setTypeEffective(data);
  }, [currentType, typesEffective]);

  useEffect(() => {
    getTypeEffective();
  }, [currentType, getTypeEffective]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(camelCase(value));
    getTypeEffective();
  };

  return (
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Attacker</b>
      </h5>
      <div className="row">
        <div className="col d-flex justify-content-center">
          <div>
            <h6 className="text-center">
              <b>Select Type</b>
            </h6>
            <div className=" d-flex justify-content-center">
              <div
                className="card-input mb-3"
                tabIndex={0}
                onClick={() => setShowType(true)}
                onBlur={() => setShowType(false)}
              >
                <div className="card-select">
                  <CardType value={capitalize(currentType)} />
                </div>
                {showType && (
                  <div className="result-type">
                    <ul>
                      {getTypes().map((value, index) => (
                        <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
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
      </div>
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Attacker;
