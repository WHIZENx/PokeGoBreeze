import React from 'react';
import PetsIcon from '@mui/icons-material/Pets';
import CallMadeIcon from '@mui/icons-material/CallMade';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import StadiumIcon from '@mui/icons-material/Stadium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { IEvolutionRequirement } from '../../../core/models/evolution.model';
import IconType from '../../Sprites/Icon/Type/Type';
import APIService from '../../../services/api.service';
import { getItemSpritePath } from '../../../utils/utils';
import { ItemName } from '../../../pages/News/enums/item-type.enum';

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

const iconKeys: Record<string, string> = {
  QUEST_CATCH_POKEMON: 'catch',
  QUEST_COMPLETE_BATTLE: 'complete-battle',
  QUEST_COMPLETE_RAID_BATTLE: 'raid',
  QUEST_FIGHT_POKEMON: 'battle-pokemon',
  QUEST_LAND_THROW: 'throw',
  QUEST_BUDDY_EARN_AFFECTION_POINTS: 'buddy-hearts',
  QUEST_BUDDY_FEED: 'buddy-feed',
  QUEST_USE_INCENSE: 'incense',
};

const requirementIcon = (type: string | undefined) => {
  switch (type) {
    case 'QUEST_CATCH_POKEMON':
      return <img alt="Pokémon" height={20} src={APIService.getPokeSprite()} />;
    case 'QUEST_COMPLETE_RAID_BATTLE':
      return <StadiumIcon fontSize="small" />;
    case 'QUEST_COMPLETE_BATTLE':
      return <EmojiEventsIcon fontSize="small" />;
    case 'QUEST_FIGHT_POKEMON':
      return <SportsMartialArtsIcon fontSize="small" />;
    case 'QUEST_LAND_THROW':
      return <CallMadeIcon fontSize="small" />;
    case 'QUEST_BUDDY_EARN_AFFECTION_POINTS':
      return <FavoriteIcon className="tw-text-accent-red" fontSize="small" />;
    case 'QUEST_BUDDY_FEED':
      return <RestaurantIcon fontSize="small" />;
    case 'QUEST_USE_INCENSE':
      return <img alt="Incense" width={20} height={20} src={getItemSpritePath(ItemName.Incense)} />;
    default:
      return null;
  }
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
          <span
            key={`${requirement.templateId}-${index}`}
            className="caption evo-quest-detail"
            data-evolution-detail-condition={requirement.type}
            data-evolution-icon={iconKeys[requirement.type ?? ''] ?? 'unknown-task'}
          >
            <span className="evo-quest-action">
              {requirementIcon(requirement.type)}
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
