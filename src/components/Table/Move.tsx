import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardType from '../Card/CardType';
import { retrieveMoves, splitAndCapitalize } from '../../util/utils';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/type.enum';
import { StoreState } from '../../store/models/state.model';
import { ISelectMoveModel, SelectMoveModel } from '../Input/models/select-move.model';
import { IMoveComponent } from '../models/component.model';
import { combineClasses, getValueOrDefault, isEqual } from '../../util/extension';

const Move = (props: IMoveComponent) => {
  const data = useSelector((state: StoreState) => state.store.data);

  const [countFM, setCountFM] = useState(0);
  const [resultMove, setResultMove] = useState<ISelectMoveModel[]>([]);
  const [currentMove, setCurrentMove] = useState<ISelectMoveModel>();
  const [showMove, setShowMove] = useState(false);

  const findMoveData = useCallback(
    (move: string) => {
      return data.combat.find((item) => isEqual(item.name, move));
    },
    [data.combat]
  );

  const findMove = useCallback(
    (id: number, form: string) => {
      const result = retrieveMoves(data.pokemon, id, form);
      if (result) {
        const simpleMove: ISelectMoveModel[] = [];
        if (!props.type || isEqual(props.type, TypeMove.FAST)) {
          result.quickMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, false, false));
          });
          result.eliteQuickMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, true, false, false, false));
          });
          setCountFM(simpleMove.length);
        }
        if (!props.type || isEqual(props.type, TypeMove.CHARGE)) {
          result.cinematicMoves?.forEach((value) => {
            simpleMove.push(new SelectMoveModel(value, false, false, false, false));
          });
          result.eliteCinematicMoves?.forEach((value) => {
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
        return setResultMove(simpleMove);
      }
    },
    [props.type, data.pokemon]
  );

  useEffect(() => {
    findMove(props.id, props.form);
    if (!props.move) {
      setCurrentMove(undefined);
    }
  }, [props.id, props.form, findMove, props.move]);

  const findType = (move: string) => {
    return findMoveData(move)?.type;
  };

  const changeMove = (value: ISelectMoveModel) => {
    setShowMove(false);
    setCurrentMove(value);
    props.setMove(findMoveData(value.name));

    if (props.clearData) {
      props.clearData();
    }
  };

  return (
    <Fragment>
      <h6 className="text-center">
        <b>{props.text}</b>
      </h6>
      <div className="d-flex justify-content-center">
        <div className="card-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
          <div className="card-select">
            {currentMove ? (
              <CardType
                value={getValueOrDefault(String, findType(currentMove.name))}
                name={splitAndCapitalize(currentMove.name, '_', ' ')}
                isElite={currentMove.isElite}
                isShadow={currentMove.isShadow}
                isPurified={currentMove.isPurified}
                isSpecial={currentMove.isSpecial}
              />
            ) : (
              <CardType />
            )}
          </div>
          {showMove && (
            <div className="result-type result-move">
              <ul>
                {resultMove && (
                  <Fragment>
                    {resultMove
                      .filter((value) => props.isSelectDefault || (!props.isSelectDefault && !isEqual(value.name, currentMove?.name)))
                      .map((value, index) => (
                        <Fragment key={index}>
                          {!props.type && index === 0 && (
                            <li className="card-header">
                              <b>Fast Moves</b>
                            </li>
                          )}
                          {!props.type && index === countFM && (
                            <li className="card-header">
                              <b>Charged Moves</b>
                            </li>
                          )}
                          <li
                            className={combineClasses(
                              'container card-pokemon',
                              props.isHighlight && isEqual(currentMove?.name, value.name) ? 'bg-card-highlight' : ''
                            )}
                            onMouseDown={() => changeMove(value)}
                          >
                            <CardType
                              value={getValueOrDefault(String, findType(value.name))}
                              name={splitAndCapitalize(value.name, '_', ' ')}
                              isElite={value.isElite}
                              isShadow={value.isShadow}
                              isPurified={value.isPurified}
                              isSpecial={value.isSpecial}
                            />
                          </li>
                        </Fragment>
                      ))}
                  </Fragment>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default Move;
