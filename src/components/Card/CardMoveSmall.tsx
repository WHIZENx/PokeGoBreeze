import React, { Fragment, useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import { ICardSmallComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty } from '../../utils/extension';
import { MoveType } from '../../enums/type.enum';
import { ICombat } from '../../core/models/combat.model';
import IconType from '../Sprites/Icon/Type/Type';
import { getDataCombats } from '../../utils/helpers/data-context.helpers';

const CardMoveSmall = (props: ICardSmallComponent) => {
  const combats = getDataCombats();

  const [move, setMove] = useState<ICombat>();

  useEffect(() => {
    if (!props.isEmpty && isNotEmpty(combats) && props.value) {
      const move = combats.find((item) => isEqual(item.name, props.value?.name));
      setMove(move);
    }
  }, [combats, props.value, props.isEmpty]);

  return (
    <Fragment>
      {props.isEmpty ? (
        <div className="h-100" />
      ) : (
        <Fragment>
          {props.value && move && (
            <div
              className={combineClasses(
                'd-flex align-items-center w-100 h-100 p-1 overflow-x-hidden text-nowrap',
                props.isDisable ? 'disable-card-move' : ''
              )}
            >
              <IconType width={18} height={18} alt="Pokémon GO Type Logo" className="me-2" type={move.type} />
              <span className="me-1">{splitAndCapitalize(move.name, '_', ' ')}</span>
              <span className="d-flex">
                {props.value.moveType !== MoveType.None && (
                  <span
                    className={combineClasses(
                      'type-icon-small ic',
                      `${getKeyWithData(MoveType, props.value.moveType)?.toLowerCase()}-ic`
                    )}
                  >
                    {getKeyWithData(MoveType, props.value.moveType)}
                  </span>
                )}
              </span>
              {props.isShow && !props.isDisable && (
                <div className="select-down d-flex align-items-center">
                  {props.isSelect && <KeyboardArrowDownIcon fontSize="small" />}
                  {props.clearData && (
                    <CloseIcon
                      className="remove-pokemon-select"
                      sx={{ color: 'red' }}
                      onClick={() => props.clearData?.()}
                    />
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
