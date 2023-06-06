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
export const PRIMAL_STATS = {
  attack: 353,
  defense: 268,
  stamina: 218,
};
