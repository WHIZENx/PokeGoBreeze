import React, { Fragment } from 'react';
import { Badge } from '@mui/material';
import { ICombat } from '../../../../core/models/combat.model';
import APIService from '../../../../services/api.service';
import { combineClasses } from '../../../../utils/extension';
import { splitAndCapitalize } from '../../../../utils/utils';
import { IPokemonBattle } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';

const TimelineVertical = (pokemonCurr: IPokemonBattle, pokemonObj: IPokemonBattle, isHide = false) => {
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

  const renderTimeline = (pokeCurr: IPokemonBattle, pokeObj: IPokemonBattle, end = false) => (
    <Fragment>
      {pokeCurr.timeline.map((value, index) => (
        <Fragment key={index}>
          {pokeObj.timeline.at(index) && pokeObj.timeline.at(index)?.type === AttackType.Charge && (
            <Fragment>
              {value.type === AttackType.Block ? (
                <div
                  style={{ height: 80 }}
                  className={combineClasses('tw-flex tw-items-center turn-battle', end ? 'tw-justify-end' : '')}
                >
                  <div className="block-attack-container">
                    <img
                      className="block-spirit-timeline"
                      alt="Image Shield"
                      src={APIService.getPokeOtherLeague('ShieldButton')}
                    />
                  </div>
                  <span className="tw-text-green-600">
                    x{value.block}
                    <span className="dec-block">-1</span>
                  </span>
                </div>
              ) : (
                <div className={combineClasses('wait-attack-container turn-battle', end ? 'tw-justify-end' : '')} />
              )}
            </Fragment>
          )}
          {value.type === AttackType.Fast && (
            <Badge
              color="primary"
              overlap="circular"
              badgeContent={value.isTap ? 'Tap' : undefined}
              className={combineClasses('fast-attack-container turn-battle', end ? 'tw-justify-end' : '')}
              anchorOrigin={{
                vertical: 'top',
                horizontal: end ? 'right' : 'left',
              }}
            >
              <div className={combineClasses('fast-attack-content tw-text-center', value.color)}>
                <span className="tw-text-yellow-600 text-shadow-black tw-text-sm">
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
                end ? 'tw-justify-end' : '',
                'turn-battle'
              )}
              anchorOrigin={{
                vertical: 'top',
                horizontal: end ? 'right' : 'left',
              }}
            >
              {pokeCurr.timeline.at(index - 1) && pokeCurr.timeline.at(index - 1)?.isDmgImmune ? (
                <div className={combineClasses('fast-attack-content tw-text-center', value.move?.type?.toLowerCase())}>
                  <span className="tw-text-sm tw-text-yellow-600 text-shadow-black">
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
              className={combineClasses('tw-flex tw-items-center turn-battle', end ? 'tw-justify-end' : '')}
            >
              <div className={combineClasses('swipe-attack-container', `${value.color}-border`, 'tw-text-center')}>
                <span className="tw-text-sm">
                  <b>Swipe Charge</b>
                </span>
                <Fragment>{renderMoveBadgeBorder(value.move, false, true)}</Fragment>
              </div>
            </div>
          )}
          {value.type === AttackType.Charge && (
            <div className={combineClasses('charged-attack-container turn-battle', end ? 'tw-justify-end' : '')}>
              <div className={combineClasses('charged-attack-content tw-text-center', value.color)}>
                <span className="tw-text-yellow-600 text-shadow-black">
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
                'winner-container bg-dark tw-text-white turn-battle',
                end ? 'tw-justify-end' : ''
              )}
            >
              TIE!
            </div>
          ) : (
            <Fragment>
              {value.type === AttackType.Win && (
                <div
                  className={combineClasses(
                    'winner-container bg-success tw-text-white turn-battle',
                    end ? 'tw-justify-end' : ''
                  )}
                >
                  WIN!
                </div>
              )}
              {value.type === AttackType.Dead && (
                <div
                  className={combineClasses(
                    'loser-container bg-danger tw-text-white turn-battle',
                    end ? 'tw-justify-end' : ''
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
        <div className="tw-flex timeline-vertical battle-container">
          <div className="tw-w-1/2">
            <div className="tw-flex tw-flex-col tw-gap-2">{renderTimeline(pokemonCurr, pokemonObj)}</div>
          </div>
          <div className="tw-w-1/2">
            <div className="tw-flex tw-flex-col tw-items-end tw-gap-2">
              {renderTimeline(pokemonObj, pokemonCurr, true)}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default TimelineVertical;
