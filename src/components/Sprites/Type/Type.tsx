import React, { Fragment } from 'react';
import APIService from '../../../services/api.service';
import { splitAndCapitalize } from '../../../utils/utils';

import './Type.scss';
import { ITypeComponent } from '../../models/component.model';
import { isNotEmpty, combineClasses, toNumber } from '../../../utils/extension';
import IconType from '../Icon/Type/Type';

const TypeInfo = (props: ITypeComponent) => {
  return (
    <Fragment>
      {!isNotEmpty(props.arr) && props.isShow ? (
        <div className="tw-mt-2 tw-flex tw-ml-3">
          <div className="tw-text-center" key={0}>
            <img
              width={toNumber(props.height, 36)}
              height={toNumber(props.height, 36)}
              alt="Pokémon Image"
              src={APIService.getPokeSprite()}
            />
            <span className="caption tw-text-default">None</span>
          </div>
        </div>
      ) : (
        <>
          {isNotEmpty(props.arr) && (
            <div
              className={combineClasses(
                props.className,
                props.isBlock ? '' : 'tw-mt-2',
                props.isShowShadow ? 'filter-shadow' : ''
              )}
              style={props.style}
            >
              {props.text && <p>{props.text}</p>}
              <div className="tw-inline-flex tw-flex-wrap type-list tw-items-center">
                {props.arr?.map((value, index) => (
                  <div className="tw-text-center tw-flex" key={index}>
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
                          className={combineClasses(
                            'caption',
                            props.isShowShadow ? `tw-text-white text-shadow-black` : ''
                          )}
                          style={{ color: `${props.color} !important` }}
                        >
                          {splitAndCapitalize(value, /(?=[A-Z])/, ' ')}
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
