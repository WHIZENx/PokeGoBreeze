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
import { checkMoveSetAvailable, convertPokemonDataName, replacePokemonGoForm, replaceTempMoveName } from '../util/utils';
import { ITypeSet, TypeSet } from './models/type.model';
import { BuffType, TypeAction, TypeMove } from '../enums/type.enum';
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
  FORM_PRIMAL,
  FORM_SHADOW,
  FORM_SPECIAL,
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
} from './models/options.model';
import { calculateStatsByTag } from '../util/calculate';
import { APITree } from '../services/models/api.model';
import { DynamicObj, getValueOrDefault, isEqual, isInclude, isIncludeList, isNotEmpty, toNumber } from '../util/extension';
import { GenderType } from './enums/asset.enum';
import { EqualMode, IncludeMode } from '../util/enums/string.enum';
import { LeagueRewardType, RewardType } from './enums/league.enum';
import { ItemEvolutionRequireType, ItemEvolutionType, ItemLureRequireType, ItemLureType, LeagueConditionType } from './enums/option.enum';
import { StatsBase } from './models/stats.model';

export const getOption = <T>(options: any, args: string[], defaultValue?: T): T => {
  if (!options) {
    return defaultValue || options;
  }

  args.forEach((arg) => {
    options = options[arg];
  });
  return options || defaultValue;
};

export const optionSettings = (data: PokemonDataGM[]) => {
  const settings = new Options();

  data.forEach((item) => {
    if (item.templateId === 'COMBAT_SETTINGS') {
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
  return data.tree.map((item) => item.path.replace('.png', ''));
};

export const optionPokeSound = (data: APITree) => {
  return data.tree.map((item) => item.path.replace('.wav', ''));
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

const findPokemonData = (id: number, name: string, isDefault = false): IPokemonData | undefined => {
  return Object.values(pokemonStoreData).find(
    (pokemon: IPokemonData) =>
      pokemon.num === id && isEqual(name, convertPokemonDataName(isDefault ? pokemon.slug : pokemon.baseFormeSlug ?? pokemon.slug))
  );
};

const convertAndReplaceNameGO = (name: string, defaultName = '') => {
  return name
    .replace(`${replacePokemonGoForm(defaultName)}_`, '')
    .replace(/^S$/gi, FORM_SHADOW)
    .replace(/^A$/gi, FORM_ARMOR)
    .replace(/GALARIAN_STANDARD/, FORM_GALARIAN);
};

export const optionPokemonData = (data: PokemonDataGM[], encounter: PokemonEncounter[]) => {
  let result: IPokemonData[] = [];
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    const regId = getValueOrDefault(Array, item.templateId.match(/\d{4}/g)) as string[];
    const pokemon = new PokemonModel(toNumber(regId[0]), undefined, pokemonSettings);

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

    const types: string[] = [];
    if (pokemonSettings.type) {
      types.push(pokemonSettings.type.replace('POKEMON_TYPE_', ''));
    }
    if (pokemonSettings.type2) {
      types.push(pokemonSettings.type2.replace('POKEMON_TYPE_', ''));
    }

    const defaultName = pokemonSettings.form ? pokemonSettings.form.toString() : pokemonSettings.pokemonId;
    const pokemonEncounter = encounter.find((e) => isEqual(defaultName, e.name));

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
      toNumber(gender?.data.genderSettings.gender?.malePercent),
      toNumber(gender?.data.genderSettings.gender?.femalePercent)
    );

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      pokemon.form && !isEqual(pokemon.form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive)
        ? `${pokemon.pokemonId}_${pokemon.form}`
        : pokemon.pokemonId,
      isEqual(pokemon.form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive)
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
          baseStamina: toNumber(stats.sta),
        };
      }
    } else if (pokemonSettings.isForceReleaseGO) {
      optional.version = 'pokémon-go';
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
      if (evo.lureItemRequirement) {
        if (evo.lureItemRequirement === ItemLureType.Magnetic) {
          dataEvo.quest.lureItemRequirement = ItemLureRequireType.Magnetic;
        } else if (evo.lureItemRequirement === ItemLureType.Mossy) {
          dataEvo.quest.lureItemRequirement = ItemLureRequireType.Mossy;
        } else if (evo.lureItemRequirement === ItemLureType.Glacial) {
          dataEvo.quest.lureItemRequirement = ItemLureRequireType.Glacial;
        } else if (evo.lureItemRequirement === ItemLureType.Rainy) {
          dataEvo.quest.lureItemRequirement = ItemLureRequireType.Rainy;
        } else if (evo.lureItemRequirement === ItemLureType.Sparkly) {
          dataEvo.quest.lureItemRequirement = ItemLureRequireType.Sparkly;
        }
      }
      if (evo.evolutionItemRequirement) {
        if (evo.evolutionItemRequirement === ItemEvolutionType.SunStone) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.SunStone;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.KingsRock) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.KingsRock;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.MetalCoat) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.MetalCoat;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.Gen4Stone) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Gen4Stone;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.DragonScale) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.DragonScale;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.Upgrade) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Upgrade;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.Gen5Stone) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Gen5Stone;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.OtherStone) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.OtherStone;
        } else if (evo.evolutionItemRequirement === ItemEvolutionType.Beans) {
          dataEvo.quest.evolutionItemRequirement = ItemEvolutionRequireType.Beans;
        }
      }
      if (evo.onlyUpsideDown) {
        dataEvo.quest.isOnlyUpsideDown = evo.onlyUpsideDown;
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
          requireMove: evo.obEvolutionBranchRequiredMove,
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

    if (pokemon.shadow && isEqual(pokemon.form, FORM_SHADOW)) {
      const pokemonOrigin = result.find((pk) => pk.num === pokemon.id && isEqual(pk.forme, FORM_NORMAL));
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

    if (!isEqual(pokemon.form, FORM_SHADOW, EqualMode.IgnoreCaseSensitive)) {
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
      (pokemon: IPokemonData) =>
        pokemon.num > 0 && !result.some((item) => isEqual(item.fullName, convertPokemonDataName(pokemon.baseFormeSlug ?? pokemon.slug)))
    )
    .forEach((item: IPokemonData) => {
      const pokemon = new PokemonModel(item.num, convertPokemonDataName(item.name));

      pokemon.pokemonId = convertPokemonDataName(item.baseSpecies ?? item.name);
      pokemon.form = item.forme ? convertPokemonDataName(item.forme) : FORM_NORMAL;
      pokemon.pokedexHeightM = item.heightm;
      pokemon.pokedexWeightKg = item.weightkg;
      pokemon.pokemonClass = item.pokemonClass;

      const pokemonForms = result.filter((p) => p.num === item.num).map((p) => p.forme);
      if (isIncludeList(pokemonForms, pokemon.form)) {
        return;
      }

      const types = item.types.map((type) => type.toUpperCase());
      const optional = new PokemonDataOptional({
        ...item,
      });

      const goTemplate = `V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(
        isInclude(pokemon.form, FORM_MEGA) || isEqual(pokemon.form, FORM_PRIMAL, EqualMode.IgnoreCaseSensitive)
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
        }

        const tempEvo = pokemonSettings.tempEvoOverrides?.find((evo) => pokemon.form && isInclude(evo.tempEvoId, pokemon.form));
        if (tempEvo) {
          pokemon.stats = tempEvo.stats;
        } else {
          if (isInclude(pokemon.form, FORM_MEGA)) {
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

      const pokemonData = PokemonData.create(pokemon, types, optional);
      result.push(pokemonData);
    });
};

const cleanPokemonDupForm = (result: IPokemonData[]) => {
  const filterPokemon = result.filter((pokemon, _, r) => {
    const normalForm = r.filter(
      (p) =>
        isEqual(pokemon.forme, FORM_NORMAL) && p.num === pokemon.num && p.baseForme && r.some((pr) => isEqual(pr.baseForme, p.baseForme))
    );
    if (isNotEmpty(normalForm)) {
      return pokemon.baseForme && isEqual(pokemon.forme, FORM_NORMAL);
    }
    return !r.some(
      (p) =>
        isEqual(pokemon.forme, FORM_NORMAL) &&
        p.num === pokemon.num &&
        !isEqual(p.forme, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) &&
        p.baseForme &&
        isEqual(p.baseForme, p.forme)
    );
  });
  const idConcat = [744];

  result = filterPokemon.filter((p) => !isIncludeList(idConcat, p.num));
  idConcat.forEach((id) => {
    const concatPokemon = filterPokemon.filter((p) => p.num === id);
    if (concatPokemon.length > 1) {
      const tempPokemon = concatPokemon.find((p) => isEqual(p.forme, FORM_NORMAL));
      if (tempPokemon) {
        concatPokemon
          .filter((p) => !isEqual(p.forme, FORM_NORMAL, EqualMode.IgnoreCaseSensitive))
          .forEach((p) => tempPokemon.evoList?.concat(getValueOrDefault(Array, p.evoList)));
        result.push(tempPokemon);
      }
    }
  });
  return result;
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

const optionPokemonFamily = (pokemon: IPokemonData[]) => {
  return [...new Set(pokemon.map((item) => getValueOrDefault(String, item.pokemonId)))];
};

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

    let formSet = imgs.filter((img) => isInclude(img, `Addressable Assets/pm${result.id}.`) && !isInclude(img, 'cry'));
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
      isMega = isInclude(form, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive);
      if (!isInclude(formSet[count], '.g2.') && isIncludeList(formSet, `${formSet[count].replace('.icon', '')}.g2.icon`)) {
        gender = GenderType.Male;
      } else if (isInclude(formSet[count], '.g2.')) {
        gender = GenderType.Female;
      }
      result.image.push(
        new ImageModel({
          gender,
          pokemonId: result.id,
          form: result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form,
          default: formSet[count],
          shiny: isShiny ? formSet[count + 1] : undefined,
        })
      );
      count += Number(isShiny) + 1;
    }

    formSet = imgs.filter(
      (img) =>
        !isInclude(img, `Addressable Assets/`) &&
        (isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}_51`) ||
          isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}_52`))
    );
    if (!isMega) {
      for (let index = 0; index < formSet.length; index += 2) {
        result.image.push(
          new ImageModel({
            gender: GenderType.GenderLess,
            pokemonId: result.id,
            form: formSet.length === 2 ? FORM_MEGA : isInclude(formSet[index], '_51') ? FORM_MEGA_X : FORM_MEGA_Y,
            default: formSet[index],
            shiny: formSet[index + 1],
          })
        );
      }
    }

    const formList = result.image.map((img) => img.form?.replaceAll('_', ''));
    formSet = imgs.filter(
      (img) => !isInclude(img, `Addressable Assets/`) && isInclude(img, `pokemon_icon_pm${result.id.toString().padStart(4, '0')}`)
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
        (img) => !isInclude(img, `Addressable Assets/`) && isInclude(img, `pokemon_icon_${result.id.toString().padStart(3, '0')}`)
      );
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
    let soundForm = sounds.filter((sound) => isInclude(sound, `Addressable Assets/pm${result.id}.`) && isInclude(sound, 'cry'));
    result.sound.cry = soundForm.map((sound) => {
      let [, form] = sound.split('.');
      if (form === 'cry') {
        form = FORM_NORMAL;
      } else {
        form = form.replace(/[a-z]/g, '');
      }
      isMega = isInclude(form, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive);
      return new CryPath({
        form,
        path: sound,
      });
    });

    soundForm = sounds.filter(
      (sound) =>
        !isInclude(sound, `Addressable Assets/`) &&
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
    soundForm = sounds.filter(
      (sound) => !isInclude(sound, `Addressable Assets/`) && isInclude(sound, `pv${result.id.toString().padStart(3, '0')}`)
    );
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
      if (item.templateId.endsWith(TypeMove.FAST) || isInclude(item.templateId, '_FAST_')) {
        result.typeMove = TypeMove.FAST;
      } else {
        result.typeMove = TypeMove.CHARGE;
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
              type: TypeAction.ATK,
              target: BuffType.Attacker,
              power: buffs.attackerAttackStatStageChange,
              buffChance: buffs.buffActivationChance,
            })
          );
        }
        if (buffs.attackerDefenseStatStageChange) {
          buffsResult.push(
            Buff.create({
              type: TypeAction.DEF,
              target: BuffType.Attacker,
              power: buffs.attackerDefenseStatStageChange,
              buffChance: buffs.buffActivationChance,
            })
          );
        }
        if (buffs.targetAttackStatStageChange) {
          buffsResult.push(
            Buff.create({
              type: TypeAction.ATK,
              target: BuffType.Target,
              power: buffs.targetAttackStatStageChange,
              buffChance: buffs.buffActivationChance,
            })
          );
        }
        if (buffs.targetDefenseStatStageChange) {
          buffsResult.push(
            Buff.create({
              type: TypeAction.DEF,
              target: BuffType.Target,
              power: buffs.targetDefenseStatStageChange,
              buffChance: buffs.buffActivationChance,
            })
          );
        }
        result.buffs = buffsResult;
      }
      const move = moves.find((move) => isEqual(move.name, result.name));
      result.id = toNumber(move?.id);
      result.track = toNumber(move?.id);
      result.name = replaceTempMoveName(result.name);
      result.pvePower = toNumber(move?.power);
      if (result.name === 'STRUGGLE') {
        result.pveEnergy = -33;
      } else {
        result.pveEnergy = toNumber(move?.energyDelta);
      }
      result.durationMs = toNumber(move?.durationMs);
      result.damageWindowStartMs = toNumber(move?.damageWindowStartMs);
      result.damageWindowEndMs = toNumber(move?.damageWindowEndMs);
      result.accuracyChance = toNumber(move?.accuracyChance);
      result.criticalChance = toNumber(move?.criticalChance);
      result.staminaLossScalar = toNumber(move?.staminaLossScalar);
      return result;
    });

  const result = moveSet;
  moveSet.forEach((move) => {
    if (move.id === 281) {
      move.isMultipleWithType = true;
      Object.keys(types)
        .filter((type) => !isEqual(type, 'NORMAL', EqualMode.IgnoreCaseSensitive) && !isEqual(type, 'FAIRY', EqualMode.IgnoreCaseSensitive))
        .forEach((type, index) =>
          result.push(
            Combat.create({
              ...move,
              id: toNumber(`${move.id}${index}`),
              name: `${move.name}_${type}`.replace('_NORMAL', ''),
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
                id: toNumber(item?.num),
                name: item?.pokemonId,
                form: poke.forms ? poke.forms : FORM_NORMAL,
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
                id: toNumber(item?.num),
                name: item?.pokemonId,
                form: poke.forms ?? FORM_NORMAL,
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
              id: toNumber(item?.num),
              name: item?.pokemonId,
              form: FORM_NORMAL,
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
      const track = isInclude(item.templateId, LeagueRewardType.Free) ? LeagueRewardType.Free : LeagueRewardType.Premium;
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
        if (track === LeagueRewardType.Free) {
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

export const mappingReleasedPokemonGO = (pokemonData: IPokemonData[], assets: IAsset[]) => {
  pokemonData.forEach((item) => {
    const form = assets.find((asset) => asset.id === item.num);
    const image = form?.image.find((img) => isEqual(img.form, item.num === 201 ? `${item.pokemonId}_${item.baseForme}` : item.forme));

    if (form && (item.hasShadowForm || (checkMoveSetAvailable(item) && image?.default))) {
      item.releasedGO = getValueOrDefault(Boolean, item.hasShadowForm || isInclude(image?.default, 'Addressable Assets/'));
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
    pokemon.purifiedMoves = convertMoveName(combat, pokemon.purifiedMoves);
    pokemon.shadowMoves = convertMoveName(combat, pokemon.shadowMoves);
  });
};
