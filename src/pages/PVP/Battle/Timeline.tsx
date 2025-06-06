import { Badge } from '@mui/material';
import React, { Fragment } from 'react';
import APIService from '../../../services/API.service';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { getKeyWithData, splitAndCapitalize } from '../../../util/utils';
import CloseIcon from '@mui/icons-material/Close';
import { IPokemonBattle } from '../models/battle.model';
import { ICombat } from '../../../core/models/combat.model';
import { AttackType } from './enums/attack-type.enum';
import { combineClasses, isNotEmpty } from '../../../util/extension';
import { TypeAction } from '../../../enums/type.enum';
import { TimelineElement, TimelineEvent } from '../../../util/models/overrides/dom.model';

export const TimeLineVertical = (pokemonCurr: IPokemonBattle, pokemonObj: IPokemonBattle, isHide = false) => {
  const renderMoveBadgeBorder = (move: ICombat | undefined, isBorder: boolean, isShowShadow = false) => {
    if (!move) {
      return <></>;
    }
    return (
      <div className="d-flex flex-wrap align-items-center gap-1">
        <span
          className={combineClasses(
            `${move.type?.toLowerCase()}${isBorder ? '-border' : ''}`,
            'type-select-bg d-flex align-items-center border-type-init'
          )}
        >
          <div className="w-1 d-contents">
            <img
              className={combineClasses('pokemon-sprite-small sprite-type-select', isShowShadow ? 'filter-shadow' : '')}
              alt="Pokémon GO Type Logo"
              src={APIService.getTypeHqSprite(move.type)}
            />
          </div>
          <span
            className={combineClasses(!isShowShadow ? 'theme-text-primary' : 'filter-shadow')}
            style={{ fontSize: 14 }}
          >
            {splitAndCapitalize(move.name, '_', ' ')}
          </span>
        </span>
      </div>
    );
  };

  const renderTimeline = (pokeCurr: IPokemonBattle, pokeObj: IPokemonBattle, end = false) => (
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
                    <img
                      className="block-spirit-timeline"
                      alt="Image Shield"
                      src={APIService.getPokeOtherLeague('ShieldButton')}
                    />
                  </div>
                  <span className="text-success">
                    x{value.block}
                    <span className="dec-block">-1</span>
                  </span>
                </div>
              ) : (
                <div
                  className={combineClasses('wait-attack-container turn-battle', end ? 'justify-content-end' : '')}
                />
              )}
            </Fragment>
          )}
          {value.type === AttackType.Fast && (
            <Badge
              color="primary"
              overlap="circular"
              badgeContent={value.isTap ? 'Tap' : undefined}
              className={combineClasses('fast-attack-container turn-battle', end ? 'justify-content-end' : '')}
              anchorOrigin={{
                vertical: 'top',
                horizontal: end ? 'right' : 'left',
              }}
            >
              <div className={combineClasses('fast-attack-content text-center', value.color)}>
                <span className="text-warning text-shadow-black" style={{ fontSize: 12 }}>
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
                  ? 'fast-attack-container'
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
                  <span className="text-warning text-shadow-black" style={{ fontSize: 12 }}>
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
            <div className={combineClasses('charged-attack-container turn-battle', end ? 'justify-content-end' : '')}>
              <div className={combineClasses('charged-attack-content text-center', value.color)}>
                <span className="text-warning text-shadow-black u-fs-1">
                  <b>Charged Attack!</b>
                </span>
              </div>
            </div>
          )}
          {value.type === AttackType.Dead &&
          pokeObj.timeline.at(index) &&
          pokeObj.timeline.at(index)?.type === AttackType.Dead ? (
            <div
              className={combineClasses(
                'winner-container bg-dark text-white turn-battle',
                end ? 'justify-content-end' : ''
              )}
            >
              TIE!
            </div>
          ) : (
            <Fragment>
              {value.type === AttackType.Win && (
                <div
                  className={combineClasses(
                    'winner-container bg-success text-white turn-battle',
                    end ? 'justify-content-end' : ''
                  )}
                >
                  WIN!
                </div>
              )}
              {value.type === AttackType.Dead && (
                <div
                  className={combineClasses(
                    'loser-container bg-danger text-white turn-battle',
                    end ? 'justify-content-end' : ''
                  )}
                >
                  LOSE!
                </div>
              )}
            </Fragment>
          )}
        </Fragment>
      ))}
    </Fragment>
  );

  return (
    <Fragment>
      {!isHide && (
        <div className="d-flex timeline-vertical battle-container">
          <div className="w-50">
            <div className="d-flex flex-column gap-2">{renderTimeline(pokemonCurr, pokemonObj)}</div>
          </div>
          <div className="w-50">
            <div className="d-flex flex-column align-items-end gap-2">
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
  scroll: (e: React.SyntheticEvent<HTMLDivElement>) => void,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  isHide = false
) => {
  const renderTimeline = (poke: IPokemonBattle, pokeObj: IPokemonBattle, border = false) => (
    <Fragment>
      <div className="mt-2" style={{ height: 12 }}>
        <div className="d-flex column-gap-2 w-max-content">
          {poke.timeline.map((value, index) => (
            <span className="position-relative" key={index} style={{ width: value.size }}>
              {value.isTap && (
                <div
                  style={{
                    borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                  }}
                  className={combineClasses('charge-attack opacity-50', showTap ? 'd-block' : 'd-none')}
                />
              )}
              {!value.isTap && (
                <Fragment>
                  {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                    <div className="position-absolute icon-buff-timeline">
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
                        <div className="position-absolute icon-buff-timeline">
                          {value.buff?.map((b, i) => (
                            <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                              {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={combineClasses('wait-attack', showTap ? 'd-block' : 'd-none')} />
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
        className="d-flex align-items-center column-gap-2 w-max-content"
        style={{
          borderBottom: border ? 'var(--custom-table-border)' : 'none',
        }}
      >
        {poke.timeline.map((value, index) => (
          <Fragment key={index}>
            {value.type === AttackType.Block && (
              <HexagonIcon id={index.toString()} sx={{ color: 'purple', fontSize: value.size }} />
            )}
            {value.type === AttackType.Fast && (
              <div
                id={index.toString()}
                className={combineClasses('fast-attack', value.color, `${value.color}-border`)}
              />
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
            {(value.type === AttackType.Wait || value.type === AttackType.New) && (
              <div id={index.toString()} className="wait-attack" />
            )}
            {!value.type && (
              <div
                id={index.toString()}
                className="wait-charge-attack"
                style={{ width: value.size, height: value.size }}
              />
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
              onTouchMove={(e) => move(e as unknown as TimelineEvent<HTMLDivElement>)}
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
