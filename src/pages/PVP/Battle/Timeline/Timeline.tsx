import React, { Fragment } from 'react';
import { TypeAction } from '../../../../enums/type.enum';
import { combineClasses, isNotEmpty } from '../../../../utils/extension';
import { TimelineElement, TimelineEvent } from '../../../../utils/models/overrides/dom.model';
import { getKeyWithData } from '../../../../utils/utils';
import { IPokemonBattle } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import HexagonIcon from '@mui/icons-material/Hexagon';
import CloseIcon from '@mui/icons-material/Close';

const Timeline = (
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
      <div className="tw-mt-2" style={{ height: 12 }}>
        <div className="tw-flex tw-gap-x-2 tw-w-max">
          {poke.timeline.map((value, index) => (
            <span className="tw-relative" key={index} style={{ width: value.size }}>
              {value.isTap && (
                <div
                  style={{
                    borderColor: value.isDmgImmune ? 'red' : 'var(--text-primary)',
                  }}
                  className={combineClasses('charge-attack opacity-50', showTap ? 'tw-block' : 'tw-hidden')}
                />
              )}
              {!value.isTap && (
                <Fragment>
                  {value.type === AttackType.Charge && isNotEmpty(value.buff) ? (
                    <div className="tw-absolute icon-buff-timeline">
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
                        <div className="tw-absolute icon-buff-timeline">
                          {value.buff?.map((b, i) => (
                            <span key={i} className={b.power < 0 ? 'text-danger' : 'text-success'}>
                              {getKeyWithData(TypeAction, b.type)?.toUpperCase()} {b.power}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className={combineClasses('wait-attack', showTap ? 'tw-block' : 'tw-hidden')} />
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
        className="tw-flex tw-items-center tw-gap-x-2 tw-w-max"
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
        <div className="tw-w-full battle-bar tw-flex tw-justify-center">
          <div id="battle-bar-scroll" className="battle-bar-container" ref={elem} onScroll={scroll.bind(this)}>
            <div
              className="tw-relative"
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

export default Timeline;
