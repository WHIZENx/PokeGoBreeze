import { Asset, CryPath, IAsset, ImageModel } from './models/asset.model';
import { Buff, Combat, IBuff, ICombat, Move, Sequence } from './models/combat.model';
import {
  EvoList,
  EvolutionQuest,
  EvolutionQuestCondition,
  IEvolutionQuestCondition,
  OpponentPokemonBattle,
  PokemonTypeCost,
} from './models/evolution.model';
import {
  League,
  LeagueData,
  RankRewardSetLeague,
  PokemonRewardSetLeague,
  PokemonRewardLeague,
  LeagueTimestamp,
  Season,
  Reward,
  RankRewardLeague,
} from './models/league.model';
import { ISticker, Sticker } from './models/sticker.model';

import pokemonStoreData from '../data/pokemon.json';
import textEng from '../data/text_english.json';
import {
  capitalize,
  checkMoveSetAvailable,
  convertPokemonDataName,
  getDataWithKey,
  getItemEvolutionType,
  getKeyWithData,
  getLeagueBattleType,
  getLureItemType,
  getPokemonType,
  getTicketRewardType,
  isSpecialMegaFormType,
  replacePokemonGoForm,
  replaceTempMoveName,
  splitAndCamelCase,
  splitAndCapitalize,
} from '../utils/utils';
import { BuffType, MoveType, PokemonType, TypeAction, TypeMove } from '../enums/type.enum';
import {
  Encounter,
  IPokemonData,
  PokemonData,
  PokemonDataModel,
  PokemonDataOptional,
  PokemonEncounter,
  PokemonGenderRatio,
  StatsGO,
} from './models/pokemon.model';
import { ITypeEffectiveModel, TypeEffectiveModel } from './models/type-effective.model';
import { versionList } from '../utils/constants';
import { APIUrl } from '../services/constants';
import {
  BuddyFriendship,
  PokemonDataGM,
  IPokemonPermission,
  TrainerFriendship,
  Options,
  PokemonPermission,
  PokemonReward,
  EvolutionChainData,
  GlobalEventTicket,
  ItemSettings,
  MoveBuff,
} from './models/options.model';
import { calculateStatsByTag } from '../utils/calculate';
import { APITree } from '../services/models/api.model';
import {
  DynamicObj,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isNumber,
  isNullOrUndefined,
  toNumber,
  UniqValueInArray,
  isNull,
  safeObjectEntries,
} from '../utils/extension';
import { GenderType } from './enums/asset.enum';
import { EqualMode, IncludeMode } from '../utils/enums/string.enum';
import { LeagueRewardType, LeagueType, RewardType } from './enums/league.enum';
import { LeagueConditionType } from './enums/option.enum';
import { EvolutionChain, EvolutionInfo, IEvolutionInfo } from './models/evolution-chain.model';
import { Information, ITicketReward, TicketReward } from './models/information';
import { TrainerLevelUp } from './models/trainer.model';
import { TemplateId } from './constants/template-id';
import { PokemonConfig } from './constants/type';
import { StatsPokemonGO } from './models/stats.model';
import {
  formArmor,
  formGalarian,
  formGmax,
  formMega,
  formMegaX,
  formMegaY,
  formNormal,
  formShadow,
  formSpecial,
  minLevel,
  pathAssetPokeGo,
  stepLevel,
} from '../utils/helpers/options-context.helpers';
import { IWeatherBoost } from './models/weather-boost.model';
import { PokemonTypeBadge } from './enums/pokemon-type.enum';

export const optionSettings = (
  data: PokemonDataGM[],
  typeEffective: ITypeEffectiveModel,
  weatherBoost: IWeatherBoost,
  settings = new Options()
): Options => {
  data.forEach((item) => {
    const templateHandlers: Record<string, (item: PokemonDataGM) => void> = {
      [TemplateId.PlayerSetting]: handlePlayerSettings,
      [TemplateId.CombatSetting]: handleCombatSettings,
      [TemplateId.BattleSetting]: handleBattleSettings,
    };

    if (templateHandlers[item.templateId]) {
      templateHandlers[item.templateId](item);
      return;
    }

    if (isInclude(item.templateId, `${TemplateId.BuddyLevel}_`)) {
      handleBuddyLevel(item);
    } else if (isInclude(item.templateId, `${TemplateId.FriendshipLevel}_`)) {
      handleFriendshipLevel(item);
    }
  });

  settings.typeEffective = typeEffective;
  settings.weatherBoost = weatherBoost;
  settings.weatherTypes = Object.keys(weatherBoost);
  settings.types = Object.keys(typeEffective);
  return settings;

  function handlePlayerSettings(item: PokemonDataGM) {
    settings.playerSetting.maxEncounterPlayerLevel = item.data.playerLevel.maxEncounterPlayerLevel;
    settings.playerSetting.maxQuestEncounterPlayerLevel = item.data.playerLevel.maxQuestEncounterPlayerLevel;

    settings.playerSetting.levelUps = item.data.playerLevel.rankNum.map((value, index) => ({
      level: index + value,
      amount: value,
      requiredExp: item.data.playerLevel.requiredExperience[index],
    }));

    processCPMultipliers(item.data.playerLevel.cpMultiplier);
  }

  function processCPMultipliers(cpmList: number[]) {
    for (let level = minLevel(); level <= cpmList.length; level++) {
      const cpmLow = toNumber(cpmList[level - 1]);
      const cpmHigh = toNumber(cpmList[level]);

      settings.playerSetting.cpMultipliers[level] = cpmLow;

      if (cpmHigh > 0) {
        const multiplier = Math.sqrt(Math.pow(cpmLow, 2) - Math.pow(cpmLow, 2) / 2 + Math.pow(cpmHigh, 2) / 2);
        settings.playerSetting.cpMultipliers[level + stepLevel()] = multiplier;
      }
    }
  }

  function handleCombatSettings(item: PokemonDataGM) {
    settings.combatOptions.stab = item.data.combatSettings.sameTypeAttackBonusMultiplier;
    settings.combatOptions.shadowBonus.atk = item.data.combatSettings.shadowPokemonAttackBonusMultiplier;
    settings.combatOptions.shadowBonus.def = item.data.combatSettings.shadowPokemonDefenseBonusMultiplier;
    settings.combatOptions.purifiedBonus = StatsPokemonGO.create(
      item.data.combatSettings.purifiedPokemonAttackMultiplierVsShadow,
      1
    );
    settings.combatOptions.maxEnergy = item.data.combatSettings.maxEnergy;

    settings.throwCharge.normal = item.data.combatSettings.chargeScoreBase;
    settings.throwCharge.nice = item.data.combatSettings.chargeScoreNice;
    settings.throwCharge.great = item.data.combatSettings.chargeScoreGreat;
    settings.throwCharge.excellent = item.data.combatSettings.chargeScoreExcellent;
  }

  function handleBattleSettings(item: PokemonDataGM) {
    settings.battleOptions.enemyAttackInterval = item.data.battleSettings.enemyAttackInterval;
    settings.battleOptions.stab = item.data.battleSettings.sameTypeAttackBonusMultiplier;
    settings.battleOptions.shadowBonus.atk = item.data.battleSettings.shadowPokemonAttackBonusMultiplier;
    settings.battleOptions.shadowBonus.def = item.data.battleSettings.shadowPokemonDefenseBonusMultiplier;
    settings.battleOptions.purifiedBonus = StatsPokemonGO.create(
      item.data.battleSettings.purifiedPokemonAttackMultiplierVsShadow,
      1
    );
    settings.battleOptions.maxEnergy = item.data.battleSettings.maximumEnergy;
    settings.battleOptions.dodgeDamageReductionPercent = item.data.battleSettings.dodgeDamageReductionPercent;
  }

  function handleBuddyLevel(item: PokemonDataGM) {
    const level = item.templateId.replace(`${TemplateId.BuddyLevel}_`, '');
    settings.buddyFriendship[level] = new BuddyFriendship();
    settings.buddyFriendship[level].level = toNumber(level);
    settings.buddyFriendship[level].minNonCumulativePointsRequired =
      item.data.buddyLevelSettings.minNonCumulativePointsRequired;
    settings.buddyFriendship[level].unlockedTrading = item.data.buddyLevelSettings.unlockedTraits;
  }

  function handleFriendshipLevel(item: PokemonDataGM) {
    const level = item.templateId.replace(`${TemplateId.FriendshipLevel}_`, '');
    settings.trainerFriendship[level] = new TrainerFriendship();
    settings.trainerFriendship[level].level = toNumber(level);
    settings.trainerFriendship[level].atkBonus = item.data.friendshipMilestoneSettings.attackBonusPercentage;
    settings.trainerFriendship[level].unlockedTrading = item.data.friendshipMilestoneSettings.unlockedTrading;
  }
};

const processAssetData = (data: APITree, extension: string) =>
  data.tree
    .filter((item) => !isEqual(item.path, pathAssetPokeGo()))
    .map((item) => item.path.replace(extension, '').replace(pathAssetPokeGo(), ''));

export const optionPokeImg = (data: APITree) => processAssetData(data, '.png');
export const optionPokeSound = (data: APITree) => processAssetData(data, '.wav');

export const optionPokemonTypes = (data: PokemonDataGM[]) => {
  const types = new TypeEffectiveModel() as unknown as DynamicObj<DynamicObj<number>>;
  const typeSet = Object.keys(types);
  data
    .filter((item) => /^POKEMON_TYPE*/g.test(item.templateId))
    .forEach((item) => {
      const rootType = item.templateId.replace(`${PokemonConfig.Type}_`, '');
      const typesRoot = types[splitAndCamelCase(rootType, '_', '')];
      typeSet.forEach((type, index) => {
        typesRoot[splitAndCamelCase(type, '_', '')] = item.data.typeEffective.attackScalar[index];
      });
    });
  return types as unknown as ITypeEffectiveModel;
};

export const optionPokemonWeather = (data: PokemonDataGM[]) => {
  const weather = new Object() as DynamicObj<string[]>;
  data
    .filter((item) => /^WEATHER_AFFINITY*/g.test(item.templateId) && item.data.weatherAffinities)
    .forEach((item) => {
      const rootType = item.data.weatherAffinities.weatherCondition;
      weather[splitAndCamelCase(rootType, '_', '')] = item.data.weatherAffinities.pokemonType.map((type) =>
        splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
      );
    });
  return weather as unknown as IWeatherBoost;
};

const optionFormNoneSpecial = (data: PokemonDataGM[], result: string[] = []) => {
  data
    .filter((item) => /^FORMS_V\d{4}_POKEMON_*/g.test(item.templateId) && isNotEmpty(item.data.formSettings.forms))
    .forEach((item) => {
      item.data.formSettings.forms.forEach((f) => {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      });
    });

  return result;
};

const findPokemonData = (id: number, name: string, isDefault = false) =>
  Object.values(pokemonStoreData).find((pokemon) => {
    const slugToCompare = isDefault ? pokemon.slug : pokemon.baseFormeSlug ?? pokemon.slug;
    const convertedSlug = convertPokemonDataName(slugToCompare);
    return pokemon.num === id && isEqual(name, convertedSlug);
  });

const convertAndReplaceNameGO = (name: string, defaultName = ''): string => {
  const formName = getValueOrDefault(String, name);
  let result = formName.replace(`${replacePokemonGoForm(defaultName)}_`, '');
  const formReplacements: Record<string, string> = {
    '^S$': formShadow(),
    '^A$': formArmor(),
    GALARIAN_STANDARD: formGalarian(),
  };

  safeObjectEntries(formReplacements).forEach(([pattern, replacement]) => {
    result = result.replace(new RegExp(pattern, 'gi'), replacement);
  });

  return result;
};

export const optionPokemonData = (
  data: PokemonDataGM[],
  encounter: PokemonEncounter[],
  result: IPokemonData[] = []
) => {
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{4}/g))[0]);
    const pokemon = PokemonDataModel.create(id, undefined, pokemonSettings);

    const pokemonSettingForm = pokemonSettings.form?.toString();
    if (!pokemonSettingForm) {
      pokemon.form = formNormal();
    } else if (pokemon.id !== 201) {
      pokemon.form = convertAndReplaceNameGO(pokemonSettingForm, pokemonSettings.pokemonId);
    }
    if (pokemon.id !== 201) {
      pokemon.name = pokemonSettings.form ? `${pokemon.pokemonId}_${pokemon.form}` : pokemonSettings.pokemonId;
    } else {
      const form = getValueOrDefault(String, pokemon.form?.toString());
      pokemon.name = form;
      pokemon.form = form.replace(/UNOWN_/, '');
    }
    pokemon.pokemonType = getPokemonType(pokemon.form);

    const types: string[] = [];
    if (pokemonSettings.type) {
      types.push(splitAndCamelCase(pokemonSettings.type.replace(`${PokemonConfig.Type}_`, ''), '_', ''));
    }
    if (pokemonSettings.type2) {
      types.push(splitAndCamelCase(pokemonSettings.type2.replace(`${PokemonConfig.Type}_`, ''), '_', ''));
    }
    pokemon.types = types;

    const defaultName = getValueOrDefault(String, pokemonSettingForm, pokemonSettings.pokemonId);
    const pokemonEncounter = encounter.find((e) => isEqual(defaultName, e.name));

    pokemon.encounter = new Encounter({
      ...pokemon.encounter,
      baseCaptureRate: pokemonEncounter?.basecapturerate,
      baseFleeRate: pokemonEncounter?.basefleerate,
    });

    const optional = new PokemonDataOptional({
      baseStatsGO: true,
    });

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

    const goForm = replacePokemonGoForm(pokemonSettings.pokemonId);
    const gender = data.find(
      (item) => item.templateId === `SPAWN_V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${goForm}`
    );

    optional.genderRatio = PokemonGenderRatio.create(
      gender?.data.genderSettings.gender?.malePercent,
      gender?.data.genderSettings.gender?.femalePercent
    );

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      pokemon.form && pokemon.pokemonType !== PokemonType.Normal
        ? `${pokemon.pokemonId}_${pokemon.form}`
        : pokemonSettings.pokemonId,
      pokemon.pokemonType === PokemonType.Normal
    );
    if (pokemonBaseData) {
      optional.slug = convertPokemonDataName(pokemonBaseData.slug).replaceAll('_', '-').toLowerCase();
      optional.color = pokemonBaseData.color;
      optional.sprite = pokemonBaseData.sprite;
      optional.baseForme = convertPokemonDataName(pokemonBaseData.baseForme);
      optional.region = isNull(pokemonBaseData.region) ? undefined : pokemonBaseData.region;
      optional.version = isNull(pokemonBaseData.version) ? undefined : pokemonBaseData.version;
      pokemon.pokedexHeightM = pokemonBaseData.heightm;
      pokemon.pokedexWeightKg = pokemonBaseData.weightkg;
      optional.isBaby = pokemonBaseData.isBaby;
      if (pokemonBaseData.prevo) {
        optional.prevEvo = pokemonBaseData.prevo;
      }
      optional.baseStats = pokemonBaseData.baseStats;

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseDefense && !pokemon.stats?.baseStamina) {
        const stats = calculateStatsByTag(undefined, pokemonBaseData.baseStats, pokemonBaseData.slug);
        pokemon.stats = {
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta,
        };
      }
    } else if (pokemonSettings.isForceReleaseGO) {
      optional.version = versionList[0].toLowerCase().replace(' ', '-');
    }

    if (!optional.baseForme && pokemon.pokemonType !== PokemonType.Normal) {
      const defaultForm = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
      if (defaultForm) {
        optional.baseForme = defaultForm.baseForme;
      }
    }

    pokemonSettings.evolutionBranch?.forEach((evo) => {
      const dataEvo = new EvoList();
      const name = getValueOrDefault(String, evo.evolution, pokemon.name);
      if (evo.form) {
        dataEvo.evoToForm = convertAndReplaceNameGO(evo.form, name);
      } else {
        dataEvo.evoToForm = getValueOrDefault(String, pokemon.form?.toString(), formNormal());
      }

      dataEvo.evoToName = name.replace(`_${formNormal()}`, '');
      const pokemonGO = data.find(
        (i) =>
          /^V\d{4}_POKEMON_*/g.test(i.templateId) &&
          i.data.pokemonSettings &&
          isEqual(i.data.pokemonSettings.pokemonId, dataEvo.evoToName) &&
          isEqual(
            convertAndReplaceNameGO(
              getValueOrDefault(
                String,
                i.data.pokemonSettings.form?.toString(),
                pokemon.form?.toString(),
                formNormal()
              ),
              i.data.pokemonSettings.pokemonId
            ),
            dataEvo.evoToForm
          )
      );

      if (pokemonGO) {
        const regEvoId = getValueOrDefault(Array, pokemonGO.templateId.match(/\d{4}/g));
        dataEvo.evoToId = toNumber(regEvoId[0]);
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
      dataEvo.quest = new EvolutionQuest();
      if (evo.genderRequirement) {
        dataEvo.quest.genderRequirement = evo.genderRequirement;
      }
      if (evo.kmBuddyDistanceRequirement > 0) {
        dataEvo.quest.kmBuddyDistanceRequirement = evo.kmBuddyDistanceRequirement;
      }
      if (evo.mustBeBuddy) {
        dataEvo.quest.isMustBeBuddy = evo.mustBeBuddy;
      }
      if (evo.onlyDaytime) {
        dataEvo.quest.isOnlyDaytime = evo.onlyDaytime;
      }
      if (evo.onlyNighttime) {
        dataEvo.quest.isOnlyNighttime = evo.onlyNighttime;
      }
      if (evo.onlyUpsideDown) {
        dataEvo.quest.isOnlyUpsideDown = evo.onlyUpsideDown;
      }
      dataEvo.quest.lureItemRequirement = getLureItemType(evo.lureItemRequirement);
      dataEvo.quest.evolutionItemRequirement = getItemEvolutionType(evo.evolutionItemRequirement);
      if (isNotEmpty(evo.questDisplay)) {
        const questDisplay = evo.questDisplay[0].questRequirementTemplateId;
        const template = data.find((template) => isEqual(template.templateId, questDisplay));
        const goals = template?.data.evolutionQuestTemplate?.goals;
        const quests: IEvolutionQuestCondition[] = [];
        let target = 0;
        goals?.forEach((goal) => {
          const conditions = goal.condition;
          conditions?.forEach((condition) => {
            const quest = new EvolutionQuestCondition();
            quest.desc = condition.type;
            if (condition.withPokemonType) {
              quest.pokemonType = condition.withPokemonType.pokemonType.map((type) =>
                getValueOrDefault(String, type.split('_').at(2))
              );
            }
            if (condition.withThrowType) {
              quest.throwType = condition.withThrowType.throwType.split('_').at(2);
            }
            if (condition.withOpponentPokemonBattleStatus) {
              const opponentPokemonBattle = new OpponentPokemonBattle();
              opponentPokemonBattle.requireDefeat = condition.withOpponentPokemonBattleStatus.requireDefeat;
              opponentPokemonBattle.types = condition.withOpponentPokemonBattleStatus.opponentPokemonType.map((type) =>
                splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
              );
              quest.opponentPokemonBattle = opponentPokemonBattle;
            }
            quests.push(quest);
          });
          target = goal.target;
        });
        dataEvo.quest.condition = quests[0];
        dataEvo.quest.goal = target;
        dataEvo.quest.type = template?.data.evolutionQuestTemplate?.questType;
      } else if (
        pokemonSettings.evolutionBranch &&
        pokemonSettings.evolutionBranch.length > 1 &&
        !isNotEmpty(Object.keys(dataEvo.quest))
      ) {
        dataEvo.quest.isRandomEvolution = !evo.form;
      }
      if (evo.temporaryEvolution) {
        const tempEvo = {
          tempEvolutionName: name + evo.temporaryEvolution.split('TEMP_EVOLUTION').at(1),
          firstTempEvolution: evo.temporaryEvolutionEnergyCost,
          tempEvolution: evo.temporaryEvolutionEnergyCostSubsequent,
          requireMove: evo.obEvolutionBranchRequiredMove ?? evo.evolutionMoveRequirement,
        };
        if (isNotEmpty(optional.tempEvo)) {
          optional.tempEvo?.push(tempEvo);
        } else {
          optional.tempEvo = [tempEvo];
        }
      } else {
        if (isNotEmpty(optional.evoList)) {
          optional.evoList?.push(dataEvo);
        } else {
          optional.evoList = [dataEvo];
        }
      }
    });

    if (pokemon.shadow && pokemon.pokemonType === PokemonType.Shadow) {
      const pokemonOrigin = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
      if (pokemonOrigin) {
        optional.shadowMoves?.forEach((move) => {
          move = replaceTempMoveName(move);
          if (!isIncludeList(pokemonOrigin.shadowMoves, move)) {
            pokemonOrigin.shadowMoves?.push(move);
          }
        });
        optional.purifiedMoves?.forEach((move) => {
          move = replaceTempMoveName(move);
          if (!isIncludeList(pokemonOrigin.purifiedMoves, move)) {
            pokemonOrigin.purifiedMoves?.push(move);
          }
        });
      }
    }

    if (pokemon.pokemonType !== PokemonType.Shadow) {
      const pokemonData = PokemonData.create(pokemon, optional);
      result.push(pokemonData);
    }
  });

  addPokemonFromData(data, result, encounter);
  result = cleanPokemonDupForm(result);

  addPokemonGMaxMove(data, result);
  addPokemonFormChangeMove(result);

  return result.sort((a, b) => a.num - b.num);
};

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
        const pokemonEncounter = encounter.find((e) => isEqual(defaultName, e.name));

        pokemon.encounter = new Encounter({
          ...pokemon.encounter,
          baseCaptureRate: pokemonEncounter?.basecapturerate,
          baseFleeRate: pokemonEncounter?.basefleerate,
        });

        const tempEvo = pokemonSettings.tempEvoOverrides?.find(
          (evo) => pokemon.form && isInclude(evo.tempEvoId, pokemon.form)
        );
        if (tempEvo && isNotEmpty(pokemon.types)) {
          pokemon.stats = tempEvo.stats;
          pokemon.types[0] = splitAndCamelCase(tempEvo.typeOverride1.replace(`${PokemonConfig.Type}_`, ''), '_', '');
          if (tempEvo.typeOverride2) {
            pokemon.types[1] = splitAndCamelCase(tempEvo.typeOverride2.replace(`${PokemonConfig.Type}_`, ''), '_', '');
          }
        } else {
          if (pokemon.pokemonType === PokemonType.Mega) {
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
      }

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack) {
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

      if (!optional.baseForme && pokemon.pokemonType !== PokemonType.Normal) {
        const defaultForm = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
        if (defaultForm) {
          optional.baseForme = defaultForm.baseForme;
        }
      }

      const pokemonData = PokemonData.create(pokemon, optional);
      result.push(pokemonData);
    });

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
              form.moveReassignment?.cinematicMoves?.forEach((move) => {
                if (move.existingMoves && isNotEmpty(move.existingMoves)) {
                  pokemonChange.cinematicMoves = pokemonChange.cinematicMoves?.filter(
                    (pm) => !move.existingMoves?.includes(pm)
                  );
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
              });
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

const checkDefaultStats = (data: PokemonDataGM[], pokemon: PokemonDataGM) => {
  const id = toNumber(getValueOrDefault(Array, pokemon.templateId.match(/\d{4}/g))[0]);
  const defaultPokemon = data.find(
    (item) =>
      item.data.pokemonSettings &&
      !item.data.pokemonSettings.form &&
      item.templateId.startsWith(`V${id.toString().padStart(4, '0')}_POKEMON_`)
  );
  return (
    defaultPokemon &&
    defaultPokemon.data.pokemonSettings.stats &&
    pokemon.data.pokemonSettings.stats &&
    (pokemon.data.pokemonSettings.stats.baseAttack !== defaultPokemon.data.pokemonSettings.stats.baseAttack ||
      pokemon.data.pokemonSettings.stats.baseDefense !== defaultPokemon.data.pokemonSettings.stats.baseDefense ||
      pokemon.data.pokemonSettings.stats.baseStamina !== defaultPokemon.data.pokemonSettings.stats.baseStamina)
  );
};

const applyPokemonReleasedGO = (data: PokemonDataGM[], pokemon: PokemonDataGM, forms: string[]) => {
  const isReleaseGO = !isIncludeList(forms, pokemon.data.pokemonSettings.form) && checkDefaultStats(data, pokemon);
  if (isReleaseGO) {
    pokemon.data.pokemonSettings.isForceReleaseGO = true;
  }
  return isReleaseGO;
};

const pokemonDefaultForm = (data: PokemonDataGM[]) => {
  const forms = optionFormNoneSpecial(data);
  return data.filter(
    (item) =>
      /^V\d{4}_POKEMON_*/g.test(item.templateId) &&
      item.data.pokemonSettings &&
      (!item.data.pokemonSettings.form ||
        applyPokemonReleasedGO(data, item, forms) ||
        isIncludeList(forms, item.data.pokemonSettings.form)) &&
      !item.data.pokemonSettings.form?.toString().endsWith(formNormal())
  );
};

export const optionSticker = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const stickers: ISticker[] = [];
  data
    .filter((item) => /^STICKER_*/g.test(item.templateId))
    .forEach((item) => {
      if (item.data.iapItemDisplay) {
        const id = item.data.iapItemDisplay.sku?.replace('STICKER_', '');
        const sticker = stickers.find((sticker) => isEqual(sticker.id, id.split('.')[0]));
        if (sticker) {
          sticker.isShop = true;
          sticker.pack.push(toNumber(id?.replace(`${sticker.id}.`, '')));
        }
      } else if (item.data.stickerMetadata) {
        const sticker = new Sticker();
        sticker.id = item.data.stickerMetadata.stickerId?.replace('STICKER_', '');
        sticker.maxCount = toNumber(item.data.stickerMetadata.maxCount);
        sticker.stickerUrl = item.data.stickerMetadata.stickerUrl;
        if (item.data.stickerMetadata.pokemonId) {
          sticker.pokemonId = pokemon.find((poke) => isEqual(poke.pokemonId, item.data.stickerMetadata.pokemonId))?.num;
          sticker.pokemonName = item.data.stickerMetadata.pokemonId;
        }
        stickers.push(sticker);
      }
    });
  return stickers;
};

export const optionAssets = (pokemon: IPokemonData[], imgs: string[], sounds: string[]) => {
  const family = UniqValueInArray(pokemon.map((item) => item.pokemonId));
  return family.map((item) => {
    const result = new Asset();
    result.id = toNumber(pokemon.find((poke) => isEqual(poke.pokemonId, item))?.num);
    result.name = item;

    let formSet = imgs.filter((img) => isInclude(img, `/pm${result.id}.`) && !isInclude(img, 'cry'));
    let count = 0;
    while (formSet.length > count) {
      let [, form] = formSet[count].split('.');
      if (isInclude(form, 'GIGANTAMAX', IncludeMode.IncludeIgnoreCaseSensitive)) {
        form = formGmax();
      } else if (isEqual(form, 'icon') || isEqual(form, 'g2')) {
        form = formNormal();
      } else {
        form = form.replace('_NOEVOLVE', '').replace(/[a-z]/g, '');
      }
      let gender = GenderType.GenderLess;
      const isShiny = isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.s.icon`);
      if (
        !isInclude(formSet[count], '.g2.') &&
        isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.g2.icon`)
      ) {
        gender = GenderType.Male;
      } else if (isInclude(formSet[count], '.g2.')) {
        gender = GenderType.Female;
      }
      form = result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form;
      result.image.push(
        new ImageModel({
          gender,
          pokemonId: result.id,
          form,
          default: formSet[count],
          shiny: isShiny ? formSet[count + 1] : undefined,
        })
      );
      count += Number(isShiny) + 1;
    }

    formSet = imgs.filter(
      (img) =>
        !isInclude(img, '/') &&
        (isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}_51`) ||
          isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}_52`))
    );
    if (
      !isIncludeList(
        result.image.map((i) => i.pokemonType),
        PokemonType.Mega
      )
    ) {
      for (let index = 0; index < formSet.length; index += 2) {
        const form = formSet.length === 2 ? formMega() : isInclude(formSet[index], '_51') ? formMegaX() : formMegaY();
        result.image.push(
          new ImageModel({
            gender: GenderType.GenderLess,
            pokemonId: result.id,
            form,
            default: formSet[index],
            shiny: formSet[index + 1],
          })
        );
      }
    }

    const formList = result.image.map((img) => img.form?.replaceAll('_', ''));
    formSet = imgs.filter(
      (img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_pm${result.id.toString().padStart(4, '0')}`)
    );
    for (let index = 0; index < formSet.length; index += 2) {
      const subForm = formSet[index].replace('_shiny', '').split('_');
      let form = subForm[subForm.length - 1].toUpperCase();
      form = result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form;
      if (!isIncludeList(formList, form)) {
        formList.push(form);
        result.image.push(
          new ImageModel({
            gender: GenderType.GenderLess,
            pokemonId: result.id,
            form,
            default: formSet[index],
            shiny: formSet[index + 1],
          })
        );
      }
    }

    if (!isNotEmpty(result.image)) {
      formSet = imgs.filter(
        (img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}`)
      );
      for (let index = 0; index < formSet.length; index += 2) {
        let form = formNormal();
        form = result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form;
        if (!isIncludeList(formList, form)) {
          formList.push(form);
          result.image.push(
            new ImageModel({
              gender: GenderType.GenderLess,
              pokemonId: result.id,
              form,
              default: formSet[index],
              shiny: formSet[index + 1],
            })
          );
        }
      }
    }

    let soundForm = sounds.filter((sound) => isInclude(sound, `/pm${result.id}.`) && isInclude(sound, 'cry'));
    result.sound.cry = soundForm.map((sound) => {
      let [, form] = sound.split('.');
      if (isEqual(form, 'cry')) {
        form = formNormal();
      } else {
        form = form.replace(/[a-z]/g, '');
      }
      return new CryPath({
        form,
        path: sound,
      });
    });

    soundForm = sounds.filter(
      (sound) =>
        !isInclude(sound, '/') &&
        (isInclude(sound, `pv${result.id.toString().padStart(3, '0')}_51`) ||
          isInclude(sound, `pv${result.id.toString().padStart(3, '0')}_52`))
    );
    if (
      !isIncludeList(
        result.sound.cry.map((i) => i.pokemonType),
        PokemonType.Mega
      )
    ) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: soundForm.length !== 2 ? formMega() : isInclude(sound, '_51') ? formMegaX() : formMegaY(),
            path: sound,
          })
        );
      });
    }
    soundForm = sounds.filter(
      (sound) => !isInclude(sound, '/') && isInclude(sound, `pv${result.id.toString().padStart(3, '0')}`)
    );
    if (!isNotEmpty(result.sound.cry)) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: isInclude(sound, '_31') ? formSpecial() : formNormal(),
            path: sound,
          })
        );
      });
    }
    return result;
  });
};

export const optionCombat = (data: PokemonDataGM[], types: ITypeEffectiveModel): ICombat[] => {
  const moves = extractBasicMoves(data);
  const sequence = extractMoveSequences(data);
  const moveSet = processCombatMoves(data, moves, sequence);
  return processSpecialMoves(data, moveSet, types);

  function extractBasicMoves(data: PokemonDataGM[]) {
    return data
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
  }

  function extractMoveSequences(data: PokemonDataGM[]) {
    return data
      .filter(
        (item) =>
          isInclude(item.templateId, 'sequence_') &&
          item.data.moveSequenceSettings.sequence.find((seq) => isInclude(seq, 'sfx attacker'))
      )
      .map((item) => {
        return new Sequence({
          id: item.templateId.replace('sequence_', '').toUpperCase(),
          path: item.data.moveSequenceSettings.sequence
            .find((seq) => isInclude(seq, 'sfx attacker'))
            ?.replace('sfx attacker ', ''),
        });
      });
  }

  function processGMaxMoves(data: PokemonDataGM[], lastTrackId: number) {
    return data
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
  }

  function processCombatMoves(data: PokemonDataGM[], moves: Move[], sequence: Sequence[]) {
    return data
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

        if (item.templateId.endsWith(`_${fastMoveType}`) || isInclude(item.templateId, `_${fastMoveType}_`)) {
          result.typeMove = TypeMove.Fast;
        } else {
          result.typeMove = TypeMove.Charge;
        }

        result.pvpPower = toNumber(item.data.combatMove.power);
        result.pvpEnergy = toNumber(item.data.combatMove.energyDelta);

        const seq = sequence.find((seq) => isEqual(seq.id, result.name));
        result.sound = seq?.path;

        if (item.data.combatMove.buffs) {
          result.buffs = processBuffs(item.data.combatMove.buffs);
        }

        const move = moves.find((move) => isEqual(move.name, result.name));
        result.name = replaceTempMoveName(result.name);

        if (isEqual(result.name, 'STRUGGLE')) {
          result.pveEnergy = -33;
        }

        if (move) {
          setMoveStats(result, move);
        }

        return result;
      });
  }

  function processBuffs(buffs: MoveBuff) {
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
  }

  function setMoveStats(result: Combat, move: Move) {
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
  }

  function processSpecialMoves(data: PokemonDataGM[], moveSet: Combat[], types: ITypeEffectiveModel) {
    const result = [...moveSet];

    moveSet
      .filter((move) => move.id === 281)
      .forEach((move) => {
        move.isMultipleWithType = true;

        Object.keys(types)
          .filter(
            (type) =>
              !isEqual(
                type,
                getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Normal),
                EqualMode.IgnoreCaseSensitive
              ) &&
              !isEqual(type, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Fairy), EqualMode.IgnoreCaseSensitive)
          )
          .forEach((type, index) =>
            result.push(
              Combat.create({
                ...move,
                id: toNumber(`${move.id}${index}`),
                name: `${move.name}_${type}`,
                type,
              })
            )
          );
      });

    const lastTrackId = result.sort((a, b) => b.track - a.track)[0].track;
    const gMaxMoves = processGMaxMoves(data, lastTrackId);
    return [...result, ...gMaxMoves];
  }
};

const setPokemonPermission = (
  pokemonData: IPokemonData[],
  pokemon: IPokemonPermission[] | undefined,
  pokemonPermission: IPokemonPermission[] = []
) => {
  pokemon?.forEach((currentPokemon) => {
    const item = pokemonData.find((i) => isEqual(i.pokemonId, currentPokemon.id));
    if (isNotEmpty(currentPokemon.forms)) {
      currentPokemon.forms
        ?.filter((form) => !isEqual(form, 'FORM_UNSET'))
        .forEach((form) => {
          form = form?.replace(`${currentPokemon.id}_`, '');
          pokemonPermission.push(
            new PokemonPermission({
              id: item?.num,
              name: item?.pokemonId,
              form,
              pokemonType: getPokemonType(form),
            })
          );
        });
    } else {
      const form = getValueOrDefault(String, currentPokemon.form?.replace(`${currentPokemon.id}_`, ''), formNormal());
      pokemonPermission.push(
        new PokemonPermission({
          id: item?.num,
          name: item?.pokemonId,
          form,
          pokemonType: getPokemonType(form),
        })
      );
    }
  });
  return pokemonPermission.sort((a, b) => toNumber(a.id) - toNumber(b.id));
};

export const optionLeagues = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const result = new LeagueData();
  result.allowLeagues = getValueOrDefault(
    Array,
    data
      .find((item) => isEqual(item.templateId, TemplateId.BattleClientSetting))
      ?.data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId.map((item) =>
        item.replace(TemplateId.CombatLeague, '').replace('_VS_SEEKER_', '').replace('DEFAULT_', '')
      )
  );

  result.data = data
    .filter(
      (item) => item.templateId.startsWith(`${TemplateId.CombatLeague}_`) && !isInclude(item.templateId, 'SETTINGS')
    )
    .map((item) => {
      const result = new League();
      result.id = item.templateId
        .replace(TemplateId.CombatLeague, '')
        .replace('_VS_SEEKER_', '')
        .replace('DEFAULT_', '');
      const combatTitle = getValueOrDefault(String, item.data.combatLeague?.title);
      const title = getTextWithKey<string>(textEng, combatTitle);
      if (title) {
        result.title = splitAndCapitalize(title, ' ', ' ');
      } else {
        result.title = splitAndCapitalize(combatTitle.replace('combat_', '').replace('_title', ''), '_', ' ');
      }
      result.enabled = getValueOrDefault(Boolean, item.data.combatLeague?.enabled);
      result.pokemonCount = toNumber(item.data.combatLeague?.pokemonCount);
      result.allowEvolutions = item.data.combatLeague?.allowTempEvos;
      result.combatLeagueTemplate = item.data.combatLeague?.battlePartyCombatLeagueTemplateId;
      const leagueType = getDataWithKey<LeagueType>(
        LeagueType,
        item.data.combatLeague?.leagueType,
        EqualMode.IgnoreCaseSensitive
      );
      if (!isNullOrUndefined(leagueType)) {
        result.leagueType = leagueType;
      }
      item.data.combatLeague?.pokemonCondition.forEach((con) => {
        result.conditions.uniqueSelected = con.type === LeagueConditionType.UniquePokemon;
        switch (con.type) {
          case LeagueConditionType.CaughtTime:
            result.conditions.timestamp = LeagueTimestamp.create({
              start: con.pokemonCaughtTimestamp?.afterTimestamp,
              end: con.pokemonCaughtTimestamp?.beforeTimestamp,
            });
            break;
          case LeagueConditionType.PokemonType:
            result.conditions.uniqueType = getValueOrDefault(
              Array,
              con.withPokemonType?.pokemonType.map((type) =>
                splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
              )
            );
            break;
          case LeagueConditionType.PokemonLevelRange:
            result.conditions.maxLevel = con.pokemonLevelRange?.maxLevel;
            break;
          case LeagueConditionType.PokemonLimitCP:
            result.conditions.maxCp = con.withPokemonCpLimit?.maxCp;
            break;
          case LeagueConditionType.WhiteList:
            result.conditions.whiteList = setPokemonPermission(pokemon, con.pokemonWhiteList?.pokemon);
            break;
          case LeagueConditionType.BanList:
            result.conditions.banned = setPokemonPermission(pokemon, con.pokemonBanList?.pokemon);
            break;
        }
      });
      result.leagueBattleType = getLeagueBattleType(toNumber(result.conditions.maxCp));
      result.iconUrl = item.data.combatLeague?.iconUrl
        .replace(APIUrl.POGO_PROD_ASSET_URL, '')
        .replace(`${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/`, '');
      if (!item.data.combatLeague?.badgeType && isInclude(item.templateId, `${TemplateId.CombatLeagueSeeker}`)) {
        result.league = `${result.id.replace(/[^GREAT|^ULTRA|^MASTER].*/, '')}_LEAGUE`;
      } else if (item.data.combatLeague?.badgeType) {
        result.league = item.data.combatLeague.badgeType.replace('BADGE_', '');
      }
      if (item.data.combatLeague && isNotEmpty(item.data.combatLeague.bannedPokemon)) {
        const banList = result.conditions.banned.concat(
          item.data.combatLeague.bannedPokemon.map((poke) => {
            const item = pokemon.find((item) => isEqual(item.pokemonId, poke));
            return new PokemonPermission({
              id: item?.num,
              name: item?.pokemonId,
              form: formNormal(),
              pokemonType: PokemonType.Normal,
            });
          })
        );
        result.conditions.banned = banList.sort((a, b) => toNumber(a.id) - toNumber(b.id));
      }
      return result;
    });

  const seasons = data.find((item) => isEqual(item.templateId, TemplateId.CombatSeasonSetting))?.data
    .combatCompetitiveSeasonSettings.seasonEndTimeTimestamp;
  const rewards = new Reward();
  data
    .filter((item) => /VS_SEEKER_LOOT_PER_WIN_SETTINGS_RANK_/.test(item.templateId))
    .forEach((item) => {
      const data = item.data.vsSeekerLoot;
      if (!rewards.rank[data.rankLevel]) {
        rewards.rank[data.rankLevel] = RankRewardLeague.create(data.rankLevel);
      }
      data.reward.slice(0, 5).forEach((reward, index) => {
        const result = new RankRewardSetLeague();
        result.step = index + 1;
        if (reward.pokemonReward) {
          result.type = RewardType.Pokemon;
          result.count = 1;
        } else if (reward.itemRankingLootTableCount) {
          result.type = RewardType.ItemLoot;
          result.count = reward.itemRankingLootTableCount;
        } else if (reward.item) {
          if (reward.item.stardust) {
            result.type = RewardType.Stardust;
          } else {
            result.type = reward.item.item;
          }
          result.count = reward.item.count;
        }
        if (!data.rewardTrack) {
          rewards.rank[data.rankLevel].free?.push(result);
        } else {
          rewards.rank[data.rankLevel].premium?.push(result);
        }
      });
    });

  data
    .filter((item) => /VS_SEEKER_POKEMON_REWARDS_/.test(item.templateId))
    .forEach((item) => {
      const data = item.data.vsSeekerPokemonRewards;
      data.availablePokemon.forEach((value) => {
        if (!rewards.pokemon[value.unlockedAtRank]) {
          rewards.pokemon[value.unlockedAtRank] = PokemonRewardLeague.create(value.unlockedAtRank);
        }
        const result = new PokemonRewardSetLeague();
        let poke = new PokemonReward();
        if (value.guaranteedLimitedPokemonReward) {
          result.guaranteedLimited = true;
          poke = value.guaranteedLimitedPokemonReward.pokemon;
        } else {
          poke = value.pokemon;
        }
        result.id = toNumber(pokemon.find((item) => isEqual(item.pokemonId, poke.pokemonId))?.num);
        result.name = poke.pokemonId;
        if (poke.pokemonDisplay) {
          result.form = poke.pokemonDisplay.form?.replace(`${poke.pokemonId}_`, '');
        } else {
          result.form = formNormal();
        }
        const rewardType = getKeyWithData(LeagueRewardType, LeagueRewardType.Free);
        if (isInclude(item.templateId, rewardType, IncludeMode.IncludeIgnoreCaseSensitive)) {
          rewards.pokemon[value.unlockedAtRank].free?.push(result);
        } else {
          rewards.pokemon[value.unlockedAtRank].premium?.push(result);
        }
      });
    });

  if (seasons) {
    result.season = Season.create({
      season: seasons.length - 1,
      timestamp: LeagueTimestamp.create({
        start: toNumber(seasons[seasons.length - 3]),
        end: toNumber(seasons[seasons.length - 2]),
      }),
      rewards,
      settings: getValueOrDefault(
        Array,
        data.find((item) => isEqual(item.templateId, `COMBAT_RANKING_SETTINGS_S${seasons.length - 1}`))?.data
          .combatRankingProtoSettings.rankLevel
      ),
    });
  }

  return result;
};

const mappingPokemonEvoInfo = (pokemonData: EvolutionChainData[] | undefined, pokemon: IPokemonData[]) => {
  const result: IEvolutionInfo[] = [];
  pokemonData?.forEach((item) => {
    const form = getValueOrDefault(
      String,
      item.headerMessage?.replace('_pokedex_header', '').toUpperCase(),
      formNormal()
    );
    item.evolutionInfos.forEach((info) => {
      const id = toNumber(pokemon.find((poke) => isEqual(poke.pokemonId, info.pokemon))?.num);
      result.push(
        EvolutionInfo.create({
          id,
          form,
          pokemonId: info.pokemon,
        })
      );
    });
  });
  return result;
};

export const optionEvolutionChain = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  return data
    .filter((item) => /^EVOLUTION_V\d{4}_*/g.test(item.templateId))
    .map((item) => {
      const id = toNumber(getValueOrDefault(Array, item.templateId.match(/\d{4}/g))[0]);
      return EvolutionChain.create({
        id,
        pokemonId: item.data.evolutionChainDisplaySettings.pokemon,
        evolutionInfos: mappingPokemonEvoInfo(item.data.evolutionChainDisplaySettings.evolutionChains, pokemon),
      });
    });
};

export const mappingReleasedPokemonGO = (pokemonData: IPokemonData[], assets: IAsset[]) => {
  pokemonData.forEach((item) => {
    const form = assets.find((asset) => asset.id === item.num);
    const image = form?.image.find((img) =>
      isEqual(img.form, item.num === 201 ? `${item.pokemonId}_${item.baseForme}` : item.form)
    );

    if (form && (item.hasShadowForm || (checkMoveSetAvailable(item) && image?.default))) {
      item.releasedGO = getValueOrDefault(Boolean, item.hasShadowForm || isInclude(image?.default, '/'));
    }
  });
};

const convertMoveName = (combat: ICombat[], moves: string[] | undefined, lastTrackId: number) => {
  return moves?.map((move) => {
    if (isNumber(move)) {
      const id = toNumber(move);
      const result = combat.find((item) => item.id === id);
      if (result) {
        return result.name;
      }
    }
    if (/^VN_BM_\d{3}$/g.test(move)) {
      const id = toNumber(getValueOrDefault(Array, move.match(/\d{3}/g))[0]);
      const result = combat.find((item) => item.track === lastTrackId + id && isEqual(item.moveType, MoveType.Dynamax));
      if (result) {
        return result.name;
      }
    }
    return move;
  });
};

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

const getInformationReward = (ticket: GlobalEventTicket | undefined, pokemonData: IPokemonData[]) => {
  const rewards: ITicketReward[] = [];
  if (ticket && isNotEmpty(ticket.iconRewards)) {
    ticket.iconRewards?.forEach((result) => {
      const reward = new TicketReward();
      reward.type = getTicketRewardType(result.type);
      if (result.avatarTemplateId || result.neutralAvatarItemTemplate) {
        reward.avatarTemplateId = result.avatarTemplateId;
        reward.neutralAvatarItemTemplate = result.neutralAvatarItemTemplate;
      } else if (result.exp) {
        reward.exp = result.exp;
      } else if (result.stardust) {
        reward.stardust = result.stardust;
      } else if (result.pokecoin) {
        reward.pokeCoin = result.pokecoin;
      } else if (result.item) {
        reward.item = {
          ...result.item,
          item: result.item.item.toString(),
        };
      } else if (result.pokemonEncounter) {
        const id = pokemonData.find((poke) => poke.pokemonId === result.pokemonEncounter?.pokemonId)?.num;
        reward.pokemon = {
          id,
          pokemonId: result.pokemonEncounter.pokemonId,
          form: result.pokemonEncounter.pokemonDisplay?.form?.replace(`${result.pokemonEncounter.pokemonId}_`, ''),
          costume: result.pokemonEncounter.pokemonDisplay?.costume,
        };
      } else if (result.candy) {
        const id = pokemonData.find((poke) => poke.pokemonId === result.candy?.pokemonId)?.num;
        reward.candy = {
          id,
          pokemonId: result.candy.pokemonId,
          amount: result.candy.amount,
        };
      }
      rewards.push(reward);
    });
  }
  return rewards;
};

const getTextWithKey = <T>(data: object, findKey: string | number) => {
  const result = safeObjectEntries(data).find(([key]) =>
    isInclude(key, findKey, IncludeMode.IncludeIgnoreCaseSensitive)
  );
  return result && isNotEmpty(result) ? (result[1] as T) : undefined;
};

const getInformationTitle = (itemSettings: ItemSettings | undefined) => {
  if (itemSettings) {
    const textKey = getValueOrDefault(String, itemSettings.nameOverride);
    const result = getDataWithKey<string>(textEng, textKey, EqualMode.IgnoreCaseSensitive);
    if (result) {
      return result;
    }
    if (itemSettings.globalEventTicket.eventBannerUrl) {
      let descKey = itemSettings.globalEventTicket.eventBannerUrl.split('/');
      let srcText = descKey[descKey.length - 1];
      srcText = getValueOrDefault(String, srcText)
        .replaceAll('-', '_')
        .replace(/\.[^.]*$/, '')
        .replace(/^PGO_MCS_/, '');
      const [firstText] = srcText.split('_');
      if (isNumber(firstText) && !itemSettings.globalEventTicket.titleImageUrl) {
        const descKey = itemSettings.globalEventTicket.itemBagDescriptionKey.split('_');
        return splitAndCapitalize(descKey[descKey.length - 1], /(?=[A-Z])/, ' ');
      }
      descKey = srcText.split('_');
      if (/^PGO/i.test(descKey[0])) {
        const msgList: string[] = [];
        for (const text of descKey.slice(1)) {
          if (/[\d*]x[\d*]/i.test(text)) {
            break;
          }
          msgList.push(text);
        }
        return msgList
          .map((text) => text?.replace(/^S/i, 'Season '))
          .map((text) => capitalize(text))
          .join(' ');
      } else {
        descKey = descKey
          .filter(
            (text) =>
              /^S[\d*]/i.test(text) ||
              isInclude(itemSettings.descriptionOverride, text, IncludeMode.IncludeIgnoreCaseSensitive)
          )
          .map((text) => text?.replace(/^S/i, 'Season '));
      }
      if (!isNotEmpty(descKey)) {
        const descriptionOverride = getValueOrDefault(Array, itemSettings.descriptionOverride?.split('_'));
        return capitalize(descriptionOverride[descriptionOverride?.length - 1]);
      }
      return descKey.map((text) => capitalize(text)).join(' ');
    }
  }
  return;
};

const getInformationDesc = (itemSettings: ItemSettings | undefined) => {
  const textKey = getValueOrDefault(
    String,
    itemSettings?.descriptionOverride,
    itemSettings?.globalEventTicket.itemBagDescriptionKey
  );
  if (!textKey) {
    return;
  }
  const result = getTextWithKey<string>(textEng, textKey);
  return result;
};

const getInformationDetails = (itemSettings: ItemSettings | undefined) => {
  const textKey = getValueOrDefault(String, itemSettings?.globalEventTicket.detailsLinkKey);
  if (!textKey) {
    return;
  }
  const result = getTextWithKey<string>(textEng, textKey);
  return result;
};

export const optionInformation = (data: PokemonDataGM[], pokemonData: IPokemonData[]) =>
  data
    .filter(
      (item) =>
        item.templateId.startsWith('ITEM_') && item.data.itemSettings && item.data.itemSettings.globalEventTicket
    )
    .map((item) =>
      Information.create({
        id: item.templateId,
        title: getInformationTitle(item.data.itemSettings),
        desc: getInformationDesc(item.data.itemSettings),
        type: item.data.itemSettings?.itemType,
        startTime: item.data.itemSettings?.globalEventTicket.eventStartTime,
        endTime: item.data.itemSettings?.globalEventTicket.eventEndTime,
        bannerUrl: item.data.itemSettings?.globalEventTicket.eventBannerUrl,
        backgroundImgUrl: item.data.itemSettings?.globalEventTicket.backgroundImageUrl,
        titleImgUrl: item.data.itemSettings?.globalEventTicket.titleImageUrl,
        giftAble: Boolean(item.data.itemSettings?.globalEventTicket.giftable),
        giftItem: item.data.itemSettings?.globalEventTicket.giftItem,
        detailsLink: getInformationDetails(item.data.itemSettings),
        rewards: getInformationReward(item.data.itemSettings?.globalEventTicket, pokemonData),
      })
    );

export const optionTrainer = (data: PokemonDataGM[]) =>
  data
    .filter((item) => /^AWARDS_LEVEL_(\d*)$/.test(item.templateId) && item.data.levelUpRewardSettings)
    .map((item) =>
      TrainerLevelUp.create({
        level: item.data.levelUpRewardSettings.level,
        items: item.data.levelUpRewardSettings.items.map((value, index) => ({
          name: value,
          amount: item.data.levelUpRewardSettings.itemsCount[index],
        })),
        itemsUnlock: item.data.levelUpRewardSettings.itemsUnlocked,
      })
    )
    .sort((a, b) => a.level - b.level);
