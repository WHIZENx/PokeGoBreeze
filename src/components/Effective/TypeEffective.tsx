import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import TypeInfo from '../Sprites/Type/Type';
import { ITypeEffectiveComponent } from '../models/component.model';
import { combineClasses, isNotEmpty, toFloat } from '../../utils/extension';
import { EffectiveType } from './enums/type-effective.enum';
import { getKeyWithData } from '../../utils/utils';
import Chip from '@mui/material/Chip';

const TypeEffectiveComponent = (props: ITypeEffectiveComponent) => {
  const isAttacker = props.perspective === 'attacker';
  const isSummary = props.variant === 'summary';
  const damageDirection = isAttacker ? 'to' : 'from';
  const summaryCardClass = isSummary ? 'tw-min-w-0' : undefined;
  const typeListClass = isSummary ? '!tw-ml-0' : 'tw-ml-3';

  const noneSprit = () => (
    <div className={combineClasses('tw-mt-2 tw-flex', typeListClass)}>
      <div className="tw-text-center" key={0}>
        <img height={50} alt="Pokémon Image" src={APIService.getPokeSprite()} />
        <span className="caption tw-text-black">{getKeyWithData(EffectiveType, EffectiveType.None)}</span>
      </div>
    </div>
  );

  return (
    <Fragment>
      {props.typeEffective && (
        <div className={isSummary ? '' : 'tw-mt-2'}>
          {!isSummary && (
            <h5 className="tw-mt-2">
              <li>Pokémon Type Effective</li>
            </h5>
          )}
          <div className={isSummary ? 'tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2 lg:tw-grid-cols-4' : ''}>
            {(isNotEmpty(props.typeEffective.veryWeak) || isNotEmpty(props.typeEffective.weak)) && (
              <div className={summaryCardClass}>
                <h6 className={isSummary ? '!tw-m-0 tw-mb-1.5' : 'tw-mt-2'}>
                  {isSummary ? (
                    <Chip
                      component="span"
                      label={isAttacker ? 'Super Effective' : getKeyWithData(EffectiveType, EffectiveType.Weakness)}
                      size="small"
                      color="error"
                    />
                  ) : (
                    <span className="type-title weakness-title">
                      <b>{isAttacker ? 'Super Effective' : getKeyWithData(EffectiveType, EffectiveType.Weakness)}</b>
                    </span>
                  )}
                </h6>
                <TypeInfo
                  text={`${toFloat(EffectiveType.VeryWeakness, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.veryWeak}
                  className={typeListClass}
                />
                <TypeInfo
                  text={`${toFloat(EffectiveType.Weakness, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.weak}
                  className={typeListClass}
                />
              </div>
            )}
            {(isNotEmpty(props.typeEffective.superResist) ||
              isNotEmpty(props.typeEffective.veryResist) ||
              isNotEmpty(props.typeEffective.resist)) && (
              <div className={summaryCardClass}>
                <h6 className={isSummary ? '!tw-m-0 tw-mb-1.5' : 'tw-mt-2'}>
                  {isSummary ? (
                    <Chip
                      component="span"
                      label={
                        isAttacker ? 'Not Very Effective' : getKeyWithData(EffectiveType, EffectiveType.Resistance)
                      }
                      size="small"
                      color="success"
                    />
                  ) : (
                    <span className="type-title resistance-title">
                      <b>
                        {isAttacker ? 'Not Very Effective' : getKeyWithData(EffectiveType, EffectiveType.Resistance)}
                      </b>
                    </span>
                  )}
                </h6>
                <TypeInfo
                  text={`${toFloat(EffectiveType.SuperResistance, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.superResist}
                  className={typeListClass}
                />
                <TypeInfo
                  text={`${toFloat(EffectiveType.VeryResistance, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.veryResist}
                  className={typeListClass}
                />
                <TypeInfo
                  text={`${toFloat(EffectiveType.Resistance, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.resist}
                  className={typeListClass}
                />
              </div>
            )}
            <div className={combineClasses(summaryCardClass, isSummary ? 'sm:tw-col-span-2 lg:tw-col-span-2' : '')}>
              <h6 className={isSummary ? '!tw-m-0 tw-mb-1.5' : 'tw-mt-2'}>
                {isSummary ? (
                  <Chip component="span" label={getKeyWithData(EffectiveType, EffectiveType.Neutral)} size="small" />
                ) : (
                  <span className="type-title neutral-title">
                    <b>{getKeyWithData(EffectiveType, EffectiveType.Neutral)}</b>
                  </span>
                )}
              </h6>
              {isNotEmpty(props.typeEffective.neutral) ? (
                <TypeInfo
                  text={`${toFloat(EffectiveType.Neutral, 3)}x damage ${damageDirection}`}
                  arr={props.typeEffective.neutral}
                  className={typeListClass}
                />
              ) : (
                noneSprit()
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TypeEffectiveComponent;
