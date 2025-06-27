import React, { useEffect, useState, useCallback } from 'react';
import TypeEffectiveComponent from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize, getKeyWithData, getMultiplyTypeEffect } from '../../utils/utils';
import { ITypeEffectiveChart, TypeEffectiveModel, TypeEffectiveChart } from '../../core/models/type-effective.model';
import { ITypeEffComponent } from '../models/page.model';
import { ITypeModel, TypeModel } from '../../core/models/type.model';
import { PokemonTypeBadge } from '../../core/enums/pokemon-type.enum';
import { DynamicObj, getValueOrDefault } from '../../utils/extension';
import { getTypes } from '../../utils/helpers/options-context.helpers';

const Attacker = (prop: ITypeEffComponent) => {
  const [currentType, setCurrentType] = useState(
    getValueOrDefault(String, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Bug)?.toUpperCase())
  );
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
    Object.entries(
      ((prop.types ?? new TypeEffectiveModel()) as unknown as DynamicObj<ITypeModel>)[currentType] ?? new TypeModel()
    ).forEach(([key, value]: [string, number]) => getMultiplyTypeEffect(data, value, key));
    setTypeEffective(data);
  }, [currentType, prop.types]);

  useEffect(() => {
    getTypeEffective();
  }, [currentType, getTypeEffective]);

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
      </div>
      <TypeEffectiveComponent typeEffective={typeEffective} />
    </div>
  );
};

export default Attacker;
