import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../Card/CardMoveSmall';

import './Select.scss';
import CardMove from '../Card/CardMove';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { ISelectMoveModel, ISelectMovePokemonModel } from './models/select-move.model';
import { addSelectMovesByType, retrieveMoves } from '../../util/utils';
import { ISelectMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty, isUndefined, toNumber } from '../../util/extension';
import { InputType, SelectPosition } from './enums/input-type.enum';

const SelectMove = (props: ISelectMoveComponent) => {
  const pokemon = useSelector((state: StoreState) => state.store.data.pokemons);
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
      const result = retrieveMoves(pokemon, selectPokemon?.id, selectPokemon?.form, selectPokemon?.pokemonType);
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
    if (isNotEmpty(pokemon)) {
      if (toNumber(props.pokemon?.id) > 0) {
        findMove(props.pokemon, props.moveType, props.isSelected);
      } else if (resultMove.length > 0) {
        setResultMove([]);
      }
    }
  }, [props.pokemon, props.isSelected, resultMove.length, pokemon, findMove]);

  const smallCardInput = () => (
    <CardMoveSmall value={props.move} isShow={Boolean(props.pokemon)} isDisable={props.isDisable} isSelect={resultMove.length > 1} />
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
                  <CardMoveSmall value={value} />
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
        'position-relative d-flex align-items-center form-control',
        !props.isDisable && toNumber(props.pokemon.id) > 0 ? 'card-select-enabled' : 'card-select-disabled'
      )}
      style={{ padding: 0, borderRadius: 0 }}
    >
      {props.pokemon && !isNotEmpty(resultMove) && (
        <div style={{ overflowX: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <span style={{ paddingLeft: 10, paddingRight: 10, color: 'gray' }}>Moves unavailable</span>
        </div>
      )}
      {isNotEmpty(resultMove) && (
        <div className="card-move-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
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

  const defaultCardInput = () => <CardMove value={props.move} />;

  const defaultCardList = (position = SelectPosition.Down) => (
    <>
      {showMove && (
        <div className={combineClasses('result-move-select-default', position === SelectPosition.Up ? 'pos-up-default' : '')}>
          <div>
            {resultMove
              .filter((value) => !isEqual(value.name, props.move?.name))
              .map((value, index) => (
                <div className="container card-pokemon" key={index} onMouseDown={() => changeMove(value)}>
                  <CardMove value={value} />
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );

  const defaultInput = () => (
    <div
      className="position-relative card-input"
      style={{ marginBottom: 15 }}
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
