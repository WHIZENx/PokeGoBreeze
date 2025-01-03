import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize } from '../../util/utils';

import './TypeEffectiveSelect.scss';
import { StoreState } from '../../store/models/state.model';
import { TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffectiveSelectComponent } from '../models/component.model';
import { combineClasses, isNotEmpty } from '../../util/extension';
import { EffectiveType } from '../../pages/PVP/enums/type-eff.enum';
import { TypeEffectiveAmount } from './enums/type-effective.enum';

const TypeEffectiveSelect = (props: ITypeEffectiveSelectComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);

  const renderEffective = (text: string, data: string[] | undefined) => (
    <Fragment>
      {isNotEmpty(data) && (
        <Fragment>
          <h6 className={props.isBlock ? 'element-top' : ''}>
            <b className="text-shadow">x{text}</b>
          </h6>
          <div className="d-flex flex-wrap" style={{ gap: 5 }}>
            {data?.map((value, index) => (
              <span key={index} className={combineClasses(value.toLowerCase(), 'type-select-bg d-flex align-items-center filter-shadow')}>
                <div style={{ display: 'contents', width: 16 }}>
                  <img
                    className="pokemon-sprite-small sprite-type-select filter-shadow"
                    alt="img-type-pokemon"
                    src={APIService.getTypeHqSprite(value)}
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

  const getTypeEffect = (effect: EffectiveType, types: string[] | undefined) => {
    const data = TypeEffChart.create({
      veryWeak: [],
      weak: [],
      superResist: [],
      veryResist: [],
      resist: [],
      neutral: [],
    });
    if (effect === EffectiveType.Weak) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective >= TypeEffectiveAmount.VeryWeak) {
          data.veryWeak?.push(key);
        } else if (valueEffective >= TypeEffectiveAmount.Weak) {
          data.weak?.push(key);
        }
      });

      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('2.56', data.veryWeak)}
          {renderEffective('1.6', data.weak)}
        </div>
      );
    } else if (effect === EffectiveType.Neutral) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (isNotEmpty(types) && valueEffective === TypeEffectiveAmount.Neutral) {
          data.neutral?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('1', data.neutral)}
        </div>
      );
    } else if (effect === EffectiveType.Resistance) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective <= TypeEffectiveAmount.SuperResist) {
          data.superResist?.push(key);
        } else if (valueEffective <= TypeEffectiveAmount.VeryResist) {
          data.veryResist?.push(key);
        } else if (valueEffective <= TypeEffectiveAmount.Resist) {
          data.resist?.push(key);
        }
      });
      return (
        <div className="container" style={{ paddingBottom: '0.5rem' }}>
          {renderEffective('0.244', data.superResist)}
          {renderEffective('0.391', data.veryResist)}
          {renderEffective('0.625', data.resist)}
        </div>
      );
    }
    return <></>;
  };

  return <Fragment>{getTypeEffect(props.effect, props.types)}</Fragment>;
};

export default TypeEffectiveSelect;
