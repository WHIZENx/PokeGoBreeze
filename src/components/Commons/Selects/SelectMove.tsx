import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../../Card/CardMoveSmall';

import './Select.scss';
import Card from '../../Card/Card';
import { CardType, TypeMove } from '../../../enums/type.enum';
import { addSelectMovesByType } from '../../../utils/utils';
import { ISelectMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty, isUndefined, toNumber } from '../../../utils/extension';
import usePokemon from '../../../composables/usePokemon';
import { InputType } from '../Inputs/enums/input-type.enum';
import { ISelectMoveModel, ISelectMovePokemonModel } from '../Inputs/models/select-move.model';
import { SelectPosition } from './enums/select-type.enum';

const SelectMove = (props: ISelectMoveComponent) => {
  const { retrieveMoves } = usePokemon();
  const [resultMove, setResultMove] = useState<ISelectMoveModel[]>([]);
  const [showMove, setShowMove] = useState(false);

  const changeMove = (value: ISelectMoveModel) => {
    setShowMove(false);
    if (props.setMovePokemon) {
      props.setMovePokemon(value);
    }
    if (props.clearData) {
      props.clearData();
    }
  };

  const findMove = useCallback(
    (selectPokemon: ISelectMovePokemonModel | undefined, type: TypeMove, selected = false) => {
      const result = retrieveMoves(selectPokemon?.id, selectPokemon?.form, selectPokemon?.pokemonType);
      if (result) {
        const simpleMove = addSelectMovesByType(result, type);
        if (props.setMovePokemon && (!selected || !props.move) && !props.move) {
          props.setMovePokemon(simpleMove.at(0));
        }
        setResultMove(simpleMove);
      }
    },
    [props.setMovePokemon, props.move]
  );

  useEffect(() => {
    if (toNumber(props.pokemon?.id) > 0) {
      findMove(props.pokemon, props.moveType, props.isSelected);
    } else if (resultMove.length > 0) {
      setResultMove([]);
    }
  }, [props.pokemon, props.isSelected, resultMove.length, findMove]);

  const smallCardInput = () => (
    <CardMoveSmall
      name={props.move?.name}
      isShow={Boolean(props.pokemon)}
      isDisable={props.isDisable}
      isSelect={resultMove.length > 1}
    />
  );

  const smallCardList = (position = SelectPosition.Down) => (
    <>
      {showMove && (
        <div
          className={combineClasses('result-move-select', position === SelectPosition.Up ? 'pos-up' : '')}
          style={{ maxHeight: props.maxHeight ?? 180 }}
        >
          <div>
            {resultMove
              .filter((value) => !isEqual(value.name, props.move?.name))
              .map((value, index) => (
                <div className="card-move" key={index} onMouseDown={() => changeMove(value)}>
                  <CardMoveSmall name={value.name} />
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );

  const smallInput = () => (
    <div
      className={combineClasses(
        'tw-relative tw-flex tw-items-center !tw-p-0 tw-rounded-none',
        !props.isDisable && toNumber(props.pokemon.id) > 0 ? 'card-select-enabled' : 'card-select-disabled'
      )}
    >
      {props.pokemon && !isNotEmpty(resultMove) && (
        <div className="tw-truncate">
          <span className="tw-px-2">Moves unavailable</span>
        </div>
      )}
      {isNotEmpty(resultMove) && (
        <div
          className="card-move-input"
          tabIndex={0}
          onClick={() => setShowMove(true)}
          onBlur={() => setShowMove(false)}
        >
          {isUndefined(props.position) || props.position === SelectPosition.Down ? (
            <>
              {smallCardInput()}
              {smallCardList(props.position)}
            </>
          ) : (
            <>
              {smallCardList(props.position)}
              {smallCardInput()}
            </>
          )}
        </div>
      )}
    </div>
  );

  const defaultCardInput = () => (
    <Card value={props.move?.name} moveType={props.move?.moveType} cardType={CardType.Move} />
  );

  const defaultCardList = (position = SelectPosition.Down) => (
    <>
      {showMove && (
        <div
          className={combineClasses(
            'result-move-select-default',
            position === SelectPosition.Up ? 'pos-up-default' : ''
          )}
        >
          <div>
            {resultMove
              .filter((value) => !isEqual(value.name, props.move?.name))
              .map((value, index) => (
                <div className="tw-container card-pokemon" key={index} onMouseDown={() => changeMove(value)}>
                  <Card value={value.name} moveType={value.moveType} cardType={CardType.Move} />
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );

  const defaultInput = () => (
    <div
      className="tw-relative card-input tw-mb-3"
      tabIndex={0}
      onClick={() => setShowMove(true)}
      onBlur={() => setShowMove(false)}
    >
      {isUndefined(props.position) || props.position === SelectPosition.Down ? (
        <>
          {defaultCardInput()}
          {defaultCardList(props.position)}
        </>
      ) : (
        <>
          {defaultCardList(props.position)}
          {defaultCardInput()}
        </>
      )}
    </div>
  );

  return (
    <Fragment>
      {props.inputType === InputType.Small && <Fragment>{smallInput()}</Fragment>}
      {(!props.inputType || props.inputType !== InputType.Small) && <Fragment>{defaultInput()}</Fragment>}
    </Fragment>
  );
};

export default SelectMove;
