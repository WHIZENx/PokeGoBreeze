import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize, getKeyWithData, getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveModel, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { ITypeEffComponent } from '../models/page.model';
import { DynamicObj, getValueOrDefault, isEmpty } from '../../utils/extension';
import { PokemonTypeBadge } from '../../core/enums/pokemon-type.enum';
import { EffectiveType } from '../../components/Effective/enums/type-effective.enum';
import { getTypes } from '../../utils/helpers/options-context.helpers';

const Defender = (prop: ITypeEffComponent) => {
  const [typeEffective, setTypeEffective] = useState<ITypeEffectiveChart>();

  const [currentTypePri, setCurrentTypePri] = useState(
    getValueOrDefault(String, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Bug)?.toUpperCase())
  );
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
    Object.entries(prop.types ?? new TypeEffectiveModel()).forEach(([key, value]: [string, DynamicObj<number>]) => {
      let valueEffective = 1;
      valueEffective *= value[currentTypePri];
      valueEffective *= isEmpty(currentTypeSec) ? 1 : value[currentTypeSec];
      getMultiplyTypeEffect(data, valueEffective, key);
    });
    setTypeEffective(data);
  }, [currentTypePri, currentTypeSec, prop.types]);

  useEffect(() => {
    getTypeEffective();
  }, [currentTypePri, currentTypeSec, getTypeEffective]);

  const changeTypePri = (value: string) => {
    setShowTypePri(false);
    setCurrentTypePri(value);
    getTypeEffective();
  };

  const changeTypeSec = (value: string) => {
    setShowTypeSec(false);
    setCurrentTypeSec(value);
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
                    {getTypes().map((value, index) => (
                      <li
                        className="container card-pokemon theme-bg-default"
                        key={index}
                        onMouseDown={() => changeTypePri(value)}
                      >
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
                    {getTypes().map((value, index) => (
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
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Defender;
