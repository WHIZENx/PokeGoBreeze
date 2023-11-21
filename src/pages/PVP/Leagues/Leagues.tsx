import TypeInfo from '../../../components/Sprites/Type/Type';

import { Accordion, Form, useAccordionButton } from 'react-bootstrap';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import APIService from '../../../services/API.service';

import './Leagues.scss';
import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTime, splitAndCapitalize, capitalize, convertFormName } from '../../../util/Utils';
import { rankIconCenterName, rankIconName, rankName } from '../../../util/Compute';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Modal, Button } from 'react-bootstrap';
import Xarrow from 'react-xarrows';
import { hideSpinner } from '../../../store/actions/spinner.action';
import { SpinnerState, StoreState } from '../../../store/models/state.model';
import { League } from '../../../core/models/league.model';
import { FORM_NORMAL } from '../../../util/Constants';

const Leagues = () => {
  const dispatch = useDispatch();
  const spinner = useSelector((state: SpinnerState) => state.spinner);
  const dataStore = useSelector((state: StoreState) => state.store.data);

  const [leagues, setLeagues]: [League[], any] = useState([]);
  const [openedLeague, setOpenedLeague]: [League[], any] = useState([]);
  const [leagueFilter, setLeagueFilter]: any = useState([]);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState(1);
  const [setting, setSetting]: any = useState(null);
  const [showData, setShowData]: any = useState(null);

  const getAssetPokeGo = (id: string, form: string) => {
    try {
      const dataId = dataStore?.assets?.find((item) => item.id?.toString() === id.toString());
      if (dataId?.image.length === 0) {
        if (form && !Object.keys(dataStore?.typeEff ?? {}).includes(form)) {
          return APIService.getPokeFullSprite(
            id,
            capitalize(
              convertFormName(parseInt(id), form.toLowerCase().replace('_', '-').replace('galarian', 'galar').replace('hisuian', 'hisui'))
            )
          );
        }
        return APIService.getPokeFullSprite(id);
      }
      const data = dataId?.image.find((item) => item.form === form);
      return data
        ? APIService.getPokemonModel(data.default)
        : APIService.getPokemonModel(dataId ? dataId.image.at(0)?.default ?? null : null);
    } catch {
      return APIService.getPokeFullSprite(id);
    }
  };

  const LeaveToggle = ({ eventKey }: any) => {
    const decoratedOnClick = useAccordionButton(eventKey, () => <></>);

    return (
      <div className="accordion-footer" onClick={decoratedOnClick}>
        <span className="text-danger">
          Close <CloseIcon sx={{ color: 'red' }} />
        </span>
      </div>
    );
  };

  useEffect(() => {
    document.title = 'Battle Leagues List';
    if (spinner.loading) {
      dispatch(hideSpinner());
    }
  }, []);

  useEffect(() => {
    if (dataStore?.leagues) {
      const leagues = dataStore?.leagues?.data ?? [];
      setLeagues(leagues);
      setOpenedLeague(leagues.filter((league) => dataStore?.leagues?.allowLeagues.includes(league.id ?? '')));
      setSetting(dataStore?.leagues?.season.settings.find((data: { rankLevel: number }) => data.rankLevel === rank + 1));
    }
  }, [dataStore?.leagues]);

  useEffect(() => {
    if (leagues.length > 0) {
      const timeOutId = setTimeout(() => {
        setLeagueFilter(
          leagues.filter((value) => {
            if (dataStore?.leagues?.allowLeagues.includes(value.id ?? '')) {
              return false;
            }
            let textTitle = '';
            if ((value.id ?? '').includes('SEEKER') && ['GREAT_LEAGUE', 'ULTRA_LEAGUE', 'MASTER_LEAGUE'].includes(value.title)) {
              textTitle = splitAndCapitalize((value.id ?? '').replace('VS_', '').toLowerCase(), '_', ' ');
            } else {
              textTitle = splitAndCapitalize(value.title.toLowerCase(), '_', ' ');
            }
            if ((value.id ?? '').includes('SAFARI_ZONE')) {
              textTitle += ` ${(value.id ?? '').split('_').at(3)} ${capitalize((value.id ?? '').split('_').at(4))}`;
            }
            return search === '' || textTitle.toLowerCase().includes(search.toLowerCase());
          })
        );
      }, 300);
      return () => clearTimeout(timeOutId);
    }
  }, [leagues, search]);

  const [show, setShow] = useState(false);

  const handleShow = (type: string | boolean | undefined, track: string, step: number) => {
    const data: any = {};
    if (type === 'pokemon') {
      const result: any[] = [];
      setShow(true);
      Object.values(dataStore?.leagues?.season.rewards.pokemon ?? []).forEach((value: any) => {
        if (value.rank <= rank) {
          result.push(
            ...value[track.toLowerCase()].map((item: { guaranteedLimited: boolean }) => {
              if (item.guaranteedLimited) {
                return {
                  ...item,
                  rank: value.rank,
                };
              }
              return item;
            })
          );
        }
      });
      data.data = result.sort((a, b) => a.id - b.id);
      data.step = step;
      data.track = track.toLowerCase();
      data.type = type;
    }
    setShowData(data);
  };

  const handleClose = () => {
    setShow(false);
    setShowData(null);
  };

  const showAccording = (league: League, index: any, isOpened = false) => {
    return (
      <Accordion.Item key={index} eventKey={index}>
        <Accordion.Header className={isOpened ? 'league-opened' : ''}>
          <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
            <img alt="img-league" height={50} src={APIService.getAssetPokeGo(league.iconUrl ?? '')} />
            <b className={league.enabled ? '' : 'text-danger'}>
              {((league.id ?? '').includes('SEEKER') && ['GREAT_LEAGUE', 'ULTRA_LEAGUE', 'MASTER_LEAGUE'].includes(league.title)
                ? splitAndCapitalize((league.id ?? '').replace('VS_', '').toLowerCase(), '_', ' ')
                : splitAndCapitalize(league.title.toLowerCase(), '_', ' ')) +
                ((league.id ?? '').includes('SAFARI_ZONE')
                  ? ` ${(league.id ?? '').split('_').at(3)} ${capitalize((league.id ?? '').split('_').at(4))}`
                  : '')}
            </b>
          </div>
        </Accordion.Header>
        <Accordion.Body className="league-body">
          <div className="sub-body">
            <h4 className="title-leagues">{splitAndCapitalize((league.id ?? '').toLowerCase(), '_', ' ')}</h4>
            <div className="text-center">
              {league.league !== league.title && !league.title.includes('REMIX') && !(league.iconUrl ?? '').includes('pogo') ? (
                <div className="league">
                  <img
                    alt="img-league"
                    height={140}
                    src={APIService.getAssetPokeGo(dataStore?.leagues?.data.find((item) => item.title === league.league)?.iconUrl ?? '')}
                  />
                  <span className={'badge-league ' + league.league.toLowerCase().replaceAll('_', '-')}>
                    <div className="sub-badge">
                      <img alt="img-league" height={50} src={APIService.getAssetPokeGo(league.iconUrl ?? '')} />
                    </div>
                  </span>
                </div>
              ) : (
                <div>
                  <img alt="img-league" height={140} src={APIService.getAssetPokeGo(league.iconUrl ?? '')} />
                </div>
              )}
            </div>
            <h5 className="title-leagues element-top">Conditions</h5>
            <ul style={{ listStyleType: 'inherit' }}>
              <li style={{ fontWeight: 500 }}>
                <h6>
                  <b>Max CP:</b> <span>{league.conditions.max_cp}</span>
                </h6>
              </li>
              {league.conditions.max_level && (
                <li style={{ fontWeight: 500 }}>
                  <h6>
                    <b>Max Level:</b> <span>{league.conditions.max_level}</span>
                  </h6>
                </li>
              )}
              {league.conditions.timestamp && (
                <li>
                  <h6 className="title-leagues">Event time</h6>
                  <span style={{ fontWeight: 500 }}>Start Date: {getTime(league.conditions.timestamp?.start)}</span>
                  {league.conditions.timestamp?.end && (
                    <span style={{ fontWeight: 500 }}>
                      <br />
                      End Date: {getTime(league.conditions.timestamp?.end)}
                    </span>
                  )}
                </li>
              )}
              <li style={{ fontWeight: 500 }}>
                <h6 className="title-leagues">Unique Selected</h6>
                {league.conditions.unique_selected ? <DoneIcon sx={{ color: 'green' }} /> : <CloseIcon sx={{ color: 'red' }} />}
              </li>
              {league.conditions.unique_type && (
                <li style={{ fontWeight: 500 }} className="unique-type">
                  <h6 className="title-leagues">Unique Type</h6>
                  <TypeInfo arr={league.conditions.unique_type ?? []} style={{ marginLeft: 15 }} />
                </li>
              )}
              {league.conditions.whiteList.length !== 0 && (
                <li style={{ fontWeight: 500 }}>
                  <h6 className="title-leagues text-success">White List</h6>
                  {league.conditions.whiteList.map((item, index: React.Key) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={
                        '/pokemon/' +
                        item.id +
                        (item.form?.toUpperCase() === FORM_NORMAL
                          ? ''
                          : '?form=' +
                            convertFormName(
                              parseInt(item.id),
                              item.form.toLowerCase().replace('_', '-').replace('galarian', 'galar').replace('hisuian', 'hisui')
                            ))
                      }
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
                      <span className="caption">
                        {splitAndCapitalize(item.name.toLowerCase(), '_', ' ') +
                          (item.form?.toUpperCase() === FORM_NORMAL ? '' : ' ' + splitAndCapitalize(item.form.toLowerCase(), '_', ' '))}
                      </span>
                    </Link>
                  ))}
                </li>
              )}
              {league.conditions.banned.length !== 0 && (
                <li style={{ fontWeight: 500 }}>
                  <h6 className="title-leagues text-danger">Ban List</h6>
                  {league.conditions.banned.map((item, index: React.Key) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={
                        '/pokemon/' +
                        item.id +
                        (item.form?.toUpperCase() === FORM_NORMAL
                          ? ''
                          : '?form=' +
                            convertFormName(
                              parseInt(item.id),
                              item.form.toLowerCase().replace('_', '-').replace('galarian', 'galar').replace('hisuian', 'hisui')
                            ))
                      }
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
                      <span className="caption">
                        {splitAndCapitalize(item.name.toLowerCase(), '_', ' ') +
                          (item.form?.toUpperCase() === FORM_NORMAL ? '' : ' ' + splitAndCapitalize(item.form.toLowerCase(), '_', ' '))}
                      </span>
                    </Link>
                  ))}
                </li>
              )}
            </ul>
          </div>
          <LeaveToggle eventKey={index} />
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
              setRank(parseInt(e.target.value));
              if (parseInt(e.target.value) < 24) {
                setSetting(
                  dataStore?.leagues?.season.settings.find((data: { rankLevel: number }) => data.rankLevel === parseInt(e.target.value) + 1)
                );
              }
            }}
            defaultValue={rank}
          >
            {Object.keys(dataStore?.leagues?.season.rewards.rank ?? []).map((value: any, index: number) => (
              <option key={index} value={value}>
                Rank {value} {value > 20 && `( ${rankName(parseInt(value))} )`}
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
                <div className="rank-header">Season {dataStore?.leagues?.season.season}</div>
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
              {dataStore?.leagues?.season.rewards.rank[rank].free.map((value, index: number) => (
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
                        paddingBottom: value.type === 'pokemon' || value.type === 'itemLoot' ? '0 !important' : '1.5rem !important',
                        paddingTop: '1.5rem !important',
                        minWidth: 64,
                      }}
                    >
                      {!value.type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {value.type === 'pokemon' && (
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
                            onClick={() => handleShow(value.type, 'FREE', value.step)}
                          />
                        </Fragment>
                      )}
                      {value.type === 'itemLoot' && (
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
                      {value.type === 'ITEM_RARE_CANDY' && (
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
                      {value.type === 'stardust' && (
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
                      {value.type === 'ITEM_MOVE_REROLL_SPECIAL_ATTACK' && (
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
                      badgeContent={dataStore?.leagues?.season.rewards.rank[rank].premium[index].count}
                      max={10000}
                      sx={{
                        paddingBottom:
                          dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'pokemon' ||
                          dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'itemLoot'
                            ? '0 !important'
                            : '1.5rem !important',
                        minWidth: 64,
                      }}
                    >
                      {!dataStore?.leagues?.season.rewards.rank[rank].premium[index].type && (
                        <Fragment>
                          <CloseIcon fontSize="large" sx={{ color: 'red', height: 82 }} />
                        </Fragment>
                      )}
                      {dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'pokemon' && (
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
                              handleShow(dataStore?.leagues?.season.rewards.rank[rank].premium[index].type, 'PREMIUM', value.step)
                            }
                          />
                        </Fragment>
                      )}
                      {dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'itemLoot' && (
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
                            // onClick={() =>
                            //   handleShow(dataStore?.leagues?.season.rewards.rank[rank].premium[index].type, 'PREMIUM', value.step)
                            // }
                          />
                        </Fragment>
                      )}
                      {dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'ITEM_RARE_CANDY' && (
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
                      {dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'stardust' && (
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
                      {dataStore?.leagues?.season.rewards.rank[rank].premium[index].type === 'ITEM_MOVE_REROLL_SPECIAL_ATTACK' && (
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
                    Complete <b>{setting?.additionalTotalBattlesRequired}</b> battle
                    {setting?.additionalTotalBattlesRequired > 1 && 's'}.
                  </li>
                )}
                {setting?.additionalWinsRequired && (
                  <li>
                    Win <b>{setting?.additionalWinsRequired}</b> battle
                    {setting?.additionalWinsRequired > 1 && 's'}.
                  </li>
                )}
                {setting?.minRatingRequired && (
                  <li>
                    Reach a battle rating of <b>{setting?.minRatingRequired}</b> or higher.
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
      <Accordion alwaysOpen={true}>{openedLeague.map((value: League, index: any) => showAccording(value, index, true))}</Accordion>

      <div className="w-25 input-group border-input element-top" style={{ minWidth: 300 }}>
        <span className="input-group-text">Find League</span>
        <input
          type="text"
          className="form-control input-search"
          placeholder="Enter League Name"
          defaultValue={search}
          onKeyUp={(e: any) => setSearch(e.target.value)}
        />
      </div>
      <Accordion alwaysOpen={true}>{leagueFilter?.map((value: League, index: any) => showAccording(value, index))}</Accordion>

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
                {showData.track === 'free' ? (
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
              .filter((item: { guaranteedLimited: boolean }) => !item.guaranteedLimited)
              .map((item: { id: string; name: string; form: string }, index: React.Key) => (
                <Link
                  className="img-link text-center"
                  key={index}
                  to={'/pokemon/' + item.id}
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
            {showData.data.filter((item: { guaranteedLimited: boolean; rank: number }) => item.guaranteedLimited && item.rank === rank)
              .length > 0 && (
              <Fragment>
                <hr />
                <h5 style={{ textDecoration: 'underline' }}>Guaranteed Pokémon in first time</h5>
                {showData.data
                  .filter((item: { guaranteedLimited: boolean; rank: number }) => item.guaranteedLimited && item.rank === rank)
                  .map((item: { id: string; name: string; form: string }, index: React.Key) => (
                    <Link
                      className="img-link text-center"
                      key={index}
                      to={'/pokemon/' + item.id}
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
