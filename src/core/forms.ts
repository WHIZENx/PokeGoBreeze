// Pokemon GO Forms
const GO_FORMS = [
  {
    default_id: 150,
    default_name: 'mewtwo',
    name: 'mewtwo',
    form: {
      form_name: 'armor',
      form_names: [],
      form_order: 4,
      id: null,
      is_battle_only: true,
      is_default: true,
      is_mega: false,
      name: 'mewtwo-armor',
      version_group: { name: 'Pokémon-GO' },
      types: [{ type: { name: 'psychic' } }],
    },
  },
];

export const getFormsGO = (id: number) => {
  return GO_FORMS.filter((pokemon) => pokemon.default_id === id);
};

// Pokemon GO Stats Change
interface PokeGOStats {
  id: string;
  attack: number;
  defense: number;
  stamina: number;
}

const PRIMAL_STATS: PokeGOStats = {
  id: 'primal',
  attack: 353,
  defense: 268,
  stamina: 218,
};

const MEGA_RAYQUAZA: PokeGOStats = {
  id: 'rayquaza-mega',
  attack: 377,
  defense: 210,
  stamina: 227,
};

const pokeGOStats: PokeGOStats[] = [PRIMAL_STATS, MEGA_RAYQUAZA];

export const findStatsPokeGO = (id: string | undefined) => {
  if (!id) {
    return null;
  }
  return pokeGOStats.find((pokemon) => id.includes(pokemon.id));
};
