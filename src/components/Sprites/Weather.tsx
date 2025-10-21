import React, { Fragment } from 'react';
import APIService from '../../services/api.service';
import { splitAndCapitalize } from '../../utils/utils';
import { IWeatherComponent } from '../models/component.model';
import { isNotEmpty } from '../../utils/extension';
import { combineClasses } from '../../utils/extension';

const Weather = (props: IWeatherComponent) => {
  return (
    <Fragment>
      {!isNotEmpty(props.arr) ? (
        <div className="tw-mt-2 tw-flex tw-ml-3">
          <div className="tw-text-center" key={0}>
            <img height={50} alt="Pokémon Image" src={APIService.getPokeSprite()} />
            <span className="caption tw-text-default">None</span>
          </div>
        </div>
      ) : (
        <div className={combineClasses('mt-2', props.className)} style={props.style}>
          {props.text && <p>{props.text}</p>}
          <div className="tw-inline-flex tw-flex-wrap type-list tw-items-center">
            {props.arr?.map((value, index) => (
              <div className="tw-text-center tw-flex" key={index}>
                <div>
                  <img height={50} alt="Pokémon Image" src={APIService.getWeatherSprite(value)} />
                  <span className="caption tw-text-default">{splitAndCapitalize(value, /(?=[A-Z])/, ' ')}</span>
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
