import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardType from '../Card/CardType';
import { retrieveMoves, splitAndCapitalize } from '../../util/Utils';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/move.enum';
import { StoreState } from '../../store/models/state.model';
import { ISelectMoveModel } from '../Input/models/select-move.model';
import { ICombat } from '../../core/models/combat.model';

const Move = (props: {
  type?: string;
  id: number;
  form: string;
  move: ICombat | undefined;
  // eslint-disable-next-line no-unused-vars
  setMove: (move: ICombat | undefined) => void | React.Dispatch<React.SetStateAction<ICombat | undefined>>;
  text: string;
  selectDefault: boolean;
  // eslint-disable-next-line no-unused-vars
  clearData?: (option?: boolean) => void;
}) => {
  const data = useSelector((state: StoreState) => state.store.data);

  const [countFM, setCountFM] = useState(0);
  const [resultMove, setResultMove]: [ISelectMoveModel[], React.Dispatch<React.SetStateAction<ISelectMoveModel[]>>] = useState(
    [] as ISelectMoveModel[]
  );
  const [currentMove, setCurrentMove]: [ISelectMoveModel | undefined, React.Dispatch<React.SetStateAction<ISelectMoveModel | undefined>>] =
    useState();
  const [showMove, setShowMove] = useState(false);

  const findMoveData = useCallback(
    (move: string) => {
      return data?.combat?.find((item) => item.name === move);
    },
    [data?.combat]
  );

  const findMove = useCallback(
    (id: number, form: string) => {
      const result = retrieveMoves(data?.pokemon ?? [], id, form);
      const simpleMove: ISelectMoveModel[] = [];
      if (result) {
        if (props.type !== TypeMove.CHARGE) {
          result?.quickMoves?.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
          });
          result?.eliteQuickMove?.forEach((value) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
          });
          setCountFM(simpleMove.length);
        }
        if (props.type === TypeMove.FAST) {
          return setResultMove(simpleMove);
        }
        result?.cinematicMoves?.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
        });
        result?.eliteCinematicMove?.forEach((value) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
        });
        result?.shadowMoves?.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
        });
        result?.purifiedMoves?.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
        });
        result?.specialMoves?.forEach((value) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
        });
      }
      setResultMove(simpleMove);
    },
    [props.type, data?.pokemon]
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
                value={findType(currentMove.name) ?? ''}
                name={splitAndCapitalize(currentMove?.name.replaceAll('_PLUS', '+'), '_', ' ')}
                elite={currentMove.elite}
                shadow={currentMove.shadow}
                purified={currentMove.purified}
                special={currentMove.special}
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
                      .filter((value) => props.selectDefault || (!props.selectDefault && value?.name !== currentMove?.name))
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
                          <li className="container card-pokemon" onMouseDown={() => changeMove(value)}>
                            <CardType
                              value={findType(value.name) ?? ''}
                              name={splitAndCapitalize(value.name.replaceAll('_PLUS', '+'), '_', ' ')}
                              elite={value.elite}
                              shadow={value.shadow}
                              purified={value.purified}
                              special={value.special}
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
