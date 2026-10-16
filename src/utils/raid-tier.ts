import type { PokemonClass, PokemonType } from '../enums/type.enum';

const POKEMON_TYPE_MEGA = 4;
const POKEMON_TYPE_PRIMAL = 5;
const POKEMON_CLASS_NONE = 0;
const POKEMON_CLASS_ULTRA_BEAST = 3;

// Typed Web mirror of the API-owned provisional profile. Keep the regression
// aligned with modules/api/src/mechanics/raid-profiles.ts.
export const SUPER_MEGA_RAID_PROFILE = {
  tier: 7,
  level: 40,
  cpm: 0.79,
  hp: 25_000,
  timer: 300,
} as const;

export const RAID_LEVEL = {
  tier1: 'RAID_LEVEL_1',
  tier2: 'RAID_LEVEL_2',
  tier3: 'RAID_LEVEL_3',
  tier4: 'RAID_LEVEL_4',
  tier5: 'RAID_LEVEL_5',
  mega: 'RAID_LEVEL_MEGA',
  megaLegendary: 'RAID_LEVEL_MEGA_5',
  primal: 'RAID_LEVEL_PRIMAL',
  superMega: 'RAID_LEVEL_4_MEGA_ENHANCED',
  superMegaLegendary: 'RAID_LEVEL_5_MEGA_ENHANCED',
} as const;

export interface RaidTierMenuItem {
  label: string;
  value?: string;
  tier?: number;
  disabled?: boolean;
  isSubHeader?: boolean;
}

export const raidTierMenuItems = (
  pokemonType: PokemonType | undefined,
  pokemonClass?: PokemonClass,
  enhancedRaidLevels: ReadonlySet<string> = new Set()
): RaidTierMenuItem[] => {
  const isPrimal = pokemonType === POKEMON_TYPE_PRIMAL;
  const isMega = pokemonType === POKEMON_TYPE_MEGA;
  const isLegendaryMega = isMega && Number(pokemonClass) > POKEMON_CLASS_NONE;

  if (isPrimal) {
    return [
      { label: 'Primal Raid', isSubHeader: true },
      { label: 'Primal Raid (Tier 6)', value: RAID_LEVEL.primal, tier: 6 },
    ];
  }

  if (isMega) {
    const tier = isLegendaryMega ? 6 : 4;
    const raidLevel = isLegendaryMega ? RAID_LEVEL.megaLegendary : RAID_LEVEL.mega;
    const enhancedTier = SUPER_MEGA_RAID_PROFILE.tier;
    const enhancedRaidLevel = isLegendaryMega ? RAID_LEVEL.superMegaLegendary : RAID_LEVEL.superMega;

    return [
      { label: 'Mega Raids', isSubHeader: true },
      {
        label: isLegendaryMega ? 'Mega Legendary Raid (Tier 6)' : 'Mega Raid (Tier 4)',
        value: raidLevel,
        tier,
      },
      ...(enhancedRaidLevels.has(enhancedRaidLevel)
        ? [
            { label: 'Super Mega Raid', isSubHeader: true },
            {
              label: `Super Mega Raid (Tier ${enhancedTier})`,
              value: enhancedRaidLevel,
              tier: enhancedTier,
            },
          ]
        : []),
    ];
  }

  return [
    { label: 'Current Tiers', isSubHeader: true },
    { label: 'Tier 1', value: RAID_LEVEL.tier1, tier: 1 },
    { label: 'Tier 3', value: RAID_LEVEL.tier3, tier: 3 },
    {
      label: pokemonClass === POKEMON_CLASS_ULTRA_BEAST ? 'Ultra Beast Raid (Tier 5)' : 'Tier 5',
      value: RAID_LEVEL.tier5,
      tier: 5,
    },
    { label: 'Legacy Tiers', isSubHeader: true },
    { label: 'Tier 2', value: RAID_LEVEL.tier2, tier: 2 },
    { label: 'Tier 4', value: RAID_LEVEL.tier4, tier: 4 },
  ];
};

export const selectableRaidTierMenuItems = (
  pokemonType: PokemonType | undefined,
  pokemonClass?: PokemonClass,
  enhancedRaidLevels: ReadonlySet<string> = new Set()
) => raidTierMenuItems(pokemonType, pokemonClass, enhancedRaidLevels).filter((item) => item.value && item.tier);

export const normalizeRaidSelection = (
  tier: number,
  raidLevel: string | undefined,
  pokemonType: PokemonType | undefined,
  pokemonClass?: PokemonClass,
  enhancedRaidLevels: ReadonlySet<string> = new Set()
) => {
  const items = selectableRaidTierMenuItems(pokemonType, pokemonClass, enhancedRaidLevels);
  return items.find((item) => item.value === raidLevel) ?? items.find((item) => item.tier === tier) ?? items[0];
};

export const isSuperMegaRaidLevel = (raidLevel: string | undefined) =>
  raidLevel === RAID_LEVEL.superMega || raidLevel === RAID_LEVEL.superMegaLegendary;

export const availableRaidTiers = (pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) => {
  if (pokemonType === POKEMON_TYPE_PRIMAL) {
    return [6];
  }
  if (pokemonType === POKEMON_TYPE_MEGA) {
    return (pokemonClass ?? POKEMON_CLASS_NONE) === POKEMON_CLASS_NONE ? [4] : [6];
  }
  return [1, 3, 5, 2, 4];
};

export const defaultRaidTier = (pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) =>
  availableRaidTiers(pokemonType, pokemonClass)[0];

export const normalizeRaidTier = (tier: number, pokemonType: PokemonType | undefined, pokemonClass?: PokemonClass) => {
  const tiers = availableRaidTiers(pokemonType, pokemonClass);
  return tiers.includes(tier) ? tier : tiers[0];
};
