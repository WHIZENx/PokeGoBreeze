import React, { useEffect, useMemo } from 'react';
import { ISelectCardMoveComponent } from '../models/component.model';
import { addSelectMovesByType } from '../../../utils/utils';
import SelectMui from './SelectMui';
import CardMoveSmall from '../../Card/CardMoveSmall';
import usePokemon from '../../../composables/usePokemon';
import { TypeMove } from '../../../enums/type.enum';
import { ISelectMoveModel } from '../Inputs/models/select-move.model';
import { combineClasses, getValueOrDefault, isNotEmpty, toNumber } from '../../../utils/extension';
import { Box, InputAdornment, IconButton } from '@mui/material';
import { ICombat } from '../../../core/models/combat.model';
import CloseIcon from '@mui/icons-material/Close';

const SelectCardMove = <T extends ISelectMoveModel | ICombat>(props: ISelectCardMoveComponent<T>) => {
  const { retrieveMoves } = usePokemon();
  const resultMove = useMemo(() => {
    if (isNotEmpty(props.moves)) {
      return props.moves || [];
    }
    if (toNumber(props.pokemon?.id) <= 0) {
      return [];
    }
    const result = retrieveMoves(props.pokemon?.id, props.pokemon?.form, props.pokemon?.pokemonType);
    return result ? (addSelectMovesByType(result, props.moveType || TypeMove.None) as T[]) : [];
  }, [props.moveType, props.moves, props.pokemon?.form, props.pokemon?.id, props.pokemon?.pokemonType, retrieveMoves]);

  const changeMove = (name: string) => {
    if (props.setMovePokemon) {
      const move = resultMove.find((move) => move?.name === name);
      props.setMovePokemon(move);
    }
  };

  useEffect(() => {
    if (!isNotEmpty(props.moves) && !props.move && props.setMovePokemon && isNotEmpty(resultMove)) {
      props.setMovePokemon(resultMove[0]);
    }
  }, [props.move, props.moves, props.setMovePokemon, resultMove]);

  const handleClear = () => {
    if (props.setMovePokemon) {
      props.setMovePokemon(undefined);
    }
    if (props.clearData) {
      props.clearData();
    }
  };

  const iconRemove = () => (
    <InputAdornment position="start">
      <IconButton disabled={props.isDisable} aria-label="clear" onClick={handleClear} edge="start">
        <CloseIcon color={props.isDisable ? 'disabled' : 'error'} />
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box
      className={combineClasses('input-control-group', props.isNoWrap ? '!tw-flex-nowrap' : '', props.className)}
      style={props.style}
    >
      {props.labelPrepend && <div className="input-group-text">{props.labelPrepend}</div>}
      <SelectMui
        displayEmpty={!props.isHideEmpty}
        menuItems={resultMove.map((value) => ({
          value: value?.name,
          label: (
            <CardMoveSmall
              isDisable={props.isDisable}
              name={value?.name}
              moveType={value?.moveType}
              pokemonId={props.pokemon?.id}
              pokemonForm={props.pokemon?.form}
            />
          ),
        }))}
        renderValue={(name) => {
          if (props.pokemon && !isNotEmpty(resultMove)) {
            return getValueOrDefault(String, props.emptyText, 'Moves unavailable');
          }
          const selectedMove = resultMove.find((move) => move?.name === name);
          return (
            <CardMoveSmall
              isDisable={props.isDisable}
              name={name}
              moveType={selectedMove?.moveType}
              pokemonId={props.pokemon?.id}
              pokemonForm={props.pokemon?.form}
            />
          );
        }}
        endAdornment={props.clearData && props.move && iconRemove()}
        value={props.move?.name && resultMove.some((move) => move?.name === props.move?.name) ? props.move?.name : ''}
        onChangeSelect={(value) => changeMove(value)}
        disabled={props.isDisable || (props.pokemon && !isNotEmpty(resultMove))}
        SelectDisplayProps={
          props.clearData &&
          props.move && {
            style: {
              paddingRight: 12,
            },
          }
        }
        isNoneBorder
        fullWidth
      />
    </Box>
  );
};

export default SelectCardMove;
