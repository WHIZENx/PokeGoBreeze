import React, { useCallback, useEffect, useState } from 'react';
import { ISelectCardMoveComponent } from '../models/component.model';
import { addSelectMovesByType } from '../../../utils/utils';
import SelectMui from './SelectMui';
import CardMoveSmall from '../../Card/CardMoveSmall';
import usePokemon from '../../../composables/usePokemon';
import { TypeMove } from '../../../enums/type.enum';
import { ISelectMoveModel, ISelectMovePokemonModel } from '../Input/models/select-move.model';
import { combineClasses, getValueOrDefault, isNotEmpty, toNumber } from '../../../utils/extension';
import { Box, InputAdornment, IconButton } from '@mui/material';
import { ICombat } from '../../../core/models/combat.model';
import CloseIcon from '@mui/icons-material/Close';

const SelectCardMove = <T extends ISelectMoveModel | ICombat>(props: ISelectCardMoveComponent<T>) => {
  const { retrieveMoves } = usePokemon();
  const [resultMove, setResultMove] = useState<(T | undefined)[]>([]);

  const changeMove = (value: T | undefined) => {
    if (props.setMovePokemon) {
      props.setMovePokemon(value);
    }
  };

  const findMove = useCallback(
    (selectPokemon: ISelectMovePokemonModel | undefined, type: TypeMove, selected = false) => {
      const result = retrieveMoves(selectPokemon?.id, selectPokemon?.form, selectPokemon?.pokemonType);
      if (result) {
        const simpleMove = addSelectMovesByType(result, type);
        if (props.setMovePokemon && (!selected || !props.move) && !props.move) {
          props.setMovePokemon(simpleMove.at(0) as T);
        }
        setResultMove(simpleMove as T[]);
      }
    },
    [props.setMovePokemon, props.move]
  );

  useEffect(() => {
    if (isNotEmpty(props.moves)) {
      setResultMove(props.moves || []);
    } else {
      if (toNumber(props.pokemon?.id) > 0) {
        findMove(props.pokemon, props.moveType || TypeMove.None, props.isSelected);
      } else if (resultMove.length > 0) {
        setResultMove([]);
      }
    }
  }, [props.pokemon, props.isSelected, resultMove.length, findMove, props.moves]);

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
    <Box className={combineClasses('input-control-group', props.isNoWrap ? 'flex-nowrap' : '')} style={props.style}>
      {props.labelPrepend && <div className="input-group-text">{props.labelPrepend}</div>}
      <SelectMui
        displayEmpty={!props.isHideEmpty}
        menuItems={resultMove
          .filter((move) => move?.name !== props.move?.name)
          .map((value) => ({
            value,
            label: <CardMoveSmall isDisable={props.isDisable} value={value} />,
          }))}
        renderValue={(value) => {
          if (props.pokemon && !isNotEmpty(resultMove)) {
            return getValueOrDefault(String, props.emptyText, 'Moves unavailable');
          }
          return <CardMoveSmall isDisable={props.isDisable} value={value} />;
        }}
        // sx={{ width: `calc(100% - ${props.clearData && props.move ? 40 : 0}px)` }}
        endAdornment={props.clearData && props.move && iconRemove()}
        value={props.move}
        onChangeSelect={(value) => changeMove(value)}
        disabled={props.isDisable || (props.pokemon && !isNotEmpty(resultMove))}
        isNoneBorder
        fullWidth
      />
    </Box>
  );
};

export default SelectCardMove;
