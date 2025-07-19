import React, { Fragment, useEffect, useState } from 'react';
import { ICardTypeComponent } from '../models/component.model';
import { CardType, MoveType } from '../../enums/type.enum';
import { combineClasses, getValueOrDefault } from '../../utils/extension';
import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import IconType from '../Sprites/Icon/Type/Type';
import APIService from '../../services/api.service';
import useCombats from '../../composables/useCombats';
import { ICombat } from '../../core/models/combat.model';

const Card = (props: ICardTypeComponent) => {
  const { findMoveByName } = useCombats();

  const [move, setMove] = useState<ICombat>();

  useEffect(() => {
    if (props.value && props.cardType === CardType.Move) {
      const move = findMoveByName(props.value);
      setMove(move);
    }
  }, [findMoveByName, props.value, props.cardType]);

  const renderWeather = () => (
    <img height={64} alt="Pokémon GO Weather Logo" className="me-2" src={APIService.getWeatherSprite(props.value)} />
  );

  return (
    <Fragment>
      {props.value ? (
        <div
          className={combineClasses(
            'd-flex align-items-center w-100 h-100 overflow-x-hidden text-nowrap',
            props.cardType === CardType.Move ? 'p-1' : ''
          )}
        >
          {props.cardType === CardType.Weather ? (
            renderWeather()
          ) : (
            <IconType
              width={64}
              height={64}
              alt="Pokémon GO Type Logo"
              className="me-2"
              type={props.cardType === CardType.Move ? move?.type : props.value}
            />
          )}
          <span className={props.cardType === CardType.Move ? 'me-1' : ''}>
            <b>{`${splitAndCapitalize(
              getValueOrDefault(String, props.cardType === CardType.Move ? move?.name : props.name, props.value),
              '_',
              ' '
            )} `}</b>
          </span>
          <span className={props.cardType === CardType.Move ? 'd-flex' : ''}>
            {move && props.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, props.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, props.moveType)}
              </span>
            )}
          </span>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center w-100 h-9">
          {!props.isHideDefaultTitle && <b>- Select -</b>}
        </div>
      )}
    </Fragment>
  );
};

export default Card;
