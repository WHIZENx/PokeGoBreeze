import React, { Fragment } from 'react';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { getKeyWithData } from '../../../../utils/utils';
import CloseIcon from '@mui/icons-material/Close';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import { combineClasses, isNotEmpty, toNumber } from '../../../../utils/extension';
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
  const calculateWidthBasedPosition = (timeline: ITimeline[], index: number) => {
    const totalScaledWidth = timeline.reduce((sum, item) => sum + toNumber(item.size), 0);
    const scaleFactor = 100 / totalScaledWidth;
    const position = timeline
      .filter((_, i) => i < index)
      .reduce((sum, item) => sum + toNumber(item.size) * scaleFactor, 0);
    return `${position}%`;
  };

  const renderTimelineFit = (poke: IPokemonBattle, pokeObj: IPokemonBattle) => (
    <Fragment>
      <div className="tw-mt-2 tw-h-3">
        <div className="tw-relative timeline-fit-container">
          {poke.timeline.map((value, index) => (
            <Fragment key={index}>
              {value.isTap && showTap && (
                <div
                  className="charge-attack opacity-50"
                  style={{
                    width: value.size,
                    left: calculateWidthBasedPosition(poke.timeline, index),
                    borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                  }}
                />
              )}
              {!value.isTap && (
                <Fragment>
                  {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                    <div
                      className="tw-absolute icon-buff-timeline tw-top-[10px]"
                      style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}
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
                          className="tw-absolute icon-buff-timeline tw-top-[10px]"
                          style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}
                        >
                          {value.buff?.map((b, i) => (
                            <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                              {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                            </span>
                          ))}
                        </div>
                      ) : (
                        showTap && (
                          <div
                            className="wait-attack"
                            style={{ width: value.size, left: calculateWidthBasedPosition(poke.timeline, index) }}
                          />
                        )
                      )}
                    </Fragment>
                  )}
                </Fragment>
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="tw-relative timeline-fit-container tw-h-7.5">
        {poke.timeline.map((value, index) => (
          <Fragment key={index}>
            {value.type === AttackType.Block && (
              <div id={index.toString()} style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}>
                <HexagonIcon sx={{ color: 'purple', fontSize: value.size }} />
              </div>
            )}
            {value.type === AttackType.Fast && (
              <div
                id={index.toString()}
                className={combineClasses('fast-attack', value.color, 'black-border')}
                style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}
              />
            )}
            {(value.type === AttackType.Spin || value.type === AttackType.Prepare) && (
              <div
                id={index.toString()}
                className={combineClasses('charge-attack', `${value.color}-border`)}
                style={{
                  width: value.size,
                  height: value.size,
                  left: calculateWidthBasedPosition(poke.timeline, index),
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
                  left: calculateWidthBasedPosition(poke.timeline, index),
                }}
              />
            )}
            {(value.type === AttackType.Wait || value.type === AttackType.New) && (
              <div
                id={index.toString()}
                className="wait-attack"
                style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}
              />
            )}
            {!value.type && (
              <div
                id={index.toString()}
                className="wait-charge-attack"
                style={{
                  width: value.size,
                  height: value.size,
                  left: calculateWidthBasedPosition(poke.timeline, index),
                }}
              />
            )}
            {value.type === AttackType.Dead && (
              <div id={index.toString()} style={{ left: calculateWidthBasedPosition(poke.timeline, index) }}>
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
        <div className="tw-w-full fit-timeline tw-flex tw-justify-center">
          <div
            className="tw-relative tw-h-full"
            ref={timeline}
            onMouseMove={move.bind(this)}
            onMouseOver={move.bind(this)}
            onTouchMove={(e) => move(e as unknown as TimelineEvent<HTMLDivElement>)}
          >
            {renderTimelineFit(pokemonCurr, pokemonObj)}
            <hr className="tw-w-full !tw-m-0" />
            {renderTimelineFit(pokemonObj, pokemonCurr)}
            <div id="play-line" ref={eRef} className="play-line" />
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineFit;
