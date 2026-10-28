import type { PvpBattleStrategyRequest } from '../../../../services/models/tools-api.model';

export interface BattleSeedPokemon {
  speciesId: string;
  id: number;
  form: string;
  pokemonType: number;
  fastMoveId: number;
  primaryMoveId: number;
  secondaryMoveId: number;
  level: number;
  atkIv: number;
  defIv: number;
  staIv: number;
  energy: number;
  block: number;
  chargeSlot: number;
  disablePrimary: boolean;
  disableSecondary: boolean;
  startingHp?: number;
  attackStage: number;
  defenseStage: number;
  caughtAt?: number;
}

export interface BattleSeedState {
  league: number;
  leagueId: string;
  playerTeam: BattleSeedPokemon[];
  opponentTeam: BattleSeedPokemon[];
  playerStrategy: PvpBattleStrategyRequest;
  opponentStrategy: PvpBattleStrategyRequest;
}

type CompactPokemon = [
  string,
  number,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  0 | 1,
  0 | 1,
  number | null,
  number,
  number,
  number | null,
];

type CompactSeed = [
  2,
  number,
  string,
  CompactPokemon[],
  CompactPokemon[],
  PvpBattleStrategyRequest,
  PvpBattleStrategyRequest,
];

const seedVersion = 2;
const supportedSeedVersions = [1, seedVersion];
const maxSeedDigits = 16_000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

const checksum = (bytes: Uint8Array) => {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const bytesToDecimal = (bytes: Uint8Array) => {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return BigInt(`0x${hex}`).toString(10);
};

const decimalToBytes = (value: string) => {
  let hex = BigInt(value).toString(16);
  if (hex.length % 2) {
    hex = `0${hex}`;
  }
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (byte) => Number.parseInt(byte, 16));
};

const compactPokemon = (pokemon: BattleSeedPokemon): CompactPokemon => [
  pokemon.speciesId,
  pokemon.id,
  pokemon.form,
  pokemon.pokemonType,
  pokemon.fastMoveId,
  pokemon.primaryMoveId,
  pokemon.secondaryMoveId,
  pokemon.level,
  pokemon.atkIv,
  pokemon.defIv,
  pokemon.staIv,
  pokemon.energy,
  pokemon.block,
  pokemon.chargeSlot,
  pokemon.disablePrimary ? 1 : 0,
  pokemon.disableSecondary ? 1 : 0,
  pokemon.startingHp ?? null,
  pokemon.attackStage,
  pokemon.defenseStage,
  pokemon.caughtAt ?? null,
];

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isInteger = (value: unknown): value is number => isFiniteNumber(value) && Number.isInteger(value);
const isOptionalNumber = (value: unknown): value is number | null => value === null || isFiniteNumber(value);
const isNumberBetween = (value: unknown, minimum: number, maximum: number) =>
  isFiniteNumber(value) && value >= minimum && value <= maximum;

const expandPokemon = (value: unknown): BattleSeedPokemon | undefined => {
  if (!Array.isArray(value) || value.length !== 20) {
    return undefined;
  }
  const [
    speciesId,
    id,
    form,
    pokemonType,
    fastMoveId,
    primaryMoveId,
    secondaryMoveId,
    level,
    atkIv,
    defIv,
    staIv,
    energy,
    block,
    chargeSlot,
    disablePrimary,
    disableSecondary,
    startingHp,
    attackStage,
    defenseStage,
    caughtAt,
  ] = value;
  if (
    typeof speciesId !== 'string' ||
    speciesId.length === 0 ||
    speciesId.length > 100 ||
    typeof form !== 'string' ||
    form.length > 100 ||
    ![
      id,
      pokemonType,
      fastMoveId,
      primaryMoveId,
      secondaryMoveId,
      atkIv,
      defIv,
      staIv,
      energy,
      block,
      chargeSlot,
      attackStage,
      defenseStage,
    ].every(isInteger) ||
    !isFiniteNumber(level) ||
    !isNumberBetween(id, 1, 10_000) ||
    !isNumberBetween(pokemonType, 0, 8) ||
    !isNumberBetween(fastMoveId, 1, 100_000) ||
    !isNumberBetween(primaryMoveId, 0, 100_000) ||
    !isNumberBetween(secondaryMoveId, 0, 100_000) ||
    !isNumberBetween(level, 1, 100) ||
    !isNumberBetween(atkIv, 0, 15) ||
    !isNumberBetween(defIv, 0, 15) ||
    !isNumberBetween(staIv, 0, 15) ||
    !isNumberBetween(energy, 0, 100) ||
    !isNumberBetween(block, 0, 2) ||
    !isNumberBetween(chargeSlot, -1, 3) ||
    !isNumberBetween(attackStage, -4, 4) ||
    !isNumberBetween(defenseStage, -4, 4) ||
    (disablePrimary !== 0 && disablePrimary !== 1) ||
    (disableSecondary !== 0 && disableSecondary !== 1) ||
    !isOptionalNumber(startingHp) ||
    (startingHp !== null && !isNumberBetween(startingHp, 1, 100_000)) ||
    !isOptionalNumber(caughtAt) ||
    (caughtAt !== null && !isNumberBetween(caughtAt, 0, 10_000_000_000_000))
  ) {
    return undefined;
  }
  return {
    speciesId,
    id,
    form,
    pokemonType,
    fastMoveId,
    primaryMoveId,
    secondaryMoveId,
    level,
    atkIv,
    defIv,
    staIv,
    energy,
    block,
    chargeSlot,
    disablePrimary: disablePrimary === 1,
    disableSecondary: disableSecondary === 1,
    startingHp: startingHp ?? undefined,
    attackStage,
    defenseStage,
    caughtAt: caughtAt ?? undefined,
  };
};

const isStrategy = (value: unknown): value is PvpBattleStrategyRequest => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const strategy = value as Record<string, unknown>;
  const oneOf = (candidate: unknown, allowed: string[]) =>
    candidate === undefined || allowed.includes(String(candidate));
  if (
    !oneOf(strategy.shield, ['always', 'lethal', 'never']) ||
    !oneOf(strategy.charged, ['selected', 'bait', 'nuke', 'farm', 'manual']) ||
    !oneOf(strategy.voluntarySwitch, ['none', 'random', 'safe']) ||
    !oneOf(strategy.forcedSwitch, ['first', 'best_matchup', 'highest_hp', 'highest_energy', 'random', 'ordered']) ||
    (strategy.farmEnergy !== undefined && !isNumberBetween(strategy.farmEnergy, 0, 100)) ||
    (strategy.undercharge !== undefined && !isNumberBetween(strategy.undercharge, 0, 100))
  ) {
    return false;
  }
  if (
    strategy.switchOrder !== undefined &&
    (!Array.isArray(strategy.switchOrder) ||
      strategy.switchOrder.length > 3 ||
      !strategy.switchOrder.every((index) => isInteger(index) && index >= 0 && index <= 2))
  ) {
    return false;
  }
  if (strategy.actions === undefined) {
    return true;
  }
  return (
    Array.isArray(strategy.actions) &&
    strategy.actions.length <= 200 &&
    strategy.actions.every((value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
      }
      const action = value as Record<string, unknown>;
      return (
        isInteger(action.turn) &&
        action.turn >= 0 &&
        oneOf(action.type, ['charged', 'switch', 'shield']) &&
        (action.moveSlot === undefined || action.moveSlot === 1 || action.moveSlot === 2) &&
        (action.targetIndex === undefined ||
          (isInteger(action.targetIndex) && action.targetIndex >= 0 && action.targetIndex <= 2)) &&
        (action.shield === undefined || typeof action.shield === 'boolean') &&
        (action.undercharge === undefined || isNumberBetween(action.undercharge, 0, 100))
      );
    })
  );
};

export const encodeBattleSeed = (state: BattleSeedState) => {
  const compact: CompactSeed = [
    seedVersion,
    state.league,
    state.leagueId,
    state.playerTeam.map(compactPokemon),
    state.opponentTeam.map(compactPokemon),
    state.playerStrategy,
    state.opponentStrategy,
  ];
  const payload = encoder.encode(JSON.stringify(compact));
  const envelope = new Uint8Array(payload.length + 5);
  envelope[0] = seedVersion;
  new DataView(envelope.buffer).setUint32(1, checksum(payload));
  envelope.set(payload, 5);
  return bytesToDecimal(envelope);
};

export const decodeBattleSeed = (seed: string): BattleSeedState | undefined => {
  try {
    if (!/^\d+$/.test(seed) || seed.length === 0 || seed.length > maxSeedDigits) {
      return undefined;
    }
    const envelope = decimalToBytes(seed);
    if (envelope.length <= 5 || !supportedSeedVersions.includes(envelope[0])) {
      return undefined;
    }
    const expectedChecksum = new DataView(envelope.buffer, envelope.byteOffset, envelope.byteLength).getUint32(1);
    const payload = envelope.slice(5);
    if (checksum(payload) !== expectedChecksum) {
      return undefined;
    }
    const compact: unknown = JSON.parse(decoder.decode(payload));
    if (!Array.isArray(compact) || (compact.length !== 7 && compact.length !== 11)) {
      return undefined;
    }
    const version = compact[0];
    if (!isInteger(version) || version !== envelope[0] || !supportedSeedVersions.includes(version)) {
      return undefined;
    }
    const [league, leagueId, player, opponent, playerStrategy, opponentStrategy] =
      version === 1
        ? [compact[1], compact[2], compact[7], compact[8], compact[9], compact[10]]
        : [compact[1], compact[2], compact[3], compact[4], compact[5], compact[6]];
    if (
      !isInteger(league) ||
      ![500, 1500, 2500, 10_000].includes(league) ||
      typeof leagueId !== 'string' ||
      leagueId.length === 0 ||
      leagueId.length > 100 ||
      !Array.isArray(player) ||
      !Array.isArray(opponent) ||
      player.length < 1 ||
      player.length > 3 ||
      opponent.length < 1 ||
      opponent.length > 3 ||
      !isStrategy(playerStrategy) ||
      !isStrategy(opponentStrategy)
    ) {
      return undefined;
    }
    const playerTeam = player.map(expandPokemon);
    const opponentTeam = opponent.map(expandPokemon);
    if (playerTeam.some((pokemon) => !pokemon) || opponentTeam.some((pokemon) => !pokemon)) {
      return undefined;
    }
    return {
      league,
      leagueId,
      playerTeam: playerTeam as BattleSeedPokemon[],
      opponentTeam: opponentTeam as BattleSeedPokemon[],
      playerStrategy,
      opponentStrategy,
    };
  } catch {
    return undefined;
  }
};
