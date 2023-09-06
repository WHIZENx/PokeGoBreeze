import TypeInfo from '../../../components/Sprites/Type/Type';

import '../PVP.scss';
import React, { useState, useEffect, Fragment, useRef } from 'react';

import { convertNameRankingToOri, splitAndCapitalize, convertName, capitalize, getStyleSheet } from '../../../util/Utils';
import { calculateStatsByTag } from '../../../util/Calculate';
import { Accordion, Button, useAccordionButton } from 'react-bootstrap';

import APIService from '../../../services/API.service';
import { computeBgType, findAssetForm } from '../../../util/Compute';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';

import update from 'immutability-helper';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Keys, MoveSet, OverAllStats, TypeEffective } from '../Model';

import { useDispatch, useSelector } from 'react-redux';
import { hideSpinner, showSpinner } from '../../../store/actions/spinner.action';
import { loadPVP, loadPVPMoves } from '../../../store/actions/store.action';
import { useLocalStorage } from 'usehooks-ts';
import { scoreType } from '../../../util/Constants';
import { Action } from 'history';
import { RouterState, StatsState, StoreState } from '../../../store/models/state.model';
import { RankingsPVP } from '../../../core/models/pvp.model';

const RankingPVP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dataStore = useSelector((state: StoreState) => state.store.data);
  const pvp = useSelector((state: StoreState) => state.store.data?.pvp);
  const router = useSelector((state: RouterState) => state.router);
  const [stateTimestamp, setStateTimestamp] = useLocalStorage(
    'timestamp',
    JSON.stringify({
      gamemaster: null,
      pvp: null,
    })
  );
  const [statePVP, setStatePVP] = useLocalStorage('pvp', null);
  const params: any = useParams();

  const [rankingData, setRankingData]: any = useState(null);
  const [storeStats, setStoreStats]: any = useState(null);
  const sortedBy = useRef('score');
  const [sorted, setSorted]: any = useState(1);

  const styleSheet: any = useRef(null);

  const [search, setSearch] = useState('');
  const statsRanking = useSelector((state: StatsState) => state.stats);

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
    if (!pvp) {
      loadPVP(dispatch, setStateTimestamp, stateTimestamp, setStatePVP, statePVP);
    }
  }, [pvp]);

  useEffect(() => {
    if (dataStore?.combat?.every((combat) => !combat.archetype)) {
      loadPVPMoves(dispatch);
    }
  }, [dataStore?.combat]);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const cp = parseInt(params.cp);
        let file: RankingsPVP[] = (
          await APIService.getFetchUrl(APIService.getRankingFile(params.serie, cp, params.type), {
            cancelToken: APIService.getAxios().CancelToken.source().token,
          })
        ).data;
        if (params.serie === 'all') {
          document.title = `PVP Ranking - ${
            cp === 500 ? 'Little Cup' : cp === 1500 ? 'Great League' : cp === 2500 ? 'Ultra League' : 'Master League'
          }`;
        } else {
          document.title = `PVP Ranking - ${
            params.serie === 'remix'
              ? cp === 500
                ? 'Little Cup '
                : cp === 1500
                ? 'Great League '
                : cp === 2500
                ? 'Ultra League '
                : 'Master League '
              : ''
          }
                    ${splitAndCapitalize(params.serie, '-', ' ')} (${capitalize(params.type)})`;
        }
        file = file.map((item) => {
          const name = convertNameRankingToOri(item.speciesId, item.speciesName);
          let pokemon = Object.values(dataStore?.pokemonData ?? []).find((pokemon) => pokemon.slug === name);

          if (!pokemon) {
            pokemon = Object.values(dataStore?.pokemonData ?? []).find((pokemon) => pokemon.slug === item.speciesId.replace('_shadow', ''));
          }

          const id = pokemon?.num;
          const form = findAssetForm(dataStore?.assets ?? [], pokemon?.num, pokemon?.name);

          const stats = calculateStatsByTag(pokemon, pokemon?.baseStats, pokemon?.slug);

          if (!styleSheet.current) {
            styleSheet.current = getStyleSheet(`.${pokemon?.types.at(0)?.toLowerCase()}`);
          }

          let fmoveData = item.moveset.at(0),
            cMoveDataPri = item.moveset.at(1),
            cMoveDataSec = item.moveset.at(2);
          if (fmoveData?.includes('HIDDEN_POWER')) {
            fmoveData = 'HIDDEN_POWER';
          }
          if (cMoveDataPri === 'FUTURE_SIGHT') {
            cMoveDataPri = 'FUTURESIGHT';
          }
          if (cMoveDataSec === 'FUTURE_SIGHT') {
            cMoveDataSec = 'FUTURESIGHT';
          }
          if (cMoveDataPri === 'TECHNO_BLAST_DOUSE') {
            cMoveDataPri = 'TECHNO_BLAST_WATER';
          }
          if (cMoveDataSec === 'TECHNO_BLAST_DOUSE') {
            cMoveDataSec = 'TECHNO_BLAST_WATER';
          }

          let fmove: any = dataStore?.combat?.find((item: { name: string }) => item.name === fmoveData);
          const cmovePri = dataStore?.combat?.find((item: { name: string }) => item.name === cMoveDataPri);
          let cmoveSec;
          if (cMoveDataSec) {
            cmoveSec = dataStore?.combat?.find((item: { name: string }) => item.name === cMoveDataSec);
          }

          if (item.moveset.at(0)?.includes('HIDDEN_POWER')) {
            fmove = { ...fmove, type: item.moveset.at(0)?.split('_').at(2) };
          }

          let combatPoke: any = dataStore?.pokemonCombat?.filter(
            (item) => item.id === pokemon?.num && item.baseSpecies === convertName(pokemon?.baseSpecies ?? pokemon?.name)
          );
          const result = combatPoke?.find((item: { name: string }) => item.name === convertName(pokemon?.name));
          if (!result) {
            if (combatPoke) {
              combatPoke = combatPoke.at(0);
            } else {
              combatPoke = combatPoke?.find((item: { BASE_SPECIES: string }) => item.BASE_SPECIES === convertName(pokemon?.name));
            }
          } else {
            combatPoke = result;
          }

          return {
            ...item,
            id,
            name,
            form,
            pokemon,
            stats,
            atk: statsRanking.attack.ranking.find((i) => i.attack === stats.atk),
            def: statsRanking.defense.ranking.find((i) => i.defense === stats.def),
            sta: statsRanking.stamina.ranking.find((i) => i.stamina === (stats?.sta ?? 0)),
            prod: statsRanking.statProd.ranking.find((i) => i.prod === stats.atk * stats.def * (stats?.sta ?? 0)),
            fmove,
            cmovePri,
            cmoveSec,
            combatPoke,
            shadow: item.speciesName.includes('(Shadow)'),
            purified: combatPoke.purifiedMoves.includes(cmovePri) || (cMoveDataSec && combatPoke.purifiedMoves.includes(cMoveDataSec)),
          };
        });
        setRankingData(file);
        setStoreStats(file.map(() => false));
        dispatch(hideSpinner());
      } catch (e: any) {
        APIService.getAxios().CancelToken.source().cancel();
        dispatch(
          showSpinner({
            error: true,
            msg: e.message,
          })
        );
      }
    };
    if (router.action === Action.Push) {
      dispatch(showSpinner());
      router.action = null as any;
      setTimeout(() => fetchPokemon(), 100);
    } else if (!rankingData && pvp) {
      fetchPokemon();
    } else {
      dispatch(showSpinner());
    }
  }, [dispatch, params.serie, params.cp, params.type, rankingData, pvp, router.action]);

  const renderItem = (data: any, key: string) => {
    return (
      <Accordion.Item eventKey={key}>
        <Accordion.Header
          onClick={() => {
            if (!storeStats[key]) {
              setStoreStats(update(storeStats, { [key]: { $set: true } }));
            }
          }}
        >
          <div className="d-flex align-items-center w-100" style={{ gap: '1rem' }}>
            <Link to={`/pvp/${params.cp}/overall/${data.speciesId.replaceAll('_', '-')}`}>
              <VisibilityIcon className="view-pokemon" fontSize="large" sx={{ color: 'black' }} />
            </Link>
            <div className="d-flex justify-content-center">
              <span className="position-relative" style={{ width: 50 }}>
                {data.shadow && <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />}
                {data.purified && <img height={28} alt="img-purified" className="shadow-icon" src={APIService.getPokePurified()} />}
                <img
                  alt="img-league"
                  className="pokemon-sprite-accordion"
                  src={data.form ? APIService.getPokemonModel(data.form) : APIService.getPokeFullSprite(data.id)}
                />
              </span>
            </div>
            <div className="ranking-group w-100">
              <b>{`#${data.id} ${splitAndCapitalize(data.name, '-', ' ')}`}</b>
              <div style={{ marginRight: 15 }}>
                <span className="ranking-score score-ic">{data.score}</span>
              </div>
            </div>
          </div>
        </Accordion.Header>
        <Accordion.Body
          style={{
            padding: 0,
            backgroundImage: computeBgType(data.pokemon.types, data.shadow, data.purified, 0.8, styleSheet.current),
          }}
        >
          {storeStats[key] && (
            <Fragment>
              <div className="pokemon-ranking-body ranking-body">
                <div className="w-100 ranking-info element-top">
                  <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
                    <h3 className="text-white text-shadow">
                      <b>
                        #{data.id} {splitAndCapitalize(data.name, '-', ' ')}
                      </b>
                    </h3>
                    <TypeInfo shadow={true} block={true} color={'white'} arr={data.pokemon.types} />
                  </div>
                  <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
                    Recommend Moveset in PVP
                  </h6>
                  <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Fast Move"
                      color={'white'}
                      move={data.fmove}
                      elite={data.combatPoke.cinematicMoves.includes(data.fmove.name)}
                    />
                    <TypeBadge
                      grow={true}
                      find={true}
                      title="Primary Charged Move"
                      color={'white'}
                      move={data.cmovePri}
                      elite={data.combatPoke.eliteCinematicMoves.includes(data.cmovePri.name)}
                      shadow={data.combatPoke.shadowMoves.includes(data.cmovePri.name)}
                      purified={data.combatPoke.purifiedMoves.includes(data.cmovePri.name)}
                    />
                    {data.cmoveSec && (
                      <TypeBadge
                        grow={true}
                        find={true}
                        title="Secondary Charged Move"
                        color={'white'}
                        move={data.cmoveSec}
                        elite={data.combatPoke.eliteCinematicMoves.includes(data.cmoveSec.name)}
                        shadow={data.combatPoke.shadowMoves.includes(data.cmoveSec.name)}
                        purified={data.combatPoke.purifiedMoves.includes(data.cmoveSec.name)}
                      />
                    )}
                  </div>
                  <hr />
                  {Keys(dataStore?.assets ?? [], Object.values(dataStore?.pokemonData ?? []), data, params.cp, params.type)}
                </div>
                <div className="container">
                  <hr />
                </div>
                <div className="stats-container">{OverAllStats(data, statsRanking, params.cp)}</div>
                <div className="container">
                  <hr />
                  {TypeEffective(data.pokemon.types)}
                </div>
                <div className="container">{MoveSet(data.moves, data.combatPoke, dataStore?.combat ?? [])}</div>
              </div>
              <LeaveToggle eventKey={key} />
            </Fragment>
          )}
        </Accordion.Body>
      </Accordion.Item>
    );
  };

  const renderLeague = () => {
    const cp = parseInt(params.cp);
    const league = pvp?.rankings.find((item) => item.id === params.serie && item.cp.includes(cp));
    return (
      <Fragment>
        {league && (
          <div className="d-flex flex-wrap align-items-center element-top" style={{ columnGap: 10 }}>
            <img
              alt="img-league"
              width={64}
              height={64}
              src={
                !league.logo
                  ? cp === 500
                    ? APIService.getPokeOtherLeague('GBL_littlecup')
                    : cp === 1500
                    ? APIService.getPokeLeague('great_league')
                    : cp === 2500
                    ? APIService.getPokeLeague('ultra_league')
                    : APIService.getPokeLeague('master_league')
                  : APIService.getAssetPokeGo(league.logo)
              }
            />
            <h2>
              <b>
                {league.name === 'All'
                  ? cp === 500
                    ? 'Little Cup'
                    : cp === 1500
                    ? 'Great league'
                    : cp === 2500
                    ? 'Ultra league'
                    : 'Master league'
                  : league.name}
              </b>
            </h2>
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {rankingData && storeStats && (
        <div className="container pvp-container element-bottom">
          {renderLeague()}
          <hr />
          <div className="element-top ranking-link-group">
            {scoreType.map((type, index) => (
              <Button
                key={index}
                className={params.type.toLowerCase() === type.toLowerCase() ? 'active' : ''}
                onClick={() => navigate(`/pvp/rankings/${params.serie}/${params.cp}/${type.toLowerCase()}`)}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="input-group border-input">
            <input
              type="text"
              className="form-control input-search"
              placeholder="Enter Name or ID"
              defaultValue={search}
              onKeyUp={(e: any) => setSearch(e.target.value)}
            />
          </div>
          <div className="ranking-container">
            <div className="ranking-group w-100 ranking-header" style={{ columnGap: '1rem' }}>
              <div />
              <div className="d-flex" style={{ marginRight: 15 }}>
                <div
                  className="text-center"
                  style={{ width: 'max-content' }}
                  onClick={() => {
                    setSorted(!sorted);
                  }}
                >
                  <span className={'ranking-sort ranking-score' + (sortedBy.current === 'score' ? ' ranking-selected' : '')}>
                    Score
                    {sorted ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
                  </span>
                </div>
              </div>
            </div>
            <Accordion alwaysOpen={true}>
              {rankingData
                .filter(
                  (pokemon: { speciesId: string; speciesName: string; id: number }) =>
                    splitAndCapitalize(convertNameRankingToOri(pokemon.speciesId, pokemon.speciesName), '-', ' ')
                      .toLowerCase()
                      .includes(search.toLowerCase()) || pokemon.id.toString().includes(search)
                )
                .sort((a: { [x: string]: number }, b: { [x: string]: number }) =>
                  sorted ? b[sortedBy.current] - a[sortedBy.current] : a[sortedBy.current] - b[sortedBy.current]
                )
                .map((value: any, index: string) => (
                  <Fragment key={index}>{renderItem(value, index)}</Fragment>
                ))}
            </Accordion>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default RankingPVP;
