import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import TypeInfo from '../Sprites/Type/Type';
import { ITypeEffectiveComponent } from '../models/component.model';

const TypeEffective = (props: ITypeEffectiveComponent) => {
  const noneSprit = () => {
    return (
      <div className="element-top d-flex" style={{ marginLeft: 15 }}>
        <div className="text-center" key={0}>
          <img height={50} alt="img-pokemon" src={APIService.getPokeSprite(0)} />
          <span className="caption text-black">None</span>
        </div>
      </div>
    );
  };

  return (
    <Fragment>
      {props.typeEffective && (
        <div className="element-top">
          <h5 className="element-top">
            <li>Pokémon Type Effective</li>
          </h5>
          <h6 className="element-top">
            <span className="type-title weakness-title">
              <b>Weakness</b>
            </span>
          </h6>
          {(props.typeEffective.veryWeak ?? []).length !== 0 || (props.typeEffective.weak ?? []).length !== 0 ? (
            <Fragment>
              <TypeInfo text={'2.56x damage from'} arr={props.typeEffective.veryWeak ?? []} style={{ marginLeft: 15 }} />
              <TypeInfo text={'1.6x damage from'} arr={props.typeEffective.weak ?? []} style={{ marginLeft: 15 }} />
            </Fragment>
          ) : (
            noneSprit()
          )}
          <h6 className="element-top">
            <span className="type-title resistance-title">
              <b>Resistance</b>
            </span>
          </h6>
          {(props.typeEffective.superResist ?? []).length !== 0 ||
          (props.typeEffective.veryResist ?? []).length !== 0 ||
          (props.typeEffective.resist ?? []).length !== 0 ? (
            <Fragment>
              <TypeInfo text={'0.244x damage from'} arr={props.typeEffective.superResist ?? []} style={{ marginLeft: 15 }} />
              <TypeInfo text={'0.391x damage from'} arr={props.typeEffective.veryResist ?? []} style={{ marginLeft: 15 }} />
              <TypeInfo text={'0.625x damage from'} arr={props.typeEffective.resist ?? []} style={{ marginLeft: 15 }} />
            </Fragment>
          ) : (
            noneSprit()
          )}
          <h6 className="element-top">
            <span className="type-title neutral-title">
              <b>Neutral</b>
            </span>
          </h6>
          {(props.typeEffective.neutral ?? []).length !== 0 ? (
            <TypeInfo text={'1x damage from'} arr={props.typeEffective.neutral ?? []} style={{ marginLeft: 15 }} />
          ) : (
            noneSprit()
          )}
        </div>
      )}
    </Fragment>
  );
};

export default TypeEffective;
