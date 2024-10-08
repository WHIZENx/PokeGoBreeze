import React, { Fragment } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import APIService from '../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../util/utils';
import { useSelector } from 'react-redux';
import { StoreState } from '../../store/models/state.model';
import { FORM_PURIFIED, FORM_SHADOW } from '../../util/constants';
import { ICardSmallComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault, isEqual } from '../../util/extension';

const CardMoveSmall = (props: ICardSmallComponent) => {
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.combat));

  return (
    <Fragment>
      {props.empty ? (
        <div className="h-100" />
      ) : (
        <Fragment>
          {props.value && (
            <div
              className={combineClasses('d-flex align-items-center w-100 h-100', props.disable ? 'disable-card-move' : '')}
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
                {props.value.elite && <span className="type-icon-small ic elite-ic">Elite</span>}
                {props.value.shadow && <span className="type-icon-small ic shadow-ic">{capitalize(FORM_SHADOW)}</span>}
                {props.value.purified && <span className="type-icon-small ic purified-ic">{capitalize(FORM_PURIFIED)}</span>}
                {props.value.special && <span className="type-icon-small ic special-ic">Special</span>}
              </span>
              {props.show && !props.disable && (
                <div className="select-down d-flex align-items-center">
                  {props.select && <KeyboardArrowDownIcon fontSize="small" />}
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
