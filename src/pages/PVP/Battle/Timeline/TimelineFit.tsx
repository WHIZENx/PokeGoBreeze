import React, { Fragment } from 'react';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { getKeyWithData } from '../../../../utils/utils';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import { combineClasses, isNotEmpty, toNumber } from '../../../../utils/extension';
import { TypeAction } from '../../../../enums/type.enum';
import { TimelineElement, TimelineEvent } from '../../../../utils/models/overrides/dom.model';
import TimelineTeamEvent from './TimelineTeamEvent';

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
          <div className="tw-relative timeline-fit-container tw-h-3">
            {showTap &&
              poke.timeline.map(
                (value, index) =>
                  value.isTap && (
                    <div
                      key={index}
                      className="charge-attack opacity-50"
                      style={{
                        width: value.size,
                        left: positions[index],
                        borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                      }}
                    />
                  )
              )}
          </div>
          <div className="tw-relative timeline-fit-container tw-h-8" data-timeline-lane="switch">
            {poke.timeline.map(
              (value, index) =>
                (value.type === AttackType.Switch ||
                  value.type === AttackType.Dead ||
                  value.switchedFromIndex !== undefined ||
                  value.faintedIndex !== undefined) && (
                  <div
                    className="!tw-flex tw-items-center tw-justify-center"
                    key={index}
                    style={{ left: positions[index], transform: 'translate(-50%, -50%)' }}
                  >
                    <TimelineTeamEvent entry={value} index={index} team={team} timeline={poke.timeline} />
                  </div>
                )
            )}
          </div>
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
            onMouseOver={move.bind(this)}
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
