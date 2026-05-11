import { PokemonDataGM } from '../models/options.model';
import { TrainerLevelUp } from '../models/trainer.model';

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
