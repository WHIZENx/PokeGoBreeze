import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../util/Utils';

const Weather = (props: { arr: any[]; style: React.CSSProperties | undefined; text?: string }) => {
  if (!props.arr || props.arr.length === 0) {
    return (
      <Fragment>
        <div className="element-top d-flex" style={{ marginLeft: 15 }}>
          <div className="text-center" key={0}>
            <img height={50} alt="img-pokemon" src={APIService.getPokeSprite(0)} />
            <span className="caption text-black">None</span>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <div className="element-top" style={props.style}>
      {props.text && <p>{props.text}</p>}
      <div className="d-inline-flex flex-wrap type-list align-items-center">
        {props.arr.map((value: string, index: React.Key) => (
          <div className="text-center d-flex" key={index}>
            <div>
              <img height={50} alt="img-pokemon" src={APIService.getWeatherSprite(value)} />
              <span className="caption text-black">{splitAndCapitalize(value, '_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weather;
