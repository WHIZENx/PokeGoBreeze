import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardType from '../Card/CardType';
import { addSelectMovesByType, retrieveMoves, splitAndCapitalize } from '../../utils/utils';
import { TypeMove } from '../../enums/type.enum';
import { ISelectMoveModel } from '../Input/models/select-move.model';
import { IMoveComponent } from '../models/component.model';
import { combineClasses, isEqual, isIncludeList, isNotEmpty } from '../../utils/extension';
import { getDataCombats, getDataPokemons } from '../../utils/helpers/data-context.helpers';

const Move = (props: IMoveComponent) => {
  const combats = getDataCombats();
  const pokemons = getDataPokemons();

  const [countFM, setCountFM] = useState(0);
  const [resultMove, setResultMove] = useState<ISelectMoveModel[]>([]);
  const [currentMove, setCurrentMove] = useState<ISelectMoveModel>();
  const [showMove, setShowMove] = useState(false);

  const findMoveData = useCallback(
    (move: string | undefined) => {
      return combats.find((item) => isEqual(item.name, move));
    },
    [combats]
  );

  const findMove = useCallback(
    (value: IMoveComponent) => {
      const result = retrieveMoves(value.id, value.form, value.pokemonType);
      if (result) {
        let simpleMove: ISelectMoveModel[] = [];
        if (!props.type || props.type === TypeMove.Fast) {
          simpleMove = addSelectMovesByType(result, TypeMove.Fast, simpleMove);
          setCountFM(simpleMove.length);
        }
        if (!props.type || props.type === TypeMove.Charge) {
          simpleMove = addSelectMovesByType(result, TypeMove.Charge, simpleMove);
        }
        if (
          currentMove &&
          isNotEmpty(simpleMove) &&
          !isIncludeList(
            simpleMove.map((m) => m.name),
            currentMove.name
          )
        ) {
          setCurrentMove(undefined);
          props.setMove(undefined);
        }
        return setResultMove(simpleMove);
      }
    },
    [props.type, pokemons, currentMove]
  );

  useEffect(() => {
    findMove(props);
    if (!props.move) {
      setCurrentMove(undefined);
      props.setMove(undefined);
    }
  }, [props, findMove]);

  const findType = (move: string | undefined) => {
    if (!move) {
      return;
    }
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
            <CardType
              value={findType(currentMove?.name)}
              name={splitAndCapitalize(currentMove?.name, '_', ' ')}
              moveType={currentMove?.moveType}
            />
          </div>
          {showMove && (
            <div className="result-type result-move">
              <ul>
                {resultMove && (
                  <Fragment>
                    {resultMove
                      .filter((value) => props.isSelectDefault || !isEqual(value.name, currentMove?.name))
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
                              value={findType(value.name)}
                              name={splitAndCapitalize(value.name, '_', ' ')}
                              moveType={value.moveType}
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
