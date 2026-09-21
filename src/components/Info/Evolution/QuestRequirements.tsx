import React from 'react';
import PetsIcon from '@mui/icons-material/Pets';
import type { IEvolutionRequirement } from '../../../core/models/evolution.model';
import IconType from '../../Sprites/Icon/Type/Type';

const labels: Record<string, string> = {
  QUEST_CATCH_POKEMON: 'Catch',
  QUEST_COMPLETE_BATTLE: 'Battles',
  QUEST_COMPLETE_RAID_BATTLE: 'Raids',
  QUEST_FIGHT_POKEMON: 'Battle',
  QUEST_LAND_THROW: 'Throws',
  QUEST_BUDDY_EARN_AFFECTION_POINTS: 'Hearts',
  QUEST_BUDDY_FEED: 'Feeds',
  QUEST_BUDDY_EVOLUTION_WALK: 'km',
  QUEST_USE_INCENSE: 'Incense',
};

const QuestRequirements = ({ requirements }: { requirements: IEvolutionRequirement[] }) => (
  <>
    {requirements
      .filter((requirement) => requirement.type !== 'QUEST_BUDDY_EVOLUTION_WALK')
      .map((requirement, index) => {
        const conditions = requirement.conditions as Array<{
          type?: string;
          withPokemonType?: { pokemonType?: string[] };
          withCombatType?: { combatType?: string[] };
          withThrowType?: { throwType?: string };
          withOpponentPokemonBattleStatus?: { requireDefeat?: boolean; opponentPokemonType?: string[] };
        }>;
        const types = [
          ...new Set(
            conditions.flatMap(
              (condition) =>
                condition.withPokemonType?.pokemonType ??
                condition.withOpponentPokemonBattleStatus?.opponentPokemonType ??
                []
            )
          ),
        ];
        const combats = conditions.flatMap((condition) => condition.withCombatType?.combatType ?? []);
        const win = conditions.some((condition) =>
          ['WITH_WIN_BATTLE_STATUS', 'WITH_WIN_RAID_STATUS'].includes(condition.type ?? '')
        );
        const defeat = conditions.some((condition) => condition.withOpponentPokemonBattleStatus?.requireDefeat);
        const throwType = conditions
          .find((condition) => condition.withThrowType)
          ?.withThrowType?.throwType?.replace('ACTIVITY_CATCH_', '')
          .replace('_THROW', '')
          .toLowerCase();
        const battleLabel = combats.length
          ? [
              ...new Set(
                combats.map(
                  (combat) =>
                    ({ COMBAT_TYPE_RAID: 'Raids', COMBAT_TYPE_DMAX: 'Max Battles', COMBAT_TYPE_GMAX: 'Max Battles' })[
                      combat
                    ] ?? combat
                )
              ),
            ].join(' / ')
          : (labels[requirement.type ?? ''] ?? 'Task · Check in game');
        const unsupported = conditions.some(
          (condition) =>
            ![
              'WITH_POKEMON_TYPE',
              'WITH_COMBAT_TYPE',
              'WITH_THROW_TYPE',
              'WITH_WIN_BATTLE_STATUS',
              'WITH_WIN_RAID_STATUS',
              'WITH_OPPONENT_POKEMON_BATTLE_STATUS',
            ].includes(condition.type ?? '')
        );
        return (
          <span key={`${requirement.templateId}-${index}`} className="caption evo-quest-detail">
            <span className="evo-quest-action">
              {win ? 'Win ' : defeat ? 'Defeat ' : ''}
              {requirement.goal} {throwType ? `${throwType} ` : ''}
              {battleLabel}
            </span>
            <span className="evo-quest-conditions">
              {types.map((type, typeIndex) => (
                <React.Fragment key={type}>
                  {typeIndex > 0 && <span>/</span>}
                  <IconType
                    width={20}
                    height={20}
                    type={type.replace('POKEMON_TYPE_', '')}
                    alt={type.replace('POKEMON_TYPE_', '')}
                  />
                </React.Fragment>
              ))}
              <PetsIcon fontSize="small" titleAccess="With this Pokémon as Buddy" />
            </span>
            {unsupported && <span>Check in game</span>}
          </span>
        );
      })}
  </>
);

export default QuestRequirements;
