import { Asset, AssetDataModel } from './models/asset.model';
import { CombatDataModel, CombatPokemon, CombatPokemonDataModel } from './models/combat.model';
import { EvolutionDataModel, EvoList } from './models/evolution.model';
import {
  LeagueDataModel,
  LeagueOptionsDataModel,
  LeagueRewardDataModel,
  LeagueRewardPokemonDataModel,
  PokemonRewardLeague,
  RankRewardLeague,
} from './models/league.model';
import { StickerModel, StickerDataModel } from './models/sticker.model';
import { Details, DetailsPokemonModel } from './models/details.model';

import pokemonData from '../data/pokemon.json';
import {
  checkMoveSetAvailable,
  convertIdMove,
  convertName,
  convertPokemonGOName,
  findPokemonData,
  replacePokemonGoForm,
  splitAndCapitalize,
} from '../util/Utils';
import { TypeSet } from './models/type.model';
import { Candy, CandyDataModel, CandyModel } from './models/candy.model';
import { TypeMove } from '../enums/move.enum';
import { PokemonDataModel, PokemonDataOptional, PokemonEncounter, PokemonModel } from './models/pokemon.model';
import { TypeEff } from './models/type-eff.model';
import { FORM_GALARIAN, FORM_HISUIAN, FORM_MEGA, FORM_NORMAL, FORM_PRIMAL, FORM_SHADOW, FORM_STANDARD } from '../util/Constants';
import { APIUrl } from '../services/constants';
import { PokemonData, PokemonPermission } from './models/options.model';
import { calculateStatsByTag } from '../util/Calculate';

export const getOption = (options: any, args: string[]) => {
  if (!options) {
    return options;
  }

  args.forEach((arg: string) => {
    options = options[arg];
  });
  return options;
};

export const optionSettings = (data: PokemonData[]) => {
  const settings: any = {
    combat_options: {},
    battle_options: {},
    throw_charge: {},
    buddy_friendship: {},
    trainer_friendship: {},
  };

  data.forEach((item) => {
    if (item.templateId === 'COMBAT_SETTINGS') {
      settings.combat_options.stab = item.data.combatSettings.sameTypeAttackBonusMultiplier;
      settings.combat_options.shadow_bonus = {};
      settings.combat_options.shadow_bonus.atk = item.data.combatSettings.shadowPokemonAttackBonusMultiplier;
      settings.combat_options.shadow_bonus.def = item.data.combatSettings.shadowPokemonDefenseBonusMultiplier;

      settings.throw_charge.normal = item.data.combatSettings.chargeScoreBase;
      settings.throw_charge.nice = item.data.combatSettings.chargeScoreNice;
      settings.throw_charge.great = item.data.combatSettings.chargeScoreGreat;
      settings.throw_charge.excellent = item.data.combatSettings.chargeScoreExcellent;
    } else if (item.templateId === 'BATTLE_SETTINGS') {
      settings.battle_options.enemyAttackInterval = item.data.battleSettings.enemyAttackInterval;
      settings.battle_options.stab = item.data.battleSettings.sameTypeAttackBonusMultiplier;
      settings.battle_options.shadow_bonus = {};
      settings.battle_options.shadow_bonus.atk = item.data.battleSettings.shadowPokemonAttackBonusMultiplier;
      settings.battle_options.shadow_bonus.def = item.data.battleSettings.shadowPokemonDefenseBonusMultiplier;
    } else if (item.templateId.includes('BUDDY_LEVEL_')) {
      const level = parseInt(item.templateId.replace('BUDDY_LEVEL_', ''));
      settings.buddy_friendship[level] = {};
      settings.buddy_friendship[level].level = level;
      settings.buddy_friendship[level].minNonCumulativePointsRequired = item.data.buddyLevelSettings.minNonCumulativePointsRequired ?? 0;
      settings.buddy_friendship[level].unlockedTrading = item.data.buddyLevelSettings.unlockedTraits;
    } else if (item.templateId.includes('FRIENDSHIP_LEVEL_')) {
      const level = parseInt(item.templateId.replace('FRIENDSHIP_LEVEL_', ''));
      settings.trainer_friendship[level] = {};
      settings.trainer_friendship[level].level = level;
      settings.trainer_friendship[level].atk_bonus = item.data.friendshipMilestoneSettings.attackBonusPercentage;
      settings.trainer_friendship[level].unlockedTrading = item.data.friendshipMilestoneSettings.unlockedTrading;
    }
  });
  return settings;
};

export const optionPokeImg = (data: { tree: { path: string }[] }) => {
  return data.tree.map((item) => item.path.replace('.png', ''));
};

export const optionPokeSound = (data: { tree: { path: string }[] }) => {
  return data.tree.map((item) => item.path.replace('.wav', ''));
};

export const optionPokemonTypes = (data: PokemonData[]) => {
  const types: any = {};
  const typeSet = [
    'NORMAL',
    'FIGHTING',
    'FLYING',
    'POISON',
    'GROUND',
    'ROCK',
    'BUG',
    'GHOST',
    'STEEL',
    'FIRE',
    'WATER',
    'GRASS',
    'ELECTRIC',
    'PSYCHIC',
    'ICE',
    'DRAGON',
    'DARK',
    'FAIRY',
  ];
  data
    .filter((item) => item.templateId.match(/^POKEMON_TYPE*/g) && item.data.typeEffective)
    .forEach((item) => {
      const rootType = item.templateId.replace('POKEMON_TYPE_', '');
      types[rootType] = {} as TypeSet;
      typeSet.forEach((type, index) => {
        types[rootType][type] = item.data.typeEffective.attackScalar[index];
      });
    });
  return types;
};

const optionFormNoneSpecial = (data: PokemonData[]) => {
  const result: string[] = [];
  data
    .filter((item) => item.templateId.match(/^FORMS_V\d{4}_POKEMON_*/g) && item.data?.formSettings?.forms)
    .forEach((item) => {
      item.data.formSettings.forms.forEach((f) => {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      });
    });

  return result;
};

const convertAndReplaceNameGO = (name: string, defaultName = '') => {
  return name
    ?.replace(`${replacePokemonGoForm(defaultName)}_`, '')
    .replace(/^S$/gi, FORM_SHADOW)
    .replace(/^A$/gi, 'ARMOR')
    .replace(FORM_GALARIAN, 'GALAR')
    .replace(FORM_HISUIAN, 'HISUI');
};

export const optionPokemonData = (data: PokemonData[], encounter: PokemonEncounter[]) => {
  const result: PokemonDataModel[] = [];
  pokemonDefaultForm(data).forEach((item) => {
    const pokemonSettings = item.data.pokemonSettings;
    const regId = item.templateId.match(/\d{4}/g) as string[];
    let pokemon = new PokemonModel(regId.length > 0 ? parseInt(regId[0]) : 0, pokemonSettings.pokemonId);
    pokemon = {
      ...pokemonSettings,
    };
    pokemon.id = regId.length > 0 ? parseInt(regId[0]) : 0;
    if (!pokemonSettings.form) {
      pokemon.form = FORM_NORMAL;
    } else {
      pokemon.form = convertAndReplaceNameGO(pokemonSettings.form?.toString(), pokemonSettings.pokemonId);
    }
    pokemon.name = pokemonSettings.form ? `${pokemon.pokemonId}_${pokemon.form}` : pokemon.pokemonId;

    const types = [];
    if (pokemonSettings.type) {
      types.push(pokemonSettings.type.replace('POKEMON_TYPE_', ''));
    }
    if (pokemonSettings.type2) {
      types.push(pokemonSettings.type2.replace('POKEMON_TYPE_', ''));
    }

    const defaultName = pokemonSettings.form ? `${pokemonSettings.pokemonId}_${pokemonSettings.form}` : pokemonSettings.pokemonId;
    const pokemonEncounter = encounter?.find((e) => defaultName === e.name);

    pokemon.encounter = {
      ...pokemonSettings.encounter,
      baseCaptureRate: pokemonEncounter?.basecapturerate,
      baseFleeRate: pokemonEncounter?.basefleerate,
    };

    const optional: PokemonDataOptional = {};

    const gender = data.find(
      (item) =>
        item.templateId === `SPAWN_V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(pokemonSettings.pokemonId)}`
    );

    if (pokemon.id === 235) {
      const moves = data.find((item) => item.templateId === 'SMEARGLE_MOVES_SETTINGS')?.data.smeargleMovesSettings;
      pokemon.quickMoves = moves?.quickMoves ?? [];
      pokemon.cinematicMoves = moves?.cinematicMoves ?? [];
    }

    if (optional && pokemonSettings.shadow) {
      optional.shadowMoves = [pokemonSettings.shadow.shadowChargeMove];
      optional.purifiedMoves = [pokemonSettings.shadow.purifiedChargeMove];
    }

    if (pokemonSettings.shadow) {
      optional.purified = {
        stardust: pokemonSettings.shadow.purificationStardustNeeded,
        candy: pokemonSettings.shadow.purificationCandyNeeded,
      };
    }
    if (pokemonSettings.thirdMove) {
      optional.thirdMove = {
        stardust: pokemonSettings.thirdMove.stardustToUnlock,
        candy: pokemonSettings.thirdMove.candyToUnlock,
      };
    }

    optional.genderRatio = {
      M: gender?.data.genderSettings.gender?.malePercent ?? 0,
      F: gender?.data.genderSettings.gender?.femalePercent ?? 0,
    };

    const pokemonBaseData = findPokemonData(
      pokemon.id,
      convertPokemonGOName(
        pokemon.form === FORM_NORMAL || pokemon.form === FORM_SHADOW || [664, 665, 666, 676].includes(pokemon.id)
          ? pokemonSettings.pokemonId
          : pokemonSettings.form?.toString() ?? pokemonSettings.pokemonId
      )
    );
    if (pokemonBaseData) {
      optional.slug = pokemonBaseData.slug;
      optional.color = pokemonBaseData.color;
      optional.sprite = pokemonBaseData.sprite;
      optional.baseForme = pokemonBaseData.baseForme ?? undefined;
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
      const dataEvo: EvoList = {
        evoToForm: '',
        evoToId: 0,
        evoToName: '',
        candyCost: 0,
        purificationEvoCandyCost: 0,
      };
      const name = evo.evolution ?? pokemon.name;
      if (evo.form) {
        dataEvo.evoToForm = convertAndReplaceNameGO(evo.form, name);
      } else {
        dataEvo.evoToForm = pokemon.form?.toString() ?? FORM_NORMAL;
      }

      dataEvo.evoToName = name.replace(`_${FORM_NORMAL}`, '');
      const pokemonGO = data.find(
        (i) =>
          i.templateId.match(/^V\d{4}_POKEMON_*/g) &&
          i.data.pokemonSettings &&
          i.data.pokemonSettings.pokemonId === dataEvo.evoToName &&
          convertAndReplaceNameGO(i.data.pokemonSettings.form?.toString() ?? FORM_NORMAL, i.data.pokemonSettings.pokemonId) ===
            dataEvo.evoToForm
      );

      if (pokemonGO) {
        const regEvoId = pokemonGO.templateId.match(/\d{4}/g) as string[];
        dataEvo.evoToId = regEvoId.length > 0 ? parseInt(regEvoId[0]) : 0;
      }

      if (evo.candyCost) {
        dataEvo.candyCost = evo.candyCost;
      }
      if (evo.obPurificationEvolutionCandyCost) {
        dataEvo.purificationEvoCandyCost = evo.obPurificationEvolutionCandyCost;
      }
      dataEvo.quest = {};
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
          dataEvo.quest.condition = {};
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
      } else if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.length > 1 && Object.keys(dataEvo.quest).length === 0) {
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

    optional.baseStatsGO = true;

    result.push(new PokemonDataModel(pokemon, types, optional));
  });

  addPokemonFromData(data, result);

  return result.sort((a, b) => a.num - b.num);
};

const convertBaseName = (name: string) => {
  return name
    .toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('.', '')
    .replaceAll(':', '')
    .replaceAll('é', 'e')
    .replaceAll('’', '')
    .replace('-east', '')
    .replace('-dusk', '');
};

const addPokemonFromData = (data: PokemonData[], result: PokemonDataModel[]) => {
  Object.values(pokemonData)
    .filter(
      (pokemon: PokemonDataModel) =>
        pokemon.num > 0 && !result.some((item) => item.slug === convertBaseName(pokemon.name)) && pokemon.forme !== 'F'
    )
    .forEach((item: PokemonDataModel) => {
      const pokemon = new PokemonModel(item.num, item.name);

      pokemon.pokemonId = (item.baseSpecies ?? item.name).replaceAll('-', '_').toUpperCase();
      pokemon.form = item.forme ? item.forme.replaceAll('-', '_').toUpperCase() : FORM_NORMAL;
      pokemon.pokedexHeightM = item.heightm;
      pokemon.pokedexWeightKg = item.weightkg;
      pokemon.pokemonClass = item.pokemonClass ?? undefined;

      const types = item.types.map((type) => type.toUpperCase());
      const optional = {
        ...item,
      } as PokemonDataOptional;

      const pokemonGO = data.find(
        (i) =>
          i.templateId ===
          `V${pokemon.id.toString().padStart(4, '0')}_POKEMON_${replacePokemonGoForm(
            pokemon.form === FORM_MEGA || pokemon.form === FORM_PRIMAL ? pokemon.pokemonId : convertName(item.slug)
          )}`
      );

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
          pokemon.stats = pokemonSettings?.stats;
        }
      }

      if (!pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack && !pokemon.stats?.baseAttack) {
        const stats = calculateStatsByTag(undefined, item.baseStats, item.slug);
        pokemon.stats = {
          baseAttack: stats.atk,
          baseDefense: stats.def,
          baseStamina: stats.sta ?? 0,
        };
      }

      optional.genderRatio = {
        M: item.genderRatio.M,
        F: item.genderRatio.F,
      };
      optional.baseStatsGO = true;

      result.push(new PokemonDataModel(pokemon, types, optional));
    });
};

export const optionPokemonName = (details: PokemonDataModel[] | undefined) => {
  const pokemonDataId = [...new Set(details?.map((p) => p.num))];
  const result: any = {};
  pokemonDataId
    .filter((id) => id > 0)
    .forEach((id, index) => {
      const pokemon = details?.find((p) => p.num === id && p.forme?.toUpperCase() === FORM_NORMAL);
      if (pokemon) {
        result[pokemon.num.toString()] = {
          index: index + 1,
          id: pokemon.num,
          name: splitAndCapitalize(pokemon.name, '_', ' '),
        };
      } else {
        const pokemonTemp = Object.values(pokemonData).find((p) => p.num === id && !p.forme);

        if (pokemonTemp) {
          result[pokemonTemp.num.toString()] = {
            index: index + 1,
            id: pokemonTemp.num,
            name: splitAndCapitalize(pokemonTemp.name, '_', ' '),
          };
        }
      }
    });
  return result;
};

export const optionPokemonWeather = (data: PokemonData[]) => {
  const weather: any = {};
  data
    .filter((item) => item.templateId.match(/^WEATHER_AFFINITY*/g) && item.data.weatherAffinities)
    .forEach((item) => {
      const rootType = item.data.weatherAffinities.weatherCondition;
      weather[rootType] = item.data.weatherAffinities.pokemonType.map((type) => type.replace('POKEMON_TYPE_', ''));
    });
  return weather;
};

const optionPokemonSpawn = (data: PokemonData[]) => {
  return data
    .filter((item) => item.templateId.match(/^SPAWN_V\d{4}_*/g) && item.data.genderSettings)
    .map((item) => {
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return {
        id: regId.length > 0 ? parseInt(regId[0]) : 0,
        name: item.templateId.split('POKEMON_').at(1),
        gender: item.data.genderSettings.gender,
      };
    });
};

const pokemonDefaultForm = (data: PokemonData[]) => {
  const forms = optionFormNoneSpecial(data);
  return data.filter(
    (item) =>
      item.templateId.match(/^V\d{4}_POKEMON_*/g) &&
      item.data.pokemonSettings &&
      (!item.data.pokemonSettings.form ||
        item.data.pokemonSettings.form?.toString() === 'MEWTWO_A' ||
        forms.includes(item.data.pokemonSettings.form?.toString() ?? '')) &&
      !item.data.pokemonSettings.form?.toString().endsWith(FORM_NORMAL)
  );
};

export const optionPokemon = (data: PokemonData[], encounter?: PokemonEncounter[]): PokemonModel[] => {
  return data
    .filter((item) => item.templateId.match(/^V\d{4}_POKEMON_*/g) && item.data.pokemonSettings)
    .map((item) => {
      const name = item.data.pokemonSettings.form?.toString() ?? item.data.pokemonSettings.pokemonId;
      const pokemonEncounter = encounter?.find((pokemon) => pokemon.name === name);
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return {
        ...item.data.pokemonSettings,
        id: regId.length > 0 ? parseInt(regId[0]) : 0,
        name,
        encounter: {
          ...item.data.pokemonSettings.encounter,
          baseCaptureRate: pokemonEncounter?.basecapturerate,
          baseFleeRate: pokemonEncounter?.basefleerate,
        },
      };
    });
};

export const optionFormNone = (data: PokemonData[]) => {
  return data
    .filter((item) => item.templateId.match(/^FORMS_V\d{4}_POKEMON_*/g))
    .map((item) => item.data.formSettings)
    .filter((item) => {
      return !item.forms?.find((form) => form.form === `${item.pokemon}_${FORM_NORMAL}`);
    })
    .map((item) => item.pokemon);
};

export const setFormNoneSpecial = (data: PokemonData[]) => {
  const result: string[] = [];
  data
    .filter((item) => item.templateId.match(/^FORMS_V\d{4}_POKEMON_*/g))
    .forEach((item) => {
      item.data.formSettings.forms?.forEach((f) => {
        if (f.form && !f.isCostume && !f.assetBundleSuffix) {
          result.push(f.form);
        }
      });
    });

  return result;
};

export const optionFormSpecial = (data: PokemonData[]) => {
  return data
    .filter((item) => item.templateId.match(/^FORMS_V\d{4}_POKEMON_*/g) && item.data.formSettings?.forms)
    .map((item) => item.data.formSettings.forms)
    .reduce((prev, curr) => [...prev, ...curr], [])
    .filter((item) => {
      return (
        item.assetBundleSuffix ||
        item.isCostume ||
        (item.form && item.form?.toUpperCase().includes(FORM_NORMAL) && !item.form.includes('UNOWN'))
      );
    })
    .map((item) => item.form)
    .filter((form) => form !== 'MEWTWO_A' && form !== 'PIKACHU_ROCK_STAR' && form !== 'PIKACHU_POP_STAR');
};

const optionPokemonFamily = (pokemon: PokemonDataModel[]) => {
  return [...new Set(pokemon.map((item) => item.pokemonId ?? ''))];
};

export const optionPokemonFamilyGroup = (data: PokemonData[]) => {
  return data
    .filter((item) => item.templateId.match(/^V\d{4}_FAMILY_*/g) && item.data.pokemonFamily)
    .map((item) => {
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return {
        familyId: regId.length > 0 ? parseInt(regId[0]) : 0,
        familyName: item.data.pokemonFamily.familyId,
      };
    });
};

export const optionPokemonCandy = (candyData: CandyModel[], pokemon: PokemonModel[], pokemonFamily: string[]) => {
  const resultCandy: Candy[] = [];
  pokemonFamily.forEach((poke, index) => {
    const candy = candyData.find((item) => index + 1 === item.FamilyId);
    if (candy) {
      const result = new CandyDataModel();
      result.familyId = index + 1;
      result.familyName = `FAMILY_${poke}`;
      result.primaryColor = candy.PrimaryColor;
      result.secondaryColor = candy.SecondaryColor;

      result.familyGroup = pokemon
        .filter((item) => result.familyId === candy.FamilyId && result.familyName === item.familyId)
        .map((item) => {
          return { id: item.id, name: item.form ? `${item.pokemonId}_${item.form}` : item.pokemonId };
        });
      resultCandy.push(result);
    }
  });

  return resultCandy;
};

export const optionEvolution = (data: PokemonData[], pokemon: PokemonModel[], formSpecial: string[]) => {
  return pokemon
    .filter((item) => !formSpecial.includes(item.name))
    .map((item) => {
      const result = new EvolutionDataModel();
      result.id = item.id;
      result.name = item.name;
      if (item.form) {
        result.form = item.form
          .toString()
          .replace(item.pokemonId + '_', '')
          .replace(FORM_GALARIAN, 'GALAR')
          .replace(FORM_HISUIAN, 'HISUI')
          .replace(`_${FORM_STANDARD}`, '')
          .replace(FORM_STANDARD, '');
      }
      if (item.evolutionBranch) {
        item.evolutionBranch.forEach((evo) => {
          const dataEvo: EvoList = {
            evoToForm: '',
            evoToId: 0,
            evoToName: '',
            candyCost: 0,
            purificationEvoCandyCost: 0,
          };
          const name = evo.evolution ?? result.name;
          if (evo.form) {
            dataEvo.evoToForm = evo.form.replace(name + '_', '').replace(FORM_NORMAL, '');
          } else {
            dataEvo.evoToForm = result.form;
          }
          dataEvo.evoToForm = dataEvo.evoToForm
            .replace(FORM_GALARIAN, 'GALAR')
            .replace(FORM_HISUIAN, 'HISUI')
            .replace(`_${FORM_STANDARD}`, '')
            .replace(FORM_STANDARD, '');
          dataEvo.evoToId = pokemon.find((poke) => poke.name === name)?.id ?? 0;
          dataEvo.evoToName = name.replace(`_${FORM_NORMAL}`, '');
          if (evo.candyCost) {
            dataEvo.candyCost = evo.candyCost;
          }
          if (evo.obPurificationEvolutionCandyCost) {
            dataEvo.purificationEvoCandyCost = evo.obPurificationEvolutionCandyCost;
          }
          dataEvo.quest = {};
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
              dataEvo.quest.condition = {};
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
          } else if (item.evolutionBranch && item.evolutionBranch.length > 1 && Object.keys(dataEvo.quest).length === 0) {
            if (evo.form) {
              dataEvo.quest.randomEvolution = false;
            } else {
              dataEvo.quest.randomEvolution = true;
            }
          }
          if (evo.temporaryEvolution) {
            result.tempEvo.push({
              tempEvolutionName: name + evo.temporaryEvolution.split('TEMP_EVOLUTION').at(1),
              firstTempEvolution: evo.temporaryEvolutionEnergyCost,
              tempEvolution: evo.temporaryEvolutionEnergyCostSubsequent,
              requireMove: evo.obEvolutionBranchRequiredMove,
            });
          }
          if (result.tempEvo.length === 0) {
            result.evoList.push(dataEvo);
          }
        });
      }
      if (item.shadow) {
        result.purified.stardust = item.shadow.purificationStardustNeeded;
        result.purified.candy = item.shadow.purificationCandyNeeded;
      }
      if (item.thirdMove) {
        result.thirdMove.stardust = item.thirdMove.stardustToUnlock;
        result.thirdMove.candy = item.thirdMove.candyToUnlock;
      }
      return result;
    });
};

export const optionSticker = (data: PokemonData[], pokemon: PokemonDataModel[]) => {
  const stickers: StickerModel[] = [];
  data
    .filter((item) => item.templateId.match(/^STICKER_*/g))
    .forEach((item) => {
      if (item.data.iapItemDisplay) {
        const id = item.data.iapItemDisplay.sku.replace('STICKER_', '');
        const sticker = stickers.find((sticker) => sticker.id === id.split('.')[0]);
        if (sticker) {
          sticker.shop = true;
          sticker.pack.push(parseInt(id.replace(sticker.id + '.', '')));
        }
      } else if (item.data.stickerMetadata) {
        const sticker = new StickerDataModel();
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

export const optionAssets = (pokemon: PokemonDataModel[], imgs: string[], sounds: string[]) => {
  const family = optionPokemonFamily(pokemon);
  return family.map((item) => {
    const result = new AssetDataModel();
    result.id = pokemon.find((poke) => poke.pokemonId === item)?.num;
    result.name = item;

    let formSet = imgs.filter((img) => img.includes(`Addressable Assets/pm${result.id}.`) && !img.includes('cry'));

    let count = 0,
      mega = false;
    while (formSet.length > count) {
      let form: string | string[] = formSet[count].split('.'),
        shiny = false,
        gender = 3;
      if (form[1] === 'icon' || form[1] === 'g2') {
        form = FORM_NORMAL;
      } else {
        form = form[1].replace('_NOEVOLVE', '').replace(/[a-z]/g, '');
      }
      if (formSet.includes(formSet[count].replace('.icon', '') + '.s.icon')) {
        shiny = true;
      }
      if (!formSet[count].includes('.g2.') && formSet.includes(formSet[count].replace('.icon', '') + '.g2.icon')) {
        gender = 1;
      } else if (formSet[count].includes('.g2.')) {
        gender = 2;
      }
      if (form?.toUpperCase().includes(FORM_MEGA)) {
        mega = true;
      }
      // if (form === 'A') {
      //   form = 'ARMOR';
      // }
      result.image.push({
        gender,
        pokemonId: result.id,
        form: form.replace(`${result.name}_`, ''),
        default: formSet[count],
        shiny: shiny ? formSet[count + 1] : null,
      });
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
        result.image.push({
          gender: 3,
          pokemonId: result.id,
          form: formSet.length === 2 ? FORM_MEGA : formSet[index].includes('_51') ? 'MEGA_X' : 'MEGA_Y',
          default: formSet[index],
          shiny: formSet[index + 1],
        });
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
        result.image.push({
          gender: 3,
          pokemonId: result.id,
          form,
          default: formSet[index],
          shiny: formSet[index + 1],
        });
      }
    }

    if (result.image.length === 0) {
      formSet = imgs?.filter(
        (img) => !img.includes(`Addressable Assets/`) && img.includes(`pokemon_icon_${result.id?.toString().padStart(3, '0')}`)
      );
      for (let index = 0; index < formSet.length; index += 2) {
        const form = FORM_NORMAL;
        if (!formList.includes(form)) {
          formList.push(form);
          result.image.push({
            gender: 3,
            pokemonId: result.id,
            form,
            default: formSet[index],
            shiny: formSet[index + 1],
          });
        }
      }
    }

    mega = false;
    let soundForm = sounds.filter((sound) => sound.includes(`Addressable Assets/pm${result.id}.`) && sound.includes('cry'));
    result.sound.cry = soundForm.map((sound) => {
      let form: string | string[] = sound.split('.');
      if (form[1] === 'cry') {
        form = FORM_NORMAL;
      } else {
        form = form[1].replace(/[a-z]/g, '');
      }
      if (form?.toUpperCase().includes(FORM_MEGA)) {
        mega = true;
      }
      return {
        form,
        path: sound,
      };
    });

    soundForm = sounds?.filter(
      (sound) =>
        !sound.includes(`Addressable Assets/`) &&
        (sound.includes(`pv${result.id?.toString().padStart(3, '0')}_51`) ||
          sound.includes(`pv${result.id?.toString().padStart(3, '0')}_52`))
    );
    if (!mega) {
      soundForm.forEach((sound) => {
        result.sound.cry.push({
          form: soundForm.length !== 2 ? FORM_MEGA : sound.includes('_51') ? 'MEGA_X' : 'MEGA_Y',
          path: sound,
        });
      });
    }
    soundForm = sounds.filter(
      (sound) => !sound.includes(`Addressable Assets/`) && sound.includes(`pv${result.id?.toString().padStart(3, '0')}`)
    );
    if (result.sound.cry.length === 0) {
      soundForm.forEach((sound) => {
        result.sound.cry.push({
          form: sound.includes('_31') ? 'SPECIAL' : FORM_NORMAL,
          path: sound,
        });
      });
    }
    return result;
  });
};

export const optionCombat = (data: PokemonData[], types: TypeEff) => {
  const moves = data
    .filter((item) => item.templateId.match(/^V\d{4}_MOVE_*/g))
    .map((item) => {
      const regId = item.templateId.match(/\d{4}/g) as string[];
      return {
        ...item.data.moveSettings,
        id: regId.length > 0 ? parseInt(regId[0]) : 0,
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
      const result = new CombatDataModel();
      result.name = item.data.combatMove.uniqueId;
      result.type = item.data.combatMove.type.replace('POKEMON_TYPE_', '');
      if (item.templateId.includes(TypeMove.FAST)) {
        result.type_move = TypeMove.FAST;
      } else {
        result.type_move = TypeMove.CHARGE;
      }
      result.pvp_power = item.data.combatMove.power ?? 0.0;
      result.pvp_energy = item.data.combatMove.energyDelta ?? 0;
      const seq = sequence.find((seq) => seq.id === result.name);
      result.sound = seq?.path ?? null;
      if (item.data.combatMove.buffs) {
        const buffKey = Object.keys(item.data.combatMove.buffs);
        buffKey.forEach((buff) => {
          if (buff.includes('AttackStat')) {
            if (buff.includes('target')) {
              result.buffs.push({
                type: 'atk',
                target: 'target',
                power: item.data.combatMove.buffs[buff],
              });
            } else {
              result.buffs.push({
                type: 'atk',
                target: 'attacker',
                power: item.data.combatMove.buffs[buff],
              });
            }
          } else if (buff.includes('DefenseStat')) {
            if (buff.includes('target')) {
              result.buffs.push({
                type: 'def',
                target: 'target',
                power: item.data.combatMove.buffs[buff],
              });
            } else {
              result.buffs.push({
                type: 'def',
                target: 'attacker',
                power: item.data.combatMove.buffs[buff],
              });
            }
          }
          result.buffs[result.buffs.length - 1].buffChance = item.data.combatMove.buffs[buffKey[buffKey.length - 1]];
        });
      }
      const move = moves.find((move) => move.movementId === result.name);
      result.id = move?.id ?? 0;
      result.track = move?.id ?? 0;
      result.name = convertIdMove(result.name?.toString()).replace('_FAST', '');
      result.pve_power = move?.power ?? 0.0;
      if (result.name === 'STRUGGLE') {
        result.pve_energy = -33;
      } else {
        result.pve_energy = move?.energyDelta ?? 0;
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
          result.push({
            ...move,
            id: parseInt(`${move.id}${index}`),
            name: `${move.name}_${type}`,
            type,
          })
        );
    }
  });

  return result;
};

export const optionPokemonCombat = (data: PokemonData[], pokemon: PokemonModel[], formSpecial: string[], noneForm: string[]) => {
  return pokemon
    .filter(
      (item) =>
        (!item.form && noneForm.includes(item.name)) ||
        item.name?.toString().endsWith('_S') ||
        (item.form && (item.form.toString().toUpperCase().includes(FORM_NORMAL) || !formSpecial.includes(item.name)))
    )
    .reduce((pokemonList: CombatPokemon[], item) => {
      if (item.name?.toString().endsWith('_S')) {
        const pokemonPrev = pokemonList.find((poke) => poke.name === item.name.replace('_S', ''));
        const purifiedCharge = item.shadow?.purifiedChargeMove;
        const shadowCharge = item.shadow?.shadowChargeMove;
        if (pokemonPrev && purifiedCharge && !pokemonPrev.purifiedMoves.includes(purifiedCharge)) {
          pokemonPrev.purifiedMoves.push(purifiedCharge);
        }
        if (pokemonPrev && shadowCharge && !pokemonPrev.shadowMoves.includes(shadowCharge)) {
          pokemonPrev.shadowMoves.push(shadowCharge);
        }
      } else {
        const result = new CombatPokemonDataModel();
        result.id = item.id;
        result.name = item.name.replace(`_${FORM_NORMAL}`, '');
        result.baseSpecies = item.pokemonId;
        if (result.id === 235) {
          const moves = data.find((item) => item.templateId === 'SMEARGLE_MOVES_SETTINGS')?.data.smeargleMovesSettings;
          result.quickMoves = moves?.quickMoves?.map((move) => convertIdMove(move?.toString()).replace('_FAST', '')) ?? [];
          result.cinematicMoves = moves?.cinematicMoves?.map((move) => convertIdMove(move?.toString())) ?? [];
        } else {
          result.quickMoves = item.quickMoves?.map((move) => convertIdMove(move?.toString()).replace('_FAST', ''));
          result.cinematicMoves = item.cinematicMoves?.map((move) => convertIdMove(move?.toString()));
          result.eliteQuickMoves = item.eliteQuickMove?.map((move) => convertIdMove(move?.toString()).replace('_FAST', '')) ?? [];
          result.eliteCinematicMoves = item.eliteCinematicMove?.map((move) => convertIdMove(move?.toString())) ?? [];
          result.specialMoves = item.obSpecialAttackMoves?.map((move) => convertIdMove(move?.toString())) ?? [];
          if (item.shadow) {
            result.shadowMoves.push(item.shadow.shadowChargeMove);
            result.purifiedMoves.push(item.shadow.purifiedChargeMove);
          }
        }
        pokemonList.push(result);
      }
      return pokemonList;
    }, []);
};

export const optionLeagues = (data: PokemonData[], pokemon: PokemonDataModel[]) => {
  const result = new LeagueOptionsDataModel();
  result.allowLeagues =
    data
      .find((item) => item.templateId === 'VS_SEEKER_CLIENT_SETTINGS')
      ?.data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId.map((item) =>
        item.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '')
      ) ?? [];

  result.data = data
    .filter((item) => item.templateId.includes('COMBAT_LEAGUE_') && !item.templateId.includes('SETTINGS'))
    .map((item) => {
      const result = new LeagueDataModel();
      result.id = item.templateId.replace('COMBAT_LEAGUE_', '').replace('DEFAULT_', '');
      result.title = item.data.combatLeague.title.replace('combat_', '').replace('_title', '').toUpperCase();
      result.enabled = item.data.combatLeague.enabled;
      item.data.combatLeague.pokemonCondition.forEach((con) => {
        if (con.type === 'POKEMON_CAUGHT_TIMESTAMP') {
          result.conditions.timestamp = {
            start: 0,
            end: 0,
          };
          result.conditions.timestamp.start = con.pokemonCaughtTimestamp.afterTimestamp;
          result.conditions.timestamp.end = con.pokemonCaughtTimestamp.beforeTimestamp ?? null;
        }
        if (con.type === 'WITH_UNIQUE_POKEMON') {
          result.conditions.unique_selected = true;
        }
        if (con.type === 'WITH_POKEMON_TYPE') {
          result.conditions.unique_type = con.withPokemonType.pokemonType.map((type) => type.replace('POKEMON_TYPE_', ''));
        }
        if (con.type === 'POKEMON_LEVEL_RANGE') {
          result.conditions.max_level = con.pokemonLevelRange.maxLevel;
        }
        if (con.type === 'WITH_POKEMON_CP_LIMIT') {
          result.conditions.max_cp = con.withPokemonCpLimit.maxCp;
        }
        if (con.type === 'POKEMON_WHITELIST') {
          result.conditions.whiteList = con.pokemonWhiteList.pokemon.map((poke) => {
            const item = pokemon.find((item) => item.pokemonId === poke.id?.toString());
            return {
              id: item?.num ?? 0,
              name: item?.pokemonId,
              form: poke.forms ? poke.forms : FORM_NORMAL,
            };
          });
          const whiteList: PokemonPermission[] = [];
          result.conditions.whiteList.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  whiteList.push({ ...value, form: FORM_NORMAL });
                } else if (form !== 'FORM_UNSET') {
                  whiteList.push({ ...value, form: form.replace(value.name + '_', '') });
                }
              });
            } else {
              whiteList.push({ ...value, form: FORM_NORMAL });
            }
          });
          result.conditions.whiteList = whiteList.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        }
        if (con.type === 'POKEMON_BANLIST') {
          result.conditions.banned = con.pokemonBanList.pokemon.map((poke) => {
            const item = pokemon.find((item) => item.pokemonId === poke.id?.toString());
            return {
              id: item?.num ?? 0,
              name: item?.pokemonId,
              form: poke.forms ?? FORM_NORMAL,
            };
          });
          const banList: PokemonPermission[] = [];
          result.conditions.banned.forEach((value) => {
            if (typeof value.form !== 'string') {
              (value.form as string[]).forEach((form) => {
                if (form === 'FORM_UNSET' && value.form.length === 1) {
                  banList.push({ ...value, form: FORM_NORMAL });
                } else if (form !== 'FORM_UNSET') {
                  banList.push({ ...value, form: form.replace(value.name + '_', '') });
                }
              });
            } else {
              banList.push(value);
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
  const rewards: {
    rank: { [x: number]: RankRewardLeague };
    pokemon: { [x: number]: PokemonRewardLeague };
  } = {
    rank: {},
    pokemon: {},
  };
  data
    .filter((item) => item.templateId.includes('VS_SEEKER_LOOT_PER_WIN_SETTINGS_RANK_'))
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
        const result = new LeagueRewardDataModel();
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
    .filter((item) => item.templateId.includes('VS_SEEKER_POKEMON_REWARDS_'))
    .forEach((item) => {
      const data = item.data.vsSeekerPokemonRewards;
      const track = item.templateId.includes('FREE') ? 'FREE' : 'PREMIUM';
      data.availablePokemon.forEach((value) => {
        if (!rewards.pokemon[value.unlockedAtRank]) {
          rewards.pokemon[value.unlockedAtRank] = {
            rank: value.unlockedAtRank,
            free: [],
            premium: [],
          };
        }
        const result = new LeagueRewardPokemonDataModel();
        let poke: { pokemonId: string; pokemonDisplay: { form: string } };
        if (value.guaranteedLimitedPokemonReward) {
          result.guaranteedLimited = true;
          poke = value.guaranteedLimitedPokemonReward.pokemon;
        } else {
          poke = value.pokemon;
        }
        result.id = pokemon.find((item) => item.pokemonId === poke.pokemonId)?.num ?? 0;
        result.name = poke.pokemonId;
        if (poke.pokemonDisplay) {
          result.form = poke.pokemonDisplay.form.replace(poke.pokemonId + '_', '');
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
    result.season = {
      season: seasons.length - 1,
      timestamp: {
        start: seasons[seasons.length - 3],
        end: seasons[seasons.length - 2],
      },
      rewards,
      settings: data.find((item) => item.templateId === `COMBAT_RANKING_SETTINGS_S${seasons.length - 1}`)?.data.combatRankingProtoSettings
        .rankLevel,
    };
  }

  return result;
};

export const mappingReleasedPokemonGO = (pokemonData: PokemonDataModel[], assets: Asset[]) => {
  pokemonData.forEach((item) => {
    const form = assets?.find((asset) => asset.id === item.num)?.image.find((img) => img.form === item.forme);
    const combat = pokemonData.find((pokemon) => pokemon.num === item.num);

    if (checkMoveSetAvailable(combat) && form && form.default) {
      item.releasedGO = form.default.includes('Addressable Assets/');
    }
  });
};

export const optionDetailsPokemon = (
  data: PokemonData[],
  pokemonData: PokemonDataModel[],
  pokemon: PokemonModel[],
  formSpecial: string[],
  assets: Asset[],
  noneForm: string[]
) => {
  const spawn = optionPokemonSpawn(data);
  const pokemonForm = pokemonData.slice(1).reduce((result: any, obj) => {
    (result[obj.num] = result[obj.num] || []).push({
      name: convertName(obj.slug),
      form: (obj.forme ?? obj.baseForme ?? FORM_NORMAL).replaceAll('-', '_').toUpperCase(),
      default: obj.forme ? false : true,
    });
    return result;
  }, {});
  let result = pokemon
    .filter(
      (item) =>
        (!item.form && noneForm.includes(item.name)) ||
        (item.form && (item.form.toString().toUpperCase().includes(FORM_NORMAL) || !formSpecial.includes(item.name)))
    )
    .map((item) => {
      const result: Details = new DetailsPokemonModel();
      result.id = item.id;
      result.name = item.name.replace(`_${FORM_NORMAL}`, '');
      if (item.form) {
        result.form = item.form.toString().replace(`${item.pokemonId}_`, '');
      } else {
        if (result.id === 555) {
          result.form = FORM_STANDARD;
        } else {
          result.form = FORM_NORMAL;
        }
      }
      const gender = spawn.find((item) => item.id === result.id && item.name === result.name);
      if (gender) {
        result.gender = gender.gender;
      } else {
        result.gender = spawn.find((item) => item.id === result.id)?.gender;
      }
      if (item.disableTransferToPokemonHome) {
        result.disableTransferToPokemonHome = item.disableTransferToPokemonHome;
      }
      result.isDeployable = item.isDeployable;
      result.isTradable = item.isTradable;
      result.isTransferable = item.isTransferable;
      if (item.pokemonClass) {
        result.pokemonClass = item.pokemonClass.replace('POKEMON_CLASS_', '');
      }
      result.formChange = item.formChange ?? [];
      result.isShadow = item.shadow ? true : false;

      const form = assets?.find((asset) => asset.id === result.id)?.image.find((img) => img.form === result.form);

      const combat = pokemonData.find((pokemon) => pokemon.num === result.id);

      if (checkMoveSetAvailable(combat) && form && form.default) {
        result.releasedGO = form.default.includes('Addressable Assets/');
      }

      result.isOnlyGO = result.form === 'A';
      return result;
    });

  result = result.map((pokemon) => {
    let formOrigin = pokemonForm[pokemon.id]?.find((form: { default: string }) => form.default);
    if (pokemon.id === 422 || pokemon.id === 423) {
      formOrigin = pokemonForm[pokemon.id]?.[0];
    }
    if (pokemon.form?.toUpperCase() === FORM_NORMAL && !pokemon.releasedGO && pokemon.form !== formOrigin?.form) {
      const checkForm = result.find((poke) => poke.form === formOrigin?.form)?.releasedGO ?? false;
      pokemon.releasedGO = checkForm;
      if (pokemon.id === 201 || pokemon.id === 718) {
        pokemon.releasedGO = true;
      }
    }
    return pokemon;
  });

  pokemon
    .filter((item) => !formSpecial.includes(item.name))
    .forEach((item) => {
      if (item.tempEvoOverrides) {
        item.tempEvoOverrides.forEach((evos) => {
          if (evos.tempEvoId) {
            const detail = new DetailsPokemonModel();
            detail.id = item.id;
            detail.form = evos.tempEvoId.replace('TEMP_EVOLUTION_', '');
            const gender = spawn.find((item) => item.id === detail.id && item.name === detail.name);
            if (gender) {
              detail.gender = gender.gender;
            }
            detail.name = item.name + '_' + detail.form;
            detail.releasedGO = true;
            result.push(detail);
          }
        });
      }
    });

  return result.sort((a, b) => a.id - b.id);
};
