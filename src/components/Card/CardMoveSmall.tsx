import React, { Fragment, useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';

import { getKeyWithData, splitAndCapitalize } from '../../utils/utils';
import { ICardSmallComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';
import { MoveType } from '../../enums/type.enum';
import { ICombat } from '../../core/models/combat.model';
import IconType from '../Sprites/Icon/Type/Type';
import useCombats from '../../composables/useCombats';

const CardMoveSmall = (props: ICardSmallComponent) => {
  const { findMoveByName } = useCombats();

  const [move, setMove] = useState<ICombat>();

  useEffect(() => {
    if (!props.isEmpty && (props.value || props.name)) {
      const move = findMoveByName(props.name || props.value?.name, props.pokemonId);
      setMove(move);
    }
  }, [findMoveByName, props.value, props.isEmpty, props.name, props.pokemonId]);

  const isHaveMoveType = () => {
    if (move && move.moveType !== undefined) {
      return move.moveType !== MoveType.None;
    } else if (props.moveType !== undefined) {
      return props.moveType !== MoveType.None;
    }
    return false;
  };

  return (
    <Fragment>
      {props.isEmpty ? (
        <div className="tw-h-full" />
      ) : (
        <Fragment>
          {(props.value || props.name) && move && (
            <div
              className={combineClasses(
                'tw-flex tw-items-center tw-w-full tw-h-full tw-overflow-x-hidden tw-text-nowrap',
                props.isDisable && 'disable-card-move'
              )}
            >
              <IconType
                width={18}
                height={18}
                alt="Pokémon GO Type Logo"
                className={combineClasses('tw-mr-2', props.isDisable && 'filter-gray')}
                type={move.type}
              />
              <span className="tw-mr-1">{splitAndCapitalize(move.name, '_', ' ')}</span>
              {!props.isHideType && isHaveMoveType() && (
                <span
                  className={combineClasses(
                    `${getKeyWithData(
                      MoveType,
                      props.isDisable ? MoveType.Disable : move.moveType || props.moveType
                    )?.toLowerCase()}-ic`,
                    props.isDisable && '!tw-text-lightgray',
                    'type-icon-small ic !tw-flex tw-items-center tw-h-3'
                  )}
                >
                  {getKeyWithData(MoveType, move.moveType || props.moveType)}
                </span>
              )}
              {props.isShow && !props.isDisable && (
                <div className="select-down tw-flex tw-items-center">
                  {props.isSelect && <KeyboardArrowDownIcon fontSize="small" />}
                  {props.clearData && (
                    <CloseIcon className="remove-pokemon-select" color="error" onClick={() => props.clearData?.()} />
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
