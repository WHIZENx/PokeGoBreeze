import type { IPokemonQueryRankMove } from '../../../utils/models/pokemon-top-move.model';
import type { PokemonForm } from './form.model';
import type { PokemonInfo, PokemonInfoEvo } from './info.model';
import type { Species } from './species.model';
import type { IAsset } from '../asset.model';
import type { IEvolutionChain } from '../evolution-chain.model';
import type { ICombat } from '../combat.model';
import type { PokemonType } from '../../../enums/type.enum';

export interface PokemonBundleVariety {
  pokemon: PokemonInfo;
  forms: PokemonForm[];
}

export interface PokemonFusionOption {
  baseId: number;
  baseName: string;
  targetName: string;
  targetForm: string;
  targetPokemonType: PokemonType;
}

export interface PokemonGoFormCatalogEntry {
  num: number;
  name?: string;
  fullName?: string;
  form?: string;
  pokemonType?: PokemonType;
  types?: string[];
  releasedGO?: boolean;
  encounterSummary?: PokemonEncounterSummary;
  asset?: {
    default: string;
    shiny?: string;
  } | null;
}

export interface PokemonEncounterSummary {
  cp?: {
    research?: { level: 15; min: number; max: number };
    raidOrEgg?: { level: 20; min: number; max: number };
    weatherBoost?: { level: 25; min: number; max: number };
    level40?: { level: 40; max: number };
    level50?: { level: 50; max: number };
    bestBuddy?: { level: 51; max: number };
  };
  encounter?: {
    baseCaptureRate?: number;
    baseFleeRate?: number;
    movementType?: string;
    attackProbability?: number;
    dodgeProbability?: number;
  };
  availability: {
    tradable?: boolean;
    deployable?: boolean;
    pokemonHome?: boolean;
    shadowAvailable: boolean;
  };
}

export interface PokemonMoveRanking {
  num: number;
  form?: string;
  fullName?: string;
  pokemonType: PokemonType;
  moves: PokemonMoves;
  bestMoves: IPokemonQueryRankMove;
}

export interface PokemonMoves {
  fastMoves: ICombat[];
  chargedMoves: ICombat[];
  eliteFastMoves: ICombat[];
  eliteChargedMoves: ICombat[];
  purifiedMoves: ICombat[];
  shadowMoves: ICombat[];
  specialMoves: ICombat[];
  exclusiveMoves: ICombat[];
  dynamaxMoves: ICombat[];
}

export interface PokemonBundle {
  species: Species;
  varieties: PokemonBundleVariety[];
  evolutionChain: PokemonInfoEvo | null;
  moveRankings?: PokemonMoveRanking[];
  pokemonGo?: {
    forms?: PokemonGoFormCatalogEntry[];
    fusionOptions?: PokemonFusionOption[];
    asset: IAsset | null;
    evolutionChains: IEvolutionChain[];
  };
}
