import React, { useEffect, useState, useCallback } from 'react';
import TypeEffective from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize, getKeyWithData, getMultiplyTypeEffect } from '../../util/utils';
import { ITypeEffChart, TypeEff, TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffComponent } from '../models/page.model';
import { PokemonTypeBadge, TypeModel, TypeMultiply } from '../../core/models/type.model';
import { DynamicObj, getValueOrDefault, isEqual } from '../../util/extension';

const Attacker = (prop: ITypeEffComponent) => {
  const [types, setTypes] = useState<string[]>([]);

  const [currentType, setCurrentType] = useState(
    getValueOrDefault(String, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Bug)?.toUpperCase())
  );
  const [showType, setShowType] = useState(false);

  const [typeEffective, setTypeEffective] = useState<ITypeEffChart>();

  const getTypeEffective = useCallback(() => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    Object.entries(
      ((prop.types ?? new TypeEff()) as unknown as DynamicObj<TypeMultiply>)[currentType] ?? new TypeModel()
    ).forEach(([key, value]: [string, number]) => getMultiplyTypeEffect(data, value, key));
    setTypeEffective(data);
  }, [currentType, prop.types]);

  useEffect(() => {
    const results = Object.keys(prop.types ?? new TypeEff()).filter((item) => !isEqual(item, currentType));
    setTypes(results);
    getTypeEffective();
  }, [currentType, getTypeEffective, prop.types]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(value);
    getTypeEffective();
  };

  return (
    <div className="mt-2">
      <h5 className="text-center">
        <b>As Attacker</b>
      </h5>
      <h6 className="text-center">
        <b>Select Type</b>
      </h6>
      <div className=" d-flex justify-content-center">
        <div className="card-input" tabIndex={0} onClick={() => setShowType(true)} onBlur={() => setShowType(false)}>
          <div className="card-select">
            <CardType value={capitalize(currentType)} />
          </div>
          {showType && (
            <div className="result-type">
              <ul>
                {types.map((value, index) => (
                  <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                    <CardType value={capitalize(value)} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <TypeEffective typeEffective={typeEffective} />
    </div>
  );
};

export default Attacker;
