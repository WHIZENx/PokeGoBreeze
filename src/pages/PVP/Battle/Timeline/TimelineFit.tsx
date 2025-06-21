import React, { Fragment } from 'react';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { getKeyWithData } from '../../../../utils/utils';
import CloseIcon from '@mui/icons-material/Close';
import { IPokemonBattle } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import { combineClasses, isNotEmpty } from '../../../../utils/extension';
import { TypeAction } from '../../../../enums/type.enum';
import { TimelineElement, TimelineEvent } from '../../../../utils/models/overrides/dom.model';

const TimelineFit = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  isHide = false
) => {
  const calculateFitPoint = (length: number, index: number) => `${(index * 100) / (length - 2)}%`;

  const renderTimelineFit = (poke: IPokemonBattle, pokeObj: IPokemonBattle) => (
    <Fragment>
      <div className="mt-2" style={{ height: 12 }}>
        <div className="position-relative timeline-fit-container">
          {poke.timeline.map((value, index) => (
            <Fragment key={index}>
              {value.isTap && (
                <div
                  className={combineClasses('charge-attack opacity-50', showTap ? 'd-block' : 'd-none')}
                  style={{
                    width: value.size,
                    left: calculateFitPoint(poke.timeline.length, index),
                    borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                  }}
                />
              )}
              {!value.isTap && (
                <Fragment>
                  {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                    <div
                      className="position-absolute icon-buff-timeline"
                      style={{ left: calculateFitPoint(poke.timeline.length, index), top: 10 }}
                    >
                      {value.buff?.map((b, i) => (
                        <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                          {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {(b.power > 0 ? '+' : '') + b.power}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <Fragment>
                      {pokeObj.timeline.at(index) &&
                      pokeObj.timeline.at(index)?.type === AttackType.Charge &&
                      isNotEmpty(value.buff) ? (
                        <div
                          className="position-absolute icon-buff-timeline"
                          style={{
                            left: calculateFitPoint(poke.timeline.length, index),
                            top: 10,
                          }}
                        >
                          {value.buff?.map((b, i) => (
                            <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                              {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={combineClasses('wait-attack', showTap ? 'd-block' : 'd-none')}
                          style={{
                            width: value.size,
                            left: calculateFitPoint(poke.timeline.length, index),
                          }}
                        />
                      )}
                    </Fragment>
                  )}
                </Fragment>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="position-relative timeline-fit-container" style={{ height: 30 }}>
        {poke.timeline.map((value, index) => (
          <Fragment key={index}>
            {value.type === AttackType.Block && (
              <div id={index.toString()} style={{ left: calculateFitPoint(poke.timeline.length, index) }}>
                <HexagonIcon sx={{ color: 'purple', fontSize: value.size }} />
              </div>
            )}
            {value.type === AttackType.Fast && (
              <div
                id={index.toString()}
                className={combineClasses('fast-attack', value.color, 'black-border')}
                style={{ left: calculateFitPoint(poke.timeline.length, index) }}
              />
            )}
            {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
              <div
                id={index.toString()}
                className={combineClasses('charge-attack', `${value.color}-border`)}
                style={{
                  width: value.size,
                  height: value.size,
                  left: calculateFitPoint(poke.timeline.length, index),
                }}
              />
            )}
            {value.type === AttackType.Charge && (
              <div
                id={index.toString()}
                className={combineClasses('charge-attack', value.color, `${value.color}-border`)}
                style={{
                  width: value.size,
                  height: value.size,
                  left: calculateFitPoint(poke.timeline.length, index),
                }}
              />
            )}
            {(value.type === AttackType.Wait || value.type === AttackType.New) && (
              <div
                id={index.toString()}
                className="wait-attack"
                style={{ left: calculateFitPoint(poke.timeline.length, index) }}
              />
            )}
            {!value.type && (
              <div
                id={index.toString()}
                className="wait-charge-attack"
                style={{
                  width: value.size,
                  height: value.size,
                  left: calculateFitPoint(poke.timeline.length, index),
                }}
              />
            )}
            {value.type === AttackType.Dead && (
              <div id={index.toString()} style={{ left: calculateFitPoint(poke.timeline.length, index) }}>
                <CloseIcon color="error" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </Fragment>
  );

  return (
    <Fragment>
      {!isHide && (
        <div className="w-100 fit-timeline d-flex justify-content-center">
          <div
            className="position-relative h-100"
            ref={timeline}
            onMouseMove={move.bind(this)}
            onMouseOver={move.bind(this)}
            onTouchMove={(e) => move(e as unknown as TimelineEvent<HTMLDivElement>)}
          >
            {renderTimelineFit(pokemonCurr, pokemonObj)}
            <hr className="w-100 m-0" />
            {renderTimelineFit(pokemonObj, pokemonCurr)}
            <div id="play-line" ref={eRef} className="play-line" />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineFit;
