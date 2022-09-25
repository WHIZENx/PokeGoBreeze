import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardType from '../Card/CardType';
import { splitAndCapitalize } from '../../util/Utils';
import { RootStateOrAny, useSelector } from 'react-redux';

const Move = (props: any) => {
  const data = useSelector((state: RootStateOrAny) => state.store.data);

  const [countFM, setCountFM] = useState(0);
  const [resultMove, setResultMove]: any = useState(null);
  const [currentMove, setCurrentMove]: any = useState(null);
  const [showMove, setShowMove] = useState(false);

  const findMoveData = useCallback(
    (move: string) => {
      return data.combat.find((item: { name: any }) => item.name === move.replaceAll('_FAST', ''));
    },
    [data.combat]
  );

  const findMove = useCallback(
    (id: any, form: string) => {
      const resultFirst = data.pokemonCombat.filter((item: { id: any }) => item.id === id);
      form = form.replaceAll('-', '_').replaceAll('_standard', '').toUpperCase();
      const result = resultFirst.find((item: { name: any }) => item.name === form);
      const simpleMove: { name: any; elite: boolean; shadow: boolean; purified: boolean }[] = [];
      if (resultFirst.length === 1 || result == null) {
        if (resultFirst.length === 0) return setResultMove('');
        if (props.type !== 'CHARGE') {
          resultFirst[0].quickMoves.forEach((value: any) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
          });
          resultFirst[0].eliteQuickMoves.forEach((value: any) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
          });
          setCountFM(simpleMove.length);
        }
        if (props.type === 'FAST') return setResultMove(simpleMove);
        resultFirst[0].cinematicMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        resultFirst[0].eliteCinematicMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
        resultFirst[0].shadowMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
        });
        resultFirst[0].purifiedMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
        });
        return setResultMove(simpleMove);
      }
      if (props.type !== 'CHARGE') {
        result.quickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        result.eliteQuickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
        setCountFM(simpleMove.length);
      }
      if (props.type === 'FAST') return setResultMove(simpleMove);
      result.cinematicMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
      });
      result.eliteCinematicMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
      });
      result.shadowMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: true, purified: false });
      });
      result.purifiedMoves.forEach((value: any) => {
        simpleMove.push({ name: value, elite: false, shadow: false, purified: true });
      });
      return setResultMove(simpleMove);
    },
    [props.type, data.pokemonCombat]
  );

  useEffect(() => {
    findMove(props.id, props.form);
    if (!props.move) setCurrentMove(null);
  }, [props.id, props.form, findMove, props.move]);

  const findType = (move: any) => {
    return findMoveData(move).type;
  };

  const changeMove = (value: any) => {
    setShowMove(false);
    setCurrentMove(value);
    props.setMove(findMoveData(value.name));
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
                value={findType(currentMove.name)}
                name={splitAndCapitalize(currentMove.name.replaceAll('_PLUS', '+').replaceAll('_FAST', ''), '_', ' ')}
                elite={currentMove.elite}
                shadow={currentMove.shadow}
                purified={currentMove.purified}
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
                      .filter((value: { name: any }) => props.selectDefault || (!props.selectDefault && value.name !== currentMove.name))
                      .map((value: { name: string; elite: any; shadow: any; purified: any }, index: React.Key | null | undefined) => (
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
                              value={findType(value.name)}
                              name={splitAndCapitalize(value.name.replaceAll('_PLUS', '+').replaceAll('_FAST', ''), '_', ' ')}
                              elite={value.elite}
                              shadow={value.shadow}
                              purified={value.purified}
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
