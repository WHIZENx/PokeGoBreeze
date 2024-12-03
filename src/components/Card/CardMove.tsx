import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { getKeyWithData, splitAndCapitalize } from '../../util/utils';
import { StoreState } from '../../store/models/state.model';
import { ICombat } from '../../core/models/combat.model';
import { ICardMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty } from '../../util/extension';
import { MoveType } from '../../enums/type.enum';

const CardMove = (props: ICardMoveComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data.combat);

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
        <div className="d-flex align-items-center w-100 h-100" style={{ padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}>
          <img width={64} height={64} alt="type-logo" style={{ marginRight: 10 }} src={APIService.getTypeSprite(move.type)} />
          <span style={{ marginRight: 5 }}>
            <b>{splitAndCapitalize(move.name, '_', ' ')}</b>
          </span>
          <span className="d-flex">
            {props.value && props.value.moveType !== MoveType.None && (
              <span
                className={combineClasses('type-icon-small ic', `${getKeyWithData(MoveType, props.value?.moveType)?.toLowerCase()}-ic`)}
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
