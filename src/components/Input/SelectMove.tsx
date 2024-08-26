import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../Card/CardMoveSmall';

import './Select.scss';
import CardMove from '../Card/CardMove';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { ISelectMoveModel, SelectMoveModel } from './models/select-move.model';
import { isNotEmpty, retrieveMoves } from '../../util/Utils';
import { ISelectMoveComponent } from '../models/component.model';

const SelectMove = (props: ISelectMoveComponent) => {
  const combat = useSelector((state: StoreState) => state.store.data?.pokemon ?? []);
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
    (id: number, form: string, type: string, selected = false) => {
      const result = retrieveMoves(combat, id, form);
      if (result) {
        const simpleMove: ISelectMoveModel[] = [];
        if (type === TypeMove.FAST) {
          result.quickMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, false, false));
          });
          result.eliteQuickMove?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, true, false, false, false));
          });
        } else {
          result.cinematicMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, false, false));
          });
          result.eliteCinematicMove?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, true, false, false, false));
          });
          result.shadowMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, true, false, false));
          });
          result.purifiedMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, true, false));
          });
          result.specialMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, false, true));
          });
        }
        if (props.setMovePokemon && (!selected || !props.move) && !props.move) {
          props.setMovePokemon(simpleMove.at(0));
        }
        setResultMove(simpleMove);
      }
    },
    [props.setMovePokemon, props.move]
  );

  useEffect(() => {
    if (isNotEmpty(combat)) {
      if (props.pokemon?.num) {
        findMove(props.pokemon.num, props.pokemon?.forme ?? '', props.moveType, props.selected);
      } else if (resultMove.length > 0) {
        setResultMove([]);
      }
    }
  }, [props.pokemon?.num, props.pokemon?.forme, props.selected, resultMove.length, combat, findMove]);

  const smallInput = () => {
    return (
      <div
        className={
          'position-relative d-flex align-items-center form-control ' +
          (!props.disable && props.pokemon ? 'card-select-enabled' : 'card-select-disabled')
        }
        style={{ padding: 0, borderRadius: 0 }}
      >
        {props.pokemon && !isNotEmpty(resultMove) && (
          <span style={{ paddingLeft: 10, paddingRight: 10, color: 'gray' }}>Moves unavailable</span>
        )}
        {isNotEmpty(resultMove) && (
          <div className="card-move-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
            <CardMoveSmall value={props.move} show={props.pokemon ? true : false} disable={props.disable} select={resultMove?.length > 1} />
            {showMove && resultMove && (
              <div className="result-move-select">
                <div>
                  {resultMove
                    .filter((value) => value?.name !== props.move?.name)
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
                .filter((value) => value.name !== props.move?.name)
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
      {props.inputType === 'small' && <Fragment>{smallInput()}</Fragment>}
      {!props.inputType && <Fragment>{defaultInput()}</Fragment>}
    </Fragment>
  );
};

export default SelectMove;
