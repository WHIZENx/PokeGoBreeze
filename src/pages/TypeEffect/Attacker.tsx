import React, { useEffect, useState, useCallback } from 'react';
import TypeEffective from '../../components/Effective/TypeEffective';
import CardType from '../../components/Card/CardType';
import { capitalize } from '../../util/Utils';
import { useTheme } from '@mui/material';
import { TypeEff, TypeEffChart } from '../../core/models/type-eff.model';

const Attacker = (prop: { types: TypeEff | any }) => {
  const theme = useTheme();
  const [types, setTypes] = useState([] as string[]);

  const [currentType, setCurrentType] = useState('BUG');
  const [showType, setShowType] = useState(false);

  const [typeEffective, setTypeEffective]: [TypeEffChart | undefined, React.Dispatch<React.SetStateAction<TypeEffChart | undefined>>] =
    useState();

  const getTypeEffective = useCallback(() => {
    const data: TypeEffChart = {
      weak: [],
      super_resist: [],
      very_resist: [],
      resist: [],
      neutral: [],
    };
    Object.entries(prop.types[currentType] ?? []).forEach(([key, value]) => {
      if (value === 1.6) {
        data.weak?.push(key);
      } else if (value === 1) {
        data.neutral?.push(key);
      } else if (value === 0.625) {
        data.resist?.push(key);
      } else {
        data.very_resist?.push(key);
      }
    });
    setTypeEffective(data);
  }, [currentType, prop.types]);

  useEffect(() => {
    const results = Object.keys(prop.types).filter((item) => item !== currentType);
    setTypes(results);
    getTypeEffective();
  }, [currentType, getTypeEffective, prop.types]);

  const changeType = (value: string) => {
    setShowType(false);
    setCurrentType(value);
    getTypeEffective();
  };

  return (
    <div className="element-top">
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
                  <li
                    className={'container card-pokemon' + (theme.palette.mode === 'dark' ? '-dark' : '')}
                    style={{ backgroundColor: theme.palette.background.default }}
                    key={index}
                    onMouseDown={() => changeType(value)}
                  >
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
