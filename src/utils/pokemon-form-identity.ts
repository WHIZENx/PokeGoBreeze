export interface PokemonGoFormIdentity {
  num: number;
  name?: string;
  form?: string | number;
  fullName?: string;
  pokemonType?: number;
  types?: string[];
  hasShadowForm?: boolean;
  releasedGO?: boolean;
  quickMoves?: unknown[];
  cinematicMoves?: unknown[];
}

export const hasPokemonGoBattleModifierCatalog = (pokemons: PokemonGoFormIdentity[]) =>
  pokemons.some((pokemon) => pokemon.pokemonType === 2 || pokemon.pokemonType === 3);

interface PokemonFormSelectionIdentity {
  defaultId?: number;
  form?: {
    name?: string;
    formName?: string;
    pokemonType?: number;
  };
}

const normalizeSelectionIdentity = (value: string | undefined) =>
  (value ?? '').trim().replaceAll('-', '_').replaceAll(' ', '_').toUpperCase();

export const deduplicatePokemonFormSelections = <T extends PokemonFormSelectionIdentity>(groups: T[][]) => {
  const seen = new Set<string>();
  return groups
    .map((group) =>
      group.filter((selection) => {
        const form = selection.form;
        const identity = normalizePokemonFormIdentity(
          selection.defaultId ?? 0,
          normalizeSelectionIdentity(form?.name) || normalizeSelectionIdentity(form?.formName)
        );
        const key = `${form?.pokemonType ?? 0}:${identity}`;
        if (!identity || !seen.has(key)) {
          seen.add(key);
          return true;
        }
        return false;
      })
    )
    .filter((group) => group.length > 0);
};

const canonicalDefaultFormById: Readonly<Record<number, string>> = {
  664: 'ICY_SNOW',
  665: 'ICY_SNOW',
  875: 'ICE',
  877: 'FULL_BELLY',
  925: 'FAMILY_OF_FOUR',
  931: 'GREEN',
  964: 'ZERO',
  978: 'CURLY',
  982: 'TWO',
  1007: 'APEX_BUILD',
  1008: 'ULTIMATE_MODE',
  1012: 'COUNTERFEIT',
  1013: 'UNREMARKABLE',
};

const maleDefaultFormIds = new Set([592, 593, 668, 678, 902, 916]);

export const normalizePokemonFormIdentity = (id: number, value: string | number | undefined) => {
  let identity = String(value ?? '')
    .trim()
    .replaceAll('-', '_')
    .replaceAll(' ', '_')
    .toUpperCase()
    .replace(/(^|_)GALAR(?=_|$)/g, '$1GALARIAN')
    .replace(/(^|_)HISUI(?=_|$)/g, '$1HISUIAN')
    .replace(/(^|_)POKE_BALL(?=_|$)/g, '$1POKEBALL');

  if (id === 25) {
    identity = identity.replace(/_CAP$/, '').replace(/^CAP$/, 'NORMAL');
  } else if (id === 128) {
    identity = identity.replace(/_BREED$/, '');
  } else if (id === 422 || id === 423) {
    identity = identity
      .replace(/_WEST$/, '_WEST_SEA')
      .replace(/^WEST$/, 'WEST_SEA')
      .replace(/_EAST$/, '_EAST_SEA')
      .replace(/^EAST$/, 'EAST_SEA');
  } else if (id === 555) {
    identity = identity.replace(/_GALARIAN_STANDARD$/, '_GALARIAN').replace(/^GALARIAN_STANDARD$/, 'GALARIAN');
  } else if (maleDefaultFormIds.has(id)) {
    identity = identity.replace(/_MALE$/, '').replace(/^MALE$/, 'NORMAL');
  }

  if (id === 718) {
    identity = identity.replace(/_10$/, '_TEN_PERCENT').replace(/_50$/, '_FIFTY_PERCENT');
    identity = identity.replace(/^10$/, 'TEN_PERCENT').replace(/^50$/, 'FIFTY_PERCENT');
  } else if (id === 741) {
    identity = identity.replace(/POM_POM$/, 'POMPOM');
  } else if (id === 801) {
    identity = identity.replace(/_ORIGINAL$/, '_ORIGINAL_COLOR').replace(/^ORIGINAL$/, 'ORIGINAL_COLOR');
  } else if (id === 888) {
    identity = identity.replace(/_CROWNED$/, '_CROWNED_SWORD').replace(/^CROWNED$/, 'CROWNED_SWORD');
  } else if (id === 889) {
    identity = identity.replace(/_CROWNED$/, '_CROWNED_SHIELD').replace(/^CROWNED$/, 'CROWNED_SHIELD');
  } else if (id === 898) {
    identity = identity.replace(/_ICE$/, '_ICE_RIDER').replace(/^ICE$/, 'ICE_RIDER');
    identity = identity.replace(/_SHADOW$/, '_SHADOW_RIDER').replace(/^SHADOW$/, 'SHADOW_RIDER');
  } else if (id === 20) {
    identity = identity.replace(/_TOTEM_ALOLA$/, '_ALOLA_TOTEM').replace(/^TOTEM_ALOLA$/, 'ALOLA_TOTEM');
  } else if (id === 105) {
    identity = identity.replace(/^MAROWAK_TOTEM$/, 'MAROWAK_ALOLA_TOTEM').replace(/^TOTEM$/, 'ALOLA_TOTEM');
  } else if (id === 778) {
    identity = identity.replace(/_TOTEM_DISGUISED$/, '_TOTEM').replace(/^TOTEM_DISGUISED$/, 'TOTEM');
    identity = identity.replace(/_TOTEM_BUSTED$/, '_BUSTED_TOTEM').replace(/^TOTEM_BUSTED$/, 'BUSTED_TOTEM');
  } else if (id === 716) {
    identity = identity.replace(/_ACTIVE$/, '').replace(/^ACTIVE$/, 'NORMAL');
  } else if (id === 931) {
    identity = identity.replace(/_PLUMAGE$/, '');
  } else if (id === 982) {
    identity = identity.replace(/_SEGMENT$/, '');
  } else if (id === 1007) {
    identity = identity.replace(/_APEX$/, '_APEX_BUILD').replace(/^APEX$/, 'APEX_BUILD');
  } else if (id === 1008) {
    identity = identity.replace(/_ULTIMATE$/, '_ULTIMATE_MODE').replace(/^ULTIMATE$/, 'ULTIMATE_MODE');
  }
  if (identity === 'NORMAL' && canonicalDefaultFormById[id]) {
    identity = canonicalDefaultFormById[id];
  }

  return identity;
};

export const pokemonGoFormIdentityKey = (pokemon: PokemonGoFormIdentity) => {
  const rawForm = normalizeSelectionIdentity(String(pokemon.form ?? ''));
  const battleModifier = pokemon.pokemonType === 2 ? 'SHADOW' : pokemon.pokemonType === 3 ? 'PURIFIED' : undefined;
  const baseForm = battleModifier ? rawForm.replace(new RegExp(`_${battleModifier}$`), '') || 'NORMAL' : rawForm;
  const baseIdentity = normalizePokemonFormIdentity(pokemon.num, baseForm);
  const identity = battleModifier ? `${baseIdentity}_${battleModifier}` : baseIdentity;
  const canonicalDefaultForm = canonicalDefaultFormById[pokemon.num];
  const pokemonType =
    canonicalDefaultForm === identity && (pokemon.pokemonType === 0 || pokemon.pokemonType === 1)
      ? 0
      : (pokemon.pokemonType ?? 0);
  return `${pokemon.num}:${pokemonType}:${identity}`;
};

export const pokemonGoFormIdentityPriority = (pokemon: PokemonGoFormIdentity) =>
  Number(
    String(pokemon.form ?? '')
      .trim()
      .replaceAll('-', '_')
      .replaceAll(' ', '_')
      .toUpperCase() !== 'NORMAL'
  ) *
    8 +
  Number(Boolean(pokemon.releasedGO)) * 4 +
  Number(Boolean(pokemon.quickMoves?.length || pokemon.cinematicMoves?.length)) * 2;

export const selectPreferredPokemonGoFormIdentity = <T extends PokemonGoFormIdentity>(pokemons: T[]) => {
  const preferred = pokemons.reduce<T | undefined>((current, pokemon) => {
    if (!current || pokemonGoFormIdentityPriority(pokemon) > pokemonGoFormIdentityPriority(current)) {
      return pokemon;
    }
    return current;
  }, undefined);
  return preferred
    ? ({
        ...preferred,
        ...(pokemons.some((pokemon) => pokemon.releasedGO) ? { releasedGO: true } : {}),
        ...(pokemons.some((pokemon) => pokemon.hasShadowForm) ? { hasShadowForm: true } : {}),
      } as T)
    : preferred;
};
