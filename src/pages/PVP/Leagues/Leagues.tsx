import TypeInfo from '../../../components/Sprites/Type/Type';

import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import APIService from '../../../services/api.service';

import './Leagues.scss';
import React, { Fragment, useEffect, useState } from 'react';
import {
  getTime,
  splitAndCapitalize,
  getPokemonType,
  generateParamForm,
  getItemSpritePath,
  getKeyWithData,
  getValidPokemonImgPath,
} from '../../../utils/utils';
import { rankIconCenterName, rankIconName, rankName } from '../../../utils/compute';
import { Badge } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Xarrow from 'react-xarrows';
import {
  ILeague,
  IPokemonRewardSetLeague,
  PokemonRewardSetLeague,
  RankRewardSetLeague,
  SettingLeague,
} from '../../../core/models/league.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import {
  combineClasses,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../../utils/extension';
import { LeagueRewardType, LeagueBattleType, RewardType, LeagueType } from '../../../core/enums/league.enum';
import { EqualMode, IncludeMode } from '../../../utils/enums/string.enum';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { PokemonType } from '../../../enums/type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import { debounce } from 'lodash';
import useDataStore from '../../../composables/useDataStore';
import useAssets from '../../../composables/useAssets';
import SelectMui from '../../../components/Commons/Selects/SelectMui';
import InputMuiSearch from '../../../components/Commons/Inputs/InputMuiSearch';
import AccordionMui from '../../../components/Commons/Accordions/AccordionMui';
import DialogMui from '../../../components/Commons/Dialogs/Dialogs';

interface LeagueData {
  data: IPokemonRewardSetLeague[];
  step: number;
  track: LeagueRewardType;
  type: string | undefined;
}

const Leagues = () => {
  useTitle({
    title: 'PokéGO Breeze - Battle Leagues List',
    description:
      'Complete list of all battle leagues in Pokémon GO. Find information about CP limits, rules, and available Pokémon for each league.',
    keywords: ['battle leagues', 'PVP leagues', 'Pokémon GO battles', 'Great League', 'Ultra League', 'Master League'],
  });
  const { leaguesData } = useDataStore();
  const { findAssetForm } = useAssets();

  const [leagues, setLeagues] = useState<ILeague[]>([]);
  const [openedLeague, setOpenedLeague] = useState<ILeague[]>([]);
  const [leagueFilter, setLeagueFilter] = useState<ILeague[]>([]);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState(1);
  const [setting, setSetting] = useState<SettingLeague>();
  const [showData, setShowData] = useState<LeagueData>();

  useEffect(() => {
    const leagues = leaguesData;
    if (isNotEmpty(leagues.data)) {
      setLeagues(leagues.data);
      setOpenedLeague(leagues.data.filter((league) => isIncludeList(leagues.allowLeagues, league.id)));
      setSetting(leagues.season.settings.find((data) => data.rankLevel === rank + 1));
    }
  }, [leaguesData]);

  useEffect(() => {
    if (isNotEmpty(leagues)) {
      const debounced = debounce(() => {
        setLeagueFilter(
          leagues.filter((value) => {
            if (isIncludeList(leaguesData.allowLeagues, value.id)) {
              return false;
            }
            const textTitle = splitAndCapitalize(value.id?.toLowerCase(), '_', ' ');
            return isEmpty(search) || isInclude(textTitle, search, IncludeMode.IncludeIgnoreCaseSensitive);
          })
        );
      }, 500);
      debounced();
      return () => {
        debounced.cancel();
      };
    }
  }, [leagues, search]);

  const [show, setShow] = useState(false);

  const handleShow = (type: RewardType | string, track: LeagueRewardType, step: number) => {
    if (type === RewardType.Pokemon) {
      const result: IPokemonRewardSetLeague[] = [];
      setShow(true);
      Object.values(leaguesData.season.rewards.pokemon).forEach((value) => {
        if (toNumber(value.rank) <= rank) {
          let tireRewards: IPokemonRewardSetLeague[] = [];
          if (track === LeagueRewardType.Free) {
            tireRewards = value.free;
          } else if (track === LeagueRewardType.Premium) {
            tireRewards = value.premium;
          }
          if (isNotEmpty(tireRewards)) {
            result.push(
              ...tireRewards.map((item) => {
                if (item.guaranteedLimited) {
                  return PokemonRewardSetLeague.create({
                    ...item,
                    rank: value.rank,
                    pokemonType: getPokemonType(item.form),
                  });
                }
                return item;
              })
            );
          }
        }
      });
      setShowData({
        data: result.sort((a, b) => a.id - b.id),
        step,
        track,
        type,
      });
    } else {
      setShowData(undefined);
    }
  };

  const handleClose = () => {
    setShow(false);
    setShowData(undefined);
  };

  const renderHeader = (league: ILeague) => (
    <div className="tw-flex tw-justify-between tw-w-full tw-mr-3 tw-gap-x-2">
      <div className="tw-flex tw-items-center tw-justify-start tw-gap-x-2">
        <img
          alt="Image League"
          title={splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}
          height={50}
          src={APIService.getAssetPokeGo(league.iconUrl)}
        />
        <b className={league.enabled ? '' : 'text-danger'}>{splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}</b>
      </div>
      {isEqual(league.leagueType, LeagueType.Premier) && (
        <div className="tw-flex tw-items-center tw-justify-end">
          <div className="info-event-future tw-p-1 tw-rounded-sm tw-text-sm">
            <b>{getKeyWithData(LeagueType, league.leagueType)}</b>
          </div>
        </div>
      )}
    </div>
  );

  const renderBody = (league: ILeague) => (
    <div className="sub-body">
      <h4 className="title-leagues">{league.title}</h4>
      <div className="tw-text-center">
        {!isEqual(league.leagueBattleType, LeagueBattleType.None) &&
        !isEqual(league.leagueBattleType, LeagueBattleType.Little) &&
        !isInclude(league.title, LeagueBattleType.Remix, IncludeMode.IncludeIgnoreCaseSensitive) &&
        !isInclude(league.iconUrl, 'pogo') ? (
          <div className="league">
            <img
              alt="Image League"
              height={140}
              src={APIService.getAssetPokeGo(
                leaguesData.data.find((item) =>
                  isEqual(item.id, league.leagueBattleType, EqualMode.IgnoreCaseSensitive)
                )?.iconUrl
              )}
            />
            <span className={combineClasses('badge-league', league.league?.toLowerCase()?.replaceAll('_', '-'))}>
              <div className="sub-badge">
                <img
                  alt="Image League"
                  title={splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}
                  height={50}
                  src={APIService.getAssetPokeGo(league.iconUrl)}
                />
              </div>
            </span>
          </div>
        ) : (
          <div>
            <img
              alt="Image League"
              title={splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}
              height={140}
              src={APIService.getAssetPokeGo(league.iconUrl)}
            />
          </div>
        )}
      </div>
      <h5 className="title-leagues tw-mt-2">Conditions</h5>
      <ul className="list-style-inherit">
        <li className="tw-font-medium">
          <h6>
            <b>Max CP:</b> <span>{league.conditions.maxCp}</span>
          </h6>
        </li>
        {league.conditions.maxLevel && (
          <li className="tw-font-medium">
            <h6>
              <b>Max Level:</b> <span>{league.conditions.maxLevel}</span>
            </h6>
          </li>
        )}
        {league.pokemonCount > 0 && (
          <li className="tw-font-medium">
            <h6>
              <b>Pokémon count:</b> <span>{league.pokemonCount}</span>
            </h6>
          </li>
        )}
        {league.conditions.timestamp && (
          <li>
            <h6 className="title-leagues">Event time</h6>
            <span className="tw-font-medium">Start Date: {getTime(league.conditions.timestamp.start)}</span>
            {league.conditions.timestamp.end && (
              <span className="tw-font-medium">
                <br />
                End Date: {getTime(league.conditions.timestamp.end)}
              </span>
            )}
          </li>
        )}
        <li className="tw-font-medium">
          <h6 className="title-leagues">Allow Forms Evolution</h6>
          {league.allowEvolutions ? <DoneIcon color="success" /> : <CloseIcon color="error" />}
        </li>
        <li className="tw-font-medium">
          <h6 className="title-leagues">Unique Selected</h6>
          {league.conditions.uniqueSelected ? <DoneIcon color="success" /> : <CloseIcon color="error" />}
        </li>
        {isNotEmpty(league.conditions.uniqueType) && (
          <li className="tw-font-medium unique-type">
            <h6 className="title-leagues">Unique Type</h6>
            <TypeInfo arr={league.conditions.uniqueType} className="tw-ml-3" />
          </li>
        )}
        {isNotEmpty(league.conditions.whiteList) && (
          <li className="tw-font-medium">
            <h6 className="title-leagues tw-text-green-600">White List</h6>
            {league.conditions.whiteList.map((item, index) => (
              <LinkToTop
                className="img-link tw-text-center"
                key={index}
                to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
              >
                <div className="tw-flex tw-justify-center">
                  <span className="!tw-w-16">
                    <img
                      className="pokemon-sprite-medium filter-shadow-hover"
                      alt="Pokémon Image"
                      title={splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}
                      src={APIService.getPokemonModel(findAssetForm(item.id, item.form), item.id)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getValidPokemonImgPath(
                          e.currentTarget.src,
                          item.id,
                          findAssetForm(item.id, item.form)
                        );
                      }}
                    />
                  </span>
                </div>
                <span className="caption">
                  {`${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')} ${
                    item.pokemonType === PokemonType.Normal
                      ? ''
                      : `${splitAndCapitalize(item.form?.toLowerCase(), '_', ' ')}`
                  }`}
                </span>
              </LinkToTop>
            ))}
          </li>
        )}
        {isNotEmpty(league.conditions.banned) && (
          <li className="tw-font-medium">
            <h6 className="title-leagues tw-text-red-600">Ban List</h6>
            {league.conditions.banned.map((item, index) => (
              <LinkToTop
                className="img-link tw-text-center"
                key={index}
                to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
              >
                <div className="tw-flex tw-justify-center">
                  <span className="!tw-w-16">
                    <img
                      className="pokemon-sprite-medium filter-shadow-hover"
                      alt="Pokémon Image"
                      title={splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}
                      src={APIService.getPokemonModel(findAssetForm(item.id, item.form), item.id)}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getValidPokemonImgPath(
                          e.currentTarget.src,
                          item.id,
                          findAssetForm(item.id, item.form)
                        );
                      }}
                    />
                  </span>
                </div>
                <span className="caption">
                  {`${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')} ${
                    item.pokemonType === PokemonType.Normal
                      ? ''
                      : `${splitAndCapitalize(item.form?.toLowerCase(), '_', ' ')}`
                  }`}
                </span>
              </LinkToTop>
            ))}
          </li>
        )}
      </ul>
    </div>
  );

  const renderReward = (value: RankRewardSetLeague) => {
    const title =
      value.type === RewardType.Pokemon
        ? 'Random Pokémon'
        : value.type === RewardType.ItemLoot
          ? 'Random Item'
          : value.type === RewardType.RareCandy
            ? 'Rare Candy'
            : value.type === RewardType.Stardust
              ? ' Stardust'
              : value.type === RewardType.MoveReRoll
                ? 'TM Charged Move'
                : '';
    return (
      <>
        {!value.type ? (
          <Fragment>
            <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
          </Fragment>
        ) : (
          <Fragment>
            <img
              className="pokemon-sprite-medium !tw-w-16"
              alt="Pokémon Image"
              title={title}
              src={
                value.type === RewardType.Pokemon
                  ? APIService.getIconSprite('ic_grass')
                  : value.type === RewardType.ItemLoot
                    ? APIService.getIconSprite('btn_question_02_normal_white_shadow')
                    : value.type === RewardType.RareCandy
                      ? getItemSpritePath(ItemName.RareCandy)
                      : value.type === RewardType.Stardust
                        ? APIService.getItemSprite('stardust_painted')
                        : value.type === RewardType.MoveReRoll
                          ? APIService.getItemSprite('Item_1202')
                          : ''
              }
            />
            <span className="caption tw-text-default">{title}</span>
            {value.type === RewardType.Pokemon && (
              <VisibilityIcon
                className="view-pokemon tw-text-default !tw-text-small"
                onClick={() => handleShow(value.type, LeagueRewardType.Free, value.step)}
              />
            )}
          </Fragment>
        )}
      </>
    );
  };

  const renderItem = (value: RankRewardSetLeague) => (
    <Badge
      color="primary"
      className={combineClasses(
        'tw-relative tw-inline-block img-link !tw-pt-6 !tw-min-w-16',
        value.type === RewardType.Pokemon ? 'tw-pb-0' : 'tw-pb-6'
      )}
      overlap="circular"
      badgeContent={value.count}
      max={BattleLeagueCPType.InsMaster}
    >
      {renderReward(value)}
    </Badge>
  );

  return (
    <div className="tw-container tw-p-3">
      <h2 className="title-leagues tw-mb-3">Battle Leagues List</h2>
      <hr />
      <div className="row !tw-m-0 tw-gap-y-2">
        <div className="md:tw-w-2/3 tw-flex tw-justify-start tw-items-center !tw-p-0">
          <span className="tw-font-medium">
            <span>Season Date: {getTime(leaguesData.season.timestamp.start)}</span>
            <span>
              {' - '}
              {getTime(leaguesData.season.timestamp.end)}
            </span>
          </span>
        </div>
        <div className="md:tw-w-1/3 tw-flex tw-justify-end !tw-p-0">
          <SelectMui
            formSx={{ width: 200 }}
            value={rank}
            onChangeSelect={(value) => {
              setRank(value);
              if (value < 24) {
                setSetting(leaguesData.season.settings.find((data) => data.rankLevel === value + 1));
              }
            }}
            menuItems={Object.keys(leaguesData.season.rewards.rank).map((value) => ({
              value: value,
              label: `Rank ${value} ${toNumber(value) > 20 ? `(${rankName(toNumber(value))})` : ''}`,
            }))}
          />
        </div>
      </div>
      {isNotEmpty(leaguesData.data) ? (
        <Fragment>
          <div className="tw-flex tw-justify-center tw-mt-2">
            <div className="season-league">
              <div className="group-rank-league reward-league tw-text-center">
                <div className="rank-header">Season {leaguesData.season.season}</div>
                <Badge
                  color="primary"
                  className="tw-relative tw-inline-block img-link tw-py-6 !tw-min-w-16"
                  overlap="circular"
                  badgeContent={null}
                >
                  <img
                    className="pokemon-sprite-medium !tw-w-16"
                    alt="Pokémon Image"
                    src={APIService.getPokeOtherLeague('BattleIconColor')}
                  />
                  <span className="caption tw-text-default">Free</span>
                </Badge>
                <hr className="tw-my-0" />
                <Badge
                  color="primary"
                  className="tw-relative tw-inline-block img-link tw-py-6 !tw-min-w-16"
                  overlap="circular"
                  badgeContent={null}
                >
                  <img
                    className="pokemon-sprite-medium !tw-w-16"
                    alt="Pokémon Image"
                    src={getItemSpritePath(ItemName.PaidRaidTicket)}
                  />
                  <span className="caption tw-text-default">Premium</span>
                </Badge>
              </div>
              {leaguesData.season.rewards.rank[rank].free.map((value, index) => (
                <Fragment key={index}>
                  <div className="group-rank-league tw-text-center">
                    <div className="rank-header">Win Stack {value.step}</div>
                    {renderItem(value)}
                    <hr className="tw-my-0" />
                    {renderItem(leaguesData.season.rewards.rank[rank].premium[index])}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="tw-w-full tw-text-center tw-my-3">
            <div className="tw-flex tw-justify-center tw-mb-2" style={{ columnGap: '10%' }}>
              <div id="currRank" className="combat-league-info">
                <img
                  className="main-combat-league-info"
                  alt="Pokémon Image"
                  title={`Rank ${rank}`}
                  src={rankIconName(rank)}
                />
                {rank > 20 ? (
                  <Fragment>
                    <span className="combat-center-league-top">{rankName(rank)}</span>
                    <span className="combat-center-league-info">
                      <img alt="Image League" title={`Rank ${rank} Icon`} height={36} src={rankIconCenterName(rank)} />
                    </span>
                  </Fragment>
                ) : (
                  <span className="combat-center-league-text">{rank}</span>
                )}
              </div>
              {rank < 24 && (
                <div id="nextRank" className="combat-league-info">
                  <img
                    className="main-combat-league-info"
                    alt="Pokémon Image"
                    title={`Rank ${rank + 1}`}
                    src={rankIconName(rank + 1)}
                  />
                  {rank + 1 > 20 ? (
                    <Fragment>
                      <span className="combat-center-league-top">{rankName(rank + 1)}</span>
                      <span className="combat-center-league-info">
                        <img
                          alt="Image League"
                          title={`Rank ${rank + 1} Icon`}
                          height={36}
                          src={rankIconCenterName(rank + 1)}
                        />
                      </span>
                    </Fragment>
                  ) : (
                    <span className="combat-center-league-text">{rank + 1}</span>
                  )}
                </div>
              )}
              {rank < 24 && <Xarrow strokeWidth={2} path="grid" color="red" start="currRank" end="nextRank" />}
            </div>
            {rank < 24 ? (
              <span className="require-rank-info">
                {setting?.additionalTotalBattlesRequired && (
                  <li>
                    Complete <b>{setting.additionalTotalBattlesRequired}</b> battle
                    {setting.additionalTotalBattlesRequired > 1 && 's'}.
                  </li>
                )}
                {setting?.additionalWinsRequired && (
                  <li>
                    Win <b>{setting.additionalWinsRequired}</b> battle
                    {setting.additionalWinsRequired > 1 && 's'}.
                  </li>
                )}
                {setting?.minRatingRequired && (
                  <li>
                    Reach a battle rating of <b>{setting.minRatingRequired}</b> or higher.
                  </li>
                )}
              </span>
            ) : (
              <span className="require-rank-info">Reach highest rank.</span>
            )}
          </div>
        </Fragment>
      ) : (
        <div className="ph-item !tw-mt-2">
          <div className="ph-picture !tw-px-0" style={{ height: 450 }} />
        </div>
      )}
      <div className="input-group tw-w-fit">
        <span className="input-group-text tw-text-green-600 tw-bg-transparent tw-font-medium">Opened Leagues</span>
      </div>
      <AccordionMui
        isShowAction
        items={openedLeague.map((value) => {
          return {
            bgHeadColor: 'openLeague',
            label: renderHeader(value),
            value: value.id,
            children: renderBody(value),
          };
        })}
      />

      <div className="tw-w-1/2 tw-mt-2 tw-min-w-75">
        <InputMuiSearch
          isNoWrap
          labelPrepend="Find League"
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Enter League Name"
        />
      </div>
      <AccordionMui
        isShowAction
        alwaysOpen
        maxHeight={400}
        items={leagueFilter.map((value) => {
          return {
            label: renderHeader(value),
            value: value.id,
            children: renderBody(value),
          };
        })}
      />

      {showData && (
        <DialogMui
          open={show}
          onClose={handleClose}
          title={
            <div className="tw-flex tw-flex-col tw-gap-y-2">
              <div>
                <span>
                  {rank > 20 && (
                    <div className="combat-league">
                      <img
                        className="main-combat-league"
                        alt="Pokémon Image"
                        title={`Rank ${rank}`}
                        src={rankIconName(rank)}
                      />
                      <span className="combat-center-league">
                        <img
                          alt="Image League"
                          title={`Rank ${rank} Icon`}
                          height={24}
                          src={rankIconCenterName(rank)}
                        />
                      </span>
                    </div>
                  )}
                </span>
                Rank {rank} {rank > 20 && `(${rankName(rank)})`}
              </div>
              <div className="reward-info">
                {showData.track === LeagueRewardType.Free ? (
                  <div className="tw-flex tw-gap-x-2 tw-items-center">
                    <img
                      className="pokemon-sprite-small filter-shadow !tw-w-fit"
                      alt="Pokémon Image"
                      title="Battle Icon"
                      src={APIService.getPokeOtherLeague('BattleIconColor')}
                    />
                    <span>Free</span> (Win stack {showData.step})
                  </div>
                ) : (
                  <div className="tw-flex tw-gap-x-2 tw-items-center">
                    <img
                      className="pokemon-sprite-small filter-shadow !tw-w-fit"
                      alt="Pokémon Image"
                      title="Paid Raid Ticket"
                      src={getItemSpritePath(ItemName.PaidRaidTicket)}
                    />
                    <span style={{ color: 'crimson' }}>Premium</span> (Win stack {showData.step})
                  </div>
                )}
              </div>
            </div>
          }
          content={
            <div className="tw-text-center">
              <h5 className="tw-underline">Random Pokémon</h5>
              {showData.data
                .filter((item) => !item.guaranteedLimited)
                .map((item, index) => (
                  <LinkToTop
                    className="img-link tw-text-center"
                    key={index}
                    to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                    title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                  >
                    <div className="tw-flex tw-justify-center">
                      <span className="!tw-w-16">
                        <img
                          className="pokemon-sprite-medium filter-shadow-hover"
                          alt="Pokémon Image"
                          title={splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}
                          src={APIService.getPokemonModel(findAssetForm(item.id, item.form))}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getValidPokemonImgPath(
                              e.currentTarget.src,
                              item.id,
                              findAssetForm(item.id, item.form)
                            );
                          }}
                        />
                      </span>
                    </div>
                    <span className="caption">{splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}</span>
                  </LinkToTop>
                ))}
              {isNotEmpty(showData.data.filter((item) => item.guaranteedLimited && toNumber(item.rank) === rank)) && (
                <Fragment>
                  <hr />
                  <h5 className="tw-underline">Guaranteed Pokémon in first time</h5>
                  {showData.data
                    .filter((item) => item.guaranteedLimited && toNumber(item.rank) === rank)
                    .map((item, index) => (
                      <LinkToTop
                        className="img-link tw-text-center"
                        key={index}
                        to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                        title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                      >
                        <div className="tw-flex tw-justify-center">
                          <span className="!tw-w-16">
                            <img
                              className="pokemon-sprite-medium filter-shadow-hover"
                              alt="Pokémon Image"
                              title={splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}
                              src={APIService.getPokemonModel(findAssetForm(item.id, item.form))}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = getValidPokemonImgPath(
                                  e.currentTarget.src,
                                  item.id,
                                  findAssetForm(item.id, item.form)
                                );
                              }}
                            />
                          </span>
                        </div>
                        <span className="caption">{splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}</span>
                      </LinkToTop>
                    ))}
                </Fragment>
              )}
            </div>
          }
          actions={[
            {
              label: 'Close',
              color: 'tertiary',
              isClose: true,
            },
          ]}
        />
      )}
    </div>
  );
};

export default Leagues;
