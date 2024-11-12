import { Badge } from '@mui/material';
import React, { Fragment } from 'react';
import APIService from '../../../services/API.service';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { capitalize, splitAndCapitalize } from '../../../util/utils';
import CloseIcon from '@mui/icons-material/Close';
import { IPokemonBattle, TimelineElement } from '../models/battle.model';
import { ICombat } from '../../../core/models/combat.model';
import { AttackType } from './enums/attack-type.enum';
import { combineClasses, isNotEmpty } from '../../../util/extension';

export const TimeLineVertical = (pokemonCurr: IPokemonBattle, pokemonObj: IPokemonBattle, isHide = false) => {
  const renderMoveBadgeBorder = (move: ICombat | undefined, isBorder: boolean, isShadow = false) => {
    if (!move) {
      return;
    }
    return (
      <div className="d-flex flex-wrap align-items-center" style={{ gap: 5 }}>
        <span
          className={combineClasses(
            `${move.type?.toLowerCase()}${isBorder ? '-border' : ''}`,
            'type-select-bg d-flex align-items-center border-type-init'
          )}
        >
          <div style={{ display: 'contents', width: 16 }}>
            <img
              className={combineClasses('pokemon-sprite-small sprite-type-select', isShadow ? 'filter-shadow' : '')}
              alt="img-type-pokemon"
              src={APIService.getTypeHqSprite(capitalize(move.type))}
            />
          </div>
          <span className={combineClasses(!isShadow ? 'text-black' : 'filter-shadow')} style={{ fontSize: 14 }}>
            {splitAndCapitalize(move.name, '_', ' ')}
          </span>
        </span>
      </div>
    );
  };

  const renderTimeline = (pokeCurr: IPokemonBattle, pokeObj: IPokemonBattle, end = false) => {
    return (
      <Fragment>
        {pokeCurr.timeline.map((value, index) => (
          <Fragment key={index}>
            {pokeObj.timeline.at(index) && pokeObj.timeline.at(index)?.type === AttackType.Charge && (
              <Fragment>
                {value.type === AttackType.Block ? (
                  <div
                    style={{ height: 80 }}
                    className={combineClasses('d-flex align-items-center turn-battle', end ? 'justify-content-end' : '')}
                  >
                    <div className="block-attack-container">
                      <img className="block-spirit-timeline" alt="img-shield" src={APIService.getPokeOtherLeague('ShieldButton')} />
                    </div>
                    <span className="text-success">
                      x{value.block}
                      <span className="dec-block">-1</span>
                    </span>
                  </div>
                ) : (
                  <div className={combineClasses('wait-attack-container turn-battle', end ? 'justify-content-end' : '')} />
                )}
              </Fragment>
            )}
            {value.type === AttackType.Fast && (
              <Badge
                color="primary"
                overlap="circular"
                badgeContent={value.isTap ? 'Tap' : undefined}
                className={combineClasses('fast-attack-container text-shadow turn-battle', end ? 'justify-content-end' : '')}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: end ? 'right' : 'left',
                }}
              >
                <div className={combineClasses('fast-attack-content text-center', value.color)}>
                  <span className="text-warning" style={{ fontSize: 12 }}>
                    <b>Fast Attack!</b>
                  </span>
                  {value.isTap && <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>}
                </div>
              </Badge>
            )}
            {value.type === AttackType.Wait && (
              <Badge
                color="primary"
                overlap="circular"
                badgeContent={value.isTap ? 'Tap' : undefined}
                className={combineClasses(
                  pokeCurr.timeline.at(index - 1) && pokeCurr.timeline.at(index - 1)?.isDmgImmune
                    ? 'fast-attack-container text-shadow'
                    : 'wait-attack-container',
                  end ? 'justify-content-end' : '',
                  'turn-battle',
                  value.isTap ? `${value.color}-border` : ''
                )}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: end ? 'right' : 'left',
                }}
              >
                {pokeCurr.timeline.at(index - 1) && pokeCurr.timeline.at(index - 1)?.isDmgImmune ? (
                  <div className={combineClasses('fast-attack-content text-center', value.move?.type?.toLowerCase())}>
                    <span className="text-warning" style={{ fontSize: 12 }}>
                      <b>Fast Attack!</b>
                    </span>
                    {value.isTap && <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>}
                  </div>
                ) : (
                  <Fragment>{value.isTap && <Fragment>{renderMoveBadgeBorder(value.move, true)}</Fragment>}</Fragment>
                )}
              </Badge>
            )}
            {value.type === AttackType.Prepare && (
              <div
                style={{ height: 80 }}
                className={combineClasses('d-flex align-items-center turn-battle', end ? 'justify-content-end' : '')}
              >
                <div className={combineClasses('swipe-attack-container', `${value.color}-border`, 'text-center')}>
                  <span style={{ fontSize: 12 }}>
                    <b>Swipe Charge</b>
                  </span>
                  <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
                </div>
              </div>
            )}
            {value.type === AttackType.Charge && (
              <div className={combineClasses('charged-attack-container text-shadow turn-battle', end ? 'justify-content-end' : '')}>
                <div className={combineClasses('charged-attack-content text-center', value.color)}>
                  <span className="text-warning" style={{ fontSize: 16 }}>
                    <b>Charged Attack!</b>
                  </span>
                </div>
              </div>
            )}
            {value.type === AttackType.Dead && pokeObj.timeline.at(index) && pokeObj.timeline.at(index)?.type === AttackType.Dead ? (
              <div className={combineClasses('winner-container bg-dark text-white turn-battle', end ? 'justify-content-end' : '')}>
                TIE!
              </div>
            ) : (
              <Fragment>
                {value.type === AttackType.Win && (
                  <div className={combineClasses('winner-container bg-success text-white turn-battle', end ? 'justify-content-end' : '')}>
                    WIN!
                  </div>
                )}
                {value.type === AttackType.Dead && (
                  <div className={combineClasses('loser-container bg-danger text-white turn-battle', end ? 'justify-content-end' : '')}>
                    LOSE!
                  </div>
                )}
              </Fragment>
            )}
          </Fragment>
        ))}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!isHide && (
        <div className="d-flex timeline-vertical battle-container">
          <div className="w-50">
            <div className="d-flex flex-column" style={{ gap: 10 }}>
              {renderTimeline(pokemonCurr, pokemonObj)}
            </div>
          </div>
          <div className="w-50">
            <div className="d-flex flex-column align-items-end" style={{ gap: 10 }}>
              {renderTimeline(pokemonObj, pokemonCurr, true)}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export const TimeLine = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  elem: React.LegacyRef<HTMLDivElement> | undefined,
  // eslint-disable-next-line no-unused-vars
  scroll: (e: React.SyntheticEvent<HTMLDivElement>) => void,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  isHide = false
) => {
  const renderTimeline = (poke: IPokemonBattle, pokeObj: IPokemonBattle, border = false) => {
    return (
      <Fragment>
        <div className="element-top" style={{ height: 12 }}>
          <div className="d-flex" style={{ columnGap: 10, width: 'max-content' }}>
            {poke.timeline.map((value, index) => (
              <span className="position-relative" key={index} style={{ width: value.size }}>
                {value.isTap && (
                  <div
                    style={{
                      display: !showTap ? 'none' : 'block',
                      opacity: 0.5,
                      borderColor: value.isDmgImmune ? 'red' : 'black',
                    }}
                    className="charge-attack"
                  />
                )}
                {!value.isTap && (
                  <Fragment>
                    {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                      <div className="position-absolute icon-buff-timeline">
                        {value.buff?.map((b, i) => (
                          <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                            {b.type?.toUpperCase()} {(b.power > 0 ? '+' : '') + b.power}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Fragment>
                        {pokeObj.timeline.at(index) && pokeObj.timeline.at(index)?.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                          <div className="position-absolute icon-buff-timeline">
                            {value.buff?.map((b, i) => (
                              <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                                {b.type?.toUpperCase()} {b.power}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: !showTap ? 'none' : 'block' }} className="wait-attack" />
                        )}
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </span>
            ))}
          </div>
        </div>
        <div
          className="d-flex align-items-center"
          style={{
            columnGap: 10,
            width: 'max-content',
            borderBottom: border ? '1px solid lightgray' : 'none',
          }}
        >
          {poke.timeline.map((value, index) => (
            <Fragment key={index}>
              {value.type === AttackType.Block && <HexagonIcon id={index.toString()} sx={{ color: 'purple', fontSize: value.size }} />}
              {value.type === AttackType.Fast && (
                <div id={index.toString()} className={combineClasses('fast-attack', value.color, `${value.color}-border`)} />
              )}
              {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
                <div
                  id={index.toString()}
                  className={combineClasses('charge-attack', `${value.color}-border`)}
                  style={{ width: value.size, height: value.size }}
                />
              )}
              {value.type === AttackType.Charge && (
                <div
                  id={index.toString()}
                  className={combineClasses('charge-attack', value.color, `${value.color}-border`)}
                  style={{ width: value.size, height: value.size }}
                />
              )}
              {(value.type === AttackType.Wait || value.type === AttackType.New) && <div id={index.toString()} className="wait-attack" />}
              {!value.type && (
                <div id={index.toString()} className="wait-charge-attack" style={{ width: value.size, height: value.size }} />
              )}
              {value.type === AttackType.Dead && (
                <div id={index.toString()}>
                  <CloseIcon color="error" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!isHide && move.bind && (
        <div className="w-100 battle-bar d-flex justify-content-center">
          <div id="battle-bar-scroll" className="battle-bar-container" ref={elem} onScroll={scroll.bind(this)}>
            <div
              className="position-relative"
              ref={timeline}
              onMouseMove={move.bind(this)}
              onMouseOver={move.bind(this)}
              onTouchMove={move.bind(this)}
            >
              {renderTimeline(pokemonCurr, pokemonObj, true)}
              {renderTimeline(pokemonObj, pokemonCurr)}
              <div id="play-line" ref={eRef} className="play-line" />
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export const TimeLineFit = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  isHide = false
) => {
  const calculateFitPoint = (length: number, index: number) => {
    return `${(index * 100) / (length - 2)}%`;
  };

  const renderTimelineFit = (poke: IPokemonBattle, pokeObj: IPokemonBattle) => {
    return (
      <Fragment>
        <div className="element-top" style={{ height: 12 }}>
          <div className="position-relative timeline-fit-container">
            {poke.timeline.map((value, index) => (
              <Fragment key={index}>
                {value.isTap && (
                  <div
                    className="charge-attack"
                    style={{
                      display: !showTap ? 'none' : 'block',
                      opacity: 0.5,
                      width: value.size,
                      left: calculateFitPoint(poke.timeline.length, index),
                      borderColor: value.isDmgImmune ? 'red' : 'black',
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
                            {b.type?.toUpperCase()} {(b.power > 0 ? '+' : '') + b.power}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <Fragment>
                        {pokeObj.timeline.at(index) && pokeObj.timeline.at(index)?.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                          <div
                            className="position-absolute icon-buff-timeline"
                            style={{
                              left: calculateFitPoint(poke.timeline.length, index),
                              top: 10,
                            }}
                          >
                            {value.buff?.map((b, i) => (
                              <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                                {b.type?.toUpperCase()} {b.power}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="wait-attack"
                            style={{
                              display: !showTap ? 'none' : 'block',
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
                <div id={index.toString()} className="wait-attack" style={{ left: calculateFitPoint(poke.timeline.length, index) }} />
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
  };

  return (
    <Fragment>
      {!isHide && (
        <div className="w-100 fit-timeline d-flex justify-content-center">
          <div
            className="position-relative h-100"
            ref={timeline}
            onMouseMove={move.bind(this)}
            onMouseOver={move.bind(this)}
            onTouchMove={move.bind(this)}
          >
            {renderTimelineFit(pokemonCurr, pokemonObj)}
            <hr className="w-100" style={{ margin: 0 }} />
            {renderTimelineFit(pokemonObj, pokemonCurr)}
            <div id="play-line" ref={eRef} className="play-line" />
          </div>
        </div>
      )}
    </Fragment>
  );
};
