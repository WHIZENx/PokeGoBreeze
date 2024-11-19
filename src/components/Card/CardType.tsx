import React, { Fragment } from 'react';
import APIService from '../../services/API.service';
import { ICardTypeComponent } from '../models/component.model';
import { MoveType } from '../../enums/type.enum';
import { combineClasses } from '../../util/extension';
import { getKeyEnum } from '../../util/utils';

const CardType = (props: ICardTypeComponent) => {
  return (
    <Fragment>
      {props.value ? (
        <Fragment>
          <img width={64} height={64} alt="type-logo" style={{ marginRight: 10 }} src={APIService.getTypeSprite(props.value)} />
          <b>{`${props.name ?? props.value} `}</b>
          {props.moveType !== MoveType.None && (
            <span className={combineClasses('type-icon-small ic', `${getKeyEnum(MoveType, props.moveType)?.toLowerCase()}-ic`)}>
              {getKeyEnum(MoveType, props.moveType)}
            </span>
          )}
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
