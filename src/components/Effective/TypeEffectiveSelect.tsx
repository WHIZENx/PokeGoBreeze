import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import { splitAndCapitalize } from '../../utils/utils';

import './TypeEffectiveSelect.scss';
import { TypeEffectiveChart } from '../../core/models/type-effective.model';
import { ITypeEffectiveSelectComponent } from '../models/component.model';
import { combineClasses, DynamicObj, isNotEmpty, safeObjectEntries, toFloat } from '../../utils/extension';
import { EffectiveType } from './enums/type-effective.enum';
import { getTypeEffective } from '../../utils/helpers/options-context.helpers';

const TypeEffectiveSelect = (props: ITypeEffectiveSelectComponent) => {
  const renderEffective = (amount: EffectiveType, data: string[] | undefined) => (
    <Fragment>
      {isNotEmpty(data) && (
        <Fragment>
          <h6 className={combineClasses('tw-mb-0', props.isBlock ? 'tw-mt-2' : '')}>
            <b className="!tw-text-white text-shadow-black">x{toFloat(amount, 3)}</b>
          </h6>
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {data?.map((value, index) => (
              <div
                key={index}
                className={combineClasses(
                  value.toLowerCase(),
                  'type-select-bg tw-flex tw-align-items-center filter-shadow text-shadow-black'
                )}
              >
                <img
                  className="tw-w-3 pokemon-sprite-small sprite-type-select filter-shadow"
                  alt="Pokémon GO Type Logo"
                  src={APIService.getTypeHqSprite(value)}
                />
                <span>{splitAndCapitalize(value, /(?=[A-Z])/, ' ')}</span>
              </div>
            ))}
          </div>
        </Fragment>
      )}
    </Fragment>
  );

  const getTypeEffect = (effect: EffectiveType, types: string[] | undefined) => {
    const data = new TypeEffectiveChart();
    if (effect === EffectiveType.Weakness) {
      safeObjectEntries<DynamicObj<number>>(getTypeEffective()).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type];
        });
        if (valueEffective >= EffectiveType.VeryWeakness) {
          data.veryWeak?.push(key);
        } else if (valueEffective >= EffectiveType.Weakness) {
          data.weak?.push(key);
        }
      });

      return (
        <div className="tw-container tw-flex tw-flex-col tw-pb-2 tw-gap-2">
          {renderEffective(EffectiveType.VeryWeakness, data.veryWeak)}
          {renderEffective(EffectiveType.Weakness, data.weak)}
        </div>
      );
    } else if (effect === EffectiveType.Neutral) {
      safeObjectEntries<DynamicObj<number>>(getTypeEffective()).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type];
        });
        if (isNotEmpty(types) && valueEffective === EffectiveType.Neutral) {
          data.neutral?.push(key);
        }
      });
      return (
        <div className="tw-container tw-flex tw-flex-col tw-pb-2 tw-gap-2">
          {renderEffective(EffectiveType.Neutral, data.neutral)}
        </div>
      );
    } else if (effect === EffectiveType.Resistance) {
      safeObjectEntries<DynamicObj<number>>(getTypeEffective()).forEach(([key, value]) => {
        let valueEffective = 1;
        types?.forEach((type) => {
          valueEffective *= value[type];
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
        <div className="tw-container tw-flex tw-flex-col tw-pb-2 tw-gap-2">
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
