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
      return timeline.map(() => ({ start: '0%', center: '0%' }));
    }
    const scaleFactor = 100 / totalScaledWidth;
    let position = 0;
    return timeline.map((item) => {
      const width = toNumber(item.size) * scaleFactor;
      const current = { start: `${position}%`, center: `${position + width / 2}%` };
      position += width;
      return current;
    });
  };

  const renderTimelineFit = (poke: IPokemonBattle, pokeObj: IPokemonBattle, team: IPokemonBattle[]) => {
    const positions = calculateWidthBasedPositions(poke.timeline);
    const startPositions = positions.map(({ start }) => start);
    const centerPositions = positions.map(({ center }) => center);
    const centeredMarkerStyle = (index: number, style: React.CSSProperties = {}): React.CSSProperties => ({
      ...style,
      left: centerPositions[index],
      transform: 'translate(-50%, -50%)',
    });
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
          events.push({ entry: value, index, left: centerPositions[index], turn });
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
          existing.left = centerPositions[index];
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
              className="tw-pointer-events-none tw-absolute tw-z-30 tw-w-px -tw-translate-x-1/2 tw-bg-foreground-secondary tw-opacity-80"
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
                      <div className="icon-buff-timeline" style={{ left: centerPositions[index] }}>
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
                          <div className="icon-buff-timeline" style={{ left: centerPositions[index] }}>
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
                  className="tw-pointer-events-none !tw-absolute tw-top-1/2 tw-z-10 !tw-flex tw-h-1.5 -tw-translate-y-1/2 tw-items-center tw-justify-center tw-rounded-full tw-bg-foreground-secondary tw-opacity-80"
                  data-timeline-tap-pause="charged-attack"
                  style={{
                    left: startPositions[group.start],
                    width: `${(getTimelineTapPauseWidth(poke.timeline, group) / totalTimelineWidth) * 100}%`,
                  }}
                  title="Charged Attack pause"
                >
                  <PauseRoundedIcon className="!tw-h-3 !tw-w-3 tw-rounded-full tw-bg-table-custom !tw-text-foreground-primary" />
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
                        ...centeredMarkerStyle(index),
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
                <div id={index.toString()} style={centeredMarkerStyle(index)}>
                  <HexagonIcon className="tw-text-combat-block" sx={{ fontSize: value.size }} />
                </div>
              )}
              {value.type === AttackType.Fast && (
                <div
                  id={index.toString()}
                  className={combineClasses('fast-attack', value.color, 'black-border')}
                  style={centeredMarkerStyle(index)}
                />
              )}
              {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
                <div
                  id={index.toString()}
                  className={combineClasses('charge-attack', `${value.color}-border`)}
                  style={centeredMarkerStyle(index, {
                    width: value.size,
                    height: value.size,
                  })}
                />
              )}
              {value.type === AttackType.Charge && (
                <div
                  id={index.toString()}
                  className={combineClasses('charge-attack', value.color, `${value.color}-border`)}
                  style={centeredMarkerStyle(index, {
                    width: value.size,
                    height: value.size,
                  })}
                />
              )}
              {value.type === AttackType.Wait && (
                <div
                  id={index.toString()}
                  aria-hidden="true"
                  className="wait-attack !tw-h-1 !tw-w-1 tw-rounded-full tw-bg-foreground-secondary tw-opacity-30"
                  data-timeline-wait-marker="true"
                  style={centeredMarkerStyle(index)}
                />
              )}
              {value.type === AttackType.New && (
                <div id={index.toString()} className="wait-attack" style={centeredMarkerStyle(index)} />
              )}
              {!value.type && (
                <div
                  id={index.toString()}
                  className="wait-charge-attack"
                  style={centeredMarkerStyle(index, {
                    width: value.size,
                    height: value.size,
                  })}
                />
              )}
              {value.type === AttackType.Dead && (
                <div id={index.toString()} className="wait-attack" style={centeredMarkerStyle(index)} />
              )}
              {value.type === AttackType.Switch && (
                <div id={index.toString()} className="wait-attack" style={centeredMarkerStyle(index)} />
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
                  style={{ left: centerPositions[index], transform: 'translateX(-50%)' }}
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
