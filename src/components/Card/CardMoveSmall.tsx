import React, { Fragment, useEffect, useState } from 'react';
import '../Commons/Selects/Select.scss';
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
      const move = findMoveByName(props.name || props.value?.name, props.pokemonId, undefined, props.pokemonForm);
      setMove(move);
    }
  }, [findMoveByName, props.value, props.isEmpty, props.name, props.pokemonId, props.pokemonForm]);

  const isHaveMoveType = () => {
    if (props.moveType !== undefined) {
      return props.moveType !== MoveType.None;
    } else if (move && move.moveType !== undefined) {
      return move.moveType !== MoveType.None;
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
                'tw-flex tw-items-center tw-w-full tw-min-w-0 tw-max-w-full tw-h-full tw-text-nowrap',
                props.isScrollable ? 'tw-overflow-x-auto' : 'tw-overflow-x-hidden',
                props.isDisable && 'disable-card-move'
              )}
            >
              <IconType
                width={18}
                height={18}
                alt="Pokémon GO Type Logo"
                className={combineClasses('tw-mr-2 tw-shrink-0', props.isDisable && 'filter-gray')}
                type={move.type}
              />
              <span className="tw-mr-1 tw-shrink-0">{splitAndCapitalize(move.name, '_', ' ')}</span>
              {!props.isHideType && isHaveMoveType() && (
                <span
                  className={combineClasses(
                    `${getKeyWithData(
                      MoveType,
                      props.isDisable ? MoveType.Disable : (props.moveType ?? move.moveType)
                    )?.toLowerCase()}-ic`,
                    props.isDisable && '!tw-text-lightgray',
                    'type-icon-small ic !tw-flex tw-items-center tw-h-3 tw-shrink-0'
                  )}
                >
                  {getKeyWithData(MoveType, props.moveType ?? move.moveType)}
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
