import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize } from '../../utils/utils';

import './TypeEffectiveSelect.scss';
import { StoreState } from '../../store/models/state.model';
import { TypeEffChart } from '../../core/models/type-eff.model';
import { ITypeEffectiveSelectComponent } from '../models/component.model';
import { combineClasses, isNotEmpty, toFloat } from '../../utils/extension';
import { EffectiveType } from './enums/type-effective.enum';

const TypeEffectiveSelect = (props: ITypeEffectiveSelectComponent) => {
  const typeEffective = useSelector((state: StoreState) => state.store.data.typeEff);

  const renderEffective = (amount: EffectiveType, data: string[] | undefined) => (
    <Fragment>
      {isNotEmpty(data) && (
        <Fragment>
          <h6 className={combineClasses('mb-0', props.isBlock ? 'mt-2' : '')}>
            <b className="text-shadow-black">x{toFloat(amount, 3)}</b>
          </h6>
          <div className="d-flex flex-wrap gap-1">
            {data?.map((value, index) => (
              <div
                key={index}
                className={combineClasses(
                  value.toLowerCase(),
                  'type-select-bg d-flex align-items-center filter-shadow text-shadow-black'
                )}
              >
                <img
                  className="w-3 pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="Pokémon GO Type Logo"
                  src={APIService.getTypeHqSprite(value)}
                />
                <span>{capitalize(value)}</span>
              </div>
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
    if (effect === EffectiveType.Weakness) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective >= EffectiveType.VeryWeakness) {
          data.veryWeak?.push(key);
        } else if (valueEffective >= EffectiveType.Weakness) {
          data.weak?.push(key);
        }
      });

      return (
        <div className="container d-flex flex-column pb-2 gap-2">
          {renderEffective(EffectiveType.VeryWeakness, data.veryWeak)}
          {renderEffective(EffectiveType.Weakness, data.weak)}
        </div>
      );
    } else if (effect === EffectiveType.Neutral) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (isNotEmpty(types) && valueEffective === EffectiveType.Neutral) {
          data.neutral?.push(key);
        }
      });
      return (
        <div className="container d-flex flex-column pb-2 gap-2">
          {renderEffective(EffectiveType.Neutral, data.neutral)}
        </div>
      );
    } else if (effect === EffectiveType.Resistance) {
      Object.entries(typeEffective).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type.toUpperCase()];
        });
        if (valueEffective <= EffectiveType.SuperResistance) {
          data.superResist?.push(key);
        } else if (valueEffective <= EffectiveType.VeryResistance) {
          data.veryResist?.push(key);
        } else if (valueEffective <= EffectiveType.Resistance) {
          data.resist?.push(key);
        }
      });
      return (
        <div className="container d-flex flex-column pb-2 gap-2">
          {renderEffective(EffectiveType.SuperResistance, data.superResist)}
          {renderEffective(EffectiveType.VeryResistance, data.veryResist)}
          {renderEffective(EffectiveType.Resistance, data.resist)}
        </div>
      );
    }
    return <></>;
  };

  return <Fragment>{getTypeEffect(props.effect, props.types)}</Fragment>;
};

export default TypeEffectiveSelect;
