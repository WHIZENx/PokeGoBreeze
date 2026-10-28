import React, { Fragment } from 'react';
import { TypeAction } from '../../../../enums/type.enum';
import { combineClasses, isNotEmpty } from '../../../../utils/extension';
import { TimelineElement, TimelineEvent } from '../../../../utils/models/overrides/dom.model';
import { getKeyWithData } from '../../../../utils/utils';
import { IPokemonBattle } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import HexagonIcon from '@mui/icons-material/Hexagon';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import TimelineTeamEvent from './TimelineTeamEvent';
import { getTimelineTapPauseGroups, getTimelineTapPauseWidth } from './timeline-tap-pause';

const Timeline = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  elem: React.LegacyRef<HTMLDivElement> | undefined,
  scroll: (e: React.SyntheticEvent<HTMLDivElement>) => void,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  pokemonCurrTeam: IPokemonBattle[] = [pokemonCurr],
  pokemonObjTeam: IPokemonBattle[] = [pokemonObj],
  isHide = false
) => {
  const getTeamEventType = (value: IPokemonBattle['timeline'][number]) => {
    if (value.type === AttackType.Switch || value.switchedFromIndex !== undefined) {
      return 'switch';
    }
    if (value.type === AttackType.Dead || value.faintedIndex !== undefined) {
      return 'faint';
    }
    return undefined;
  };
  const renderTimeline = (poke: IPokemonBattle, pokeObj: IPokemonBattle, team: IPokemonBattle[], border = false) => {
    const minimumTeamEventGap = 96;
    const timelineGap = 12;
    const lastPositionByRow: number[] = [];
    const teamEventRowByIndex = new Map<number, number>();
    let timelinePosition = 0;
    poke.timeline.forEach((value, index) => {
      const size = Number(value.size) || 0;
      const center = timelinePosition + size / 2;
      if (getTeamEventType(value)) {
        let row = lastPositionByRow.findIndex((lastPosition) => center - lastPosition >= minimumTeamEventGap);
        if (row < 0) {
          row = lastPositionByRow.length;
        }
        lastPositionByRow[row] = center;
        teamEventRowByIndex.set(index, row);
      }
      timelinePosition += size + timelineGap;
    });
    const teamEventRowCount = Math.max(1, lastPositionByRow.length);
    const teamEventRowHeight = 28;
    const tapPauseGroups = getTimelineTapPauseGroups(poke.timeline, pokeObj.timeline);
    const tapPauseGroupByStart = new Map(tapPauseGroups.map((group) => [group.start, group]));
    return (
      <Fragment>
        <div className="tw-mt-2 tw-h-4">
          <div className="tw-flex tw-gap-x-3 tw-w-max">
            {poke.timeline.map((value, index) => {
              const tapPauseGroup = tapPauseGroupByStart.get(index);
              return (
                <span
                  className="tw-relative tw-flex tw-shrink-0 tw-items-center"
                  key={index}
                  style={{ width: value.size }}
                >
                  {showTap && tapPauseGroup && (
                    <span
                      aria-label="Charged Attack pauses Fast Attack taps"
                      className="tw-pointer-events-none tw-absolute tw-left-0 tw-top-1/2 tw-z-10 tw-flex tw-h-1.5 -tw-translate-y-1/2 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--text-secondary)] tw-opacity-80"
                      data-timeline-tap-pause="charged-attack"
                      style={{ width: getTimelineTapPauseWidth(poke.timeline, tapPauseGroup, timelineGap) }}
                      title="Charged Attack pause"
                    >
                      <PauseRoundedIcon className="!tw-h-3 !tw-w-3 tw-rounded-full tw-bg-[var(--custom-table-background)] !tw-text-[var(--text-primary)]" />
                    </span>
                  )}
                  {value.isTap && showTap && (
                    <div
                      style={{
                        borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                      }}
                      className="charge-attack opacity-50"
                    />
                  )}
                  {!value.isTap && (
                    <Fragment>
                      {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                        <div className="tw-absolute icon-buff-timeline">
                          {value.buff?.map((b, i) => (
                            <span key={i} className={b.power < 0 ? '!tw-text-error' : '!tw-text-success'}>
                              {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {(b.power > 0 ? '+' : '') + b.power}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Fragment>
                          {pokeObj.timeline.at(index) &&
                          pokeObj.timeline.at(index)?.type === AttackType.Charge &&
                          isNotEmpty(value.buff) ? (
                            <div className="tw-absolute icon-buff-timeline">
                              {value.buff?.map((b, i) => (
                                <span key={i} className={b.power < 0 ? '!tw-text-error' : '!tw-text-success'}>
                                  {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                                </span>
                              ))}
                            </div>
                          ) : (
                            showTap && <div className="wait-attack" />
                          )}
                        </Fragment>
                      )}
                    </Fragment>
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <div data-timeline-lane="switch" style={{ height: teamEventRowCount * teamEventRowHeight }}>
          <div className="tw-flex tw-w-max tw-gap-x-3" style={{ height: teamEventRowCount * teamEventRowHeight }}>
            {poke.timeline.map((value, index) => {
              const teamEventType = getTeamEventType(value);
              const row = teamEventRowByIndex.get(index);
              return (
                <span
                  className="tw-relative tw-shrink-0"
                  key={index}
                  style={{ width: value.size, height: teamEventRowCount * teamEventRowHeight }}
                >
                  {teamEventType && row !== undefined && (
                    <>
                      <span
                        aria-hidden="true"
                        className="tw-pointer-events-none tw-absolute tw-left-1/2 tw-z-30 tw-w-px -tw-translate-x-1/2 tw-bg-[var(--text-secondary)] tw-opacity-80"
                        data-timeline-event-divider={teamEventType}
                        style={{
                          top: row * teamEventRowHeight + teamEventRowHeight / 2,
                          height: (teamEventRowCount - row) * teamEventRowHeight + 30,
                        }}
                      />
                      <span
                        className="tw-absolute tw-left-1/2 tw-z-40 tw-flex tw-items-center tw-justify-center"
                        data-timeline-event-row={row}
                        style={{
                          top: row * teamEventRowHeight + teamEventRowHeight / 2,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <TimelineTeamEvent entry={value} index={index} team={team} timeline={poke.timeline} />
                      </span>
                    </>
                  )}
                </span>
              );
            })}
          </div>
        </div>
        <div
          className="tw-flex tw-items-center tw-gap-x-3 tw-w-max"
          style={{
            borderBottom: border ? 'var(--custom-table-border)' : 'none',
          }}
        >
          {poke.timeline.map((value, index) => (
            <div id={index.toString()} className="tw-relative tw-shrink-0" key={index} style={{ width: value.size }}>
              {value.type === AttackType.Block && (
                <HexagonIcon className="tw-text-combat-block" sx={{ fontSize: value.size }} />
              )}
              {value.type === AttackType.Fast && (
                <div className={combineClasses('fast-attack', value.color, `${value.color}-border`)} />
              )}
              {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
                <div
                  className={combineClasses('charge-attack', `${value.color}-border`)}
                  style={{ width: value.size, height: value.size }}
                />
              )}
              {value.type === AttackType.Charge && (
                <div
                  className={combineClasses('charge-attack', value.color, `${value.color}-border`)}
                  style={{ width: value.size, height: value.size }}
                />
              )}
              {(value.type === AttackType.Wait || value.type === AttackType.New) && <div className="wait-attack" />}
              {!value.type && <div className="wait-charge-attack" style={{ width: value.size, height: value.size }} />}
              {value.type === AttackType.Dead && <div className="wait-attack" />}
              {value.type === AttackType.Switch && <div className="wait-attack" />}
              {value.type === AttackType.Timeout && (
                <span
                  className={combineClasses(
                    'tw-text-xs tw-font-bold',
                    value.outcome === 'win'
                      ? 'tw-text-success'
                      : value.outcome === 'lose'
                        ? 'tw-text-error'
                        : 'tw-text-default'
                  )}
                  title="Battle ended by time limit"
                >
                  {value.outcome === 'win' ? 'W' : value.outcome === 'lose' ? 'L' : 'T'}
                </span>
              )}
            </div>
          ))}
        </div>
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!isHide && move.bind && (
        <div className="tw-w-full battle-bar tw-flex tw-justify-center">
          <div id="battle-bar-scroll" className="battle-bar-container" ref={elem} onScroll={scroll.bind(this)}>
            <div
              className="tw-relative"
              ref={timeline}
              onMouseMove={move.bind(this)}
              onMouseOver={move.bind(this)}
              onTouchMove={(e) => move(e as unknown as TimelineEvent<HTMLDivElement>)}
            >
              {renderTimeline(pokemonCurr, pokemonObj, pokemonCurrTeam, true)}
              {renderTimeline(pokemonObj, pokemonCurr, pokemonObjTeam)}
              <div id="play-line" ref={eRef} className="play-line" />
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default Timeline;
