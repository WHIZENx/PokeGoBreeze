import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { ICardTypeComponent } from '../models/component.model';
import { MoveType } from '../../enums/type.enum';

const CardType = (props: ICardTypeComponent) => {
  return (
    <Fragment>
      {props.value ? (
        <Fragment>
          <img width={64} height={64} alt="type-logo" style={{ marginRight: 10 }} src={APIService.getTypeSprite(props.value)} />
          <b>{props.name ?? props.value}</b>{' '}
          {props.moveType === MoveType.Elite && <span className="type-icon-small ic elite-ic">{MoveType.Elite}</span>}
          {props.moveType === MoveType.Shadow && <span className="type-icon-small ic shadow-ic">{MoveType.Shadow}</span>}
          {props.moveType === MoveType.Purified && <span className="type-icon-small ic purified-ic">{MoveType.Purified}</span>}
          {props.moveType === MoveType.Special && <span className="type-icon-small ic special-ic">{MoveType.Special}</span>}
        </Fragment>
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100" style={{ height: 64 }}>
          <b>- Select -</b>
        </div>
      )}
    </Fragment>
  );
};

export default CardType;
