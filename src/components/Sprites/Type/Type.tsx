import { useTheme } from '@mui/material';
import React, { Fragment } from 'react';
import APIService from '../../../services/API.service';
import { capitalize, isNotEmpty } from '../../../util/utils';

import './Type.scss';
import { ITypeComponent } from '../../models/component.model';
import { TypeTheme } from '../../../enums/type.enum';
import { ThemeModify } from '../../../util/models/overrides/themes.model';

const TypeInfo = (props: ITypeComponent) => {
  const theme = useTheme<ThemeModify>();

  return (
    <Fragment>
      {!isNotEmpty(props.arr) && props.isShow ? (
        <div className="element-top d-flex" style={{ marginLeft: 15 }}>
          <div className="text-center" key={0}>
            <img height={50} alt="img-pokemon" src={APIService.getPokeSprite(0)} />
            <span className="caption" style={{ color: theme.palette.text.primary }}>
              None
            </span>
          </div>
        </div>
      ) : (
        <>
          {isNotEmpty(props.arr) && (
            <div className={`${props.block ? '' : 'element-top'} ${props.shadow ? 'filter-shadow' : ''}`} style={props.style}>
              {props.text && <p>{props.text}</p>}
              <div className="d-inline-flex flex-wrap type-list align-items-center">
                {props.arr?.map((value, index) => (
                  <div className="text-center d-flex" key={index}>
                    {props.hideText ? (
                      <img
                        className={props.shadow ? 'filter-shadow' : ''}
                        width={props.height}
                        height={props.height}
                        alt="img-pokemon"
                        src={APIService.getTypeSprite(value)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = APIService.getPokeSprite(0);
                        }}
                      />
                    ) : (
                      <div>
                        <img
                          className={props.shadow ? 'filter-shadow' : ''}
                          width={36}
                          height={36}
                          alt="img-pokemon"
                          src={APIService.getTypeSprite(value)}
                        />
                        <span
                          className={`caption ${props.shadow ? `text-shadow${theme.palette.mode === TypeTheme.DARK ? '-white' : ''}` : ''}`}
                          style={{ color: props.color ?? theme.palette.text.primary }}
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
