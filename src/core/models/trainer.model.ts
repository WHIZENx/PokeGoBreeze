export interface AwardItem {
  name: string;
  amount: number;
}

export interface ITrainerLevelUp {
  level: number;
  items: AwardItem[];
  itemsUnlock?: string[];
}

export interface ITrainerBattlePokemonPreset {
  pokemonId: string;
  form?: string;
}

export interface ITrainerBattlePersonality {
  id: string;
  superEffectiveChance: number;
  specialChance: number;
  defensiveMinimumScore?: number;
  defensiveMaximumScore?: number;
  offensiveMinimumScore?: number;
  offensiveMaximumScore?: number;
}

export interface ITrainerBattlePreset {
  id: string;
  trainer: string;
  league: 'great' | 'ultra' | 'master';
  leagueTemplateId: string;
  personality: ITrainerBattlePersonality;
  trainerNameKey: string;
  trainerTitleKey?: string;
  trainerQuoteKey?: string;
  iconUrl?: string;
  backdropImageBundle?: string;
  pokemon: ITrainerBattlePokemonPreset[];
}

export class TrainerLevelUp implements ITrainerLevelUp {
  level = 0;
  items: AwardItem[] = [];
  itemsUnlock?: string[];

  static create(value: ITrainerLevelUp) {
    const obj = new TrainerLevelUp();
    Object.assign(obj, value);
    return obj;
  }
}
