import React, { Fragment } from 'react';
import PokemonTableIcon from '../../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { ICombat } from '../../../../core/models/combat.model';
import APIService from '../../../../services/api.service';
import { combineClasses } from '../../../../utils/extension';
import { splitAndCapitalize } from '../../../../utils/utils';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';
import TimelineTeamEvent from './TimelineTeamEvent';

const TimelineVertical = (
  pokemonCurr: IPokemonBattle,
  pokemonObj: IPokemonBattle,
  playerTeam: IPokemonBattle[] = [pokemonCurr],
  opponentTeam: IPokemonBattle[] = [pokemonObj],
  isHide = false
) => {
  const renderMoveBadgeBorder = (move: ICombat | undefined, isBorder: boolean, isShowShadow = false) => {
    if (!move) {
      return <></>;
    }
    return (
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-1">
        <span
          className={combineClasses(
            `${move.type?.toLowerCase()}${isBorder ? '-border' : ''}`,
            'type-select-bg tw-flex tw-items-center border-type-init'
          )}
        >
          <div className="tw-w-1 tw-contents">
            <img
              className={combineClasses('pokemon-sprite-small sprite-type-select', isShowShadow ? 'filter-shadow' : '')}
              alt="Pokémon GO Type Logo"
              src={APIService.getTypeHqSprite(move.type)}
            />
          </div>
          <span className={combineClasses('tw-text-sm', !isShowShadow ? 'tw-text-default' : 'filter-shadow')}>
            {splitAndCapitalize(move.name, '_', ' ')}
          </span>
        </span>
      </div>
    );
  };

  const timelinePokemon = (entry: ITimeline, team: IPokemonBattle[]) => team[entry.activeIndex ?? 0] ?? team[0];

  const renderPokemonIcon = (pokemon: IPokemonBattle | undefined) => (
    <PokemonTableIcon
      {...pokemon?.pokemonData?.pokemon}
      className="tw-mx-0.5"
      num={pokemon?.pokemonData?.id ?? 0}
      name={pokemon?.pokemonData?.name}
      form={pokemon?.pokemonData?.form}
      pokemonType={pokemon?.pokemonType}
      size={30}
    />
  );

  const renderActionLabel = (
    label: string,
    entry: ITimeline,
    index: number,
    team: IPokemonBattle[],
    timeline: ITimeline[]
  ) => (
    <span className="tw-flex tw-items-center tw-justify-center tw-gap-1 tw-text-sm">
      {entry.switchedFromIndex !== undefined ? (
        <TimelineTeamEvent entry={entry} index={index} team={team} timeline={timeline} />
      ) : (
        renderPokemonIcon(timelinePokemon(entry, team))
      )}
      <b>{label}</b>
    </span>
  );

  const resultClasses =
    'tw-flex tw-h-12 tw-w-full tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded tw-p-2.5 tw-text-center tw-font-bold tw-text-white';

  const renderResultLabel = (
    label: React.ReactNode,
    entry: ITimeline,
    index: number,
    team: IPokemonBattle[],
    timeline: ITimeline[],
    fainted = false
  ) => (
    <span className="tw-flex tw-items-center tw-justify-center tw-gap-1.5">
      {fainted ? (
        <TimelineTeamEvent entry={entry} index={index} team={team} timeline={timeline} />
      ) : (
        renderPokemonIcon(timelinePokemon(entry, team))
      )}
      <span>{label}</span>
    </span>
  );

  const turnRowClasses = (end: boolean) =>
    combineClasses(
      'tw-flex tw-min-h-24 tw-w-full tw-items-center tw-border-0 tw-border-t tw-border-solid tw-border-[var(--custom-table-background-sub-head-border)] tw-px-2 tw-py-1',
      end ? 'tw-justify-end' : 'tw-justify-start'
    );

  const renderTapBadge = () => (
    <span className="tw-shrink-0 tw-rounded-full tw-bg-primary tw-px-2 tw-py-1 tw-text-caption tw-leading-none tw-text-revert">
      Tap
    </span>
  );

  const renderTimeline = (pokeCurr: IPokemonBattle, pokeObj: IPokemonBattle, team: IPokemonBattle[], end = false) => (
    <Fragment>
      {pokeCurr.timeline.map((value, index) => (
        <div className={turnRowClasses(end)} data-timeline-turn={value.timer} key={index}>
          {value.type === AttackType.Block && (
            <div className="tw-flex tw-items-center tw-gap-1.5">
              {renderPokemonIcon(timelinePokemon(value, team))}
              <div className="block-attack-container">
                <img
                  className="block-spirit-timeline"
                  alt="Image Shield"
                  src={APIService.getPokeOtherLeague('ShieldButton')}
                />
              </div>
              <span className="tw-text-success">
                x{value.block}
                <span className="dec-block">-1</span>
              </span>
            </div>
          )}
          {value.type === AttackType.Fast && (
            <div className="tw-flex tw-items-center tw-gap-2">
              {!end && value.isTap && renderTapBadge()}
              <div
                className={combineClasses(
                  'fast-attack-content tw-flex tw-flex-col tw-items-center tw-gap-1 tw-text-center',
                  value.color
                )}
              >
                <span className="tw-text-yellow-600 text-shadow-black">
                  {renderActionLabel('Fast Attack!', value, index, team, pokeCurr.timeline)}
                </span>
                {renderMoveBadgeBorder(value.move, false, true)}
              </div>
              {end && value.isTap && renderTapBadge()}
            </div>
          )}
          {value.type === AttackType.Wait && (
            <div
              className={combineClasses(
                pokeCurr.timeline.at(index - 1) && pokeCurr.timeline.at(index - 1)?.isDmgImmune
                  ? 'fast-attack-container'
                  : 'wait-attack-container',
                '!tw-flex !tw-h-auto tw-items-center tw-gap-2'
              )}
            >
              {!end && value.isTap && renderTapBadge()}
              {pokeCurr.timeline.at(index - 1) && pokeCurr.timeline.at(index - 1)?.isDmgImmune ? (
                <div
                  className={combineClasses(
                    'fast-attack-content tw-flex tw-flex-col tw-items-center tw-gap-1 tw-text-center',
                    value.move?.type?.toLowerCase()
                  )}
                >
                  <span className="tw-text-yellow-600 text-shadow-black">
                    {renderActionLabel('Fast Attack!', value, index, team, pokeCurr.timeline)}
                  </span>
                  {renderMoveBadgeBorder(value.move, false, true)}
                </div>
              ) : (
                <Fragment>
                  {value.isTap && (
                    <div className="tw-flex tw-flex-col tw-items-center tw-gap-1">
                      {renderActionLabel('Fast Attack!', value, index, team, pokeCurr.timeline)}
                      {renderMoveBadgeBorder(value.move, true)}
                    </div>
                  )}
                </Fragment>
              )}
              {end && value.isTap && renderTapBadge()}
            </div>
          )}
          {value.type === AttackType.Prepare && (
            <div
              className={combineClasses(
                'swipe-attack-container tw-flex tw-flex-col tw-items-center tw-gap-1',
                `${value.color}-border`,
                'tw-text-center'
              )}
            >
              {renderActionLabel('Swipe Charge', value, index, team, pokeCurr.timeline)}
              <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
            </div>
          )}
          {value.type === AttackType.Switch && (
            <div className="tw-flex tw-items-center tw-text-primary">
              <TimelineTeamEvent entry={value} index={index} team={team} timeline={pokeCurr.timeline} />
            </div>
          )}
          {value.type === AttackType.Charge && (
            <div className="charged-attack-container !tw-h-auto">
              <div
                className={combineClasses(
                  'charged-attack-content tw-flex tw-flex-col tw-items-center tw-gap-1 tw-text-center',
                  value.color
                )}
              >
                <span className="tw-text-yellow-600 text-shadow-black">
                  {renderActionLabel('Charged Attack!', value, index, team, pokeCurr.timeline)}
                </span>
                {renderMoveBadgeBorder(value.move, false, true)}
              </div>
            </div>
          )}
          {value.type === AttackType.Dead &&
          pokeObj.timeline.at(index) &&
          pokeObj.timeline.at(index)?.type === AttackType.Dead ? (
            <div className={combineClasses(resultClasses, 'bg-dark')}>
              {renderResultLabel('TIE!', value, index, team, pokeCurr.timeline, true)}
            </div>
          ) : (
            <Fragment>
              {value.type === AttackType.Win && (
                <div className={combineClasses(resultClasses, '!tw-bg-green-600')}>
                  {renderResultLabel('WIN!', value, index, team, pokeCurr.timeline)}
                </div>
              )}
              {value.type === AttackType.Dead && (
                <div className={combineClasses(resultClasses, '!tw-bg-red-600')}>
                  {renderResultLabel('LOSE!', value, index, team, pokeCurr.timeline, true)}
                </div>
              )}
              {value.type === AttackType.Timeout && (
                <div
                  className={combineClasses(
                    resultClasses,
                    value.outcome === 'win'
                      ? '!tw-bg-green-600'
                      : value.outcome === 'lose'
                        ? '!tw-bg-red-600'
                        : 'bg-dark'
                  )}
                >
                  {renderResultLabel(
                    <Fragment>
                      {value.outcome === 'win' ? 'WIN!' : value.outcome === 'lose' ? 'LOSE!' : 'TIE!'}
                      <span className="tw-ml-1 tw-text-xs">(TIME)</span>
                    </Fragment>,
                    value,
                    index,
                    team,
                    pokeCurr.timeline
                  )}
                </div>
              )}
            </Fragment>
          )}
        </div>
      ))}
    </Fragment>
  );

  return (
    <Fragment>
      {!isHide && (
        <div className="tw-flex timeline-vertical battle-container">
          <div className="tw-w-1/2">
            <div className="tw-flex tw-flex-col">{renderTimeline(pokemonCurr, pokemonObj, playerTeam)}</div>
          </div>
          <div className="tw-w-1/2">
            <div className="tw-flex tw-flex-col tw-items-end">
              {renderTimeline(pokemonObj, pokemonCurr, opponentTeam, true)}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineVertical;
