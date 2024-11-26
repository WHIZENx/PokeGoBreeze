import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../Card/CardMoveSmall';

import './Select.scss';
import CardMove from '../Card/CardMove';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { ISelectMoveModel } from './models/select-move.model';
import { addSelectMovesByType, retrieveMoves } from '../../util/utils';
import { ISelectMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isNotEmpty } from '../../util/extension';
import { InputType } from './enums/input-type.enum';

const SelectMove = (props: ISelectMoveComponent) => {
  const pokemon = useSelector((state: StoreState) => state.store.data.pokemon);
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
    (id: number, form: string | null | undefined, type: TypeMove, selected = false) => {
      const result = retrieveMoves(pokemon, id, form);
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
      if (props.pokemon?.num) {
        findMove(props.pokemon.num, props.pokemon.forme, props.moveType, props.isSelected);
      } else if (resultMove.length > 0) {
        setResultMove([]);
      }
    }
  }, [props.pokemon?.num, props.pokemon?.forme, props.isSelected, resultMove.length, pokemon, findMove]);

  const smallInput = () => {
    return (
      <div
        className={combineClasses(
          'position-relative d-flex align-items-center form-control',
          !props.isDisable && props.pokemon ? 'card-select-enabled' : 'card-select-disabled'
        )}
        style={{ padding: 0, borderRadius: 0 }}
      >
        {props.pokemon && !isNotEmpty(resultMove) && (
          <span style={{ paddingLeft: 10, paddingRight: 10, color: 'gray' }}>Moves unavailable</span>
        )}
        {isNotEmpty(resultMove) && (
          <div className="card-move-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
            <CardMoveSmall
              value={props.move}
              isShow={Boolean(props.pokemon)}
              isDisable={props.isDisable}
              isSelect={resultMove.length > 1}
            />
            {showMove && (
              <div className="result-move-select">
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
          </div>
        )}
      </div>
    );
  };

  const defaultInput = () => {
    return (
      <div
        className="card-input"
        style={{ marginBottom: 15 }}
        tabIndex={0}
        onClick={() => setShowMove(true)}
        onBlur={() => setShowMove(false)}
      >
        <CardMove value={props.move} />
        {showMove && (
          <div className="result-move-select-default">
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
      </div>
    );
  };

  return (
    <Fragment>
      {props.inputType === InputType.Small && <Fragment>{smallInput()}</Fragment>}
      {!props.inputType && <Fragment>{defaultInput()}</Fragment>}
    </Fragment>
  );
};

export default SelectMove;
