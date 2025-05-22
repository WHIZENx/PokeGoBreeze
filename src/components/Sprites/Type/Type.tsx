import React, { Fragment } from 'react';
import APIService from '../../../services/API.service';
import { capitalize } from '../../../util/utils';

import './Type.scss';
import { ITypeComponent } from '../../models/component.model';
import { isNotEmpty, combineClasses, toNumber } from '../../../util/extension';
import IconType from '../Icon/Type/Type';

const TypeInfo = (props: ITypeComponent) => {
  return (
    <Fragment>
      {!isNotEmpty(props.arr) && props.isShow ? (
        <div className="element-top d-flex" style={{ marginLeft: 15 }}>
          <div className="text-center" key={0}>
            <img
              width={toNumber(props.height, 36)}
              height={toNumber(props.height, 36)}
              alt="Pokémon Image"
              src={APIService.getPokeSprite()}
            />
            <span className="caption theme-text-primary">None</span>
          </div>
        </div>
      ) : (
        <>
          {isNotEmpty(props.arr) && (
            <div
              className={combineClasses(props.isBlock ? '' : 'element-top', props.isShowShadow ? 'filter-shadow' : '')}
              style={props.style}
            >
              {props.text && <p>{props.text}</p>}
              <div className="d-inline-flex flex-wrap type-list align-items-center">
                {props.arr?.map((value, index) => (
                  <div className="text-center d-flex" key={index}>
                    {props.isHideText ? (
                      <IconType
                        className={props.isShowShadow ? 'filter-shadow' : ''}
                        width={props.height}
                        height={props.height}
                        alt="Pokémon GO Type Logo"
                        type={value}
                      />
                    ) : (
                      <div>
                        <IconType
                          className={props.isShowShadow ? 'filter-shadow' : ''}
                          width={36}
                          height={36}
                          alt="Pokémon GO Type Logo"
                          type={value}
                        />
                        <span
                          className={combineClasses('caption', props.isShowShadow ? `text-white text-shadow` : '')}
                          style={{ color: `${props.color} !important` }}
                        >
                          {capitalize(value)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Fragment>
  );
};

export default TypeInfo;
