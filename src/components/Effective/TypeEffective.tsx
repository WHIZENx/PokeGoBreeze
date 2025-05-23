import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import TypeInfo from '../Sprites/Type/Type';
import { ITypeEffectiveComponent } from '../models/component.model';
import { isNotEmpty, toFloat } from '../../util/extension';
import { EffectiveType } from './enums/type-effective.enum';
import { getKeyWithData } from '../../util/utils';

const TypeEffective = (props: ITypeEffectiveComponent) => {
  const noneSprit = () => (
    <div className="mt-2 d-flex ms-3">
      <div className="text-center" key={0}>
        <img height={50} alt="Pokémon Image" src={APIService.getPokeSprite()} />
        <span className="caption text-black">{getKeyWithData(EffectiveType, EffectiveType.None)}</span>
      </div>
    </div>
  );

  return (
    <Fragment>
      {props.typeEffective && (
        <div className="mt-2">
          <h5 className="mt-2">
            <li>Pokémon Type Effective</li>
          </h5>
          {(isNotEmpty(props.typeEffective.veryWeak) || isNotEmpty(props.typeEffective.weak)) && (
            <Fragment>
              <h6 className="mt-2">
                <span className="type-title weakness-title">
                  <b>{getKeyWithData(EffectiveType, EffectiveType.Weakness)}</b>
                </span>
              </h6>
              <TypeInfo
                text={`${toFloat(EffectiveType.VeryWeakness, 3)}x damage from`}
                arr={props.typeEffective.veryWeak}
                className="ms-3"
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.Weakness, 3)}x damage from`}
                arr={props.typeEffective.weak}
                className="ms-3"
              />
            </Fragment>
          )}
          {(isNotEmpty(props.typeEffective.superResist) ||
            isNotEmpty(props.typeEffective.veryResist) ||
            isNotEmpty(props.typeEffective.resist)) && (
            <Fragment>
              <h6 className="mt-2">
                <span className="type-title resistance-title">
                  <b>{getKeyWithData(EffectiveType, EffectiveType.Resistance)}</b>
                </span>
              </h6>
              <TypeInfo
                text={`${toFloat(EffectiveType.SuperResistance, 3)}x damage from`}
                arr={props.typeEffective.superResist}
                className="ms-3"
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.VeryResistance, 3)}x damage from`}
                arr={props.typeEffective.veryResist}
                className="ms-3"
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.Resistance, 3)}x damage from`}
                arr={props.typeEffective.resist}
                className="ms-3"
              />
            </Fragment>
          )}
          <h6 className="mt-2">
            <span className="type-title neutral-title">
              <b>{getKeyWithData(EffectiveType, EffectiveType.Neutral)}</b>
            </span>
          </h6>
          {isNotEmpty(props.typeEffective.neutral) ? (
            <TypeInfo
              text={`${toFloat(EffectiveType.Neutral, 3)}x damage from`}
              arr={props.typeEffective.neutral}
              className="ms-3"
            />
          ) : (
            noneSprit()
          )}
        </div>
      )}
    </Fragment>
  );
};

export default TypeEffective;
