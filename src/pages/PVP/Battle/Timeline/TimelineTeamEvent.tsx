import React from 'react';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CloseIcon from '@mui/icons-material/Close';

import PokemonTableIcon from '../../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';

interface TimelineTeamEventProps {
  entry: ITimeline;
  index: number;
  team: IPokemonBattle[];
  timeline: ITimeline[];
}

const normalizeName = (value?: string) => value?.toLowerCase().replaceAll(/[^a-z0-9]+/g, '') ?? '';
const formatName = (value: string) =>
  value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');

const TimelineTeamEvent = ({ entry, index, team, timeline }: TimelineTeamEventProps) => {
  const hasSwitch = entry.type === AttackType.Switch || entry.switchedFromIndex !== undefined;
  const hasFaint = entry.faintedIndex !== undefined || entry.type === AttackType.Dead;
  const isSwitch = hasSwitch;
  const isFaint = hasFaint;
  if (!isSwitch && !isFaint) {
    return null;
  }

  const previousEntry = timeline.slice(0, index).findLast((value) => value.activeIndex !== undefined);
  const previousIndex = previousEntry?.activeIndex ?? 0;
  const namedTargetIndex = team.findIndex(
    (pokemon) => normalizeName(pokemon.pokemonData?.name) === normalizeName(entry.pokemonName)
  );
  const targetIndex = entry.activeIndex ?? (namedTargetIndex >= 0 ? namedTargetIndex : previousIndex);
  const sourceIndex =
    entry.faintedIndex ?? entry.switchedFromIndex ?? (entry.type === AttackType.Dead ? targetIndex : previousIndex);
  const source = team[sourceIndex];
  const target = team[targetIndex];
  const sourceName =
    source?.pokemonData?.name ??
    entry.faintedPokemonName ??
    entry.switchedFromPokemonName ??
    entry.pokemonName ??
    'Pokémon';
  const targetName = target?.pokemonData?.name ?? entry.pokemonName ?? 'Pokémon';
  const label = isSwitch
    ? `${formatName(sourceName)}${isFaint ? ' fainted and' : ''} switched to ${formatName(targetName)}`
    : `${formatName(sourceName)} fainted`;

  const renderPokemonIcon = (pokemon: IPokemonBattle | undefined, fainted = false) => (
    <span className="tw-relative tw-flex tw-h-6 tw-w-7 tw-items-center tw-justify-center">
      <PokemonTableIcon
        {...pokemon?.pokemonData?.pokemon}
        num={pokemon?.pokemonData?.id ?? 0}
        name={pokemon?.pokemonData?.name}
        form={pokemon?.pokemonData?.form}
        pokemonType={pokemon?.pokemonType}
        size={26}
      />
      {fainted && (
        <CloseIcon
          className="tw-absolute -tw-right-1 -tw-top-1 tw-rounded-full tw-bg-[var(--background-table-hover)] !tw-text-error"
          sx={{ fontSize: 14 }}
        />
      )}
    </span>
  );

  return (
    <span
      aria-label={label}
      className="tw-relative tw-z-20 tw-inline-flex tw-items-center tw-gap-0.5 tw-rounded tw-bg-[var(--background-table-hover)] tw-px-1"
      data-timeline-event={isSwitch ? 'switch' : 'faint'}
      role="img"
    >
      {renderPokemonIcon(source, isFaint)}
      {isSwitch && (
        <>
          <ArrowRightAltIcon className="tw-shrink-0 tw-text-primary" sx={{ fontSize: 16 }} />
          {renderPokemonIcon(target)}
        </>
      )}
    </span>
  );
};

export default TimelineTeamEvent;
