import TypeInfo from '../../../components/Sprites/Type/Type';

import { Accordion, Form, useAccordionButton } from 'react-bootstrap';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import APIService from '../../../services/API.service';

import './Leagues.scss';
import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTime, splitAndCapitalize, capitalize } from '../../../util/utils';
import { queryAssetForm, rankIconCenterName, rankIconName, rankName } from '../../../util/compute';
import { useSelector } from 'react-redux';
import { Badge } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Modal, Button } from 'react-bootstrap';
import Xarrow from 'react-xarrows';
import { StoreState } from '../../../store/models/state.model';
import { ILeague, IPokemonRewardSetLeague, PokemonRewardSetLeague, SettingLeague } from '../../../core/models/league.model';
import { FORM_NORMAL } from '../../../util/constants';
import { useChangeTitle } from '../../../util/hooks/useChangeTitle';
import { Toggle } from '../../../core/models/pvp.model';
import {
  combineClasses,
  getValueOrDefault,
  isEmpty,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  toNumber,
} from '../../../util/extension';
import { LeagueRewardType, RewardType } from '../../../core/enums/league.enum';
import { IncludeMode } from '../../../util/enums/string.enum';

interface LeagueData {
  data: IPokemonRewardSetLeague[];
  step: number;
  track: string;
  type: string | undefined;
}

const Leagues = () => {
  useChangeTitle('Battle Leagues List');
  const dataStore = useSelector((state: StoreState) => state.store.data);

  const [leagues, setLeagues] = useState<ILeague[]>([]);
  const [openedLeague, setOpenedLeague] = useState<ILeague[]>([]);
  const [leagueFilter, setLeagueFilter] = useState<ILeague[]>([]);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState(1);
  const [setting, setSetting] = useState<SettingLeague>();
  const [showData, setShowData] = useState<LeagueData>();

  const getAssetPokeGo = (id: number, form: string) => {
    const asset = queryAssetForm(getValueOrDefault(Array, dataStore?.assets), id, form);
    if (asset) {
      return APIService.getPokemonModel(asset.default);
    } else {
      return APIService.getPokeFullSprite(id);
    }
  };

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
    if (dataStore?.leagues) {
      const leagues = getValueOrDefault(Array, dataStore?.leagues?.data);
      setLeagues(leagues);
      setOpenedLeague(leagues.filter((league) => isIncludeList(dataStore.leagues.allowLeagues, league.id)));
      setSetting(dataStore.leagues.season.settings.find((data) => data.rankLevel === rank + 1));
    }
  }, [dataStore?.leagues]);

  useEffect(() => {
    if (isNotEmpty(leagues)) {
      const timeOutId = setTimeout(() => {
        setLeagueFilter(
          leagues.filter((value) => {
            if (isIncludeList(dataStore?.leagues?.allowLeagues, value.id)) {
              return false;
            }
            let textTitle = '';
            if (isInclude(value.id, 'SEEKER') && isIncludeList(['GREAT_LEAGUE', 'ULTRA_LEAGUE', 'MASTER_LEAGUE'], value.title)) {
              textTitle = splitAndCapitalize(getValueOrDefault(String, value.id).replace('VS_', '').toLowerCase(), '_', ' ');
            } else {
              textTitle = splitAndCapitalize(value.title.toLowerCase(), '_', ' ');
            }
            if (isInclude(value.id, 'SAFARI_ZONE')) {
              textTitle += ` ${getValueOrDefault(String, value.id).split('_').at(3)} ${capitalize(
                getValueOrDefault(String, value.id).split('_').at(4)
              )}`;
            }
            return isEmpty(search) || isInclude(textTitle, search, IncludeMode.IncludeIgnoreCaseSensitive);
          })
        );
      }, 300);
      return () => clearTimeout(timeOutId);
    }
  }, [leagues, search]);

  const [show, setShow] = useState(false);

  const handleShow = (type: string | undefined, track: string, step: number) => {
    if (type === RewardType.Pokemon) {
      const result: IPokemonRewardSetLeague[] = [];
      setShow(true);
      Object.values(dataStore?.leagues?.season.rewards.pokemon ?? new Object()).forEach((value) => {
        if (value.rank <= rank) {
          result.push(
            ...value[track.toLowerCase()].map((item: IPokemonRewardSetLeague) => {
              if (item.guaranteedLimited) {
                return PokemonRewardSetLeague.create({
                  ...item,
                  rank: value.rank,
                });
              }
              return item;
            })
          );
        }
      });
      setShowData({
        data: result.sort((a, b) => a.id - b.id),
        step,
        track: track.toLowerCase(),
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

  const showAccording = (league: ILeague, index: number, isOpened = false) => {
    return (
      <Accordion.Item key={index} eventKey={index.toString()}>
        <Accordion.Header className={isOpened ? 'league-opened' : ''}>
          <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
            <img alt="img-league" height={50} src={APIService.getAssetPokeGo(getValueOrDefault(String, league.iconUrl))} />
            <b className={league.enabled ? '' : 'text-danger'}>
              {(isInclude(league.id, 'SEEKER') && isIncludeList(['GREAT_LEAGUE', 'ULTRA_LEAGUE', 'MASTER_LEAGUE'], league.title)
                ? splitAndCapitalize(getValueOrDefault(String, league.id).replace('VS_', '').toLowerCase(), '_', ' ')
                : splitAndCapitalize(league.title.toLowerCase(), '_', ' ')) +
                (isInclude(league.id, 'SAFARI_ZONE')
                  ? ` ${getValueOrDefault(String, league.id).split('_').at(3)} ${capitalize(
                      getValueOrDefault(String, league.id).split('_').at(4)
                    )}`
                  : '')}
            </b>
          </div>
        </Accordion.Header>
        <Accordion.Body className="league-body">
          <div className="sub-body">
            <h4 className="title-leagues">{splitAndCapitalize(getValueOrDefault(String, league.id).toLowerCase(), '_', ' ')}</h4>
            <div className="text-center">
              {!isEqual(league.league, league.title) && !isInclude(league.title, 'REMIX') && !isInclude(league.iconUrl, 'pogo') ? (
                <div className="league">
                  <img
                    alt="img-league"
                    height={140}
                    src={APIService.getAssetPokeGo(
                      getValueOrDefault(String, dataStore?.leagues?.data.find((item) => isEqual(item.title, league.league))?.iconUrl)
                    )}
                  />
                  <span className={combineClasses('badge-league', league.league.toLowerCase().replaceAll('_', '-'))}>
                    <div className="sub-badge">
                      <img alt="img-league" height={50} src={APIService.getAssetPokeGo(getValueOrDefault(String, league.iconUrl))} />
                    </div>
                  </span>
                </div>
              ) : (
                <div>
                  <img alt="img-league" height={140} src={APIService.getAssetPokeGo(getValueOrDefault(String, league.iconUrl))} />
                </div>
              )}
            </div>
            <h5 className="title-leagues element-top">Conditions</h5>
            <ul style={{ listStyleType: 'inherit' }}>
              <li style={{ fontWeight: 500 }}>
                <h6>
                  <b>Max CP:</b> <span>{league.conditions.maxCp}</span>
                </h6>
              </li>
              {league.pokemonCount > 0 && (
                <li style={{ fontWeight: 500 }}>
                  <h6>
                    <b>Pokémon count:</b> <span>{league.pokemonCount}</span>
                  </h6>
                </li>
              )}
              {league.conditions.maxLevel && (
                <li style={{ fontWeight: 500 }}>
                  <h6>
                    <b>Max Level:</b> <span>{league.conditions.maxLevel}</span>
                  </h6>
                </li>
              )}
              {league.conditions.timestamp && (
                <li>
                  <h6 className="title-leagues">Event time</h6>
                  <span style={{ fontWeight: 500 }}>Start Date: {getTime(league.conditions.timestamp.start)}</span>
                  {league.conditions.timestamp.end && (
                    <span style={{ fontWeight: 500 }}>
                      <br />
                      End Date: {getTime(league.conditions.timestamp.end)}
                    </span>
                  )}
                </li>
              )}
              <li style={{ fontWeight: 500 }}>
                <h6 className="title-leagues">Unique Selected</h6>
                {league.conditions.uniqueSelected ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />}
              </li>
              {isNotEmpty(league.conditions.uniqueType) && (
                <li style={{ fontWeight: 500 }} className="unique-type">
                  <h6 className="title-leagues">Unique Type</h6>
                  <TypeInfo arr={getValueOrDefault(Array, league.conditions.uniqueType)} style={{ marginLeft: 15 }} />
                </li>
              )}
              {isNotEmpty(league.conditions.whiteList) && (
                <li style={{ fontWeight: 500 }}>
                  <h6 className="title-leagues text-success">White List</h6>
                  {league.conditions.whiteList.map((item, index) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={`/pokemon/${item.id}${
                        item.form.toUpperCase() === FORM_NORMAL ? '' : `?form=${item.form.toLowerCase().replaceAll('_', '-')}`
                      }`}
                      title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
                    >
                      <div className="d-flex justify-content-center">
                        <span style={{ width: 64 }}>
                          <img
                            className="pokemon-sprite-medium filter-shadow-hover"
                            alt="img-pokemon"
                            src={getAssetPokeGo(getValueOrDefault(Number, item.id), item.form)}
                          />
                        </span>
                      </div>
                      <span className="caption">
                        {`${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')} ${
                          item.form.toUpperCase() === FORM_NORMAL ? '' : `${splitAndCapitalize(item.form.toLowerCase(), '_', ' ')}`
                        }`}
                      </span>
                    </Link>
                  ))}
                </li>
              )}
              {isNotEmpty(league.conditions.banned) && (
                <li style={{ fontWeight: 500 }}>
                  <h6 className="title-leagues text-danger">Ban List</h6>
                  {league.conditions.banned.map((item, index) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={`/pokemon/${item.id}${
                        item.form.toUpperCase() === FORM_NORMAL ? '' : `?form=${item.form.toLowerCase().replaceAll('_', '-')}`
                      }`}
                      title={`#${item.id} ${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')}`}
                    >
                      <div className="d-flex justify-content-center">
                        <span style={{ width: 64 }}>
                          <img
                            className="pokemon-sprite-medium filter-shadow-hover"
                            alt="img-pokemon"
                            src={getAssetPokeGo(getValueOrDefault(Number, item.id), item.form)}
                          />
                        </span>
                      </div>
                      <span className="caption">
                        {`${splitAndCapitalize(item.name?.toLowerCase(), '_', ' ')} ${
                          item.form.toUpperCase() === FORM_NORMAL ? '' : `${splitAndCapitalize(item.form.toLowerCase(), '_', ' ')}`
                        }`}
                      </span>
                    </Link>
                  ))}
                </li>
              )}
            </ul>
          </div>
          <LeaveToggle eventKey={index.toString()} />
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  return (
    <div className="container" style={{ padding: 15 }}>
      <h2 className="title-leagues" style={{ marginBottom: 15 }}>
        Battle Leagues List
      </h2>
      <hr />
      <div className="row" style={{ rowGap: 10, margin: 0 }}>
        <div className="col-md-8 d-flex justify-content-start align-items-center" style={{ padding: 0 }}>
          <span style={{ fontWeight: 500 }}>
            <span>Season Date: {getTime(dataStore?.leagues?.season.timestamp.start)}</span>{' '}
            <span>- {getTime(dataStore?.leagues?.season.timestamp.end)}</span>
          </span>
        </div>
        <div className="col-md-4 d-flex justify-content-end" style={{ padding: 0 }}>
          <Form.Select
            onChange={(e) => {
              setRank(toNumber(e.target.value));
              if (toNumber(e.target.value) < 24) {
                setSetting(dataStore?.leagues?.season.settings.find((data) => data.rankLevel === toNumber(e.target.value) + 1));
              }
            }}
            defaultValue={rank}
          >
            {Object.keys(getValueOrDefault(Array, dataStore?.leagues?.season.rewards.rank)).map((value, index) => (
              <option key={index} value={value}>
                Rank {value} {toNumber(value) > 20 && `( ${rankName(toNumber(value))} )`}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>
      {dataStore?.leagues ? (
        <Fragment>
          <div className="d-flex justify-content-center element-top">
            <div className="season-league">
              <div className="group-rank-league reward-league text-center">
                <div className="rank-header">Season {dataStore.leagues.season.season}</div>
                <Badge
                  color="primary"
                  className="position-relative d-inline-block img-link"
                  overlap="circular"
                  badgeContent={null}
                  sx={{
                    paddingTop: '1.5rem !important',
                    paddingBottom: '0.5rem !important',
                    maxWidth: 64,
                  }}
                >
                  <img
                    className="pokemon-sprite-medium"
                    style={{ width: 64 }}
                    alt="img-pokemon"
                    src={APIService.getPokeOtherLeague('BattleIconColor')}
                  />
                  <span className="caption text-black">Free</span>
                </Badge>
                <hr />
                <Badge
                  color="primary"
                  className="position-relative d-inline-block img-link"
                  overlap="circular"
                  badgeContent={null}
                  sx={{ paddingBottom: '1.5rem !important', maxWidth: 64 }}
                >
                  <img className="pokemon-sprite-medium" alt="img-pokemon" src={APIService.getItemSprite('Item_1402')} />
                  <span className="caption text-black">Premium</span>
                </Badge>
              </div>
              {dataStore.leagues.season.rewards.rank[rank].free?.map((value, index) => (
                <Fragment key={index}>
                  <div className="group-rank-league text-center">
                    <div className="rank-header">Win Stack {value.step}</div>
                    <Badge
                      color="primary"
                      className="position-relative d-inline-block img-link"
                      overlap="circular"
                      badgeContent={value.count}
                      max={10000}
                      sx={{
                        paddingBottom:
                          value.type === RewardType.Pokemon || value.type === RewardType.ItemLoot ? '0 !important' : '1.5rem !important',
                        paddingTop: '1.5rem !important',
                        minWidth: 64,
                      }}
                    >
                      {!value.type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {value.type === RewardType.Pokemon && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getIconSprite('ic_grass')}
                          />
                          <span className="caption text-black">Random Pokémon</span>
                          <VisibilityIcon
                            className="view-pokemon"
                            sx={{ fontSize: '1rem', color: 'black' }}
                            onClick={() => handleShow(value.type, LeagueRewardType.Free, value.step)}
                          />
                        </Fragment>
                      )}
                      {value.type === RewardType.ItemLoot && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getIconSprite('btn_question_02_normal_white_shadow')}
                          />
                          <span className="caption text-black">Random Item</span>
                          <VisibilityIcon className="view-pokemon" sx={{ fontSize: '1rem', color: 'black' }} />
                        </Fragment>
                      )}
                      {value.type === RewardType.RareCandy && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('Item_1301')}
                          />
                          <span className="caption text-black">Rare Candy</span>
                        </Fragment>
                      )}
                      {value.type === RewardType.Stardust && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          <span className="caption text-black">Stardust</span>
                        </Fragment>
                      )}
                      {value.type === RewardType.MoveReRoll && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('Item_1202')}
                          />
                          <span className="caption text-black">TM Charged Move</span>
                        </Fragment>
                      )}
                    </Badge>
                    <hr style={{ marginTop: 0 }} />
                    <Badge
                      color="primary"
                      className="position-relative d-inline-block img-link"
                      overlap="circular"
                      badgeContent={dataStore.leagues.season.rewards.rank[rank].premium?.[index].count}
                      max={10000}
                      sx={{
                        paddingBottom:
                          dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.Pokemon ||
                          dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.ItemLoot
                            ? '0 !important'
                            : '1.5rem !important',
                        minWidth: 64,
                      }}
                    >
                      {!dataStore.leagues.season.rewards.rank[rank].premium?.[index].type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.Pokemon && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getIconSprite('ic_grass')}
                          />
                          <span className="caption text-black">Random Pokémon</span>
                          <VisibilityIcon
                            className="view-pokemon"
                            sx={{ fontSize: '1rem', color: 'black' }}
                            onClick={() =>
                              handleShow(
                                dataStore.leagues.season.rewards.rank[rank].premium?.[index].type,
                                LeagueRewardType.Premium,
                                value.step
                              )
                            }
                          />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.ItemLoot && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getIconSprite('btn_question_02_normal_white_shadow')}
                          />
                          <span className="caption text-black">Random Item</span>
                          <VisibilityIcon
                            className="view-pokemon"
                            sx={{ fontSize: '1rem', color: 'black' }}
                            onClick={() =>
                              handleShow(
                                dataStore.leagues?.season.rewards.rank[rank].premium?.[index].type,
                                LeagueRewardType.Premium,
                                value.step
                              )
                            }
                          />
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.RareCandy && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('Item_1301')}
                          />
                          <span className="caption text-black">Rare Candy</span>
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.Stardust && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('stardust_painted')}
                          />
                          <span className="caption text-black">Stardust</span>
                        </Fragment>
                      )}
                      {dataStore.leagues.season.rewards.rank[rank].premium?.[index].type === RewardType.MoveReRoll && (
                        <Fragment>
                          <img
                            className="pokemon-sprite-medium"
                            style={{ width: 64 }}
                            alt="img-pokemon"
                            src={APIService.getItemSprite('Item_1202')}
                          />
                          <span className="caption text-black">TM Charged Move</span>
                        </Fragment>
                      )}
                    </Badge>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <div className="w-100 text-center" style={{ marginTop: 15, marginBottom: 15 }}>
            <div className="d-flex justify-content-center" style={{ marginBottom: 10, columnGap: '10%' }}>
              <div id="currRank" className="combat-league-info">
                <img className="main-combat-league-info" alt="img-pokemon" src={rankIconName(rank)} />
                {rank > 20 ? (
                  <Fragment>
                    <span className="combat-center-league-top">{rankName(rank)}</span>
                    <span className="combat-center-league-info">
                      <img alt="img-league" height={36} src={rankIconCenterName(rank)} />
                    </span>
                  </Fragment>
                ) : (
                  <span className="combat-center-league-text">{rank}</span>
                )}
              </div>
              {rank < 24 && (
                <div id="nextRank" className="combat-league-info">
                  <img className="main-combat-league-info" alt="img-pokemon" src={rankIconName(rank + 1)} />
                  {rank + 1 > 20 ? (
                    <Fragment>
                      <span className="combat-center-league-top">{rankName(rank + 1)}</span>
                      <span className="combat-center-league-info">
                        <img alt="img-league" height={36} src={rankIconCenterName(rank + 1)} />
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
        <div className="ph-item element-top">
          <div className="ph-picture" style={{ height: 450, paddingLeft: 0, paddingRight: 0 }} />
        </div>
      )}
      <div className="input-group border-input" style={{ width: 'fit-content' }}>
        <span className="input-group-text text-success" style={{ backgroundColor: 'transparent', fontWeight: 500 }}>
          Opened Leagues
        </span>
      </div>
      <Accordion alwaysOpen={true}>{openedLeague.map((value, index) => showAccording(value, index, true))}</Accordion>

      <div className="w-25 input-group border-input element-top" style={{ minWidth: 300 }}>
        <span className="input-group-text">Find League</span>
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter League Name"
          defaultValue={search}
          onKeyUp={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
      <Accordion alwaysOpen={true}>{leagueFilter.map((value, index) => showAccording(value, index))}</Accordion>

      {showData && (
        <Modal size="lg" show={show} onHide={handleClose} centered={true}>
          <Modal.Header closeButton={true}>
            <Modal.Title className="d-flex flex-column" style={{ rowGap: 10 }}>
              <div>
                <span>
                  {rank > 20 && (
                    <div className="combat-league">
                      <img className="main-combat-league" alt="img-pokemon" src={rankIconName(rank)} />
                      <span className="combat-center-league">
                        <img alt="img-league" height={24} src={rankIconCenterName(rank)} />
                      </span>
                    </div>
                  )}
                </span>
                Rank {rank} {rank > 20 && `(${rankName(rank)})`}
              </div>
              <div className="reward-info">
                {showData.track === LeagueRewardType.Free.toLowerCase() ? (
                  <div className="d-flex" style={{ columnGap: 8 }}>
                    <img
                      className="pokemon-sprite-small filter-shadow"
                      style={{ width: 16 }}
                      alt="img-pokemon"
                      src={APIService.getPokeOtherLeague('BattleIconColor')}
                    />
                    <span>Free</span> (Win stack {showData.step})
                  </div>
                ) : (
                  <div className="d-flex" style={{ columnGap: 8 }}>
                    <img
                      className="pokemon-sprite-small filter-shadow"
                      style={{ width: 16 }}
                      alt="img-pokemon"
                      src={APIService.getItemSprite('Item_1402')}
                    />
                    <span style={{ color: 'crimson' }}>Premium</span> (Win stack {showData.step})
                  </div>
                )}
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <h5 style={{ textDecoration: 'underline' }}>Random Pokémon</h5>
            {showData.data
              .filter((item) => !item.guaranteedLimited)
              .map((item, index) => (
                <Link
                  className="img-link text-center"
                  key={index}
                  to={`/pokemon/${item.id}${
                    item.form.toUpperCase() === FORM_NORMAL ? '' : `?form=${item.form.toLowerCase().replaceAll('_', '-')}`
                  }`}
                  title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                >
                  <div className="d-flex justify-content-center">
                    <span style={{ width: 64 }}>
                      <img
                        className="pokemon-sprite-medium filter-shadow-hover"
                        alt="img-pokemon"
                        src={getAssetPokeGo(item.id, item.form)}
                      />
                    </span>
                  </div>
                  <span className="caption">{splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}</span>
                </Link>
              ))}
            {isNotEmpty(showData.data.filter((item) => item.guaranteedLimited && getValueOrDefault(Number, item.rank) === rank)) && (
              <Fragment>
                <hr />
                <h5 style={{ textDecoration: 'underline' }}>Guaranteed Pokémon in first time</h5>
                {showData.data
                  .filter((item) => item.guaranteedLimited && getValueOrDefault(Number, item.rank) === rank)
                  .map((item, index) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={`/pokemon/${item.id}${
                        item.form.toUpperCase() === FORM_NORMAL ? '' : `?form=${item.form.toLowerCase().replaceAll('_', '-')}`
                      }`}
                      title={`#${item.id} ${splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}`}
                    >
                      <div className="d-flex justify-content-center">
                        <span style={{ width: 64 }}>
                          <img
                            className="pokemon-sprite-medium filter-shadow-hover"
                            alt="img-pokemon"
                            src={getAssetPokeGo(item.id, item.form)}
                          />
                        </span>
                      </div>
                      <span className="caption">{splitAndCapitalize(item.name.toLowerCase(), '_', ' ')}</span>
                    </Link>
                  ))}
              </Fragment>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Leagues;
