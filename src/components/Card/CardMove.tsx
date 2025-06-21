import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import { StoreState } from '../../store/models/state.model';
import { ICombat } from '../../core/models/combat.model';
import { ICardMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty } from '../../utils/extension';
import { MoveType } from '../../enums/type.enum';
import IconType from '../Sprites/Icon/Type/Type';

const CardMove = (props: ICardMoveComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data.combats);

  const [move, setMove] = useState<ICombat>();

  useEffect(() => {
    if (isNotEmpty(combat) && props.value) {
      const move = combat.find((item) => isEqual(item.name, props.value?.name));
      setMove(move);
    }
  }, [combat, props.value]);

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
