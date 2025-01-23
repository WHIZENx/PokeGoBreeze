import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import TypeInfo from '../Sprites/Type/Type';
import { ITypeEffectiveComponent } from '../models/component.model';
import { isNotEmpty, toFloat } from '../../util/extension';
import { EffectiveType } from './enums/type-effective.enum';
import { getKeyWithData } from '../../util/utils';

const TypeEffective = (props: ITypeEffectiveComponent) => {
  const noneSprit = () => (
    <div className="element-top d-flex" style={{ marginLeft: 15 }}>
      <div className="text-center" key={0}>
        <img height={50} alt="img-pokemon" src={APIService.getPokeSprite()} />
        <span className="caption text-black">{getKeyWithData(EffectiveType, EffectiveType.None)}</span>
      </div>
    </div>
  );

  return (
    <Fragment>
      {props.typeEffective && (
        <div className="element-top">
          <h5 className="element-top">
            <li>Pokémon Type Effective</li>
          </h5>
          {(isNotEmpty(props.typeEffective.veryWeak) || isNotEmpty(props.typeEffective.weak)) && (
            <Fragment>
              <h6 className="element-top">
                <span className="type-title weakness-title">
                  <b>{getKeyWithData(EffectiveType, EffectiveType.Weakness)}</b>
                </span>
              </h6>
              <TypeInfo
                text={`${toFloat(EffectiveType.VeryWeakness, 3)}x damage from`}
                arr={props.typeEffective.veryWeak}
                style={{ marginLeft: 15 }}
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.Weakness, 3)}x damage from`}
                arr={props.typeEffective.weak}
                style={{ marginLeft: 15 }}
              />
            </Fragment>
          )}
          {(isNotEmpty(props.typeEffective.superResist) ||
            isNotEmpty(props.typeEffective.veryResist) ||
            isNotEmpty(props.typeEffective.resist)) && (
            <Fragment>
              <h6 className="element-top">
                <span className="type-title resistance-title">
                  <b>{getKeyWithData(EffectiveType, EffectiveType.Resistance)}</b>
                </span>
              </h6>
              <TypeInfo
                text={`${toFloat(EffectiveType.SuperResistance, 3)}x damage from`}
                arr={props.typeEffective.superResist}
                style={{ marginLeft: 15 }}
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.VeryResistance, 3)}x damage from`}
                arr={props.typeEffective.veryResist}
                style={{ marginLeft: 15 }}
              />
              <TypeInfo
                text={`${toFloat(EffectiveType.Resistance, 3)}x damage from`}
                arr={props.typeEffective.resist}
                style={{ marginLeft: 15 }}
              />
            </Fragment>
          )}
          <h6 className="element-top">
            <span className="type-title neutral-title">
              <b>{getKeyWithData(EffectiveType, EffectiveType.Neutral)}</b>
            </span>
          </h6>
          {isNotEmpty(props.typeEffective.neutral) ? (
            <TypeInfo
              text={`${toFloat(EffectiveType.Neutral, 3)}x damage from`}
              arr={props.typeEffective.neutral}
              style={{ marginLeft: 15 }}
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
