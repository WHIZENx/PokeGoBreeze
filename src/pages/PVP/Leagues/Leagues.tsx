import TypeInfo from '../../../components/Sprites/Type/Type';

import { Accordion, Form, useAccordionButton } from 'react-bootstrap';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import APIService from '../../../services/API.service';

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
import { findAssetForm, rankIconCenterName, rankIconName, rankName } from '../../../utils/compute';
import { useSelector } from 'react-redux';
import { Badge } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Modal, Button } from 'react-bootstrap';
import Xarrow from 'react-xarrows';
import { StoreState } from '../../../store/models/state.model';
import {
  ILeague,
  IPokemonRewardSetLeague,
  PokemonRewardSetLeague,
  SettingLeague,
} from '../../../core/models/league.model';
import { useTitle } from '../../../utils/hooks/useTitle';
import { Toggle } from '../../../core/models/pvp.model';
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
import { PokemonType, VariantType } from '../../../enums/type.enum';
import { ItemName } from '../../News/enums/item-type.enum';
import { LinkToTop } from '../../../utils/hooks/LinkToTop';
import { debounce } from 'lodash';

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
  const dataStore = useSelector((state: StoreState) => state.store.data);

  const [leagues, setLeagues] = useState<ILeague[]>([]);
  const [openedLeague, setOpenedLeague] = useState<ILeague[]>([]);
  const [leagueFilter, setLeagueFilter] = useState<ILeague[]>([]);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState(1);
  const [setting, setSetting] = useState<SettingLeague>();
  const [showData, setShowData] = useState<LeagueData>();

  const getAssetPokeGo = (id: number | undefined, formName: string | undefined) =>
    findAssetForm(dataStore.assets, id, formName);

  const LeaveToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        <span className="text-danger">
          Close <CloseIcon sx={{ color: 'red' }} />
        </span>
      </div>
    );
  };

  useEffect(() => {
    const leagues = dataStore.leagues;
    if (isNotEmpty(leagues.data)) {
      setLeagues(leagues.data);
      setOpenedLeague(leagues.data.filter((league) => isIncludeList(leagues.allowLeagues, league.id)));
      setSetting(leagues.season.settings.find((data) => data.rankLevel === rank + 1));
    }
  }, [dataStore.leagues]);

  useEffect(() => {
    if (isNotEmpty(leagues)) {
      const debounced = debounce(() => {
        setLeagueFilter(
          leagues.filter((value) => {
            if (isIncludeList(dataStore.leagues.allowLeagues, value.id)) {
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
      Object.values(dataStore.leagues.season.rewards.pokemon).forEach((value) => {
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

  const showAccording = (league: ILeague, index: number, isOpened = false) => (
    <Accordion.Item key={index} eventKey={index.toString()}>
      <Accordion.Header className={isOpened ? 'league-opened' : ''}>
        <div className="d-flex justify-content-between w-100 me-3 column-gap-2">
          <div className="d-flex align-items-center flex-start column-gap-2">
            <img
              alt="Image League"
              title={splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}
              height={50}
              src={APIService.getAssetPokeGo(league.iconUrl)}
            />
            <b className={league.enabled ? '' : 'text-danger'}>
              {splitAndCapitalize(league.id?.toLowerCase(), '_', ' ')}
            </b>
          </div>
          {isEqual(league.leagueType, LeagueType.Premier) && (
            <div className="d-flex align-items-center flex-end">
              <div className="info-event-future p-1 rounded-1" style={{ fontSize: 14 }}>
                <b>{getKeyWithData(LeagueType, league.leagueType)}</b>
              </div>
            </div>
          )}
        </div>
      </Accordion.Header>
      <Accordion.Body className="league-body">
        <div className="sub-body">
          <h4 className="title-leagues">{league.title}</h4>
          <div className="text-center">
            {!isEqual(league.leagueBattleType, LeagueBattleType.None) &&
            !isEqual(league.leagueBattleType, LeagueBattleType.Little) &&
            !isInclude(league.title, LeagueBattleType.Remix, IncludeMode.IncludeIgnoreCaseSensitive) &&
            !isInclude(league.iconUrl, 'pogo') ? (
              <div className="league">
                <img
                  alt="Image League"
                  height={140}
                  src={APIService.getAssetPokeGo(
                    dataStore.leagues.data.find((item) =>
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
          <h5 className="title-leagues mt-2">Conditions</h5>
          <ul className="list-style-inherit">
            <li className="fw-medium">
              <h6>
                <b>Max CP:</b> <span>{league.conditions.maxCp}</span>
              </h6>
            </li>
            {league.conditions.maxLevel && (
              <li className="fw-medium">
                <h6>
                  <b>Max Level:</b> <span>{league.conditions.maxLevel}</span>
                </h6>
              </li>
            )}
            {league.pokemonCount > 0 && (
              <li className="fw-medium">
                <h6>
                  <b>Pokémon count:</b> <span>{league.pokemonCount}</span>
                </h6>
              </li>
            )}
            {league.conditions.timestamp && (
              <li>
                <h6 className="title-leagues">Event time</h6>
                <span className="fw-medium">Start Date: {getTime(league.conditions.timestamp.start)}</span>
                {league.conditions.timestamp.end && (
                  <span className="fw-medium">
                    <br />
                    End Date: {getTime(league.conditions.timestamp.end)}
                  </span>
                )}
              </li>
            )}
            <li className="fw-medium">
              <h6 className="title-leagues">Allow Forms Evolution</h6>
              {league.allowEvolutions ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />}
            </li>
            <li className="fw-medium">
              <h6 className="title-leagues">Unique Selected</h6>
              {league.conditions.uniqueSelected ? (
                <DoneIcon sx={{ color: 'green' }} />
              ) : (
                <CloseIcon sx={{ color: 'red' }} />
              )}
            </li>
            {isNotEmpty(league.conditions.uniqueType) && (
              <li className="fw-medium unique-type">
                <h6 className="title-leagues">Unique Type</h6>
                <TypeInfo arr={league.conditions.uniqueType} className="ms-3" />
              </li>
            )}
            {isNotEmpty(league.conditions.whiteList) && (
              <li className="fw-medium">
                <h6 className="title-leagues text-success">White List</h6>
                {league.conditions.whiteList.map((item, index) => (
                  <LinkToTop
                    className="img-link text-center"
                    key={index}
                    to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                    title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
                  >
                    <div className="d-flex justify-content-center">
                      <span className="w-9">
                        <img
                          className="pokemon-sprite-medium filter-shadow-hover"
                          alt="Pokémon Image"
                          title={splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}
                          src={APIService.getPokemonModel(getAssetPokeGo(item.id, item.form), item.id)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getValidPokemonImgPath(
                              e.currentTarget.src,
                              item.id,
                              getAssetPokeGo(item.id, item.form)
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
              <li className="fw-medium">
                <h6 className="title-leagues text-danger">Ban List</h6>
                {league.conditions.banned.map((item, index) => (
                  <LinkToTop
                    className="img-link text-center"
                    key={index}
                    to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                    title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
                  >
                    <div className="d-flex justify-content-center">
                      <span className="w-9">
                        <img
                          className="pokemon-sprite-medium filter-shadow-hover"
                          alt="Pokémon Image"
                          title={splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}
                          src={APIService.getPokemonModel(getAssetPokeGo(item.id, item.form), item.id)}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getValidPokemonImgPath(
                              e.currentTarget.src,
                              item.id,
                              getAssetPokeGo(item.id, item.form)
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
        <LeaveToggle eventKey={index.toString()} />
      </Accordion.Body>
    </Accordion.Item>
  );

  return (
    <div className="container p-3">
      <h2 className="title-leagues mb-3">Battle Leagues List</h2>
      <hr />
      <div className="row m-0 row-gap-2">
        <div className="col-md-8 d-flex justify-content-start align-items-center p-0">
          <span className="fw-medium">
            <span>Season Date: {getTime(dataStore.leagues.season.timestamp.start)}</span>
            <span>
              {' - '}
              {getTime(dataStore.leagues.season.timestamp.end)}
            </span>
          </span>
        </div>
        <div className="col-md-4 d-flex justify-content-end p-0">
          <Form.Select
            onChange={(e) => {
              setRank(toNumber(e.target.value));
              if (toNumber(e.target.value) < 24) {
                setSetting(
                  dataStore.leagues.season.settings.find((data) => data.rankLevel === toNumber(e.target.value) + 1)
                );
              }
            }}
            defaultValue={rank}
          >
            {Object.keys(dataStore.leagues.season.rewards.rank).map((value, index) => (
              <option key={index} value={value}>
                Rank {value} {toNumber(value) > 20 && `( ${rankName(toNumber(value))} )`}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>
      {isNotEmpty(dataStore.leagues.data) ? (
        <Fragment>
          <div className="d-flex justify-content-center mt-2">
            <div className="season-league">
              <div className="group-rank-league reward-league text-center">
                <div className="rank-header">Season {dataStore.leagues.season.season}</div>
                <Badge
                  color="primary"
                  className="position-relative d-inline-block img-link pt-4 pb-2 mw-9"
                  overlap="circular"
                  badgeContent={null}
                >
                  <img
                    className="pokemon-sprite-medium w-9"
                    alt="Pokémon Image"
                    src={APIService.getPokeOtherLeague('BattleIconColor')}
                  />
                  <span className="caption theme-text-primary">Free</span>
                </Badge>
                <hr />
                <Badge
                  color="primary"
                  className="position-relative d-inline-block img-link pb-4 mw-9"
                  overlap="circular"
                  badgeContent={null}
                >
                  <img
                    className="pokemon-sprite-medium"
                    alt="Pokémon Image"
                    src={getItemSpritePath(ItemName.PaidRaidTicket)}
                  />
                  <span className="caption theme-text-primary">Premium</span>
                </Badge>
              </div>
              {dataStore.leagues.season.rewards.rank[rank].free.map((value, index) => (
                <Fragment key={index}>
                  <div className="group-rank-league text-center">
                    <div className="rank-header">Win Stack {value.step}</div>
                    <Badge
                      color="primary"
                      className={combineClasses(
                        'position-relative d-inline-block img-link pt-4 mnw-9',
                        value.type === RewardType.Pokemon || value.type === RewardType.ItemLoot ? 'pb-0' : 'pb-4'
                      )}
                      overlap="circular"
                      badgeContent={value.count}
                      max={BattleLeagueCPType.InsMaster}
                    >
                      {!value.type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {value.type === RewardType.Pokemon && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Random Pokémon"
                            src={APIService.getIconSprite('ic_grass')}
                          />
                          <span className="caption theme-text-primary">Random Pokémon</span>
                          <VisibilityIcon
                            className="view-pokemon theme-text-primary u-fs-3"
                            onClick={() => handleShow(value.type, LeagueRewardType.Free, value.step)}
                          />
                        </Fragment>
                      )}
                      {value.type === RewardType.ItemLoot && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Random Item"
                            src={APIService.getIconSprite('btn_question_02_normal_white_shadow')}
                          />
                          <span className="caption theme-text-primary">Random Item</span>
                          <VisibilityIcon className="view-pokemon theme-text-primary u-fs-3" />
                        </Fragment>
                      )}
                      {value.type === RewardType.RareCandy && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Rare Candy"
                            src={getItemSpritePath(ItemName.RareCandy)}
                          />
                          <span className="caption theme-text-primary">Rare Candy</span>
                        </Fragment>
                      )}
                      {value.type === RewardType.Stardust && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Stardust"
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          <span className="caption theme-text-primary">Stardust</span>
                        </Fragment>
                      )}
                      {value.type === RewardType.MoveReRoll && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="TM Charged Move"
                            src={APIService.getItemSprite('Item_1202')}
                          />
                          <span className="caption theme-text-primary">TM Charged Move</span>
                        </Fragment>
                      )}
                    </Badge>
                    <hr className="mt-0" />
                    <Badge
                      color="primary"
                      className={combineClasses(
                        'position-relative d-inline-block img-link mnw-9',
                        dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.Pokemon ||
                          dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.ItemLoot
                          ? 'pb-0'
                          : 'pb-4'
                      )}
                      overlap="circular"
                      badgeContent={dataStore.leagues.season.rewards.rank[rank].premium[index].count}
                      max={BattleLeagueCPType.InsMaster}
                    >
                      {!dataStore.leagues.season.rewards.rank[rank].premium[index].type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.Pokemon && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Random Pokémon"
                            src={APIService.getIconSprite('ic_grass')}
                          />
                          <span className="caption theme-text-primary">Random Pokémon</span>
                          <VisibilityIcon
                            className="view-pokemon theme-text-primary u-fs-3"
                            onClick={() =>
                              handleShow(
                                dataStore.leagues.season.rewards.rank[rank].premium[index].type,
                                LeagueRewardType.Premium,
                                value.step
                              )
                            }
                          />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.ItemLoot && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Random Item"
                            src={APIService.getIconSprite('btn_question_02_normal_white_shadow')}
                          />
                          <span className="caption theme-text-primary">Random Item</span>
                          <VisibilityIcon
                            className="view-pokemon theme-text-primary u-fs-3"
                            onClick={() =>
                              handleShow(
                                dataStore.leagues.season.rewards.rank[rank].premium[index].type,
                                LeagueRewardType.Premium,
                                value.step
                              )
                            }
                          />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.RareCandy && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Rare Candy"
                            src={getItemSpritePath(ItemName.RareCandy)}
                          />
                          <span className="caption theme-text-primary">Rare Candy</span>
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.Stardust && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="Stardust"
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          <span className="caption theme-text-primary">Stardust</span>
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium[index].type === RewardType.MoveReRoll && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium w-9"
                            alt="Pokémon Image"
                            title="TM Charged Move"
                            src={APIService.getItemSprite('Item_1202')}
                          />
                          <span className="caption theme-text-primary">TM Charged Move</span>
                        </Fragment>
                      )}
                    </Badge>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="w-100 text-center my-3">
            <div className="d-flex justify-content-center mb-2" style={{ columnGap: '10%' }}>
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
        <div className="ph-item mt-2">
          <div className="ph-picture px-0" style={{ height: 450 }} />
        </div>
      )}
      <div className="input-group border-input w-fit-content">
        <span className="input-group-text text-success bg-transparent fw-medium">Opened Leagues</span>
      </div>
      <Accordion alwaysOpen>{openedLeague.map((value, index) => showAccording(value, index, true))}</Accordion>

      <div className="w-25 input-group border-input mt-2" style={{ minWidth: 300 }}>
        <span className="input-group-text">Find League</span>
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter League Name"
          defaultValue={search}
          onKeyUp={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
      <Accordion className="accordion-league" alwaysOpen>
        {leagueFilter.map((value, index) => showAccording(value, index))}
      </Accordion>

      {showData && (
        <Modal size="lg" show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex flex-column row-gap-2">
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
                  <div className="d-flex column-gap-2">
                    <img
                      className="pokemon-sprite-small filter-shadow w-1"
                      alt="Pokémon Image"
                      title="Battle Icon"
                      src={APIService.getPokeOtherLeague('BattleIconColor')}
                    />
                    <span>Free</span> (Win stack {showData.step})
                  </div>
                ) : (
                  <div className="d-flex column-gap-2">
                    <img
                      className="pokemon-sprite-small filter-shadow w-1"
                      alt="Pokémon Image"
                      title="Paid Raid Ticket"
                      src={getItemSpritePath(ItemName.PaidRaidTicket)}
                    />
                    <span style={{ color: 'crimson' }}>Premium</span> (Win stack {showData.step})
                  </div>
                )}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <h5 className="text-decoration-underline">Random Pokémon</h5>
            {showData.data
              .filter((item) => !item.guaranteedLimited)
              .map((item, index) => (
                <LinkToTop
                  className="img-link text-center"
                  key={index}
                  to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                  title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                >
                  <div className="d-flex justify-content-center">
                    <span className="w-9">
                      <img
                        className="pokemon-sprite-medium filter-shadow-hover"
                        alt="Pokémon Image"
                        title={splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}
                        src={APIService.getPokemonModel(getAssetPokeGo(item.id, item.form))}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getValidPokemonImgPath(
                            e.currentTarget.src,
                            item.id,
                            getAssetPokeGo(item.id, item.form)
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
                <h5 className="text-decoration-underline">Guaranteed Pokémon in first time</h5>
                {showData.data
                  .filter((item) => item.guaranteedLimited && toNumber(item.rank) === rank)
                  .map((item, index) => (
                    <LinkToTop
                      className="img-link text-center"
                      key={index}
                      to={`/pokemon/${item.id}${generateParamForm(item.form)}`}
                      title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                    >
                      <div className="d-flex justify-content-center">
                        <span className="w-9">
                          <img
                            className="pokemon-sprite-medium filter-shadow-hover"
                            alt="Pokémon Image"
                            title={splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}
                            src={APIService.getPokemonModel(getAssetPokeGo(item.id, item.form))}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getValidPokemonImgPath(
                                e.currentTarget.src,
                                item.id,
                                getAssetPokeGo(item.id, item.form)
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant={VariantType.Secondary} onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Leagues;
