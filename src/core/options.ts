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
  getKeyWithData,
  getLureItemType,
  getPokemonType,
  getTicketRewardType,
  replacePokemonGoForm,
  replaceTempMoveName,
} from '../util/utils';
import { ITypeSet, PokemonTypeBadge, TypeSet } from './models/type.model';
import { BuffType, PokemonType, TypeAction, TypeMove } from '../enums/type.enum';
import {
  Encounter,
  IPokemonData,
  PokemonData,
  PokemonDataOptional,
  PokemonEncounter,
  PokemonGenderRatio,
  PokemonModel,
  StatsGO,
} from './models/pokemon.model';
import { ITypeEff } from './models/type-eff.model';
import {
  FORM_ARMOR,
  FORM_GALARIAN,
  FORM_MEGA,
  FORM_MEGA_X,
  FORM_MEGA_Y,
  FORM_NORMAL,
  FORM_SHADOW,
  FORM_SPECIAL,
  MIN_LEVEL,
  PATH_ASSET_POKEGO,
} from '../util/constants';
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
} from './models/options.model';
import { calculateStatsByTag } from '../util/calculate';
import { APITree } from '../services/models/api.model';
import { DynamicObj, getValueOrDefault, isEqual, isInclude, isIncludeList, isNotEmpty, isNotNumber, toNumber } from '../util/extension';
import { GenderType } from './enums/asset.enum';
import { EqualMode, IncludeMode } from '../util/enums/string.enum';
import { LeagueRewardType, RewardType } from './enums/league.enum';
import { ItemEvolutionRequireType, ItemEvolutionType, LeagueConditionType } from './enums/option.enum';
import { StatsBase } from './models/stats.model';
import { EvolutionChain, EvolutionInfo, IEvolutionInfo } from './models/evolution-chain.model';
import { Information, ITicketReward, TicketReward } from './models/information';

export const getOption = <T>(options: any, args: string[], defaultValue?: T): T => {
  if (!options) {
    return defaultValue || options;
  }

  args.forEach((arg) => {
    try {
      options = options[arg];
    } catch {
      return defaultValue;
    }
  });
  return options || defaultValue;
};

export const optionSettings = (data: PokemonDataGM[]) => {
  const settings = new Options();

  data.forEach((item) => {
    if (item.templateId === 'PLAYER_LEVEL_SETTINGS') {
      settings.playerSetting.levelUps = item.data.playerLevel.rankNum.map((value, index) => ({
        level: index + value,
        amount: value,
        requiredExp: item.data.playerLevel.requiredExperience[index],
      }));
      const cpmList = item.data.playerLevel.cpMultiplier;
      for (let level = MIN_LEVEL; level <= cpmList.length; level++) {
        const cpmLow = toNumber(cpmList[level - 1]);
        const cpmHigh = toNumber(cpmList[level]);

        settings.playerSetting.cpMultipliers[level] = cpmLow;
        if (cpmHigh > 0) {
          const multiplier = Math.sqrt(Math.pow(cpmLow, 2) - Math.pow(cpmLow, 2) / 2 + Math.pow(cpmHigh, 2) / 2);
          settings.playerSetting.cpMultipliers[level + 0.5] = multiplier;
        }
      }
    } else if (item.templateId === 'COMBAT_SETTINGS') {
      settings.combatOptions.stab = item.data.combatSettings.sameTypeAttackBonusMultiplier;
      settings.combatOptions.shadowBonus.atk = item.data.combatSettings.shadowPokemonAttackBonusMultiplier;
      settings.combatOptions.shadowBonus.def = item.data.combatSettings.shadowPokemonDefenseBonusMultiplier;
      settings.combatOptions.purifiedBonus = StatsBase.setValue(item.data.combatSettings.purifiedPokemonAttackMultiplierVsShadow);
      settings.combatOptions.maxEnergy = item.data.combatSettings.maxEnergy;

      settings.throwCharge.normal = item.data.combatSettings.chargeScoreBase;
      settings.throwCharge.nice = item.data.combatSettings.chargeScoreNice;
      settings.throwCharge.great = item.data.combatSettings.chargeScoreGreat;
      settings.throwCharge.excellent = item.data.combatSettings.chargeScoreExcellent;
    } else if (item.templateId === 'BATTLE_SETTINGS') {
      settings.battleOptions.enemyAttackInterval = item.data.battleSettings.enemyAttackInterval;
      settings.battleOptions.stab = item.data.battleSettings.sameTypeAttackBonusMultiplier;
      settings.battleOptions.shadowBonus.atk = item.data.battleSettings.shadowPokemonAttackBonusMultiplier;
      settings.battleOptions.shadowBonus.def = item.data.battleSettings.shadowPokemonDefenseBonusMultiplier;
      settings.battleOptions.purifiedBonus = StatsBase.setValue(item.data.battleSettings.purifiedPokemonAttackMultiplierVsShadow);
      settings.battleOptions.maxEnergy = item.data.battleSettings.maximumEnergy;
      settings.battleOptions.dodgeDamageReductionPercent = item.data.battleSettings.dodgeDamageReductionPercent;
    } else if (isInclude(item.templateId, 'BUDDY_LEVEL_')) {
      const level = item.templateId.replace('BUDDY_LEVEL_', '');
      settings.buddyFriendship[level] = new BuddyFriendship();
      settings.buddyFriendship[level].level = toNumber(level);
      settings.buddyFriendship[level].minNonCumulativePointsRequired = item.data.buddyLevelSettings.minNonCumulativePointsRequired;
      settings.buddyFriendship[level].unlockedTrading = item.data.buddyLevelSettings.unlockedTraits;
    } else if (isInclude(item.templateId, 'FRIENDSHIP_LEVEL_')) {
      const level = item.templateId.replace('FRIENDSHIP_LEVEL_', '');
      settings.trainerFriendship[level] = new TrainerFriendship();
      settings.trainerFriendship[level].level = toNumber(level);
      settings.trainerFriendship[level].atkBonus = item.data.friendshipMilestoneSettings.attackBonusPercentage;
      settings.trainerFriendship[level].unlockedTrading = item.data.friendshipMilestoneSettings.unlockedTrading;
    }
  });
  return settings;
};

export const optionPokeImg = (data: APITree) => {
  return data.tree
    .filter((item) => !isEqual(item.path, PATH_ASSET_POKEGO))
    .map((item) => item.path.replace('.png', '').replace(PATH_ASSET_POKEGO, ''));
};

export const optionPokeSound = (data: APITree) => {
  return data.tree
    .filter((item) => !isEqual(item.path, PATH_ASSET_POKEGO))
    .map((item) => item.path.replace('.wav', '').replace(PATH_ASSET_POKEGO, ''));
};

export const optionPokemonTypes = (data: PokemonDataGM[]) => {
  const types = new TypeSet() as unknown as DynamicObj<DynamicObj<number>>;
  const typeSet = Object.keys(types);
  data
    .filter((item) => /^POKEMON_TYPE*/g.test(item.templateId))
    .forEach((item) => {
      const rootType = item.templateId.replace('POKEMON_TYPE_', '');
      typeSet.forEach((type, index) => {
        types[rootType][type] = item.data.typeEffective.attackScalar[index];
      });
    });
  return types as unknown as ITypeSet;
};

const optionFormNoneSpecial = (data: PokemonDataGM[]) => {
  const result: string[] = [];
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

const findPokemonData = (id: number, name: string, isDefault = false) => {
  return Object.values(pokemonStoreData).find(
    (pokemon) =>
      pokemon.num === id && isEqual(name, convertPokemonDataName(isDefault ? pokemon.slug : pokemon.baseFormeSlug ?? pokemon.slug))
  ) as IPokemonData | undefined;
};

const convertAndReplaceNameGO = (name: string, defaultName = '') => {
  return name
    .replace(`${replacePokemonGoForm(defaultName)}_`, '')
    .replace(/^S$/gi, FORM_SHADOW)
    .replace(/^A$/gi, FORM_ARMOR)
    .replace(/GALARIAN_STANDARD/, FORM_GALARIAN);
};

export const optionPokemonData = (data: PokemonDataGM[], encounter?: PokemonEncounter[]) => {
  let result: IPokemonData[] = [];
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    const regId = getValueOrDefault(Array, item.templateId.match(/\d{4}/g)) as string[];
    const pokemon = new PokemonModel(regId[0], undefined, pokemonSettings);

    if (!pokemonSettings.form) {
      pokemon.form = FORM_NORMAL;
    } else if (pokemon.id !== 201) {
      pokemon.form = convertAndReplaceNameGO(pokemonSettings.form.toString(), pokemonSettings.pokemonId);
    }
    if (pokemon.id !== 201) {
      pokemon.name = pokemonSettings.form ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;
    } else {
      const form = getValueOrDefault(String, pokemon.form?.toString());
      pokemon.name = form;
      pokemon.form = form.replace(/UNOWN_/, '');
    }
    pokemon.pokemonType = getPokemonType(pokemon.form);

    const types: string[] = [];
    if (pokemonSettings.type) {
      types.push(pokemonSettings.type.replace('POKEMON_TYPE_', ''));
    }
    if (pokemonSettings.type2) {
      types.push(pokemonSettings.type2.replace('POKEMON_TYPE_', ''));
    }

    const defaultName = pokemonSettings.form ? pokemonSettings.form.toString() : pokemonSettings.pokemonId;
    const pokemonEncounter = encounter?.find((e) => isEqual(defaultName, e.name));

    pokemon.encounter = new Encounter({
      ...pokemon.encounter,
      baseCaptureRate: pokemonEncounter?.basecapturerate,
      baseFleeRate: pokemonEncounter?.basecapturerate,
    });

    const optional = new PokemonDataOptional({
      baseStatsGO: true,
    });

    if (pokemon.id === 235) {
      const moves = data.find((item) => item.templateId === 'SMEARGLE_MOVES_SETTINGS')?.data.smeargleMovesSettings;
      pokemon.quickMoves = moves?.quickMoves;
      pokemon.cinematicMoves = moves?.cinematicMoves;
    }

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
    const gender = data.find((item) => item.templateId === `SPAWN_V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${goForm}`);

    optional.genderRatio = PokemonGenderRatio.create(
      gender?.data.genderSettings.gender?.malePercent,
      gender?.data.genderSettings.gender?.femalePercent
    );

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      pokemon.form && pokemon.pokemonType !== PokemonType.Normal ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId,
      pokemon.pokemonType === PokemonType.Normal
    );
    if (pokemonBaseData) {
      optional.slug = convertPokemonDataName(pokemonBaseData.slug).replaceAll('_', '-').toLowerCase();
      optional.color = pokemonBaseData.color;
      optional.sprite = pokemonBaseData.sprite;
      optional.baseForme = convertPokemonDataName(pokemonBaseData.baseForme);
      optional.region = pokemonBaseData.region;
      optional.version = pokemonBaseData.version;
      pokemon.pokedexHeightM = pokemonBaseData.heightm;
      pokemon.pokedexWeightKg = pokemonBaseData.weightkg;
      optional.isBaby = pokemonBaseData.isBaby;

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseDefense && !pokemon.stats?.baseStamina) {
        const stats = calculateStatsByTag(undefined, pokemonBaseData.baseStats, pokemonBaseData.slug);
        pokemon.stats = {
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta,
        };
      }
    } else if (pokemonSettings.isForceReleaseGO) {
      optional.version = 'pokémon-go';
    }

    if (!optional.baseForme && pokemon.pokemonType !== PokemonType.Normal) {
      const defaultForm = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
      if (defaultForm) {
        optional.baseForme = defaultForm.baseForme;
      }
    }

    pokemonSettings.evolutionBranch?.forEach((evo) => {
      const dataEvo = new EvoList();
      const name = evo.evolution ?? pokemon.name;
      if (evo.form) {
        dataEvo.evoToForm = convertAndReplaceNameGO(evo.form, name);
      } else {
        dataEvo.evoToForm = pokemon.form?.toString() ?? FORM_NORMAL;
      }

      dataEvo.evoToName = name.replace(`_${FORM_NORMAL}`, '');
      const pokemonGO = data.find(
        (i) =>
          /^V\d{4}_POKEMON_*/g.test(i.templateId) &&
          i.data.pokemonSettings &&
          isEqual(i.data.pokemonSettings.pokemonId, dataEvo.evoToName) &&
          isEqual(
            convertAndReplaceNameGO(
              i.data.pokemonSettings.form?.toString() ?? pokemon.form?.toString() ?? FORM_NORMAL,
              i.data.pokemonSettings.pokemonId
            ),
            dataEvo.evoToForm
          )
      );

      if (pokemonGO) {
        const regEvoId = pokemonGO.templateId.match(/\d{4}/g) as string[];
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
      switch (evo.evolutionItemRequirement) {
        case ItemEvolutionType.SunStone:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.SunStone;
          break;
        case ItemEvolutionType.KingsRock:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.KingsRock;
          break;
        case ItemEvolutionType.MetalCoat:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.MetalCoat;
          break;
        case ItemEvolutionType.Gen4Stone:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Gen4Stone;
          break;
        case ItemEvolutionType.DragonScale:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.DragonScale;
          break;
        case ItemEvolutionType.Upgrade:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Upgrade;
          break;
        case ItemEvolutionType.Gen5Stone:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Gen5Stone;
          break;
        case ItemEvolutionType.OtherStone:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.OtherStone;
          break;
        case ItemEvolutionType.Beans:
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Beans;
          break;
      }
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
              quest.pokemonType = condition.withPokemonType.pokemonType.map((type) => getValueOrDefault(String, type.split('_').at(2)));
            }
            if (condition.withThrowType) {
              quest.throwType = condition.withThrowType.throwType.split('_').at(2);
            }
            if (condition.withOpponentPokemonBattleStatus) {
              const opponentPokemonBattle = new OpponentPokemonBattle();
              opponentPokemonBattle.requireDefeat = condition.withOpponentPokemonBattleStatus.requireDefeat;
              opponentPokemonBattle.types = condition.withOpponentPokemonBattleStatus.opponentPokemonType.map((type) =>
                type.replace('POKEMON_TYPE_', '')
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
      } else if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.length > 1 && !isNotEmpty(Object.keys(dataEvo.quest))) {
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
      const pokemonData = PokemonData.create(pokemon, types, optional);
      result.push(pokemonData);
    }
  });

  addPokemonFromData(data, result);
  result = cleanPokemonDupForm(result);

  return result.sort((a, b) => a.num - b.num);
};

const addPokemonFromData = (data: PokemonDataGM[], result: IPokemonData[]) => {
  Object.values(pokemonStoreData)
    .filter(
      (pokemon) =>
        pokemon.num > 0 && !result.some((item) => isEqual(item.fullName, convertPokemonDataName(pokemon.baseFormeSlug ?? pokemon.slug)))
    )
    .forEach((item) => {
      const pokemon = new PokemonModel(item.num, convertPokemonDataName(item.name));

      pokemon.pokemonId = convertPokemonDataName(item.baseSpecies ?? item.name);
      pokemon.form = item.forme ? convertPokemonDataName(item.forme) : FORM_NORMAL;
      pokemon.pokedexHeightM = item.heightm;
      pokemon.pokedexWeightKg = item.weightkg;
      pokemon.pokemonClass = item.pokemonClass;
      pokemon.pokemonType = getPokemonType(pokemon.form);

      const pokemonForms = result.filter((p) => p.num === item.num).map((p) => p.forme);
      if (isIncludeList(pokemonForms, pokemon.form)) {
        return;
      }

      const types = item.types.map((type) => type.toUpperCase());
      const optional = new PokemonDataOptional({
        ...item,
      });

      const goTemplate = `V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(
        pokemon.pokemonType === PokemonType.Mega || pokemon.pokemonType === PokemonType.Primal
          ? pokemon.pokemonId
          : convertPokemonDataName(item.baseFormeSlug ?? item.slug)
      )}`;
      const pokemonGO = data.find((i) => isEqual(i.templateId, goTemplate));

      if (pokemonGO) {
        const pokemonSettings = pokemonGO.data.pokemonSettings;

        pokemon.isDeployable = pokemonSettings.isDeployable;
        pokemon.isTradable = pokemonSettings.isTradable;
        pokemon.isTransferable = pokemonSettings.isTransferable;
        pokemon.disableTransferToPokemonHome = pokemonSettings.disableTransferToPokemonHome;

        if (pokemon.id === 235) {
          const moves = data.find((item) => item.templateId === 'SMEARGLE_MOVES_SETTINGS')?.data.smeargleMovesSettings;
          pokemon.quickMoves = moves?.quickMoves;
          pokemon.cinematicMoves = moves?.cinematicMoves;
        } else {
          pokemon.quickMoves = pokemonSettings.quickMoves;
          pokemon.cinematicMoves = pokemonSettings.cinematicMoves;
          pokemon.eliteQuickMove = pokemonSettings.eliteQuickMove;
          pokemon.eliteCinematicMove = pokemonSettings.eliteCinematicMove;
          pokemon.obSpecialAttackMoves = pokemonSettings.obSpecialAttackMoves;
          pokemon.nonTmCinematicMoves = pokemonSettings.nonTmCinematicMoves;
        }

        const tempEvo = pokemonSettings.tempEvoOverrides?.find((evo) => pokemon.form && isInclude(evo.tempEvoId, pokemon.form));
        if (tempEvo) {
          pokemon.stats = tempEvo.stats;
        } else {
          if (pokemon.pokemonType === PokemonType.Mega) {
            const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
            pokemon.stats = StatsGO.create({
              baseAttack: stats.atk,
              baseDefense: stats.def,
              baseStamina: toNumber(stats.sta),
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
          baseStamina: toNumber(stats.sta),
        });
      }

      optional.genderRatio = PokemonGenderRatio.create(item.genderRatio.M, item.genderRatio.F);
      optional.slug = convertPokemonDataName(item.baseFormeSlug ?? item.slug)
        .replaceAll('_', '-')
        .toLowerCase();
      optional.baseForme = item.baseForme?.toUpperCase();
      optional.baseStatsGO = true;

      if (!optional.baseForme && pokemon.pokemonType !== PokemonType.Normal) {
        const defaultForm = result.find((pk) => pk.num === pokemon.id && pk.pokemonType === PokemonType.Normal);
        if (defaultForm) {
          optional.baseForme = defaultForm.baseForme;
        }
      }

      const pokemonData = PokemonData.create(pokemon, types, optional);
      result.push(pokemonData);
    });
};

const cleanPokemonDupForm = (result: IPokemonData[]) => {
  return result.filter((pokemon, _, r) => {
    const hasOriginForm = r.filter((p) => p.num === pokemon.num).some((f) => isEqual(f.baseForme, f.forme));
    if (hasOriginForm) {
      return (
        pokemon.pokemonType !== PokemonType.Normal ||
        (pokemon.pokemonType === PokemonType.Normal && isEqual(pokemon.forme, pokemon.baseForme))
      );
    }
    return true;
  });
};

export const optionPokemonWeather = (data: PokemonDataGM[]) => {
  const weather: DynamicObj<string[]> = {};
  data
    .filter((item) => /^WEATHER_AFFINITY*/g.test(item.templateId) && item.data.weatherAffinities)
    .forEach((item) => {
      const rootType = item.data.weatherAffinities.weatherCondition;
      weather[rootType] = item.data.weatherAffinities.pokemonType.map((type) => type.replace('POKEMON_TYPE_', ''));
    });
  return weather;
};

const checkDefaultStats = (data: PokemonDataGM[], pokemon: PokemonDataGM) => {
  const regId = getValueOrDefault(Array, pokemon.templateId.match(/\d{4}/g)) as string[];
  const id = toNumber(regId[0]);
  const defaultPokemon = data.find(
    (item) =>
      item.data.pokemonSettings &&
      !item.data.pokemonSettings.form &&
      item.templateId.startsWith(`V${id.toString().padStart(4, '0')}_POKEMON_`)
  );
  if (defaultPokemon && defaultPokemon.data.pokemonSettings.stats && pokemon.data.pokemonSettings.stats) {
    return (
      pokemon.data.pokemonSettings.stats.baseAttack !== defaultPokemon.data.pokemonSettings.stats.baseAttack ||
      pokemon.data.pokemonSettings.stats.baseDefense !== defaultPokemon.data.pokemonSettings.stats.baseDefense ||
      pokemon.data.pokemonSettings.stats.baseStamina !== defaultPokemon.data.pokemonSettings.stats.baseStamina
    );
  }
  return false;
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
      !item.data.pokemonSettings.form?.toString().endsWith(FORM_NORMAL)
  );
};

const optionPokemonFamily = (pokemon: IPokemonData[]) => [...new Set(pokemon.map((item) => getValueOrDefault(String, item.pokemonId)))];

export const optionSticker = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const stickers: ISticker[] = [];
  data
    .filter((item) => /^STICKER_*/g.test(item.templateId))
    .forEach((item) => {
      if (item.data.iapItemDisplay) {
        const id = item.data.iapItemDisplay.sku.replace('STICKER_', '');
        const sticker = stickers.find((sticker) => isEqual(sticker.id, id.split('.')[0]));
        if (sticker) {
          sticker.isShop = true;
          sticker.pack.push(toNumber(id.replace(`${sticker.id}.`, '')));
        }
      } else if (item.data.stickerMetadata) {
        const sticker = new Sticker();
        sticker.id = item.data.stickerMetadata.stickerId.replace('STICKER_', '');
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
  const family = optionPokemonFamily(pokemon);
  return family.map((item) => {
    const result = new Asset();
    result.id = toNumber(pokemon.find((poke) => isEqual(poke.pokemonId, item))?.num);
    result.name = item;

    let formSet = imgs.filter((img) => isInclude(img, `/pm${result.id}.`) && !isInclude(img, 'cry'));
    let count = 0;
    let isMega = false;
    while (formSet.length > count) {
      let [, form] = formSet[count].split('.');
      if (form === 'icon' || form === 'g2') {
        form = FORM_NORMAL;
      } else {
        form = form.replace('_NOEVOLVE', '').replace(/[a-z]/g, '');
      }
      let gender = GenderType.GenderLess;
      const isShiny = isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.s.icon`);
      const pokemonType = getPokemonType(form);
      isMega = pokemonType === PokemonType.Mega;
      if (!isInclude(formSet[count], '.g2.') && isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.g2.icon`)) {
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
    if (!isMega) {
      for (let index = 0; index < formSet.length; index += 2) {
        const form = formSet.length === 2 ? FORM_MEGA : isInclude(formSet[index], '_51') ? FORM_MEGA_X : FORM_MEGA_Y;
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
    formSet = imgs.filter((img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_pm${result.id.toString().padStart(4, '0')}`));
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
      formSet = imgs.filter((img) => !isInclude(img, '/') && isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}`));
      for (let index = 0; index < formSet.length; index += 2) {
        let form = FORM_NORMAL;
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

    isMega = false;
    let soundForm = sounds.filter((sound) => isInclude(sound, `/pm${result.id}.`) && isInclude(sound, 'cry'));
    result.sound.cry = soundForm.map((sound) => {
      let [, form] = sound.split('.');
      if (form === 'cry') {
        form = FORM_NORMAL;
      } else {
        form = form.replace(/[a-z]/g, '');
      }
      const pokemonType = getPokemonType(form);
      isMega = pokemonType === PokemonType.Mega;
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
    if (!isMega) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: soundForm.length !== 2 ? FORM_MEGA : isInclude(sound, '_51') ? FORM_MEGA_X : FORM_MEGA_Y,
            path: sound,
          })
        );
      });
    }
    soundForm = sounds.filter((sound) => !isInclude(sound, '/') && isInclude(sound, `pv${result.id.toString().padStart(3, '0')}`));
    if (!isNotEmpty(result.sound.cry)) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: isInclude(sound, '_31') ? FORM_SPECIAL : FORM_NORMAL,
            path: sound,
          })
        );
      });
    }
    return result;
  });
};

export const optionCombat = (data: PokemonDataGM[], types: ITypeEff) => {
  const moves = data
    .filter((item) => /^V\d{4}_MOVE_*/g.test(item.templateId))
    .map((item) => {
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return new Move({
        ...item.data.moveSettings,
        id: toNumber(regId[0]),
        name:
          typeof item.data.moveSettings.movementId === 'string'
            ? item.data.moveSettings.movementId
            : item.templateId.replace(/^V\d{4}_MOVE_/, ''),
      });
    });
  const sequence = data
    .filter(
      (item) =>
        isInclude(item.templateId, 'sequence_') && item.data.moveSequenceSettings.sequence.find((seq) => isInclude(seq, 'sfx attacker'))
    )
    .map((item) => {
      return new Sequence({
        id: item.templateId.replace('sequence_', '').toUpperCase(),
        path: item.data.moveSequenceSettings.sequence.find((seq) => isInclude(seq, 'sfx attacker'))?.replace('sfx attacker ', ''),
      });
    });

  const moveSet = data
    .filter((item) => /^COMBAT_V\d{4}_MOVE_*/g.test(item.templateId))
    .map((item) => {
      const result = new Combat();
      if (typeof item.data.combatMove.uniqueId === 'string') {
        result.name = item.data.combatMove.uniqueId;
      } else if (typeof item.data.combatMove.uniqueId === 'number') {
        result.name = item.templateId.replace(/^COMBAT_V\d{4}_MOVE_/, '');
      }
      result.type = item.data.combatMove.type.replace('POKEMON_TYPE_', '');
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
      const buffs = item.data.combatMove.buffs;
      if (buffs) {
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
        result.buffs = buffsResult;
      }
      const move = moves.find((move) => isEqual(move.name, result.name));
      result.name = replaceTempMoveName(result.name);
      if (result.name === 'STRUGGLE') {
        result.pveEnergy = -33;
      }
      if (move) {
        result.id = move.id;
        result.track = move.id;
        result.pvePower = move.power;
        if (result.name !== 'STRUGGLE') {
          result.pveEnergy = move.energyDelta;
        }
        result.durationMs = move.durationMs;
        result.damageWindowStartMs = move.damageWindowStartMs;
        result.damageWindowEndMs = move.damageWindowEndMs;
        result.accuracyChance = move.accuracyChance;
        result.criticalChance = move.criticalChance;
        result.staminaLossScalar = move.staminaLossScalar;
      }
      return result;
    });

  const result = moveSet;
  moveSet.forEach((move) => {
    if (move.id === 281) {
      move.isMultipleWithType = true;
      Object.keys(types)
        .filter(
          (type) =>
            !isEqual(type, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Normal), EqualMode.IgnoreCaseSensitive) &&
            !isEqual(type, getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Fairy), EqualMode.IgnoreCaseSensitive)
        )
        .forEach((type, index) =>
          result.push(
            Combat.create({
              ...move,
              id: toNumber(`${move.id}${index}`),
              name: `${move.name}_${type}`.replace(`_${getKeyWithData(PokemonTypeBadge, PokemonTypeBadge.Normal)?.toUpperCase()}`, ''),
              type,
            })
          )
        );
    }
  });

  return result;
};

export const optionLeagues = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const result = new LeagueData();
  result.allowLeagues = getValueOrDefault(
    Array,
    data
      .find((item) => item.templateId === 'VS_SEEKER_CLIENT_SETTINGS')
      ?.data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId.map((item) =>
        item.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '')
      )
  );

  result.data = data
    .filter((item) => isInclude(item.templateId, 'COMBAT_LEAGUE_') && !isInclude(item.templateId, 'SETTINGS'))
    .map((item) => {
      const result = new League();
      result.id = item.templateId.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '');
      result.title = item.data.combatLeague.title.replace('combat_', '').replace('_title', '').toUpperCase();
      result.enabled = item.data.combatLeague.enabled;
      result.pokemonCount = item.data.combatLeague.pokemonCount;
      item.data.combatLeague.pokemonCondition.forEach((con) => {
        if (con.type === LeagueConditionType.CaughtTime) {
          result.conditions.timestamp = LeagueTimestamp.create({
            start: con.pokemonCaughtTimestamp?.afterTimestamp,
            end: con.pokemonCaughtTimestamp?.beforeTimestamp,
          });
        } else if (con.type === LeagueConditionType.UniquePokemon) {
          result.conditions.uniqueSelected = true;
        } else if (con.type === LeagueConditionType.PokemonType) {
          result.conditions.uniqueType = getValueOrDefault(
            Array,
            con.withPokemonType?.pokemonType.map((type) => type.replace('POKEMON_TYPE_', ''))
          );
        } else if (con.type === LeagueConditionType.PokemonLevelRange) {
          result.conditions.maxLevel = con.pokemonLevelRange?.maxLevel;
        } else if (con.type === LeagueConditionType.PokemonLimitCP) {
          result.conditions.maxCp = con.withPokemonCpLimit?.maxCp;
        } else if (con.type === LeagueConditionType.Whitelist) {
          result.conditions.whiteList = getValueOrDefault(
            Array,
            con.pokemonWhiteList?.pokemon.map((poke) => {
              const item = pokemon.find((item) => isEqual(item.pokemonId, poke.id));
              return new PokemonPermission({
                id: item?.num,
                name: item?.pokemonId,
                form: poke.forms ?? FORM_NORMAL,
                pokemonType: getPokemonType(poke.forms ?? FORM_NORMAL),
              });
            })
          );
          const whiteList: IPokemonPermission[] = [];
          result.conditions.whiteList.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  whiteList.push(new PokemonPermission({ ...value, form: FORM_NORMAL }));
                } else if (!isEqual(form, 'FORM_UNSET', EqualMode.IgnoreCaseSensitive)) {
                  whiteList.push(new PokemonPermission({ ...value, form: form.replace(`${value.name}_`, '') }));
                }
              });
            } else {
              whiteList.push(new PokemonPermission(value));
            }
          });
          result.conditions.whiteList = whiteList.sort((a, b) => toNumber(a.id) - toNumber(b.id));
        } else if (con.type === LeagueConditionType.BanList) {
          result.conditions.banned = getValueOrDefault(
            Array,
            con.pokemonBanList?.pokemon.map((poke) => {
              const item = pokemon.find((item) => isEqual(item.pokemonId, poke.id));
              return new PokemonPermission({
                id: item?.num,
                name: item?.pokemonId,
                form: poke.forms ?? FORM_NORMAL,
                pokemonType: getPokemonType(poke.forms ?? FORM_NORMAL),
              });
            })
          );
          const banList: IPokemonPermission[] = [];
          result.conditions.banned.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  banList.push(new PokemonPermission({ ...value, form: FORM_NORMAL }));
                } else if (!isEqual(form, 'FORM_UNSET', EqualMode.IgnoreCaseSensitive)) {
                  banList.push(new PokemonPermission({ ...value, form: form.replace(`${value.name}_`, '') }));
                }
              });
            } else {
              banList.push(new PokemonPermission(value));
            }
          });
          result.conditions.banned = banList.sort((a, b) => toNumber(a.id) - toNumber(b.id));
        }
      });
      result.iconUrl = item.data.combatLeague.iconUrl
        .replace(APIUrl.POGO_PROD_ASSET_URL, '')
        .replace(`${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/`, '');
      result.league = item.data.combatLeague.badgeType.replace('BADGE_', '');
      if (item.data.combatLeague.bannedPokemon) {
        const banList = result.conditions.banned.concat(
          item.data.combatLeague.bannedPokemon.map((poke) => {
            const item = pokemon.find((item) => isEqual(item.pokemonId, poke));
            return new PokemonPermission({
              id: item?.num,
              name: item?.pokemonId,
              form: FORM_NORMAL,
              pokemonType: PokemonType.Normal,
            });
          })
        );
        result.conditions.banned = banList.sort((a, b) => toNumber(a.id) - toNumber(b.id));
      }
      return result;
    });

  const seasons = data.find((item) => item.templateId === 'COMBAT_COMPETITIVE_SEASON_SETTINGS')?.data.combatCompetitiveSeasonSettings
    .seasonEndTimeTimestamp;
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
        } else if (reward.itemLootTable) {
          result.type = RewardType.ItemLoot;
          result.count = 1;
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
          result.form = poke.pokemonDisplay.form.replace(`${poke.pokemonId}_`, '');
        } else {
          result.form = FORM_NORMAL;
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
        data.find((item) => item.templateId === `COMBAT_RANKING_SETTINGS_S${seasons.length - 1}`)?.data.combatRankingProtoSettings.rankLevel
      ),
    });
  }

  return result;
};

const mappingPokemonEvoInfo = (pokemonData: EvolutionChainData[] | undefined, pokemon: IPokemonData[]) => {
  const result: IEvolutionInfo[] = [];
  pokemonData?.forEach((item) => {
    const form = item.headerMessage?.replace('_pokedex_header', '').toUpperCase() ?? FORM_NORMAL;
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
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return EvolutionChain.create({
        id: toNumber(regId[0]),
        pokemonId: item.data.evolutionChainDisplaySettings.pokemon,
        evolutionInfos: mappingPokemonEvoInfo(item.data.evolutionChainDisplaySettings.evolutionChains, pokemon),
      });
    });
};

export const mappingReleasedPokemonGO = (pokemonData: IPokemonData[], assets: IAsset[]) => {
  pokemonData.forEach((item) => {
    const form = assets.find((asset) => asset.id === item.num);
    const image = form?.image.find((img) => isEqual(img.form, item.num === 201 ? `${item.pokemonId}_${item.baseForme}` : item.forme));

    if (form && (item.hasShadowForm || (checkMoveSetAvailable(item) && image?.default))) {
      item.releasedGO = getValueOrDefault(Boolean, item.hasShadowForm || isInclude(image?.default, '/'));
    }
  });
};

const convertMoveName = (combat: ICombat[], moves: string[] | undefined) => {
  return moves?.map((move) => {
    const id = toNumber(move);
    if (!isNaN(id)) {
      const result = combat.find((item) => item.id === id);
      if (result) {
        return result.name;
      }
    }
    return move;
  });
};

export const mappingMoveSetPokemonGO = (pokemonData: IPokemonData[], combat: ICombat[]) => {
  pokemonData.forEach((pokemon) => {
    pokemon.quickMoves = convertMoveName(combat, pokemon.quickMoves);
    pokemon.cinematicMoves = convertMoveName(combat, pokemon.cinematicMoves);
    pokemon.eliteQuickMoves = convertMoveName(combat, pokemon.eliteQuickMoves);
    pokemon.eliteCinematicMoves = convertMoveName(combat, pokemon.eliteCinematicMoves);
    pokemon.specialMoves = convertMoveName(combat, pokemon.specialMoves);
    pokemon.exclusiveMoves = convertMoveName(combat, pokemon.exclusiveMoves);
    pokemon.purifiedMoves = convertMoveName(combat, pokemon.purifiedMoves);
    pokemon.shadowMoves = convertMoveName(combat, pokemon.shadowMoves);
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
      }
      rewards.push(reward);
    });
  }
  return rewards;
};

const getTextWithKey = <T>(data: object, findKey: string | number) => {
  const result = Object.entries(data).find(([key]) => isInclude(key, findKey, IncludeMode.IncludeIgnoreCaseSensitive));
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
      srcText = srcText
        .replaceAll('-', '_')
        .replace(/\.[^.]*$/, '')
        .replace(/^PGO_MCS_/, '');
      const [firstText] = srcText.split('_');
      if (!isNotNumber(firstText) && !itemSettings.globalEventTicket.titleImageUrl) {
        const descKey = itemSettings.globalEventTicket.itemBagDescriptionKey.split('_');
        return descKey[descKey.length - 1]?.split(/(?=[A-Z])/).join(' ');
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
          .map((text) => text.replace(/^S/i, 'Season '))
          .map((text) => capitalize(text))
          .join(' ');
      } else {
        descKey = descKey
          .filter(
            (text) => /^S[\d*]/i.test(text) || isInclude(itemSettings.descriptionOverride, text, IncludeMode.IncludeIgnoreCaseSensitive)
          )
          .map((text) => text.replace(/^S/i, 'Season '));
      }
      return descKey.map((text) => capitalize(text)).join(' ');
    }
  }
  return;
};

const getInformationDesc = (itemSettings: ItemSettings | undefined) => {
  const textKey = getValueOrDefault(String, itemSettings?.descriptionOverride, itemSettings?.globalEventTicket.itemBagDescriptionKey);
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

export const optionInformation = (data: PokemonDataGM[], pokemonData: IPokemonData[]) => {
  return data
    .filter((item) => item.templateId.startsWith('ITEM_') && item.data.itemSettings && item.data.itemSettings.globalEventTicket)
    .map((item) => {
      return Information.create({
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
      });
    });
};
