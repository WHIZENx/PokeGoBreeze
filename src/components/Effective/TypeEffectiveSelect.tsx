import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize } from '../../util/utils';

import './TypeEffectiveSelect.scss';
import { StoreState } from '../../store/models/state.model';
import { TypeEff, TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffectiveSelectComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault, isNotEmpty } from '../../util/extension';
import { EffectiveType } from '../../pages/PVP/enums/type-eff.enum';

const TypeEffectiveSelect = (props: ITypeEffectiveSelectComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);

  const renderEffective = (text: string, data: string[]) => {
    return (
      <Fragment>
        {isNotEmpty(data) && (
          <Fragment>
            <h6 className={props.isBlock ? 'element-top' : ''}>
              <b className="text-shadow">x{text}</b>
            </h6>
            <div className="d-flex flex-wrap" style={{ gap: 5 }}>
              {data.map((value, index) => (
                <span key={index} className={combineClasses(value.toLowerCase(), 'type-select-bg d-flex align-items-center filter-shadow')}>
                  <div style={{ display: 'contents', width: 16 }}>
                    <img
                      className="pokemon-sprite-small sprite-type-select filter-shadow"
                      alt="img-type-pokemon"
                      src={APIService.getTypeHqSprite(capitalize(value))}
                    />
                  </div>
                  <span className="filter-shadow">{capitalize(value)}</span>
                </span>
              ))}
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  };

  const getTypeEffect = (effect: number, types: string[]) => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    if (effect === EffectiveType.WEAK) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective >= 2.56) {
          data.veryWeak?.push(key);
        } else if (valueEffective >= 1.6) {
          data.weak?.push(key);
        }
      });

      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('2.56', getValueOrDefault(Array, data.veryWeak))}
          {renderEffective('1.6', getValueOrDefault(Array, data.weak))}
        </div>
      );
    } else if (effect === EffectiveType.NEUTRAL) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (isNotEmpty(types) && valueEffective === 1) {
          data.neutral?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('1', getValueOrDefault(Array, data.neutral))}
        </div>
      );
    } else if (effect === EffectiveType.RESISTANCE) {
      Object.entries(typeEffective ?? new TypeEff()).forEach(([key, value]) => {
        let valueEffective = 1;
        types.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective <= 0.3) {
          data.superResist?.push(key);
        } else if (valueEffective <= 0.39) {
          data.veryResist?.push(key);
        } else if (valueEffective <= 0.625) {
          data.resist?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('0.244', getValueOrDefault(Array, data.superResist))}
          {renderEffective('0.391', getValueOrDefault(Array, data.veryResist))}
          {renderEffective('0.625', getValueOrDefault(Array, data.resist))}
        </div>
      );
    }
    return <></>;
  };

  return <Fragment>{getTypeEffect(props.effect, props.types)}</Fragment>;
};

export default TypeEffectiveSelect;
