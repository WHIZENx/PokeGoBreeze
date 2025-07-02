import React, { Fragment, useEffect, useState } from 'react';
import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import { ICombat } from '../../core/models/combat.model';
import { ICardMoveComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { MoveType } from '../../enums/type.enum';
import IconType from '../Sprites/Icon/Type/Type';
import useCombats from '../../composables/useCombats';

const CardMove = (props: ICardMoveComponent) => {
  const { findMoveData } = useCombats();

  const [move, setMove] = useState<ICombat>();

  useEffect(() => {
    if (props.value) {
      const move = findMoveData(props.value?.name);
      setMove(move);
    }
  }, [findMoveData, props.value]);

  return (
    <Fragment>
      {move && (
        <div className="d-flex align-items-center w-100 h-100 p-1 overflow-x-hidden text-nowrap">
          <IconType width={64} height={64} alt="Pokémon GO Type Logo" className="me-2" type={move.type} />
          <span className="me-1">
            <b>{splitAndCapitalize(move.name, '_', ' ')}</b>
          </span>
          <span className="d-flex">
            {props.value && props.value.moveType !== MoveType.None && (
              <span
                className={combineClasses(
                  'type-icon-small ic',
                  `${getKeyWithData(MoveType, props.value?.moveType)?.toLowerCase()}-ic`
                )}
              >
                {getKeyWithData(MoveType, props.value.moveType)}
              </span>
            )}
          </span>
        </div>
      )}
    </Fragment>
  );
};

export default CardMove;
