import React, { Fragment, useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import APIService from '../../services/API.service';
import { getKeyWithData, splitAndCapitalize } from '../../util/utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { ICardSmallComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty } from '../../util/extension';
import { MoveType } from '../../enums/type.enum';
import { ICombat } from '../../core/models/combat.model';

const CardMoveSmall = (props: ICardSmallComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data.combat);

  const [data, setData] = useState<ICombat>();

  useEffect(() => {
    if (isNotEmpty(combat) && props.value) {
      const move = combat.find((item) => isEqual(item.name, props.value?.name));
      setData(move);
    }
  }, [combat, props.value]);

  return (
    <Fragment>
      {props.isEmpty ? (
        <div className="h-100" />
      ) : (
        <Fragment>
          {props.value && data && (
            <div
              className={combineClasses('d-flex align-items-center w-100 h-100', props.isDisable ? 'disable-card-move' : '')}
              style={{ padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}
            >
              <img width={18} height={18} alt="type-logo" style={{ marginRight: 10 }} src={APIService.getTypeSprite(data.type)} />
              <span style={{ marginRight: 5 }}>{splitAndCapitalize(data.name, '_', ' ')}</span>
              <span className="d-flex">
                {props.value && props.value.moveType !== MoveType.None && (
                  <span
                    className={combineClasses('type-icon-small ic', `${getKeyWithData(MoveType, props.value?.moveType)?.toLowerCase()}-ic`)}
                  >
                    {getKeyWithData(MoveType, props.value.moveType)}
                  </span>
                )}
              </span>
              {props.isShow && !props.isDisable && (
                <div className="select-down d-flex align-items-center">
                  {props.isSelect && <KeyboardArrowDownIcon fontSize="small" />}
                  {props.clearData && (
                    <CloseIcon className="remove-pokemon-select" sx={{ color: 'red' }} onClick={() => props.clearData?.()} />
                  )}
                </div>
              )}
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default CardMoveSmall;
