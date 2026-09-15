import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import SelectCardMove from '../../components/Commons/Selects/SelectCardMove';
import { SelectMovePokemonModel } from '../../components/Commons/Inputs/models/select-move.model';
import { ICombat } from '../../core/models/combat.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { getMoveType } from '../../utils/utils';

export interface TrainerMoveSelection {
  fastMove?: string;
  chargedMoves: [string | undefined, string | undefined];
}

interface TrainerMoveSelectProps {
  pokemon: IPokemonData;
  combats: ICombat[];
  selection: TrainerMoveSelection;
  onChange: (selection: TrainerMoveSelection) => void;
}

const normalize = (value: string) => value.toUpperCase().replaceAll('-', '_');
const unique = (values: Array<string | undefined>) => [...new Set(values.filter((value): value is string => !!value))];

export const createDefaultTrainerMoveSelection = (pokemon: IPokemonData): TrainerMoveSelection => {
  const chargedMoves = unique([...(pokemon.cinematicMoves ?? []), ...(pokemon.eliteCinematicMoves ?? [])]).slice(0, 2);
  return {
    fastMove: unique([...(pokemon.quickMoves ?? []), ...(pokemon.eliteQuickMoves ?? [])])[0],
    chargedMoves: [chargedMoves[0], chargedMoves[1]],
  };
};

const TrainerMoveSelect = ({ pokemon, combats, selection, onChange }: TrainerMoveSelectProps) => {
  const combatByName = useMemo(() => new Map(combats.map((move) => [normalize(move.name), move])), [combats]);
  const selectPokemon = useMemo(
    () => new SelectMovePokemonModel(pokemon.num, pokemon.form, pokemon.pokemonType),
    [pokemon.form, pokemon.num, pokemon.pokemonType]
  );

  const resolveMoves = (names: string[]) =>
    unique(names).flatMap((name) => {
      const move = combatByName.get(normalize(name));
      return move ? [{ ...move, moveType: getMoveType(pokemon, name) }] : [];
    });

  const fastMoves = useMemo(
    () => resolveMoves([...(pokemon.quickMoves ?? []), ...(pokemon.eliteQuickMoves ?? [])]),
    [combatByName, pokemon]
  );
  const chargedMoves = useMemo(
    () =>
      resolveMoves([
        ...(pokemon.cinematicMoves ?? []),
        ...(pokemon.eliteCinematicMoves ?? []),
        ...(pokemon.shadowMoves ?? []),
        ...(pokemon.purifiedMoves ?? []),
        ...(pokemon.specialMoves ?? []),
        ...(pokemon.exclusiveMoves ?? []),
        ...(pokemon.dynamaxMoves ?? []),
      ]),
    [combatByName, pokemon]
  );

  const selectedFastMove = fastMoves.find((move) => normalize(move.name) === normalize(selection.fastMove ?? ''));
  const selectedChargedMoves = selection.chargedMoves.map((name) =>
    chargedMoves.find((move) => normalize(move.name) === normalize(name ?? ''))
  );

  const setChargedMove = (index: number, move?: ICombat) => {
    const nextMoves: TrainerMoveSelection['chargedMoves'] = [...selection.chargedMoves];
    nextMoves[index] = move?.name;
    onChange({ ...selection, chargedMoves: nextMoves });
  };

  return (
    <Box className="trainer-slot-moves">
      <Box>
        <Typography variant="caption" fontWeight={700}>
          Fast Move
        </Typography>
        <SelectCardMove<ICombat>
          isHideEmpty
          pokemon={selectPokemon}
          move={selectedFastMove}
          moves={fastMoves}
          setMovePokemon={(move) => onChange({ ...selection, fastMove: move?.name })}
        />
      </Box>
      {([0, 1] as const).map((index) => (
        <Box key={index}>
          <Typography variant="caption" fontWeight={700}>
            Charged Move {index + 1}
          </Typography>
          <SelectCardMove<ICombat>
            isHideEmpty
            pokemon={selectPokemon}
            move={selectedChargedMoves[index]}
            moves={chargedMoves.filter(
              (move) =>
                !selection.chargedMoves.some(
                  (selected, selectedIndex) =>
                    selectedIndex !== index && normalize(selected ?? '') === normalize(move.name)
                )
            )}
            setMovePokemon={(move) => setChargedMove(index, move)}
            clearData={index === 1 ? () => undefined : undefined}
          />
        </Box>
      ))}
    </Box>
  );
};

export default TrainerMoveSelect;
