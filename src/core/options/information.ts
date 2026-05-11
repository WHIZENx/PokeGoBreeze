import { getValueOrDefault, isInclude, isNotEmpty, isNumber } from '../../utils/extension';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { capitalize, getDataWithKey, getTicketRewardType, splitAndCapitalize } from '../../utils/utils';
import { GlobalEventTicket, ItemSettings, PokemonDataGM } from '../models/options.model';
import { IPokemonData } from '../models/pokemon.model';
import { Information, ITicketReward, TicketReward } from '../models/information';
import { getTextWithKey, textEng } from './_shared';

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
          form: result.pokemonEncounter.pokemonDisplay?.form
            ?.toString()
            .replace(`${result.pokemonEncounter.pokemonId}_`, ''),
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

const titleFromNameOverride = (itemSettings: ItemSettings) => {
  const textKey = getValueOrDefault(String, itemSettings.nameOverride);
  return getDataWithKey<string>(textEng, textKey, EqualMode.IgnoreCaseSensitive);
};

const titleFromPgoParts = (descKey: string[]) => {
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
};

const titleFromDescriptionFallback = (descriptionOverride: string | undefined) => {
  const parts = getValueOrDefault(Array, descriptionOverride?.split('_'));
  return capitalize(parts[parts?.length - 1]);
};

const titleFromEventBanner = (itemSettings: ItemSettings): string | undefined => {
  const pathParts = itemSettings.globalEventTicket.eventBannerUrl.split('/');
  const srcText = getValueOrDefault(String, pathParts[pathParts.length - 1])
    .replaceAll('-', '_')
    .replace(/\.[^.]*$/, '')
    .replace(/^PGO_MCS_/, '');

  const [firstText] = srcText.split('_');
  if (isNumber(firstText) && !itemSettings.globalEventTicket.titleImageUrl) {
    const bagParts = itemSettings.globalEventTicket.itemBagDescriptionKey.split('_');
    return splitAndCapitalize(bagParts[bagParts.length - 1], /(?=[A-Z])/, ' ');
  }

  const descKey = srcText.split('_');
  if (/^PGO/i.test(descKey[0])) {
    return titleFromPgoParts(descKey);
  }

  const filtered = descKey
    .filter(
      (text) =>
        /^S[\d*]/i.test(text) ||
        isInclude(itemSettings.descriptionOverride, text, IncludeMode.IncludeIgnoreCaseSensitive)
    )
    .map((text) => text?.replace(/^S/i, 'Season '));

  if (!isNotEmpty(filtered)) {
    return titleFromDescriptionFallback(itemSettings.descriptionOverride);
  }
  return filtered.map((text) => capitalize(text)).join(' ');
};

const getInformationTitle = (itemSettings: ItemSettings | undefined) => {
  if (!itemSettings) {
    return;
  }

  const nameOverrideMatch = titleFromNameOverride(itemSettings);
  if (nameOverrideMatch) {
    return nameOverrideMatch;
  }

  if (itemSettings.globalEventTicket.eventBannerUrl) {
    return titleFromEventBanner(itemSettings);
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
