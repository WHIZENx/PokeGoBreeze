import { Bonus, Buff, Combat, IBuff, ICombat, Move, Sequence } from '../models/combat.model';
import { BuffType, MoveType, TypeAction, TypeMove } from '../../enums/type.enum';
import { ITypeEffectiveModel } from '../models/type-effective.model';
import { MoveBuff, PokemonDataGM } from '../models/options.model';
import { getValueOrDefault, isEqual, isInclude, toNumber } from '../../utils/extension';
import { EqualMode } from '../../utils/enums/string.enum';
import { PokemonTypeBadge } from '../enums/pokemon-type.enum';
import { PokemonConfig } from '../constants/type';
import { getBonusType, getKeyWithData, replaceTempMoveName, splitAndCamelCase } from '../../utils/utils';
import { struggleEnergy, weatherBallMoveId } from '../../utils/helpers/options-context.helpers';

const extractBasicMoves = (data: PokemonDataGM[]): Move[] =>
  data
    .filter((item) => /^V\d{4}_MOVE_*/g.test(item.templateId))
    .map((item) => {
      const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{4}/g))[0]);
      return new Move({
        ...item.data.moveSettings,
        id,
        name:
          typeof item.data.moveSettings.movementId === 'string'
            ? item.data.moveSettings.movementId
            : item.templateId.replace(/^V\d{4}_MOVE_/, ''),
      });
    });

const extractMoveSequences = (data: PokemonDataGM[]): Sequence[] =>
  data
    .filter(
      (item) =>
        isInclude(item.templateId, 'sequence_') &&
        item.data.moveSequenceSettings.sequence.find((seq) => isInclude(seq, 'sfx attacker'))
    )
    .map(
      (item) =>
        new Sequence({
          id: item.templateId.replace('sequence_', '').toUpperCase(),
          path: item.data.moveSequenceSettings.sequence
            .find((seq) => isInclude(seq, 'sfx attacker'))
            ?.replace('sfx attacker ', ''),
        })
    );

const processBuffs = (buffs: MoveBuff): IBuff[] => {
  const buffsResult: IBuff[] = [];

  if (buffs.attackerAttackStatStageChange) {
    buffsResult.push(
      Buff.create({
        type: TypeAction.Atk,
        target: BuffType.Attacker,
        power: buffs.attackerAttackStatStageChange,
        buffChance: buffs.buffActivationChance,
      })
    );
  }
  if (buffs.attackerDefenseStatStageChange) {
    buffsResult.push(
      Buff.create({
        type: TypeAction.Def,
        target: BuffType.Attacker,
        power: buffs.attackerDefenseStatStageChange,
        buffChance: buffs.buffActivationChance,
      })
    );
  }
  if (buffs.targetAttackStatStageChange) {
    buffsResult.push(
      Buff.create({
        type: TypeAction.Atk,
        target: BuffType.Target,
        power: buffs.targetAttackStatStageChange,
        buffChance: buffs.buffActivationChance,
      })
    );
  }
  if (buffs.targetDefenseStatStageChange) {
    buffsResult.push(
      Buff.create({
        type: TypeAction.Def,
        target: BuffType.Target,
        power: buffs.targetDefenseStatStageChange,
        buffChance: buffs.buffActivationChance,
      })
    );
  }

  return buffsResult;
};

const applyMoveStats = (result: Combat, move: Move) => {
  result.id = move.id;
  result.track = move.id;
  result.pvePower = move.power;

  if (!isEqual(result.name, 'STRUGGLE')) {
    result.pveEnergy = move.energyDelta;
  }

  result.durationMs = move.durationMs;
  result.damageWindowStartMs = move.damageWindowStartMs;
  result.damageWindowEndMs = move.damageWindowEndMs;
  result.accuracyChance = move.accuracyChance;
  result.criticalChance = move.criticalChance;
  result.staminaLossScalar = move.staminaLossScalar;
};

const applyNonCombatBonus = (result: Combat, data: PokemonDataGM[]) => {
  const item = data.find((item) =>
    item.templateId.startsWith(`NON_COMBAT_V${result.id.toString().padStart(4, '0')}_MOVE`)
  );
  const dataNonCombat = item?.data.nonCombatMoveSettings;
  if (!dataNonCombat) {
    return;
  }

  result.bonus = Bonus.create({
    cost: dataNonCombat.cost,
    bonusEffect: dataNonCombat.bonusEffect,
    durationMs: toNumber(dataNonCombat.durationMs),
    bonusType: getBonusType(dataNonCombat.bonusType),
    enableMultiUse: dataNonCombat.enableMultiUse,
    extraDurationMs: toNumber(dataNonCombat.extraDurationMs),
    enableNonCombatMove: dataNonCombat.enableNonCombatMove,
  });
};

const processCombatMoves = (data: PokemonDataGM[], moves: Move[], sequence: Sequence[]): Combat[] =>
  data
    .filter((item) => /^COMBAT_V\d{4}_MOVE_*/g.test(item.templateId))
    .map((item) => {
      const result = new Combat();

      if (typeof item.data.combatMove.uniqueId === 'string') {
        result.name = item.data.combatMove.uniqueId;
      } else if (typeof item.data.combatMove.uniqueId === 'number') {
        result.name = item.templateId.replace(/^COMBAT_V\d{4}_MOVE_/, '');
      }

      result.type = splitAndCamelCase(item.data.combatMove.type.replace(`${PokemonConfig.Type}_`, ''), '_', '');
      const fastMoveType = getValueOrDefault(String, getKeyWithData(TypeMove, TypeMove.Fast)?.toUpperCase());
      result.typeMove =
        item.templateId.endsWith(`_${fastMoveType}`) || isInclude(item.templateId, `_${fastMoveType}_`)
          ? TypeMove.Fast
          : TypeMove.Charge;

      result.pvpPower = toNumber(item.data.combatMove.power);
      result.pvpEnergy = toNumber(item.data.combatMove.energyDelta);
      result.sound = sequence.find((seq) => isEqual(seq.id, result.name))?.path;

      if (item.data.combatMove.buffs) {
        result.buffs = processBuffs(item.data.combatMove.buffs);
      }

      const move = moves.find((move) => isEqual(move.name, result.name));
      result.name = replaceTempMoveName(result.name);

      if (isEqual(result.name, 'STRUGGLE')) {
        result.pveEnergy = struggleEnergy();
      }

      if (move) {
        applyMoveStats(result, move);
      }
      applyNonCombatBonus(result, data);

      return result;
    });

const processGMaxMoves = (data: PokemonDataGM[], lastTrackId: number): Combat[] =>
  data
    .filter((item) => /^VN_BM_\d{3}$/g.test(item.templateId))
    .map((item) => {
      const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{3}/g))[0]);
      const result = new Combat();
      result.id = lastTrackId + id;
      result.track = lastTrackId + id;
      result.name = item.data.moveSettings.vfxName.split('_')[1].toUpperCase();
      result.type = splitAndCamelCase(
        item.data.moveSettings.pokemonType.replace(`${PokemonConfig.Type}_`, ''),
        '_',
        ''
      );
      result.typeMove = TypeMove.Charge;
      result.moveType = MoveType.Dynamax;
      result.durationMs = item.data.moveSettings.durationMs;
      result.damageWindowStartMs = item.data.moveSettings.damageWindowStartMs;
      result.damageWindowEndMs = item.data.moveSettings.damageWindowEndMs;
      result.accuracyChance = item.data.moveSettings.accuracyChance;
      result.staminaLossScalar = item.data.moveSettings.staminaLossScalar;
      return result;
    });

const expandWeatherBallVariants = (moveSet: Combat[], types: ITypeEffectiveModel): Combat[] => {
  const normalKey = getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Normal);
  const fairyKey = getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Fairy);
  const variants: Combat[] = [];

  moveSet
    .filter((move) => move.id === weatherBallMoveId())
    .forEach((move) => {
      move.isMultipleWithType = true;
      Object.keys(types)
        .filter(
          (type) =>
            !isEqual(type, normalKey, EqualMode.IgnoreCaseSensitive) &&
            !isEqual(type, fairyKey, EqualMode.IgnoreCaseSensitive)
        )
        .forEach((type, index) =>
          variants.push(
            Combat.create({
              ...move,
              id: toNumber(`${move.id}${index}`),
              name: `${move.name}_${type}`,
              type,
            })
          )
        );
    });

  return variants;
};

const processSpecialMoves = (data: PokemonDataGM[], moveSet: Combat[], types: ITypeEffectiveModel): Combat[] => {
  const result = [...moveSet, ...expandWeatherBallVariants(moveSet, types)];
  const lastTrackId = result.sort((a, b) => b.track - a.track)[0].track;
  return [...result, ...processGMaxMoves(data, lastTrackId)];
};

export const optionCombat = (data: PokemonDataGM[], types: ITypeEffectiveModel): ICombat[] => {
  const moves = extractBasicMoves(data);
  const sequence = extractMoveSequences(data);
  const moveSet = processCombatMoves(data, moves, sequence);
  return processSpecialMoves(data, moveSet, types);
};
