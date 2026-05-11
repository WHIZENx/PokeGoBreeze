import { isInclude, toNumber } from '../../utils/extension';
import { minLevel, stepLevel } from '../../utils/helpers/options-context.helpers';
import { TemplateId } from '../constants/template-id';
import { BuddyFriendship, Options, PokemonDataGM, TrainerFriendship } from '../models/options.model';
import { StatsPokemonGO } from '../models/stats.model';
import { ITypeEffectiveModel } from '../models/type-effective.model';
import { IWeatherBoost } from '../models/weather-boost.model';

export const optionSettings = (
  data: PokemonDataGM[],
  typeEffective: ITypeEffectiveModel,
  weatherBoost: IWeatherBoost,
  settings = new Options()
): Options => {
  const exactHandlers: Record<string, (item: PokemonDataGM) => void> = {
    [TemplateId.PlayerSetting]: handlePlayerSettings,
    [TemplateId.CombatSetting]: handleCombatSettings,
    [TemplateId.BattleSetting]: handleBattleSettings,
  };
  const buddyPrefix = `${TemplateId.BuddyLevel}_`;
  const friendshipPrefix = `${TemplateId.FriendshipLevel}_`;

  data.forEach((item) => {
    const exact = exactHandlers[item.templateId];
    if (exact) {
      exact(item);
    } else if (isInclude(item.templateId, buddyPrefix)) {
      handleBuddyLevel(item);
    } else if (isInclude(item.templateId, friendshipPrefix)) {
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
