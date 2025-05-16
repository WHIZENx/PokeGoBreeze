import React, { useEffect, useState, useCallback } from 'react';
import TypeEffective from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize, getKeyWithData, getMultiplyTypeEffect } from '../../util/utils';
import { ITypeEffChart, TypeEff, TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffComponent } from '../models/page.model';
import { DynamicObj, getValueOrDefault, isEmpty, isEqual } from '../../util/extension';
import { PokemonTypeBadge } from '../../core/models/type.model';
import { EffectiveType } from '../../components/Effective/enums/type-effective.enum';

const Defender = (prop: ITypeEffComponent) => {
  const [types, setTypes] = useState<string[]>([]);

  const [typeEffective, setTypeEffective] = useState<ITypeEffChart>();

  const [currentTypePri, setCurrentTypePri] = useState(
    getValueOrDefault(String, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Bug)?.toUpperCase())
  );
  const [currentTypeSec, setCurrentTypeSec] = useState('');

  const [showTypePri, setShowTypePri] = useState(false);
  const [showTypeSec, setShowTypeSec] = useState(false);

  const getTypeEffective = useCallback(() => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    Object.entries(prop.types ?? new TypeEff()).forEach(([key, value]: [string, DynamicObj<number>]) => {
      let valueEffective = 1;
      valueEffective *= value[currentTypePri];
      valueEffective *= isEmpty(currentTypeSec) ? 1 : value[currentTypeSec];
      getMultiplyTypeEffect(data, valueEffective, key);
    });
    setTypeEffective(data);
  }, [currentTypePri, currentTypeSec, prop.types]);

  useEffect(() => {
    const results = Object.keys(prop.types ?? new TypeEff()).filter(
      (item) => !isEqual(item, currentTypePri) && !isEqual(item, currentTypeSec)
    );
    setTypes(results);
    getTypeEffective();
  }, [currentTypePri, currentTypeSec, getTypeEffective, prop.types]);

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
    <div className="element-top">
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
              className="card-input"
              style={{ marginBottom: 15 }}
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
              className="card-input"
              style={{ marginBottom: 15 }}
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
                      <li
                        className="container card-pokemon theme-bg-default"
                        key={index}
                        onMouseDown={() => changeTypeSec(value)}
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
      </div>
      <TypeEffective typeEffective={typeEffective} />
    </div>
  );
};

export default Defender;
