import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../Card/CardMoveSmall';

import './Select.scss';
import CardMove from '../Card/CardMove';
import { RootStateOrAny, useSelector } from 'react-redux';

const SelectMove = ({ move, setMovePokemon, clearData, pokemon, moveType, inputType, result, selected, disable }: any) => {
  const data = useSelector((state: RootStateOrAny) => state.store.data.pokemonCombat);
  const [resultMove, setResultMove]: any = useState(null);
  const [showMove, setShowMove] = useState(false);

  const changeMove = (value: any) => {
    setShowMove(false);
    if (setMovePokemon) {
      setMovePokemon(value);
    }
    if (clearData) {
      clearData();
    }
  };

  const findMove = useCallback(
    (id: any, form: string, type: string, selected = false) => {
      const resultFirst = data.filter((item: { id: any }) => item.id === id);
      form = form ? form.toLowerCase().replaceAll('-', '_').replaceAll('_standard', '').toUpperCase() : '';
      const result = resultFirst.find(
        (item: { name: string; baseSpecies: string }) => item.name.replace(item.baseSpecies + '_', '') === form
      );
      const simpleMove: any[] = [];
      if (resultFirst.length === 1 || result == null) {
        if (resultFirst.length === 0) {
          return setResultMove([]);
        }
        if (type === 'FAST') {
          resultFirst[0].quickMoves.forEach((value: any) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
          });
          resultFirst[0].eliteQuickMoves.forEach((value: any) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
          });
        } else {
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
        }
        if (setMovePokemon && !selected && !move) {
          setMovePokemon(simpleMove[0]);
        }
        return setResultMove(simpleMove);
      }
      if (type === 'FAST') {
        result.quickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: false, shadow: false, purified: false });
        });
        result.eliteQuickMoves.forEach((value: any) => {
          simpleMove.push({ name: value, elite: true, shadow: false, purified: false });
        });
      } else {
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
      }
      if (setMovePokemon && !selected && !move) {
        setMovePokemon(simpleMove[0]);
      }
      return setResultMove(simpleMove);
    },
    [setMovePokemon, data]
  );

  useEffect(() => {
    if (pokemon && move) {
      findMove(pokemon.num, pokemon.forme, moveType);
    }
  }, []);

  useEffect(() => {
    if (result !== '' && move !== '') {
      if (result) {
        setResultMove(result);
      } else {
        if (pokemon && !move) {
          findMove(pokemon.num, pokemon.forme, moveType);
        }
        if (!pokemon) {
          setResultMove(null);
        } else if (selected) {
          findMove(pokemon.num, pokemon.forme, moveType, selected);
        }
      }
    }
  }, [findMove, pokemon, moveType, move, result, selected, setMovePokemon]);

  const smallInput = () => {
    return (
      <div
        className={
          'position-relative d-flex align-items-center form-control ' +
          (!disable && pokemon ? 'card-select-enabled' : 'card-select-disabled')
        }
        style={{ padding: 0, borderRadius: 0 }}
      >
        {resultMove && resultMove.length === 0 && (
          <span style={{ paddingLeft: 10, paddingRight: 10, color: 'gray' }}>Moves Unavailable</span>
        )}
        {resultMove && resultMove.length > 0 && (
          <div className="card-move-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
            <CardMoveSmall
              value={move === '' ? null : move}
              show={pokemon ? true : false}
              disable={disable}
              select={resultMove && resultMove.length > 1}
            />
            {showMove && resultMove && (
              <div className="result-move-select">
                <div>
                  {resultMove
                    .filter((value: { name: any }) => value.name !== move.name)
                    .map((value: { name: string; elite: any; shadow: any; purified: any }, index: React.Key) => (
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
        <CardMove value={move} />
        {showMove && (
          <div className="result-move-select-default">
            <div>
              {resultMove
                .filter((value: { name: any }) => value.name !== move.name)
                .map((value: { name: string; elite: any; shadow: any; purified: any }, index: React.Key) => (
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
      {inputType === 'small' && <Fragment>{smallInput()}</Fragment>}
      {!inputType && <Fragment>{defaultInput()}</Fragment>}
    </Fragment>
  );
};

export default SelectMove;
