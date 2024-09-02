import { Asset, CryPath, IAsset, ImageModel } from './models/asset.model';
import { Buff, Combat } from './models/combat.model';
import { EvoList, EvolutionQuest, EvolutionQuestCondition, PokemonTypeCost } from './models/evolution.model';
import {
  League,
  LeagueData,
  RankRewardSetLeague,
  PokemonRewardSetLeague,
  PokemonRewardLeague,
  LeagueTimestamp,
  Season,
  Reward,
} from './models/league.model';
import { ISticker, Sticker } from './models/sticker.model';

import pokemonStoreData from '../data/pokemon.json';
import { checkMoveSetAvailable, convertPokemonDataName, isNotEmpty, replacePokemonGoForm, replaceTempMoveName } from '../util/utils';
import { ITypeSet, TypeSet } from './models/type.model';
import { TypeAction, TypeMove } from '../enums/type.enum';
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
import { DynamicObj } from '../util/models/util.model';

export const getOption = <T>(options: any, args: string[]): T => {
  if (!options) {
    return options;
  }

  args.forEach((arg) => {
    options = options[arg];
  });
  return options;
};

export const optionSettings = (data: PokemonDataGM[]) => {
  const settings = new Options();

  data.forEach((item) => {
    if (item.templateId === 'COMBAT_SETTINGS') {
      settings.combatOptions.stab = item.data.combatSettings.sameTypeAttackBonusMultiplier;
      settings.combatOptions.shadowBonus.atk = item.data.combatSettings.shadowPokemonAttackBonusMultiplier;
      settings.combatOptions.shadowBonus.def = item.data.combatSettings.shadowPokemonDefenseBonusMultiplier;

      settings.throwCharge.normal = item.data.combatSettings.chargeScoreBase;
      settings.throwCharge.nice = item.data.combatSettings.chargeScoreNice;
      settings.throwCharge.great = item.data.combatSettings.chargeScoreGreat;
      settings.throwCharge.excellent = item.data.combatSettings.chargeScoreExcellent;
    } else if (item.templateId === 'BATTLE_SETTINGS') {
      settings.battleOptions.enemyAttackInterval = item.data.battleSettings.enemyAttackInterval;
      settings.battleOptions.stab = item.data.battleSettings.sameTypeAttackBonusMultiplier;
      settings.battleOptions.shadowBonus.atk = item.data.battleSettings.shadowPokemonAttackBonusMultiplier;
      settings.battleOptions.shadowBonus.def = item.data.battleSettings.shadowPokemonDefenseBonusMultiplier;
    } else if (item.templateId.includes('BUDDY_LEVEL_')) {
      const level = item.templateId.replace('BUDDY_LEVEL_', '');
      settings.buddyFriendship[level] = new BuddyFriendship();
      settings.buddyFriendship[level].level = parseInt(level);
      settings.buddyFriendship[level].minNonCumulativePointsRequired = item.data.buddyLevelSettings.minNonCumulativePointsRequired ?? 0;
      settings.buddyFriendship[level].unlockedTrading = item.data.buddyLevelSettings.unlockedTraits;
    } else if (item.templateId.includes('FRIENDSHIP_LEVEL_')) {
      const level = item.templateId.replace('FRIENDSHIP_LEVEL_', '');
      settings.trainerFriendship[level] = new TrainerFriendship();
      settings.trainerFriendship[level].level = parseInt(level);
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
  const types = new TypeSet() as unknown as DynamicObj<string, DynamicObj<string, number>>;
  const typeSet = Object.keys(types);
  data
    .filter((item) => /^POKEMON_TYPE*/g.test(item.templateId) && item.data.typeEffective)
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
    .filter((item) => /^FORMS_V\d{4}_POKEMON_*/g.test(item.templateId) && isNotEmpty(item.data?.formSettings?.forms))
    .forEach((item) => {
      item.data.formSettings.forms.forEach((f) => {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      });
    });

  return result;
};

const findPokemonData = (id: number, name: string): IPokemonData | undefined => {
  return Object.values(pokemonStoreData).find(
    (pokemon: IPokemonData) => pokemon.num === id && name === convertPokemonDataName(pokemon.baseFormeSlug ?? pokemon.slug)
  );
};

const convertAndReplaceNameGO = (name: string, defaultName = '') => {
  return name
    ?.replace(`${replacePokemonGoForm(defaultName)}_`, '')
    .replace(/^S$/gi, FORM_SHADOW)
    .replace(/^A$/gi, FORM_ARMOR)
    .replace(/GALARIAN_STANDARD/, FORM_GALARIAN);
};

export const optionPokemonData = (data: PokemonDataGM[], encounter: PokemonEncounter[]) => {
  let result: IPokemonData[] = [];
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    const regId = (item.templateId.match(/\d{4}/g) || []) as string[];
    const pokemon = new PokemonModel(isNotEmpty(regId) ? parseInt(regId[0]) : 0, undefined, pokemonSettings);

    if (!pokemonSettings.form) {
      pokemon.form = FORM_NORMAL;
    } else {
      pokemon.form = convertAndReplaceNameGO(pokemonSettings.form?.toString(), pokemonSettings.pokemonId);
    }
    pokemon.name = pokemonSettings.form ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;

    const types: string[] = [];
    if (pokemonSettings.type) {
      types.push(pokemonSettings.type.replace('POKEMON_TYPE_', ''));
    }
    if (pokemonSettings.type2) {
      types.push(pokemonSettings.type2.replace('POKEMON_TYPE_', ''));
    }

    const defaultName = pokemonSettings.form ? pokemonSettings.form.toString() : pokemonSettings.pokemonId;
    const pokemonEncounter = encounter?.find((e) => defaultName === e.name);

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
      pokemon.quickMoves = moves?.quickMoves ?? [];
      pokemon.cinematicMoves = moves?.cinematicMoves ?? [];
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
      gender?.data.genderSettings.gender?.malePercent ?? 0,
      gender?.data.genderSettings.gender?.femalePercent ?? 0
    );

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      pokemon.form && pokemon.form !== FORM_NORMAL ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId
    );
    if (pokemonBaseData) {
      optional.slug = convertPokemonDataName(pokemonBaseData.slug)?.replaceAll('_', '-').toLowerCase();
      optional.color = pokemonBaseData.color;
      optional.sprite = pokemonBaseData.sprite;
      optional.baseForme = convertPokemonDataName(pokemonBaseData.baseForme);
      optional.region = pokemonBaseData.region ?? undefined;
      optional.version = pokemonBaseData.version ?? undefined;
      pokemon.pokedexHeightM = pokemonBaseData.heightm;
      pokemon.pokedexWeightKg = pokemonBaseData.weightkg;
      optional.isBaby = pokemonBaseData.isBaby;

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack) {
        const stats = calculateStatsByTag(undefined, pokemonBaseData.baseStats, pokemonBaseData.slug);
        pokemon.stats = {
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta ?? 0,
        };
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
          i.data.pokemonSettings.pokemonId === dataEvo.evoToName &&
          convertAndReplaceNameGO(
            i.data.pokemonSettings.form?.toString() ?? pokemon.form?.toString() ?? FORM_NORMAL,
            i.data.pokemonSettings.pokemonId
          ) === dataEvo.evoToForm
      );

      if (pokemonGO) {
        const regEvoId = pokemonGO.templateId.match(/\d{4}/g) as string[];
        dataEvo.evoToId = isNotEmpty(regEvoId) ? parseInt(regEvoId[0]) : 0;
      }

      if (evo.candyCost) {
        dataEvo.candyCost = evo.candyCost;
      }
      if (evo.evolutionItemRequirementCost) {
        dataEvo.itemCost = evo.evolutionItemRequirementCost;
      }
      if (evo.candyCostPurified) {
        dataEvo.purificationEvoCandyCost = evo.candyCostPurified;
      }
      dataEvo.quest = new EvolutionQuest();
      if (evo.genderRequirement) {
        dataEvo.quest.genderRequirement = evo.genderRequirement;
      }
      if (evo.kmBuddyDistanceRequirement) {
        dataEvo.quest.kmBuddyDistanceRequirement = evo.kmBuddyDistanceRequirement;
      }
      if (evo.mustBeBuddy) {
        dataEvo.quest.mustBeBuddy = evo.mustBeBuddy;
      }
      if (evo.onlyDaytime) {
        dataEvo.quest.onlyDaytime = evo.onlyDaytime;
      }
      if (evo.onlyNighttime) {
        dataEvo.quest.onlyNighttime = evo.onlyNighttime;
      }
      if (evo.lureItemRequirement) {
        if (evo.lureItemRequirement === 'ITEM_TROY_DISK_MAGNETIC') {
          dataEvo.quest.lureItemRequirement = 'magnetic';
        } else if (evo.lureItemRequirement === 'ITEM_TROY_DISK_MOSSY') {
          dataEvo.quest.lureItemRequirement = 'moss';
        } else if (evo.lureItemRequirement === 'ITEM_TROY_DISK_GLACIAL') {
          dataEvo.quest.lureItemRequirement = 'glacial';
        } else if (evo.lureItemRequirement === 'ITEM_TROY_DISK_RAINY') {
          dataEvo.quest.lureItemRequirement = 'rainy';
        }
      }
      if (evo.evolutionItemRequirement) {
        if (evo.evolutionItemRequirement === 'ITEM_SUN_STONE') {
          dataEvo.quest.evolutionItemRequirement = 'Sun_Stone';
        } else if (evo.evolutionItemRequirement === 'ITEM_KINGS_ROCK') {
          dataEvo.quest.evolutionItemRequirement = "King's_Rock";
        } else if (evo.evolutionItemRequirement === 'ITEM_METAL_COAT') {
          dataEvo.quest.evolutionItemRequirement = 'Metal_Coat';
        } else if (evo.evolutionItemRequirement === 'ITEM_GEN4_EVOLUTION_STONE') {
          dataEvo.quest.evolutionItemRequirement = 'Sinnoh_Stone';
        } else if (evo.evolutionItemRequirement === 'ITEM_DRAGON_SCALE') {
          dataEvo.quest.evolutionItemRequirement = 'Dragon_Scale';
        } else if (evo.evolutionItemRequirement === 'ITEM_UP_GRADE') {
          dataEvo.quest.evolutionItemRequirement = 'Up-Grade';
        } else if (evo.evolutionItemRequirement === 'ITEM_GEN5_EVOLUTION_STONE') {
          dataEvo.quest.evolutionItemRequirement = 'Unova_Stone';
        } else if (evo.evolutionItemRequirement === 'ITEM_OTHER_EVOLUTION_STONE_A') {
          dataEvo.quest.evolutionItemRequirement = 'Other_Stone_A';
        } else if (evo.evolutionItemRequirement === 'ITEM_BEANS') {
          dataEvo.quest.evolutionItemRequirement = 'Beans';
        }
      }
      if (evo.onlyUpsideDown) {
        dataEvo.quest.onlyUpsideDown = evo.onlyUpsideDown;
      }
      if (evo.questDisplay) {
        const questDisplay = evo.questDisplay[0].questRequirementTemplateId;
        const template = data.find((template) => template.templateId === questDisplay);
        try {
          const condition = template?.data.evolutionQuestTemplate?.goals[0].condition[0];
          dataEvo.quest.condition = new EvolutionQuestCondition();
          dataEvo.quest.condition.desc = condition?.type.replace('WITH_', '');
          if (condition?.withPokemonType) {
            dataEvo.quest.condition.pokemonType = condition.withPokemonType.pokemonType.map((type) => type.split('_').at(2) ?? '');
          }
          if (condition?.withThrowType) {
            dataEvo.quest.condition.throwType = condition.withThrowType.throwType.split('_').at(2);
          }
          // tslint:disable-next-line: no-empty
        } catch {} // eslint-disable-line no-empty
        dataEvo.quest.goal = template?.data.evolutionQuestTemplate?.goals[0].target;
        dataEvo.quest.type = template?.data.evolutionQuestTemplate?.questType.replace('QUEST_', '');
      } else if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.length > 1 && !isNotEmpty(Object.keys(dataEvo.quest))) {
        if (evo.form) {
          dataEvo.quest.randomEvolution = false;
        } else {
          dataEvo.quest.randomEvolution = true;
        }
      }
      if (evo.temporaryEvolution) {
        const tempEvo = {
          tempEvolutionName: name + evo.temporaryEvolution.split('TEMP_EVOLUTION').at(1),
          firstTempEvolution: evo.temporaryEvolutionEnergyCost,
          tempEvolution: evo.temporaryEvolutionEnergyCostSubsequent,
          requireMove: evo.obEvolutionBranchRequiredMove,
        };
        if (optional.tempEvo) {
          optional.tempEvo.push(tempEvo);
        } else {
          optional.tempEvo = [tempEvo];
        }
      } else {
        if (optional.evoList) {
          optional.evoList.push(dataEvo);
        } else {
          optional.evoList = [dataEvo];
        }
      }
    });

    if (pokemon.shadow && pokemon.form === FORM_SHADOW) {
      const pokemonOrigin = result.find((pk) => pk.num === pokemon.id && pk.forme === FORM_NORMAL);
      if (pokemonOrigin) {
        optional.shadowMoves?.forEach((move) => {
          move = replaceTempMoveName(move);
          if (!pokemonOrigin.shadowMoves?.includes(move)) {
            pokemonOrigin.shadowMoves?.push(move);
          }
        });
        optional.purifiedMoves?.forEach((move) => {
          move = replaceTempMoveName(move);
          if (!pokemonOrigin.purifiedMoves?.includes(move)) {
            pokemonOrigin.purifiedMoves?.push(move);
          }
        });
      }
    }

    if (pokemon.form !== FORM_SHADOW) {
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
        pokemon.num > 0 && !result.some((item) => item.fullName === convertPokemonDataName(pokemon.baseFormeSlug ?? pokemon.slug))
    )
    .forEach((item: IPokemonData) => {
      const pokemon = new PokemonModel(item.num, convertPokemonDataName(item.name));

      pokemon.pokemonId = convertPokemonDataName(item.baseSpecies ?? item.name);
      pokemon.form = item.forme ? convertPokemonDataName(item.forme) : FORM_NORMAL;
      pokemon.pokedexHeightM = item.heightm;
      pokemon.pokedexWeightKg = item.weightkg;
      pokemon.pokemonClass = item.pokemonClass ?? undefined;

      const types = item.types.map((type) => type.toUpperCase());
      const optional = new PokemonDataOptional({
        ...item,
      });

      const goTemplate = `V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(
        pokemon.form?.toString().includes(FORM_MEGA) || pokemon.form?.toString() === FORM_PRIMAL
          ? pokemon.pokemonId
          : convertPokemonDataName(item.baseFormeSlug ?? item.slug)
      )}`;
      const pokemonGO = data.find((i) => i.templateId === goTemplate);

      if (pokemonGO) {
        const pokemonSettings = pokemonGO.data?.pokemonSettings;

        pokemon.isDeployable = pokemonSettings?.isDeployable;
        pokemon.isTradable = pokemonSettings?.isTradable;
        pokemon.isTransferable = pokemonSettings?.isTransferable;
        pokemon.disableTransferToPokemonHome = pokemonSettings?.disableTransferToPokemonHome;

        if (pokemon.id === 235) {
          const moves = data.find((item) => item.templateId === 'SMEARGLE_MOVES_SETTINGS')?.data.smeargleMovesSettings;
          pokemon.quickMoves = moves?.quickMoves ?? [];
          pokemon.cinematicMoves = moves?.cinematicMoves ?? [];
        } else {
          pokemon.quickMoves = pokemonSettings?.quickMoves ?? [];
          pokemon.cinematicMoves = pokemonSettings?.cinematicMoves ?? [];
          pokemon.eliteQuickMove = pokemonSettings?.eliteQuickMove ?? [];
          pokemon.eliteCinematicMove = pokemonSettings?.eliteCinematicMove ?? [];
          pokemon.obSpecialAttackMoves = pokemonSettings?.obSpecialAttackMoves ?? [];
        }

        const tempEvo = pokemonSettings?.tempEvoOverrides?.find((evo) => pokemon.form && evo.tempEvoId?.includes(pokemon.form.toString()));
        if (tempEvo) {
          pokemon.stats = tempEvo.stats;
        } else {
          if (pokemon.form?.toString().includes(FORM_MEGA)) {
            const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
            pokemon.stats = {
              baseAttack: stats.atk,
              baseDefense: stats.def,
              baseStamina: stats.sta ?? 0,
            };
          } else {
            pokemon.stats = pokemonSettings?.stats;
          }
        }
      }

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack) {
        const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
        pokemon.stats = StatsGO.create({
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta ?? 0,
        });
      }

      optional.genderRatio = PokemonGenderRatio.create(item.genderRatio.M, item.genderRatio.F);
      optional.slug = convertPokemonDataName(item.baseFormeSlug ?? item.slug)
        ?.replaceAll('_', '-')
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
      (p) => pokemon.forme === FORM_NORMAL && p.num === pokemon.num && p.baseForme && r.some((pr) => pr.baseForme === p.baseForme)
    );
    if (isNotEmpty(normalForm)) {
      return pokemon.baseForme && pokemon.forme === FORM_NORMAL;
    }
    return !r.some(
      (p) => pokemon.forme === FORM_NORMAL && p.num === pokemon.num && p.forme !== FORM_NORMAL && p.baseForme && p.baseForme === p.forme
    );
  });
  const idConcat = [744];

  result = filterPokemon.filter((p) => !idConcat.includes(p.num));
  idConcat.forEach((id) => {
    const concatPokemon = filterPokemon.filter((p) => p.num === id);
    if (concatPokemon.length > 1) {
      const tempPokemon = concatPokemon.find((p) => p.forme === FORM_NORMAL);
      if (tempPokemon) {
        concatPokemon
          .filter((p) => p.forme !== FORM_NORMAL)
          .forEach((p) => {
            tempPokemon.evoList?.concat(p.evoList ?? []);
          });
        result.push(tempPokemon);
      }
    }
  });
  return result;
};

export const optionPokemonWeather = (data: PokemonDataGM[]) => {
  const weather: DynamicObj<string, string[]> = {};
  data
    .filter((item) => /^WEATHER_AFFINITY*/g.test(item.templateId) && item.data.weatherAffinities)
    .forEach((item) => {
      const rootType = item.data.weatherAffinities.weatherCondition;
      weather[rootType] = item.data.weatherAffinities.pokemonType.map((type) => type.replace('POKEMON_TYPE_', ''));
    });
  return weather;
};

const pokemonDefaultForm = (data: PokemonDataGM[]) => {
  const forms = optionFormNoneSpecial(data);
  return data.filter(
    (item) =>
      /^V\d{4}_POKEMON_*/g.test(item.templateId) &&
      item.data.pokemonSettings &&
      (!item.data.pokemonSettings.form ||
        item.data.pokemonSettings.form?.toString() === 'MEWTWO_A' ||
        forms.includes(item.data.pokemonSettings.form?.toString() ?? '')) &&
      !item.data.pokemonSettings.form?.toString().endsWith(FORM_NORMAL)
  );
};

const optionPokemonFamily = (pokemon: IPokemonData[]) => {
  return [...new Set(pokemon.map((item) => item.pokemonId ?? ''))];
};

export const optionSticker = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const stickers: ISticker[] = [];
  data
    .filter((item) => /^STICKER_*/g.test(item.templateId))
    .forEach((item) => {
      if (item.data.iapItemDisplay) {
        const id = item.data.iapItemDisplay.sku.replace('STICKER_', '');
        const sticker = stickers.find((sticker) => sticker.id === id.split('.')[0]);
        if (sticker) {
          sticker.shop = true;
          sticker.pack.push(parseInt(id.replace(`${sticker.id}.`, '')));
        }
      } else if (item.data.stickerMetadata) {
        const sticker = new Sticker();
        sticker.id = item.data.stickerMetadata.stickerId.replace('STICKER_', '');
        sticker.maxCount = item.data.stickerMetadata.maxCount ?? 0;
        sticker.stickerUrl = item.data.stickerMetadata.stickerUrl ?? null;
        if (item.data.stickerMetadata.pokemonId) {
          sticker.pokemonId = pokemon.find((poke) => poke.pokemonId === item.data.stickerMetadata.pokemonId)?.num;
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
    result.id = pokemon.find((poke) => poke.pokemonId === item)?.num;
    result.name = item;

    let formSet = imgs.filter((img) => img.includes(`Addressable Assets/pm${result.id}.`) && !img.includes('cry'));

    let count = 0,
      mega = false;
    while (formSet.length > count) {
      let form;
      let shiny = false;
      let gender = 3;
      const formList = formSet[count].split('.');
      if (formList[1] === 'icon' || formList[1] === 'g2') {
        form = FORM_NORMAL;
      } else {
        form = formList[1].replace('_NOEVOLVE', '').replace(/[a-z]/g, '');
      }
      if (formSet.includes(`${formSet[count].replace('.icon', '')}.s.icon`)) {
        shiny = true;
      }
      if (!formSet[count].includes('.g2.') && formSet.includes(`${formSet[count].replace('.icon', '')}.g2.icon`)) {
        gender = 1;
      } else if (formSet[count].includes('.g2.')) {
        gender = 2;
      }
      if (form?.toUpperCase().includes(FORM_MEGA)) {
        mega = true;
      }
      result.image.push(
        new ImageModel({
          gender,
          pokemonId: result.id,
          form: result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form,
          default: formSet[count],
          shiny: shiny ? formSet[count + 1] : null,
        })
      );
      count += shiny ? 2 : 1;
    }

    formSet = imgs?.filter(
      (img) =>
        !img.includes(`Addressable Assets/`) &&
        (img.includes(`pokemon_icon_${result.id?.toString().padStart(3, '0')}_51`) ||
          img.includes(`pokemon_icon_${result.id?.toString().padStart(3, '0')}_52`))
    );
    if (!mega) {
      for (let index = 0; index < formSet?.length; index += 2) {
        result.image.push(
          new ImageModel({
            gender: 3,
            pokemonId: result.id,
            form: formSet.length === 2 ? FORM_MEGA : formSet[index].includes('_51') ? FORM_MEGA_X : FORM_MEGA_Y,
            default: formSet[index],
            shiny: formSet[index + 1],
          })
        );
      }
    }

    const formList = result.image.map((img) => img.form?.replaceAll('_', ''));
    formSet = imgs.filter(
      (img) => !img.includes(`Addressable Assets/`) && img.includes(`pokemon_icon_pm${result.id?.toString().padStart(4, '0')}`)
    );
    for (let index = 0; index < formSet?.length; index += 2) {
      const subForm = formSet[index].replace('_shiny', '').split('_');
      const form = subForm[subForm.length - 1].toUpperCase();
      if (!formList.includes(form)) {
        formList.push(form);
        result.image.push(
          new ImageModel({
            gender: 3,
            pokemonId: result.id,
            form: result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form,
            default: formSet[index],
            shiny: formSet[index + 1],
          })
        );
      }
    }

    if (!isNotEmpty(result.image)) {
      formSet = imgs?.filter(
        (img) => !img.includes(`Addressable Assets/`) && img.includes(`pokemon_icon_${result.id?.toString().padStart(3, '0')}`)
      );
      for (let index = 0; index < formSet.length; index += 2) {
        const form = FORM_NORMAL;
        if (!formList.includes(form)) {
          formList.push(form);
          result.image.push(
            new ImageModel({
              gender: 3,
              pokemonId: result.id,
              form: result.id !== 201 ? convertAndReplaceNameGO(form, result.name) : form,
              default: formSet[index],
              shiny: formSet[index + 1],
            })
          );
        }
      }
    }

    mega = false;
    let soundForm = sounds.filter((sound) => sound.includes(`Addressable Assets/pm${result.id}.`) && sound.includes('cry'));
    result.sound.cry = soundForm.map((sound) => {
      const forms = sound.split('.');
      let form;
      if (forms[1] === 'cry') {
        form = FORM_NORMAL;
      } else {
        form = forms[1].replace(/[a-z]/g, '');
      }
      if (form?.toUpperCase().includes(FORM_MEGA)) {
        mega = true;
      }
      return new CryPath({
        form,
        path: sound,
      });
    });

    soundForm = sounds?.filter(
      (sound) =>
        !sound.includes(`Addressable Assets/`) &&
        (sound.includes(`pv${result.id?.toString().padStart(3, '0')}_51`) ||
          sound.includes(`pv${result.id?.toString().padStart(3, '0')}_52`))
    );
    if (!mega) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: soundForm.length !== 2 ? FORM_MEGA : sound.includes('_51') ? FORM_MEGA_X : FORM_MEGA_Y,
            path: sound,
          })
        );
      });
    }
    soundForm = sounds.filter(
      (sound) => !sound.includes(`Addressable Assets/`) && sound.includes(`pv${result.id?.toString().padStart(3, '0')}`)
    );
    if (!isNotEmpty(result.sound.cry)) {
      soundForm.forEach((sound) => {
        result.sound.cry.push(
          new CryPath({
            form: sound.includes('_31') ? FORM_SPECIAL : FORM_NORMAL,
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
      return {
        ...item.data.moveSettings,
        id: isNotEmpty(regId) ? parseInt(regId[0]) : 0,
      };
    });
  const sequence = data
    .filter(
      (item) => item.templateId.includes('sequence_') && item.data.moveSequenceSettings.sequence.find((seq) => seq.includes('sfx attacker'))
    )
    .map((item) => {
      return {
        id: item.templateId.replace('sequence_', '').toUpperCase(),
        path: item.data.moveSequenceSettings.sequence?.find((seq) => seq.includes('sfx attacker'))?.replace('sfx attacker ', ''),
      };
    });

  const moveSet = data
    .filter((item) => item.templateId.startsWith('COMBAT_V'))
    .map((item) => {
      const result = new Combat();
      result.name = item.data.combatMove.uniqueId.replace(/^V\d{4}_MOVE_/, '');
      result.type = item.data.combatMove.type.replace('POKEMON_TYPE_', '');
      if (item.templateId.endsWith(TypeMove.FAST) || item.templateId.includes('_FAST_')) {
        result.typeMove = TypeMove.FAST;
      } else {
        result.typeMove = TypeMove.CHARGE;
      }
      result.pvpPower = item.data.combatMove.power ?? 0.0;
      result.pvpEnergy = item.data.combatMove.energyDelta ?? 0;
      const seq = sequence.find((seq) => seq.id === result.name);
      result.sound = seq?.path ?? null;
      if (item.data.combatMove.buffs) {
        const buffKey = Object.keys(item.data.combatMove.buffs);
        buffKey.forEach((buff) => {
          if (buff.includes('AttackStat')) {
            if (buff.includes('target')) {
              result.buffs.push(
                new Buff({
                  type: TypeAction.ATK,
                  target: 'target',
                  power: item.data.combatMove.buffs?.[buff] ?? 0,
                })
              );
            } else {
              result.buffs.push(
                new Buff({
                  type: TypeAction.ATK,
                  target: 'attacker',
                  power: item.data.combatMove.buffs?.[buff] ?? 0,
                })
              );
            }
          } else if (buff.includes('DefenseStat')) {
            if (buff.includes('target')) {
              result.buffs.push(
                new Buff({
                  type: TypeAction.DEF,
                  target: 'target',
                  power: item.data.combatMove.buffs?.[buff] ?? 0,
                })
              );
            } else {
              result.buffs.push(
                new Buff({
                  type: TypeAction.DEF,
                  target: 'attacker',
                  power: item.data.combatMove.buffs?.[buff] ?? 0,
                })
              );
            }
          }
          result.buffs[result.buffs.length - 1].buffChance = item.data.combatMove.buffs?.[buffKey[buffKey.length - 1]];
        });
      }
      const move = moves.find((move) => move.movementId.replace(/^V\d{4}_MOVE_/, '') === result.name);
      const name = replaceTempMoveName(result.name.toString());
      result.id = move?.id ?? 0;
      result.track = move?.id ?? 0;
      result.name = name;
      result.pvePower = move?.power ?? 0.0;
      if (result.name === 'STRUGGLE') {
        result.pveEnergy = -33;
      } else {
        result.pveEnergy = move?.energyDelta ?? 0;
      }
      result.durationMs = move?.durationMs ?? 0;
      result.damageWindowStartMs = move?.damageWindowStartMs ?? 0;
      result.damageWindowEndMs = move?.damageWindowEndMs ?? 0;
      result.accuracyChance = move?.accuracyChance ?? 0;
      result.criticalChance = move?.criticalChance ?? 0;
      result.staminaLossScalar = move?.staminaLossScalar ?? 0;
      return result;
    });

  const result = moveSet;
  moveSet.forEach((move) => {
    if (move.name === 'HIDDEN_POWER') {
      Object.keys(types)
        .filter((type) => type !== 'NORMAL' && type !== 'FAIRY')
        .forEach((type, index) =>
          result.push(
            Combat.create({
              ...move,
              id: parseInt(`${move.id}${index}`),
              name: `${move.name}_${type}`,
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
  result.allowLeagues =
    data
      .find((item) => item.templateId === 'VS_SEEKER_CLIENT_SETTINGS')
      ?.data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId.map((item) =>
        item.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '')
      ) ?? [];

  result.data = data
    .filter((item) => item.templateId.includes('COMBAT_LEAGUE_') && !item.templateId.includes('SETTINGS'))
    .map((item) => {
      const result = new League();
      result.id = item.templateId.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '');
      result.title = item.data.combatLeague.title.replace('combat_', '').replace('_title', '').toUpperCase();
      result.enabled = item.data.combatLeague.enabled;
      item.data.combatLeague.pokemonCondition.forEach((con) => {
        if (con.type === 'POKEMON_CAUGHT_TIMESTAMP') {
          result.conditions.timestamp = LeagueTimestamp.create({
            start: 0,
            end: 0,
          });
          result.conditions.timestamp.start = con.pokemonCaughtTimestamp?.afterTimestamp;
          result.conditions.timestamp.end = con.pokemonCaughtTimestamp?.beforeTimestamp;
        }
        if (con.type === 'WITH_UNIQUE_POKEMON') {
          result.conditions.uniqueSelected = true;
        }
        if (con.type === 'WITH_POKEMON_TYPE') {
          result.conditions.uniqueType = con.withPokemonType?.pokemonType.map((type) => type.replace('POKEMON_TYPE_', '')) ?? [];
        }
        if (con.type === 'POKEMON_LEVEL_RANGE') {
          result.conditions.maxLevel = con.pokemonLevelRange?.maxLevel;
        }
        if (con.type === 'WITH_POKEMON_CP_LIMIT') {
          result.conditions.maxCp = con.withPokemonCpLimit?.maxCp;
        }
        if (con.type === 'POKEMON_WHITELIST') {
          result.conditions.whiteList =
            con.pokemonWhiteList?.pokemon.map((poke) => {
              const item = pokemon.find((item) => item.pokemonId === poke.id?.toString());
              return {
                id: item?.num ?? 0,
                name: item?.pokemonId,
                form: poke.forms ? poke.forms : FORM_NORMAL,
              };
            }) ?? [];
          const whiteList: IPokemonPermission[] = [];
          result.conditions.whiteList.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  whiteList.push(new PokemonPermission({ ...value, form: FORM_NORMAL }));
                } else if (form !== 'FORM_UNSET') {
                  whiteList.push(new PokemonPermission({ ...value, form: form.replace(`${value.name}_`, '') }));
                }
              });
            } else {
              whiteList.push(new PokemonPermission(value));
            }
          });
          result.conditions.whiteList = whiteList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        }
        if (con.type === 'POKEMON_BANLIST') {
          result.conditions.banned =
            con.pokemonBanList?.pokemon.map((poke) => {
              const item = pokemon.find((item) => item.pokemonId === poke.id?.toString());
              return {
                id: item?.num ?? 0,
                name: item?.pokemonId,
                form: poke.forms ?? FORM_NORMAL,
              };
            }) ?? [];
          const banList: IPokemonPermission[] = [];
          result.conditions.banned.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  banList.push(new PokemonPermission({ ...value, form: FORM_NORMAL }));
                } else if (form !== 'FORM_UNSET') {
                  banList.push(new PokemonPermission({ ...value, form: form.replace(`${value.name}_`, '') }));
                }
              });
            } else {
              banList.push(new PokemonPermission(value));
            }
          });
          result.conditions.banned = banList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        }
      });
      result.iconUrl = item.data.combatLeague.iconUrl
        .replace(APIUrl.POGO_PROD_ASSET_URL, '')
        .replace(`${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/`, '');
      result.league = item.data.combatLeague.badgeType.replace('BADGE_', '');
      if (item.data.combatLeague.bannedPokemon) {
        const banList = result.conditions.banned.concat(
          item.data.combatLeague.bannedPokemon.map((poke) => {
            const item = pokemon.find((item) => item.pokemonId === poke);
            return {
              id: item?.num ?? 0,
              name: item?.pokemonId,
              form: FORM_NORMAL,
            };
          })
        );
        result.conditions.banned = banList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
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
        rewards.rank[data.rankLevel] = {
          rank: data.rankLevel,
          free: [],
          premium: [],
        };
      }
      data.reward.slice(0, 5).forEach((reward, index) => {
        const result = new RankRewardSetLeague();
        result.step = index + 1;
        if (reward.pokemonReward) {
          result.type = 'pokemon';
          result.count = 1;
        } else if (reward.itemLootTable) {
          result.type = 'itemLoot';
          result.count = 1;
        } else if (reward.item) {
          if (reward.item.stardust) {
            result.type = 'stardust';
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
      const track = item.templateId.includes('FREE') ? 'FREE' : 'PREMIUM';
      data.availablePokemon.forEach((value) => {
        if (!rewards.pokemon[value.unlockedAtRank]) {
          rewards.pokemon[value.unlockedAtRank] = new PokemonRewardLeague({
            rank: value.unlockedAtRank,
            free: [],
            premium: [],
          });
        }
        const result = new PokemonRewardSetLeague();
        let poke = new PokemonReward();
        if (value.guaranteedLimitedPokemonReward) {
          result.guaranteedLimited = true;
          poke = value.guaranteedLimitedPokemonReward.pokemon;
        } else {
          poke = value.pokemon;
        }
        result.id = pokemon.find((item) => item.pokemonId === poke.pokemonId)?.num ?? 0;
        result.name = poke.pokemonId;
        if (poke.pokemonDisplay) {
          result.form = poke.pokemonDisplay.form.replace(`${poke.pokemonId}_`, '');
        } else {
          result.form = FORM_NORMAL;
        }
        if (track === 'FREE') {
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
        start: parseInt(seasons[seasons.length - 3]),
        end: parseInt(seasons[seasons.length - 2]),
      }),
      rewards,
      settings:
        data.find((item) => item.templateId === `COMBAT_RANKING_SETTINGS_S${seasons.length - 1}`)?.data.combatRankingProtoSettings
          .rankLevel ?? [],
    });
  }

  return result;
};

export const mappingReleasedPokemonGO = (pokemonData: IPokemonData[], assets: IAsset[]) => {
  pokemonData.forEach((item) => {
    const form = assets?.find((asset) => asset.id === item.num);
    const image = form?.image.find((img) => img.form === (item.num === 201 ? `${item.pokemonId}_${item.baseForme}` : item.forme));

    if (form && (item.isShadow || (checkMoveSetAvailable(item) && image?.default))) {
      item.releasedGO = (item.isShadow || image?.default.includes('Addressable Assets/')) ?? false;
    }
  });
};
