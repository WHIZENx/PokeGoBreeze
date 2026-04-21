import { IAsset } from '../models/asset.model';
import { ICombat } from '../models/combat.model';
import {
  EvoList,
  EvolutionQuest,
  EvolutionQuestCondition,
  IEvolutionQuestCondition,
  OpponentPokemonBattle,
  PokemonTypeCost,
} from '../models/evolution.model';
import {
  checkMoveSetAvailable,
  convertPokemonDataName,
  getItemEvolutionType,
  getLureItemType,
  getPokemonType,
  isSpecialMegaFormType,
  replacePokemonGoForm,
  replaceTempMoveName,
  splitAndCamelCase,
} from '../../utils/utils';
import { MoveType, PokemonType } from '../../enums/type.enum';
import {
  Encounter,
  IPokemonData,
  PokemonData,
  PokemonDataModel,
  PokemonDataOptional,
  PokemonEncounter,
  PokemonGenderRatio,
  StatsGO,
} from '../models/pokemon.model';
import { versionList } from '../../utils/constants';
import { PokemonDataGM } from '../models/options.model';
import { calculateStatsByTag } from '../../utils/calculate';
import {
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isNumber,
  isNullOrUndefined,
  toNumber,
  isNull,
} from '../../utils/extension';
import { formNormal, unownId } from '../../utils/helpers/options-context.helpers';
import { PokemonConfig } from '../constants/type';
import { convertAndReplaceNameGO, pokemonStoreData } from './_shared';
import { findPokemonData, pokemonDefaultForm } from './pokemon-helpers';

type PokemonSettings = NonNullable<PokemonDataGM['data']['pokemonSettings']>;
type EvolutionBranchItem = NonNullable<PokemonSettings['evolutionBranch']>[number];
type PokemonBaseData = ReturnType<typeof findPokemonData>;

// ============================================================================
// optionPokemonData — phase helpers
// ============================================================================

const resolveFormAndName = (pokemon: PokemonDataModel, pokemonSettings: PokemonSettings) => {
  const pokemonSettingForm = pokemonSettings.form?.toString();
  if (!pokemonSettingForm) {
    pokemon.form = formNormal();
  } else if (pokemon.id !== unownId()) {
    pokemon.form = convertAndReplaceNameGO(pokemonSettingForm, pokemonSettings.pokemonId?.toString());
  }
  if (pokemon.id !== unownId()) {
    pokemon.name = pokemonSettings.form
      ? `${pokemon.pokemonId}_${pokemon.form}`
      : pokemonSettings.pokemonId?.toString();
  } else {
    const form = getValueOrDefault(String, pokemon.form?.toString());
    pokemon.name = form;
    pokemon.form = form.replace(/UNOWN_/, '');
  }
};

const buildTypes = (pokemonSettings: PokemonSettings): string[] => {
  const types: string[] = [];
  if (pokemonSettings.type) {
    types.push(splitAndCamelCase(pokemonSettings.type.replace(`${PokemonConfig.Type}_`, ''), '_', ''));
  }
  if (pokemonSettings.type2) {
    types.push(splitAndCamelCase(pokemonSettings.type2.replace(`${PokemonConfig.Type}_`, ''), '_', ''));
  }
  return types;
};

const applyEncounterRates = (
  pokemon: PokemonDataModel,
  encounter: PokemonEncounter[],
  pokemonSettingForm: string | number | undefined,
  pokemonId: string | number | undefined
) => {
  const defaultName = getValueOrDefault(String, pokemonSettingForm, pokemonId);
  const pokemonEncounter = encounter.find((e) => isEqual(defaultName, e.name));
  pokemon.encounter = new Encounter({
    ...pokemon.encounter,
    baseCaptureRate: pokemonEncounter?.basecapturerate,
    baseFleeRate: pokemonEncounter?.basefleerate,
  });
};

const applyShadowAndThirdMove = (optional: PokemonDataOptional, pokemonSettings: PokemonSettings) => {
  if (pokemonSettings.shadow) {
    optional.shadowMoves = [pokemonSettings.shadow.shadowChargeMove];
    optional.purifiedMoves = [pokemonSettings.shadow.purifiedChargeMove];
    optional.purified = PokemonTypeCost.create({
      stardust: pokemonSettings.shadow.purificationStardustNeeded,
      candy: pokemonSettings.shadow.purificationCandyNeeded,
    });
  }
  if (pokemonSettings.thirdMove) {
    optional.thirdMove = PokemonTypeCost.create({
      stardust: pokemonSettings.thirdMove.stardustToUnlock,
      candy: pokemonSettings.thirdMove.candyToUnlock,
    });
  }
};

const resolveGenderRatio = (data: PokemonDataGM[], pokemonId: number, pokemonSettings: PokemonSettings) => {
  const goForm = replacePokemonGoForm(pokemonSettings.pokemonId);
  const gender = data.find(
    (item) => item.templateId === `SPAWN_V${pokemonId.toString().padStart(4, '0')}_POKEMON_${goForm}`
  );
  return PokemonGenderRatio.create(
    gender?.data.genderSettings.gender?.malePercent,
    gender?.data.genderSettings.gender?.femalePercent
  );
};

const applyPokemonBaseData = (pokemon: PokemonDataModel, optional: PokemonDataOptional, baseData: PokemonBaseData) => {
  if (!baseData) {
    return;
  }
  optional.slug = convertPokemonDataName(baseData.slug).replaceAll('_', '-').toLowerCase();
  optional.color = baseData.color;
  optional.sprite = baseData.sprite;
  optional.baseForme = convertPokemonDataName(baseData.baseForme);
  optional.region = isNull(baseData.region) ? undefined : baseData.region;
  optional.version = isNull(baseData.version) ? undefined : baseData.version;
  pokemon.pokedexHeightM = baseData.heightm;
  pokemon.pokedexWeightKg = baseData.weightkg;
  optional.isBaby = baseData.isBaby;
  if (baseData.prevo) {
    optional.prevEvo = baseData.prevo;
  }
  optional.baseStats = baseData.baseStats;

  if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseDefense && !pokemon.stats?.baseStamina) {
    const stats = calculateStatsByTag(undefined, baseData.baseStats, baseData.slug);
    pokemon.stats = {
      baseAttack: stats.atk,
      baseDefense: stats.def,
      baseStamina: stats.sta,
    };
  }
};

const backfillBaseForme = (optional: PokemonDataOptional, result: IPokemonData[], pokemon: PokemonDataModel) => {
  if (optional.baseForme || pokemon.pokemonType === PokemonType.Normal) {
    return;
  }
  const defaultForm = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
  if (defaultForm) {
    optional.baseForme = defaultForm.baseForme;
  }
};

const buildEvoQuestCondition = (evo: EvolutionBranchItem, data: PokemonDataGM[]): EvolutionQuest => {
  const quest = new EvolutionQuest();
  if (evo.genderRequirement) {
    quest.genderRequirement = evo.genderRequirement;
  }
  if (evo.kmBuddyDistanceRequirement > 0) {
    quest.kmBuddyDistanceRequirement = evo.kmBuddyDistanceRequirement;
  }
  if (evo.mustBeBuddy) {
    quest.isMustBeBuddy = evo.mustBeBuddy;
  }
  if (evo.onlyDaytime) {
    quest.isOnlyDaytime = evo.onlyDaytime;
  }
  if (evo.onlyNighttime) {
    quest.isOnlyNighttime = evo.onlyNighttime;
  }
  if (evo.onlyUpsideDown) {
    quest.isOnlyUpsideDown = evo.onlyUpsideDown;
  }
  quest.lureItemRequirement = getLureItemType(evo.lureItemRequirement);
  quest.evolutionItemRequirement = getItemEvolutionType(evo.evolutionItemRequirement);

  if (!isNotEmpty(evo.questDisplay)) {
    return quest;
  }

  const questDisplay = evo.questDisplay[0].questRequirementTemplateId;
  const template = data.find((template) => isEqual(template.templateId, questDisplay));
  const goals = template?.data.evolutionQuestTemplate?.goals;
  const quests: IEvolutionQuestCondition[] = [];
  let target = 0;

  goals?.forEach((goal) => {
    goal.condition?.forEach((condition) => {
      const questCondition = new EvolutionQuestCondition();
      questCondition.desc = condition.type;
      if (condition.withPokemonType) {
        questCondition.pokemonType = condition.withPokemonType.pokemonType.map((type) =>
          getValueOrDefault(String, type.split('_').at(2))
        );
      }
      if (condition.withThrowType) {
        questCondition.throwType = condition.withThrowType.throwType.split('_').at(2);
      }
      if (condition.withOpponentPokemonBattleStatus) {
        const opponentPokemonBattle = new OpponentPokemonBattle();
        opponentPokemonBattle.requireDefeat = condition.withOpponentPokemonBattleStatus.requireDefeat;
        opponentPokemonBattle.types = condition.withOpponentPokemonBattleStatus.opponentPokemonType.map((type) =>
          splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
        );
        questCondition.opponentPokemonBattle = opponentPokemonBattle;
      }
      quests.push(questCondition);
    });
    target = goal.target;
  });

  quest.condition = quests[0];
  quest.goal = target;
  quest.type = template?.data.evolutionQuestTemplate?.questType;
  return quest;
};

const resolveEvoTargetId = (
  data: PokemonDataGM[],
  pokemon: PokemonDataModel,
  evoToName: string,
  evoToForm: string
): number | undefined => {
  const pokemonGO = data.find(
    (i) =>
      /^V\d{4}_POKEMON_*/g.test(i.templateId) &&
      i.data.pokemonSettings &&
      isEqual(i.data.pokemonSettings.pokemonId, evoToName) &&
      isEqual(
        convertAndReplaceNameGO(
          getValueOrDefault(String, i.data.pokemonSettings.form?.toString(), pokemon.form?.toString(), formNormal()),
          i.data.pokemonSettings.pokemonId?.toString()
        ),
        evoToForm
      )
  );
  if (!pokemonGO) {
    return undefined;
  }
  const regEvoId = getValueOrDefault(Array, pokemonGO.templateId.match(/\d{4}/g));
  return toNumber(regEvoId[0]);
};

const buildEvoListEntry = (
  evo: EvolutionBranchItem,
  pokemon: PokemonDataModel,
  pokemonSettings: PokemonSettings,
  data: PokemonDataGM[]
): { dataEvo: EvoList; name: string } => {
  const dataEvo = new EvoList();
  const name = getValueOrDefault(String, evo.evolution?.toString(), pokemon.name);
  dataEvo.evoToForm = evo.form
    ? convertAndReplaceNameGO(evo.form, name)
    : getValueOrDefault(String, pokemon.form?.toString(), formNormal());
  dataEvo.evoToName = name.replace(`_${formNormal()}`, '');

  const evoId = resolveEvoTargetId(data, pokemon, dataEvo.evoToName, dataEvo.evoToForm);
  if (evoId !== undefined) {
    dataEvo.evoToId = evoId;
  }

  if (evo.candyCost > 0) {
    dataEvo.candyCost = evo.candyCost;
  }
  if (evo.evolutionItemRequirementCost) {
    dataEvo.itemCost = evo.evolutionItemRequirementCost;
  }
  if (evo.candyCostPurified > 0) {
    dataEvo.purificationEvoCandyCost = evo.candyCostPurified;
  }

  dataEvo.quest = buildEvoQuestCondition(evo, data);

  const multiBranchRandom =
    !isNotEmpty(evo.questDisplay) &&
    pokemonSettings.evolutionBranch &&
    pokemonSettings.evolutionBranch.length > 1 &&
    !isNotEmpty(Object.keys(dataEvo.quest));
  if (multiBranchRandom) {
    dataEvo.quest.isRandomEvolution = !evo.form;
  }

  return { dataEvo, name };
};

const pushToList = <T>(list: T[] | undefined, item: T, assign: (next: T[]) => void) => {
  if (list && isNotEmpty(list)) {
    list.push(item);
  } else {
    assign([item]);
  }
};

const processEvolutionBranch = (
  pokemonSettings: PokemonSettings,
  pokemon: PokemonDataModel,
  optional: PokemonDataOptional,
  data: PokemonDataGM[]
) => {
  pokemonSettings.evolutionBranch?.forEach((evo) => {
    const { dataEvo, name } = buildEvoListEntry(evo, pokemon, pokemonSettings, data);
    if (evo.temporaryEvolution) {
      const tempEvo = {
        tempEvolutionName: name + evo.temporaryEvolution.split('TEMP_EVOLUTION').at(1),
        firstTempEvolution: evo.temporaryEvolutionEnergyCost,
        tempEvolution: evo.temporaryEvolutionEnergyCostSubsequent,
        requireMove: evo.obEvolutionBranchRequiredMove ?? evo.evolutionMoveRequirement,
      };
      pushToList(optional.tempEvo, tempEvo, (next) => (optional.tempEvo = next));
    } else {
      pushToList(optional.evoList, dataEvo, (next) => (optional.evoList = next));
    }
  });
};

const mergeShadowMovesIntoOrigin = (
  pokemon: PokemonDataModel,
  optional: PokemonDataOptional,
  result: IPokemonData[]
) => {
  if (!(pokemon.shadow && pokemon.pokemonType === PokemonType.Shadow)) {
    return;
  }
  const pokemonOrigin = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
  if (!pokemonOrigin) {
    return;
  }

  optional.shadowMoves?.forEach((rawMove) => {
    const move = replaceTempMoveName(rawMove);
    if (!isIncludeList(pokemonOrigin.shadowMoves, move)) {
      pokemonOrigin.shadowMoves?.push(move);
    }
  });
  optional.purifiedMoves?.forEach((rawMove) => {
    const move = replaceTempMoveName(rawMove);
    if (!isIncludeList(pokemonOrigin.purifiedMoves, move)) {
      pokemonOrigin.purifiedMoves?.push(move);
    }
  });
};

// ============================================================================
// optionPokemonData
// ============================================================================

export const optionPokemonData = (
  data: PokemonDataGM[],
  encounter: PokemonEncounter[],
  result: IPokemonData[] = []
) => {
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    if (isNumber(pokemonSettings.pokemonId) && !pokemonSettings.form) {
      pokemonSettings.pokemonId = item.templateId.replace(/V\d{4}_POKEMON_/g, '');
    }
    const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{4}/g))[0]);
    const pokemon = PokemonDataModel.create(id, undefined, pokemonSettings);

    resolveFormAndName(pokemon, pokemonSettings);
    pokemon.pokemonType = getPokemonType(pokemon.form);
    pokemon.types = buildTypes(pokemonSettings);
    applyEncounterRates(pokemon, encounter, pokemonSettings.form?.toString(), pokemonSettings.pokemonId?.toString());

    const optional = new PokemonDataOptional({ baseStatsGO: true });
    applyShadowAndThirdMove(optional, pokemonSettings);
    optional.genderRatio = resolveGenderRatio(data, pokemon.id, pokemonSettings);

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      pokemon.form && pokemon.pokemonType !== PokemonType.Normal
        ? `${pokemon.pokemonId}_${pokemon.form}`
        : pokemonSettings.pokemonId?.toString(),
      pokemon.pokemonType === PokemonType.Normal
    );
    if (pokemonBaseData) {
      applyPokemonBaseData(pokemon, optional, pokemonBaseData);
    } else if (pokemonSettings.isForceReleaseGO) {
      optional.version = versionList[0].toLowerCase().replace(' ', '-');
    }

    backfillBaseForme(optional, result, pokemon);
    processEvolutionBranch(pokemonSettings, pokemon, optional, data);
    mergeShadowMovesIntoOrigin(pokemon, optional, result);

    if (pokemon.pokemonType !== PokemonType.Shadow) {
      result.push(PokemonData.create(pokemon, optional));
    }
  });

  addPokemonFromData(data, result, encounter);
  result = cleanPokemonDupForm(result);

  addPokemonGMaxMove(data, result);
  addPokemonFormChangeMove(result);

  return result.sort((a, b) => a.num - b.num);
};

// ============================================================================
// addPokemonFromData — supplement missing pokemon from static JSON
// ============================================================================

const applyMoveReassignment = (
  pokemonChange: IPokemonData,
  move: { existingMoves?: string[]; replacementMoves?: string[] }
) => {
  if (move.existingMoves && isNotEmpty(move.existingMoves)) {
    pokemonChange.cinematicMoves = pokemonChange.cinematicMoves?.filter((pm) => !move.existingMoves?.includes(pm));
  }
  if (move.replacementMoves && isNotEmpty(move.replacementMoves)) {
    if (isNullOrUndefined(pokemonChange.exclusiveMoves)) {
      pokemonChange.exclusiveMoves = [];
    }
    move.replacementMoves.forEach((rMove) => {
      if (pokemonChange.exclusiveMoves && !isIncludeList(pokemonChange.exclusiveMoves, rMove)) {
        pokemonChange.exclusiveMoves.push(rMove);
      }
    });
  }
};

// Preserves historical behavior — the original check used `baseAttack` three times;
// we keep that semantics (fall back to calculated stats when baseAttack is falsy).
const hasNoStatsLegacy = (stats: { baseAttack?: number } | undefined) => !stats?.baseAttack;

const addPokemonFromData = (data: PokemonDataGM[], result: IPokemonData[], encounter: PokemonEncounter[]) =>
  Object.values(pokemonStoreData)
    .filter(
      (pokemon) =>
        pokemon.num > 0 &&
        !result.some((item) => isEqual(item.fullName, convertPokemonDataName(pokemon.baseFormeSlug, pokemon.slug)))
    )
    .forEach((item) => {
      const pokemon = PokemonDataModel.create(item.num, item.name);

      pokemon.pokemonId = convertPokemonDataName(item.baseSpecies, item.name);
      pokemon.form = convertPokemonDataName(item.forme, formNormal());
      pokemon.pokedexHeightM = item.heightm;
      pokemon.pokedexWeightKg = item.weightkg;
      pokemon.pokemonClass = isNull(item.pokemonClass) ? undefined : item.pokemonClass;
      pokemon.pokemonType = getPokemonType(pokemon.form);

      const pokemonForms = result.filter((p) => p.num === item.num).map((p) => p.form);
      if (isIncludeList(pokemonForms, pokemon.form)) {
        return;
      }

      pokemon.types = item.types.map((type) => splitAndCamelCase(type, '_', ''));
      const optional = new PokemonDataOptional({
        ...item,
        baseForme: isNull(item.baseForme) ? undefined : item.baseForme,
        region: isNull(item.region) ? undefined : item.region,
        version: isNull(item.version) ? undefined : item.version,
      });

      const goTemplate = `V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(
        isSpecialMegaFormType(pokemon.pokemonType) || pokemon.pokemonType === PokemonType.GMax
          ? pokemon.pokemonId
          : convertPokemonDataName(item.baseFormeSlug, item.slug)
      )}`;
      const pokemonGO = data.find((i) => isEqual(i.templateId, goTemplate));

      if (pokemonGO) {
        const pokemonSettings = pokemonGO.data.pokemonSettings;
        pokemon.isDeployable = pokemonSettings.isDeployable;
        pokemon.isTradable = pokemonSettings.isTradable;
        pokemon.isTransferable = pokemonSettings.isTransferable;
        pokemon.disableTransferToPokemonHome = pokemonSettings.disableTransferToPokemonHome;
        pokemon.quickMoves = pokemonSettings.quickMoves;
        pokemon.cinematicMoves = pokemonSettings.cinematicMoves;
        pokemon.eliteQuickMove = pokemonSettings.eliteQuickMove;
        pokemon.eliteCinematicMove = pokemonSettings.eliteCinematicMove;
        pokemon.obSpecialAttackMoves = pokemonSettings.obSpecialAttackMoves;
        pokemon.nonTmCinematicMoves = pokemonSettings.nonTmCinematicMoves;

        const defaultName = pokemonSettings.form ? pokemonSettings.form.toString() : pokemonSettings.pokemonId;
        applyEncounterRates(pokemon, encounter, defaultName, undefined);

        const tempEvo = pokemonSettings.tempEvoOverrides?.find(
          (evo) => pokemon.form && isInclude(evo.tempEvoId, pokemon.form)
        );
        if (tempEvo && isNotEmpty(pokemon.types)) {
          pokemon.stats = tempEvo.stats;
          pokemon.types[0] = splitAndCamelCase(tempEvo.typeOverride1.replace(`${PokemonConfig.Type}_`, ''), '_', '');
          if (tempEvo.typeOverride2) {
            pokemon.types[1] = splitAndCamelCase(tempEvo.typeOverride2.replace(`${PokemonConfig.Type}_`, ''), '_', '');
          }
        } else if (pokemon.pokemonType === PokemonType.Mega) {
          const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
          pokemon.stats = StatsGO.create({
            baseAttack: stats.atk,
            baseDefense: stats.def,
            baseStamina: stats.sta,
          });
        } else {
          pokemon.stats = pokemonSettings.stats;
        }
      }

      if (hasNoStatsLegacy(pokemon.stats)) {
        const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
        pokemon.stats = StatsGO.create({
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta,
        });
      }

      optional.genderRatio = PokemonGenderRatio.create(item.genderRatio.M, item.genderRatio.F);
      optional.slug = convertPokemonDataName(item.baseFormeSlug, item.slug).replaceAll('_', '-').toLowerCase();
      optional.baseForme = item.baseForme?.toUpperCase();
      optional.baseStatsGO = true;

      backfillBaseForme(optional, result, pokemon);

      result.push(PokemonData.create(pokemon, optional));
    });

// ============================================================================
// Post-processing helpers
// ============================================================================

const cleanPokemonDupForm = (result: IPokemonData[]) =>
  result.filter((pokemon, _, r) => {
    const hasOriginForm = r.filter((p) => p.num === pokemon.num).some((f) => isEqual(f.baseForme, f.form));
    if (hasOriginForm) {
      return (
        pokemon.pokemonType !== PokemonType.Normal ||
        (pokemon.pokemonType === PokemonType.Normal && isEqual(pokemon.form, pokemon.baseForme))
      );
    }
    return true;
  });

const addPokemonFormChangeMove = (result: IPokemonData[]) =>
  result
    .filter((pokemon) => pokemon.formChange)
    .forEach((pokemon) => {
      pokemon.formChange?.forEach((form) => {
        if (form.componentPokemonSettings) {
          const id = result.find((r) => isEqual(r.pokemonId, form.componentPokemonSettings?.pokedexId))?.num;
          form.componentPokemonSettings.id = toNumber(id);
        }
        if (
          form.moveReassignment &&
          isNotEmpty(form.availableForm) &&
          isNotEmpty(form.moveReassignment.cinematicMoves)
        ) {
          form.availableForm.forEach((availableForm) => {
            const pokemonChange = result.find((pc) => isEqual(pc.fullName, availableForm));
            if (pokemonChange) {
              form.moveReassignment?.cinematicMoves?.forEach((move) => applyMoveReassignment(pokemonChange, move));
            }
          });
        }
      });
    });

const addPokemonGMaxMove = (data: PokemonDataGM[], result: IPokemonData[]) => {
  const template = data.find((gm) => isEqual(gm.templateId, 'SOURDOUGH_MOVE_MAPPING_SETTINGS'));
  result
    .filter((pokemon) => isEqual(pokemon.pokemonType, PokemonType.GMax))
    .forEach((item) => {
      const move = template?.data.sourdoughMoveMappingSettings?.mappings.find((m) =>
        isEqual(m.pokemonId, item.pokemonId)
      );
      if (move) {
        if (isNullOrUndefined(item.dynamaxMoves)) {
          item.dynamaxMoves = [];
        }
        item.dynamaxMoves.push(move.move);
      }
    });
};

// ============================================================================
// Public: released flag + move-set mapping
// ============================================================================

export const mappingReleasedPokemonGO = (pokemonData: IPokemonData[], assets: IAsset[]) => {
  pokemonData.forEach((item) => {
    const form = assets.find((asset) => asset.id === item.num);
    const image = form?.image.find((img) =>
      isEqual(img.form, item.num === unownId() ? `${item.pokemonId}_${item.baseForme}` : item.form)
    );
    if (form && (item.hasShadowForm || (checkMoveSetAvailable(item) && image?.default))) {
      item.releasedGO = getValueOrDefault(Boolean, item.hasShadowForm || isInclude(image?.default, '/'));
    }
  });
};

const convertMoveName = (combat: ICombat[], moves: string[] | undefined, lastTrackId: number) =>
  moves?.map((move) => {
    if (isNumber(move)) {
      const found = combat.find((item) => item.id === toNumber(move));
      if (found) {
        return found.name;
      }
    }
    if (/^VN_BM_\d{3}$/g.test(move)) {
      const id = toNumber(getValueOrDefault(Array, move.match(/\d{3}/g))[0]);
      const found = combat.find((item) => item.track === lastTrackId + id && isEqual(item.moveType, MoveType.Dynamax));
      if (found) {
        return found.name;
      }
    }
    return move;
  });

export const mappingMoveSetPokemonGO = (pokemonData: IPokemonData[], combat: ICombat[]) => {
  const lastTrackId = combat
    .filter((item) => item.moveType !== MoveType.Dynamax)
    .sort((a, b) => b.track - a.track)[0].track;
  pokemonData.forEach((pokemon) => {
    pokemon.quickMoves = convertMoveName(combat, pokemon.quickMoves, lastTrackId);
    pokemon.cinematicMoves = convertMoveName(combat, pokemon.cinematicMoves, lastTrackId);
    pokemon.eliteQuickMoves = convertMoveName(combat, pokemon.eliteQuickMoves, lastTrackId);
    pokemon.eliteCinematicMoves = convertMoveName(combat, pokemon.eliteCinematicMoves, lastTrackId);
    pokemon.specialMoves = convertMoveName(combat, pokemon.specialMoves, lastTrackId);
    pokemon.exclusiveMoves = convertMoveName(combat, pokemon.exclusiveMoves, lastTrackId);
    pokemon.dynamaxMoves = convertMoveName(combat, pokemon.dynamaxMoves, lastTrackId);
    pokemon.purifiedMoves = convertMoveName(combat, pokemon.purifiedMoves, lastTrackId);
    pokemon.shadowMoves = convertMoveName(combat, pokemon.shadowMoves, lastTrackId);
  });
};
