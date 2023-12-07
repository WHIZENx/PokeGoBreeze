import React, { Fragment, useCallback, useEffect, useState } from 'react';
import CardMoveSmall from '../Card/CardMoveSmall';

import './Select.scss';
import CardMove from '../Card/CardMove';
import { useSelector } from 'react-redux';
import { TypeMove } from '../../enums/move.enum';
import { StoreState } from '../../store/models/state.model';
import { SelectMoveModel } from './models/select-move.model';

const SelectMove = ({ move, setMovePokemon, clearData, pokemon, moveType, inputType, selected, disable }: any) => {
  const combat = useSelector((state: StoreState) => state.store.data?.pokemonCombat ?? []);
  const [resultMove, setResultMove]: [SelectMoveModel[], any] = useState([]);
  const [showMove, setShowMove] = useState(false);

  const changeMove = (value: SelectMoveModel) => {
    setShowMove(false);
    if (setMovePokemon) {
      setMovePokemon(value);
    }
    if (clearData) {
      clearData();
    }
  };

  const findMove = useCallback(
    (id: number, form: string, type: string, selected = false) => {
      if (combat.length > 0) {
        const resultFirst = combat.filter((item) => item.id === id);

        form = form ? form.toLowerCase().replaceAll('-', '_').replaceAll('_standard', '').toUpperCase() : '';
        const result = resultFirst.find((item) => item.name.replace(item.baseSpecies + (form === '' ? '' : '_'), '') === form);
        const simpleMove: SelectMoveModel[] = [];
        if (resultFirst.length === 1 || result == null) {
          if (resultFirst.length === 0) {
            return setResultMove([]);
          }
          if (type === TypeMove.FAST) {
            resultFirst.at(0)?.quickMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.eliteQuickMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
            });
          } else {
            resultFirst.at(0)?.cinematicMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.eliteCinematicMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
            });
            resultFirst.at(0)?.shadowMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
            });
            resultFirst.at(0)?.purifiedMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
            });
            resultFirst.at(0)?.specialMoves.forEach((value) => {
              simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
            });
          }
          if (setMovePokemon && (!selected || !move) && !move) {
            setMovePokemon(simpleMove.at(0));
          }
          return setResultMove(simpleMove);
        }
        if (type === TypeMove.FAST) {
          result.quickMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
          });
          result.eliteQuickMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
          });
        } else {
          result.cinematicMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: false });
          });
          result.eliteCinematicMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: true, shadow: false, purified: false, special: false });
          });
          result.shadowMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: true, purified: false, special: false });
          });
          result.purifiedMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: true, special: false });
          });
          result.specialMoves.forEach((value) => {
            simpleMove.push({ name: value, elite: false, shadow: false, purified: false, special: true });
          });
        }
        if (setMovePokemon && (!selected || !move) && !move) {
          setMovePokemon(simpleMove.at(0));
        }
        return setResultMove(simpleMove);
      }
    },
    [setMovePokemon, combat, move]
  );

  useEffect(() => {
    if (pokemon?.num && moveType) {
      findMove(pokemon.num, pokemon?.forme ?? '', moveType, selected);
    }
  }, [pokemon?.num, pokemon?.forme, moveType, selected]);

  const smallInput = () => {
    return (
      <div
        className={
          'position-relative d-flex align-items-center form-control ' +
          (!disable && pokemon ? 'card-select-enabled' : 'card-select-disabled')
        }
        style={{ padding: 0, borderRadius: 0 }}
      >
        {resultMove?.length === 0 && <span style={{ paddingLeft: 10, paddingRight: 10, color: 'gray' }}>Moves unavailable</span>}
        {resultMove?.length > 0 && (
          <div className="card-move-input" tabIndex={0} onClick={() => setShowMove(true)} onBlur={() => setShowMove(false)}>
            <CardMoveSmall
              value={move === '' ? null : move}
              show={pokemon ? true : false}
              disable={disable}
              select={resultMove?.length > 1}
            />
            {showMove && resultMove && (
              <div className="result-move-select">
                <div>
                  {resultMove
                    .filter((value) => value?.name !== move?.name)
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
        <CardMove value={move} />
        {showMove && (
          <div className="result-move-select-default">
            <div>
              {resultMove
                .filter((value) => value.name !== move.name)
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
      {inputType === 'small' && <Fragment>{smallInput()}</Fragment>}
      {!inputType && <Fragment>{defaultInput()}</Fragment>}
    </Fragment>
  );
};

export default SelectMove;
