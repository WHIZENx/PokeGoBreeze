import React, { Fragment } from 'react';
import { ICardTypeComponent } from '../models/component.model';
import { MoveType } from '../../enums/type.enum';
import { combineClasses, getValueOrDefault } from '../../util/extension';
import { getKeyWithData } from '../../util/utils';
import IconType from '../Sprites/Icon/Type/Type';

const CardType = (props: ICardTypeComponent) => {
  return (
    <Fragment>
      {props.value ? (
        <Fragment>
          <IconType width={64} height={64} alt="Pokémon GO Type Logo" className="me-2" type={props.value} />
          <b>{`${getValueOrDefault(String, props.name, props.value)} `}</b>
          {props.moveType !== MoveType.None && (
            <span
              className={combineClasses(
                'type-icon-small ic',
                `${getKeyWithData(MoveType, props.moveType)?.toLowerCase()}-ic`
              )}
            >
              {getKeyWithData(MoveType, props.moveType)}
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
