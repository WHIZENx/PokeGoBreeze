import React, { Fragment } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import APIService from '../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../util/utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { ICardSmallComponent } from '../models/component.model';
import { combineClasses, isEqual } from '../../util/extension';
import { MoveType } from '../../enums/type.enum';

const CardMoveSmall = (props: ICardSmallComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data.combat);

  return (
    <Fragment>
      {props.isEmpty ? (
        <div className="h-100" />
      ) : (
        <Fragment>
          {props.value && (
            <div
              className={combineClasses('d-flex align-items-center w-100 h-100', props.isDisable ? 'disable-card-move' : '')}
              style={{ padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}
            >
              <img
                width={18}
                height={18}
                alt="type-logo"
                style={{ marginRight: 10 }}
                src={APIService.getTypeSprite(
                  props.value ? capitalize(combat.find((item) => isEqual(item.name, props.value?.name))?.type) : ''
                )}
              />
              <span style={{ marginRight: 5 }}>{splitAndCapitalize(props.value.name, '_', ' ')}</span>
              <span className="d-flex">
                {props.value.isElite && <span className="type-icon-small ic elite-ic">{MoveType.Elite}</span>}
                {props.value.isShadow && <span className="type-icon-small ic shadow-ic">{MoveType.Shadow}</span>}
                {props.value.isPurified && <span className="type-icon-small ic purified-ic">{MoveType.Purified}</span>}
                {props.value.isSpecial && <span className="type-icon-small ic special-ic">{MoveType.Special}</span>}
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
