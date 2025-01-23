export interface EvoPath {
  url: string;
}

export interface Species {
  base_happiness: number;
  capture_rate: number;
  color: Path;
  egg_groups: Path[];
  evolution_chain: EvoPath;
  evolves_from_species: string | null;
  flavor_text_entries: FlavorText[];
  form_descriptions: [];
  forms_switchable: boolean;
  gender_rate: number;
  genera: Genera[];
  generation: Path;
  growth_rate: Path;
  habitat: Path;
  has_gender_differences: boolean;
  hatch_counter: number;
  id: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  name: string;
  names: Name[];
  order: number;
  pal_park_encounters: PalPark[];
  pokedex_numbers: Pokedex[];
  shape: Path;
  varieties: Variety[];
}

export interface Path {
  name: string;
  url: string;
}

interface FlavorText {
  flavor_text: string;
  language: Path;
  version: Path;
}

interface Genera {
  genus: string;
  language: Path;
}

interface Name {
  language: Path;
  name: string;
}

interface PalPark {
  area: Path;
  base_score: number;
  rate: number;
}

interface Pokedex {
  entry_number: number;
  pokedex: Path;
}

interface Variety {
  is_default: boolean;
  pokemon: Path;
}
