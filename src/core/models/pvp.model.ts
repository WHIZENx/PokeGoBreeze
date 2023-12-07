export interface PVPDataModel {
  rankings: PVPInfo[];
  trains: PVPInfo[];
}

interface PVPInfo {
  id: string;
  name: string;
  cp: number[];
  logo: string | null;
}

export interface TeamsPVP {
  performers: Performers[];
  properties: Properties;
  teams: Teams[];
}

interface Performers {
  games: number;
  individualScore: number;
  pokemon: string;
  teamScore: number;
}

interface Properties {
  lastUpdated: string;
  totalPerformers: number;
  totalTeams: number;
}

interface Teams {
  games: number;
  team: string;
  teamScore: number;
}

export interface RankingsPVP {
  counters: PokemonVersus[];
  matchups: PokemonVersus[];
  moves: {
    chargedMoves: PokemonRankingMove[];
    fastMoves: PokemonRankingMove[];
  };
  moveset: string[];
  rating: number;
  score: number;
  scores: number[];
  speciesId: string;
  speciesName: string;
  stats: PokemonRankingStats;
}

interface PokemonVersus {
  opponent: string;
  rating: number;
}

interface PokemonRankingMove {
  moveId: string;
  uses: number | null;
}

interface PokemonRankingStats {
  product?: number;
  atk: number;
  def: number;
  hp?: number;
}
