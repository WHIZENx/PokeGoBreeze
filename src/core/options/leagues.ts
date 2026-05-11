import { PokemonType } from '../../enums/type.enum';
import {
  League,
  LeagueData,
  LeagueTimestamp,
  PokemonRewardLeague,
  PokemonRewardSetLeague,
  RankRewardLeague,
  RankRewardSetLeague,
  Reward,
  Season,
} from '../models/league.model';
import { IPokemonPermission, PokemonDataGM, PokemonPermission, PokemonReward } from '../models/options.model';
import { IPokemonData } from '../models/pokemon.model';
import { APIUrl } from '../../services/constants';
import { getValueOrDefault, isEqual, isInclude, isNotEmpty, isNullOrUndefined, toNumber } from '../../utils/extension';
import { EqualMode, IncludeMode } from '../../utils/enums/string.enum';
import { LeagueConditionType } from '../enums/option.enum';
import { LeagueRewardType, LeagueType, RewardType } from '../enums/league.enum';
import { TemplateId } from '../constants/template-id';
import { PokemonConfig } from '../constants/type';
import {
  getDataWithKey,
  getKeyWithData,
  getLeagueBattleType,
  getPokemonType,
  splitAndCamelCase,
  splitAndCapitalize,
} from '../../utils/utils';
import { formNormal } from '../../utils/helpers/options-context.helpers';
import { getTextWithKey, textEng } from './_shared';

type CombatLeagueData = NonNullable<PokemonDataGM['data']['combatLeague']>;
type LeagueCondition = CombatLeagueData['pokemonCondition'][number];

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
          form = form?.replace?.(`${currentPokemon.id}_`, '');
          pokemonPermission.push(
            new PokemonPermission({
              id: item?.num,
              name: item?.pokemonId?.toString(),
              form,
              pokemonType: getPokemonType(form),
            })
          );
        });
    } else {
      const form = getValueOrDefault(String, currentPokemon.form?.replace?.(`${currentPokemon.id}_`, ''), formNormal());
      pokemonPermission.push(
        new PokemonPermission({
          id: item?.num,
          name: item?.pokemonId?.toString(),
          form,
          pokemonType: getPokemonType(form),
        })
      );
    }
  });
  return pokemonPermission.sort((a, b) => toNumber(a.id) - toNumber(b.id));
};

const resolveAllowedLeagues = (data: PokemonDataGM[]): string[] =>
  getValueOrDefault(
    Array,
    data
      .find((item) => isEqual(item.templateId, TemplateId.BattleClientSetting))
      ?.data.vsSeekerClientSettings.allowedVsSeekerLeagueTemplateId.map((item) =>
        item.replace(TemplateId.CombatLeague, '').replace('_VS_SEEKER_', '').replace('DEFAULT_', '')
      )
  );

const applyLeagueCondition = (league: League, con: LeagueCondition, pokemon: IPokemonData[]) => {
  league.conditions.uniqueSelected = con.type === LeagueConditionType.UniquePokemon;
  switch (con.type) {
    case LeagueConditionType.CaughtTime:
      league.conditions.timestamp = LeagueTimestamp.create({
        start: con.pokemonCaughtTimestamp?.afterTimestamp,
        end: con.pokemonCaughtTimestamp?.beforeTimestamp,
      });
      break;
    case LeagueConditionType.PokemonType:
      league.conditions.uniqueType = getValueOrDefault(
        Array,
        con.withPokemonType?.pokemonType.map((type) =>
          splitAndCamelCase(type.replace(`${PokemonConfig.Type}_`, ''), '_', '')
        )
      );
      break;
    case LeagueConditionType.PokemonLevelRange:
      league.conditions.maxLevel = con.pokemonLevelRange?.maxLevel;
      break;
    case LeagueConditionType.PokemonLimitCP:
      league.conditions.maxCp = con.withPokemonCpLimit?.maxCp;
      break;
    case LeagueConditionType.WhiteList:
      league.conditions.whiteList = setPokemonPermission(pokemon, con.pokemonWhiteList?.pokemon);
      break;
    case LeagueConditionType.BanList:
      league.conditions.banned = setPokemonPermission(pokemon, con.pokemonBanList?.pokemon);
      break;
  }
};

const deriveLeagueTitle = (combatLeague: CombatLeagueData | undefined) => {
  const combatTitle = getValueOrDefault(String, combatLeague?.title);
  const translated = getTextWithKey<string>(textEng, combatTitle);
  if (translated) {
    return splitAndCapitalize(translated, ' ', ' ');
  }
  return splitAndCapitalize(combatTitle.replace('combat_', '').replace('_title', ''), '_', ' ');
};

const deriveLeagueBadge = (
  templateId: string,
  fallbackId: string,
  combatLeague: CombatLeagueData | undefined
): string | undefined => {
  if (!combatLeague?.badgeType && isInclude(templateId, `${TemplateId.CombatLeagueSeeker}`)) {
    return `${fallbackId.replace(/[^GREAT|^ULTRA|^MASTER].*/, '')}_LEAGUE`;
  }
  if (combatLeague?.badgeType) {
    return combatLeague.badgeType.replace('BADGE_', '');
  }
  return undefined;
};

const mergeBannedPokemon = (
  baseBanned: IPokemonPermission[],
  extraBanned: string[] | undefined,
  pokemon: IPokemonData[]
): IPokemonPermission[] => {
  if (!extraBanned || !isNotEmpty(extraBanned)) {
    return baseBanned;
  }
  const additions = extraBanned.map((poke) => {
    const item = pokemon.find((item) => isEqual(item.pokemonId, poke));
    return new PokemonPermission({
      id: item?.num,
      name: item?.pokemonId?.toString(),
      form: formNormal(),
      pokemonType: PokemonType.Normal,
    });
  });
  return baseBanned.concat(additions).sort((a, b) => toNumber(a.id) - toNumber(b.id));
};

const buildLeague = (item: PokemonDataGM, pokemon: IPokemonData[]): League => {
  const result = new League();
  result.id = item.templateId.replace(TemplateId.CombatLeague, '').replace('_VS_SEEKER_', '').replace('DEFAULT_', '');
  result.title = deriveLeagueTitle(item.data.combatLeague);
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

  item.data.combatLeague?.pokemonCondition.forEach((con) => applyLeagueCondition(result, con, pokemon));

  result.leagueBattleType = getLeagueBattleType(toNumber(result.conditions.maxCp));
  result.iconUrl = item.data.combatLeague?.iconUrl
    .replace(APIUrl.POGO_PROD_ASSET_URL, '')
    .replace(`${APIUrl.POGO_PRODHOLOHOLO_ASSET_URL}LeagueIcons/`, '');

  const badge = deriveLeagueBadge(item.templateId, result.id, item.data.combatLeague);
  if (badge) {
    result.league = badge;
  }

  if (item.data.combatLeague) {
    result.conditions.banned = mergeBannedPokemon(
      result.conditions.banned,
      item.data.combatLeague.bannedPokemon,
      pokemon
    );
  }
  return result;
};

const classifyRankReward = (reward: PokemonDataGM['data']['vsSeekerLoot']['reward'][number]): RankRewardSetLeague => {
  const result = new RankRewardSetLeague();
  if (reward.pokemonReward) {
    result.type = RewardType.Pokemon;
    result.count = 1;
  } else if (reward.itemRankingLootTableCount) {
    result.type = RewardType.ItemLoot;
    result.count = reward.itemRankingLootTableCount;
  } else if (reward.item) {
    result.type = reward.item.stardust ? RewardType.Stardust : reward.item.item;
    result.count = reward.item.count;
  }
  return result;
};

const collectRankRewards = (data: PokemonDataGM[], rewards: Reward) => {
  data
    .filter((item) => /VS_SEEKER_LOOT_PER_WIN_SETTINGS_RANK_/.test(item.templateId))
    .forEach((item) => {
      const lootData = item.data.vsSeekerLoot;
      if (!rewards.rank[lootData.rankLevel]) {
        rewards.rank[lootData.rankLevel] = RankRewardLeague.create(lootData.rankLevel);
      }
      lootData.reward.slice(0, 5).forEach((reward, index) => {
        const classified = classifyRankReward(reward);
        classified.step = index + 1;
        const bucket = lootData.rewardTrack
          ? rewards.rank[lootData.rankLevel].premium
          : rewards.rank[lootData.rankLevel].free;
        bucket?.push(classified);
      });
    });
};

const collectPokemonRewards = (data: PokemonDataGM[], rewards: Reward, pokemon: IPokemonData[]) => {
  const freeRewardType = getKeyWithData(LeagueRewardType, LeagueRewardType.Free);
  data
    .filter((item) => /VS_SEEKER_POKEMON_REWARDS_/.test(item.templateId))
    .forEach((item) => {
      const rewardData = item.data.vsSeekerPokemonRewards;
      rewardData.availablePokemon.forEach((value) => {
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
        result.id = toNumber(pokemon.find((pk) => isEqual(pk.pokemonId, poke.pokemonId))?.num);
        result.name = poke.pokemonId;
        result.form = poke.pokemonDisplay
          ? poke.pokemonDisplay.form?.replace?.(`${poke.pokemonId}_`, '')
          : formNormal();

        const isFree = isInclude(item.templateId, freeRewardType, IncludeMode.IncludeIgnoreCaseSensitive);
        const bucket = isFree
          ? rewards.pokemon[value.unlockedAtRank].free
          : rewards.pokemon[value.unlockedAtRank].premium;
        bucket?.push(result);
      });
    });
};

const buildSeason = (data: PokemonDataGM[], rewards: Reward): Season | undefined => {
  const seasons = data.find((item) => isEqual(item.templateId, TemplateId.CombatSeasonSetting))?.data
    .combatCompetitiveSeasonSettings.seasonEndTimeTimestamp;
  if (!seasons) {
    return undefined;
  }

  return Season.create({
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
};

export const optionLeagues = (data: PokemonDataGM[], pokemon: IPokemonData[]) => {
  const result = new LeagueData();
  result.allowLeagues = resolveAllowedLeagues(data);

  result.data = data
    .filter(
      (item) => item.templateId.startsWith(`${TemplateId.CombatLeague}_`) && !isInclude(item.templateId, 'SETTINGS')
    )
    .map((item) => buildLeague(item, pokemon));

  const rewards = new Reward();
  collectRankRewards(data, rewards);
  collectPokemonRewards(data, rewards, pokemon);

  const season = buildSeason(data, rewards);
  if (season) {
    result.season = season;
  }

  return result;
};
