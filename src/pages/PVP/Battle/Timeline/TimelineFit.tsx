import React, { Fragment } from 'react';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { getKeyWithData } from '../../../../utils/utils';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import { combineClasses, isNotEmpty, toNumber } from '../../../../utils/extension';
import { TypeAction } from '../../../../enums/type.enum';
import { TimelineElement, TimelineEvent } from '../../../../utils/models/overrides/dom.model';
import TimelineTeamEvent from './TimelineTeamEvent';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import { getTimelineTapPauseGroups, getTimelineTapPauseWidth } from './timeline-tap-pause';

const TimelineFit = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  timeline: React.LegacyRef<HTMLDivElement> | undefined,
  eRef: React.LegacyRef<HTMLDivElement> | undefined,
  move: TimelineElement<HTMLDivElement>,
  showTap: boolean,
  pokemonCurrTeam: IPokemonBattle[] = [pokemonCurr],
  pokemonObjTeam: IPokemonBattle[] = [pokemonObj],
  isHide = false
) => {
  const calculateWidthBasedPositions = (timeline: ITimeline[]) => {
    const totalScaledWidth = timeline.reduce((sum, item) => sum + toNumber(item.size), 0);
    if (totalScaledWidth <= 0) {
      return timeline.map(() => '0%');
    }
    const scaleFactor = 100 / totalScaledWidth;
    let position = 0;
    return timeline.map((item) => {
      const current = `${position}%`;
      position += toNumber(item.size) * scaleFactor;
      return current;
    });
  };

  const renderTimelineFit = (poke: IPokemonBattle, pokeObj: IPokemonBattle, team: IPokemonBattle[]) => {
    const positions = calculateWidthBasedPositions(poke.timeline);
    const totalTimelineWidth = poke.timeline.reduce((sum, entry) => sum + toNumber(entry.size), 0);
    const tapPauseGroups = getTimelineTapPauseGroups(poke.timeline, pokeObj.timeline);
    const isSwitchEvent = (value: ITimeline) =>
      value.type === AttackType.Switch || value.switchedFromIndex !== undefined;
    const isFaintEvent = (value: ITimeline) => value.type === AttackType.Dead || value.faintedIndex !== undefined;
    const teamEvents = poke.timeline.reduce<Array<{ entry: ITimeline; index: number; left: string; turn: number }>>(
      (events, value, index) => {
        const hasSwitch = isSwitchEvent(value);
        const hasFaint = isFaintEvent(value);
        if (!hasSwitch && !hasFaint) {
          return events;
        }
        const turn = value.timer ?? index;
        const existing = events.find((event) => event.turn === turn);
        if (!existing) {
          events.push({ entry: value, index, left: positions[index], turn });
          return events;
        }
        const switchEntry = hasSwitch ? value : isSwitchEvent(existing.entry) ? existing.entry : undefined;
        const faintEntry = hasFaint ? value : isFaintEvent(existing.entry) ? existing.entry : undefined;
        existing.entry = {
          ...existing.entry,
          ...switchEntry,
          faintedIndex: faintEntry?.faintedIndex ?? faintEntry?.activeIndex,
          faintedPokemonName: faintEntry?.faintedPokemonName,
        };
        if (hasSwitch) {
          existing.index = index;
          existing.left = positions[index];
        }
        return events;
      },
      []
    );
    const minimumTeamEventGapPercent = 12;
    const lastPositionByRow: number[] = [];
    const positionedTeamEvents = teamEvents.map((event) => {
      const position = Number.parseFloat(event.left);
      let row = lastPositionByRow.findIndex((lastPosition) => position - lastPosition >= minimumTeamEventGapPercent);
      if (row < 0) {
        row = lastPositionByRow.length;
      }
      lastPositionByRow[row] = position;
      return { ...event, row };
    });
    const teamEventRowCount = Math.max(1, lastPositionByRow.length);
    const teamEventRowHeight = 28;
    const renderTeamEventLane = () => (
      <div
        className="tw-relative timeline-fit-container"
        data-timeline-event-lane="switch"
        style={{ height: teamEventRowCount * teamEventRowHeight }}
      >
        {positionedTeamEvents.map(({ entry, index, left, row, turn }) => (
          <Fragment key={`${turn}-${index}`}>
            <span
              aria-hidden="true"
              className="tw-pointer-events-none tw-absolute tw-z-30 tw-w-px -tw-translate-x-1/2 tw-bg-[var(--text-secondary)] tw-opacity-80"
              data-timeline-event-divider={entry.type === AttackType.Switch ? 'switch' : 'faint'}
              style={{
                left,
                top: row * teamEventRowHeight + teamEventRowHeight / 2,
                height: (teamEventRowCount - row) * teamEventRowHeight + 30,
              }}
            />
            <div
              className="!tw-z-40 !tw-flex tw-items-center tw-justify-center"
              data-timeline-event-row={row}
              style={{
                left,
                top: row * teamEventRowHeight + teamEventRowHeight / 2,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <TimelineTeamEvent entry={entry} index={index} team={team} timeline={poke.timeline} />
            </div>
          </Fragment>
        ))}
      </div>
    );
    return (
      <Fragment>
        <div className="tw-mt-2">
          <div className="tw-relative timeline-fit-container tw-h-4">
            {poke.timeline.map((value, index) => (
              <Fragment key={index}>
                {!value.isTap && (
                  <Fragment>
                    {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                      <div className="icon-buff-timeline" style={{ left: positions[index] }}>
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
                          <div className="icon-buff-timeline" style={{ left: positions[index] }}>
                            {value.buff?.map((b, i) => (
                              <span key={i} className={b.power < 0 ? '!tw-text-error' : '!tw-text-success'}>
                                {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Fragment>
            ))}
          </div>
          <div className="tw-relative timeline-fit-container tw-h-4">
            {showTap &&
              tapPauseGroups.map((group) => (
                <div
                  key={`${group.start}-${group.end}`}
                  aria-label="Charged Attack pauses Fast Attack taps"
                  className="tw-pointer-events-none !tw-absolute tw-top-1/2 tw-z-10 !tw-flex tw-h-1.5 -tw-translate-y-1/2 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--text-secondary)] tw-opacity-80"
                  data-timeline-tap-pause="charged-attack"
                  style={{
                    left: positions[group.start],
                    width: `${(getTimelineTapPauseWidth(poke.timeline, group) / totalTimelineWidth) * 100}%`,
                  }}
                  title="Charged Attack pause"
                >
                  <PauseRoundedIcon className="!tw-h-3 !tw-w-3 tw-rounded-full tw-bg-[var(--custom-table-background)] !tw-text-[var(--text-primary)]" />
                </div>
              ))}
            {showTap &&
              poke.timeline.map(
                (value, index) =>
                  value.isTap && (
                    <div
                      key={index}
                      className="charge-attack tw-z-20 opacity-50"
                      style={{
                        width: value.size,
                        left: positions[index],
                        borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                      }}
                    />
                  )
              )}
          </div>
          {positionedTeamEvents.length > 0 && <div data-timeline-lane="switch">{renderTeamEventLane()}</div>}
        </div>
        <div className="tw-relative timeline-fit-container tw-h-7.5">
          {poke.timeline.map((value, index) => (
            <Fragment key={index}>
              {value.type === AttackType.Block && (
                <div id={index.toString()} style={{ left: positions[index] }}>
                  <HexagonIcon className="tw-text-combat-block" sx={{ fontSize: value.size }} />
                </div>
              )}
              {value.type === AttackType.Fast && (
                <div
                  id={index.toString()}
                  className={combineClasses('fast-attack', value.color, 'black-border')}
                  style={{ left: positions[index] }}
                />
              )}
              {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
                <div
                  id={index.toString()}
                  className={combineClasses('charge-attack', `${value.color}-border`)}
                  style={{
                    width: value.size,
                    height: value.size,
                    left: positions[index],
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
                    left: positions[index],
                  }}
                />
              )}
              {(value.type === AttackType.Wait || value.type === AttackType.New) && (
                <div id={index.toString()} className="wait-attack" style={{ left: positions[index] }} />
              )}
              {!value.type && (
                <div
                  id={index.toString()}
                  className="wait-charge-attack"
                  style={{
                    width: value.size,
                    height: value.size,
                    left: positions[index],
                  }}
                />
              )}
              {value.type === AttackType.Dead && (
                <div id={index.toString()} className="wait-attack" style={{ left: positions[index] }} />
              )}
              {value.type === AttackType.Switch && (
                <div id={index.toString()} className="wait-attack" style={{ left: positions[index] }} />
              )}
              {value.type === AttackType.Timeout && (
                <span
                  id={index.toString()}
                  className={combineClasses(
                    'tw-text-xs tw-font-bold',
                    value.outcome === 'win'
                      ? 'tw-text-success'
                      : value.outcome === 'lose'
                        ? 'tw-text-error'
                        : 'tw-text-default'
                  )}
                  style={{ left: positions[index] }}
                  title="Battle ended by time limit"
                >
                  {value.outcome === 'win' ? 'W' : value.outcome === 'lose' ? 'L' : 'T'}
                </span>
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
        <div className="tw-w-full fit-timeline tw-flex tw-justify-center">
          <div
            className="tw-relative tw-h-full"
            ref={timeline}
            onMouseMove={move.bind(this)}
            onTouchMove={(e) => move(e as unknown as TimelineEvent<HTMLDivElement>)}
          >
            {renderTimelineFit(pokemonCurr, pokemonObj, pokemonCurrTeam)}
            <hr className="tw-w-full !tw-m-0" />
            {renderTimelineFit(pokemonObj, pokemonCurr, pokemonObjTeam)}
            <div id="play-line" ref={eRef} className="play-line" />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineFit;
