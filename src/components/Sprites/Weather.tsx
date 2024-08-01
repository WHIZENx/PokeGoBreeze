import { useTheme } from '@mui/material';
import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { splitAndCapitalize } from '../../util/Utils';
import { IWeatherComponent } from '../models/component.model';

const Weather = (props: IWeatherComponent) => {
  const theme = useTheme();

  return (
    <Fragment>
      {!props.arr || props.arr.length === 0 ? (
        <div className="element-top d-flex" style={{ marginLeft: 15 }}>
          <div className="text-center" key={0}>
            <img height={50} alt="img-pokemon" src={APIService.getPokeSprite(0)} />
            <span className="caption" style={{ color: theme.palette.text.primary }}>
              None
            </span>
          </div>
        </div>
      ) : (
        <div className="element-top" style={props.style}>
          {props.text && <p>{props.text}</p>}
          <div className="d-inline-flex flex-wrap type-list align-items-center">
            {props.arr.map((value, index) => (
              <div className="text-center d-flex" key={index}>
                <div>
                  <img height={50} alt="img-pokemon" src={APIService.getWeatherSprite(value)} />
                  <span className="caption" style={{ color: theme.palette.text.primary }}>
                    {splitAndCapitalize(value, '_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Weather;
