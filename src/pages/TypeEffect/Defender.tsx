import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize, getKeyWithData, getMultiplyTypeEffect, splitAndCapitalize } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { DynamicObj, getPropertyName, isEmpty, safeObjectEntries } from '../../utils/extension';
import { EffectiveType } from '../../components/Effective/enums/type-effective.enum';
import { getTypeEffective as getTypeEffectiveContext } from '../../utils/helpers/options-context.helpers';
import { camelCase, isEqual } from 'lodash';

const Defender = () => {
  const typesEffective = getTypeEffectiveContext();
  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const [types, setTypes] = useState<string[]>([]);

  const [currentTypePri, setCurrentTypePri] = useState(camelCase(getPropertyName(typesEffective, (o) => o.bug)));
  const [currentTypeSec, setCurrentTypeSec] = useState('');

  const [showTypePri, setShowTypePri] = useState(false);
  const [showTypeSec, setShowTypeSec] = useState(false);

  const getTypeEffective = useCallback(() => {
    const data = TypeEffectiveChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    safeObjectEntries<DynamicObj<number>>(typesEffective).forEach(([key, value]) => {
      let valueEffective = 1;
      valueEffective *= value[currentTypePri];
      valueEffective *= isEmpty(currentTypeSec) ? 1 : value[currentTypeSec];
      getMultiplyTypeEffect(data, valueEffective, key);
    });
    setTypeEffective(data);
  }, [currentTypePri, currentTypeSec, typesEffective]);

  useEffect(() => {
    const results = Object.keys(typesEffective).filter(
      (item) => !isEqual(item, currentTypePri) && !isEqual(item, currentTypeSec)
    );
    setTypes(results);
    getTypeEffective();
  }, [currentTypePri, currentTypeSec, getTypeEffective, typesEffective]);

  const changeTypePri = (value: string) => {
    setShowTypePri(false);
    setCurrentTypePri(camelCase(value));
    getTypeEffective();
  };

  const changeTypeSec = (value: string) => {
    setShowTypeSec(false);
    setCurrentTypeSec(camelCase(value));
    getTypeEffective();
  };

  const closeTypeSec = () => {
    setShowTypeSec(false);
    setCurrentTypeSec('');
  };

  return (
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Defender</b>
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
                <CardType value={capitalize(currentTypePri)} />
              </div>
              {showTypePri && (
                <div className="result-type">
                  <ul>
                    {types.map((value, index) => (
                      <li
                        className="container card-pokemon theme-bg-default"
                        key={index}
                        onMouseDown={() => changeTypePri(value)}
                      >
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
                <div className="result-type">
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
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Defender;
