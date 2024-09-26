import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import TypeEffectiveSelect from '../../components/Effective/TypeEffectiveSelect';
import Stats from '../../components/Info/Stats/Stats';
import Hexagon from '../../components/Sprites/Hexagon/Hexagon';
import IVBar from '../../components/Sprites/IVBar/IVBar';
import TypeInfo from '../../components/Sprites/Type/Type';
import APIService from '../../services/API.service';
import { calculateCP, calStatsProd } from '../../util/calculate';
import { computeBgType, findAssetForm } from '../../util/compute';
import {
  convertNameRankingToForm,
  convertNameRankingToOri,
  getAllMoves,
  replaceTempMovePvpName,
  splitAndCapitalize,
} from '../../util/utils';

import CircleIcon from '@mui/icons-material/Circle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import StairsIcon from '@mui/icons-material/Stairs';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import BoltIcon from '@mui/icons-material/Bolt';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import SpokeIcon from '@mui/icons-material/Spoke';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import PersonIcon from '@mui/icons-material/Person';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../components/Popover/PopoverConfig';
import CandyXL from '../../components/Sprites/Candy/CandyXL';
import { IStatsRank, IStatsBase, HexagonStats } from '../../core/models/stats.model';
import { IAsset } from '../../core/models/asset.model';
import { IPokemonData } from '../../core/models/pokemon.model';
import { Combat, ICombat } from '../../core/models/combat.model';
import { FORM_NORMAL, MAX_IV, MAX_LEVEL } from '../../util/constants';
import { IMovePokemonRanking, PokemonVersus, RankingsPVP } from '../../core/models/pvp.model';
import { IPokemonBattleRanking } from './models/battle.model';
import { BattleBaseStats } from '../../util/models/calculate.model';
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';
import { combineClasses, getValueOrDefault, isEqual, isInclude, isIncludeList, toNumber } from '../../util/extension';
import { EffectiveType } from './enums/type-eff.enum';
import { ArcheType } from './enums/arche-type.enum';

export const Header = (data: IPokemonBattleRanking | undefined) => {
  return (
    <Fragment>
      <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
        {data && (
          <h3 className="text-white text-shadow">
            <b>
              #{data.id} {splitAndCapitalize(data.name, '-', ' ')}
            </b>
          </h3>
        )}
        <TypeInfo shadow={true} block={true} color="white" arr={data?.pokemon?.types} />
      </div>
      <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
        Recommend Moveset in PVP
      </h6>
      <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
        <TypeBadge
          grow={true}
          find={true}
          title="Fast Move"
          color="white"
          move={data?.fMove}
          elite={isIncludeList(data?.pokemon?.cinematicMoves, data?.fMove?.name)}
          unavailable={data?.fMove && !isIncludeList(getAllMoves(data.pokemon), data.fMove.name)}
        />
        <TypeBadge
          grow={true}
          find={true}
          title="Primary Charged Move"
          color="white"
          move={data?.cMovePri}
          elite={isIncludeList(data?.pokemon?.eliteCinematicMove, data?.cMovePri?.name)}
          shadow={isIncludeList(data?.pokemon?.shadowMoves, data?.cMovePri?.name)}
          purified={isIncludeList(data?.pokemon?.purifiedMoves, data?.cMovePri?.name)}
          special={isIncludeList(data?.pokemon?.specialMoves, data?.cMovePri?.name)}
          unavailable={data?.cMovePri && !isIncludeList(getAllMoves(data.pokemon), data.cMovePri.name)}
        />
        {data?.cMoveSec && (
          <TypeBadge
            grow={true}
            find={true}
            title="Secondary Charged Move"
            color="white"
            move={data.cMoveSec}
            elite={isIncludeList(data.pokemon?.eliteCinematicMove, data.cMoveSec.name)}
            shadow={isIncludeList(data.pokemon?.shadowMoves, data.cMoveSec.name)}
            purified={isIncludeList(data.pokemon?.purifiedMoves, data.cMoveSec.name)}
            special={isIncludeList(data.pokemon?.specialMoves, data.cMoveSec.name)}
            unavailable={!isIncludeList(getAllMoves(data.pokemon), data.cMoveSec.name)}
          />
        )}
      </div>
    </Fragment>
  );
};

export const Body = (
  assets: IAsset[],
  pokemonData: IPokemonData[],
  data: RankingsPVP | undefined,
  cp: string | undefined,
  type: string | undefined
) => {
  const renderItemList = (data: PokemonVersus, bgType: number) => {
    const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
    const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.slug, name));
    const id = pokemon?.num;
    const form = findAssetForm(assets, pokemon?.num, pokemon?.forme ?? FORM_NORMAL);

    return (
      <Link
        to={`/pvp/${cp}/${type}/${data.opponent.replaceAll('_', '-')}`}
        className="list-item-ranking"
        style={{ backgroundImage: computeBgType(pokemon?.types, isInclude(data.opponent, '_shadow')) }}
      >
        <div className="container d-flex align-items-center" style={{ columnGap: 10 }}>
          <div className="d-flex justify-content-center">
            <span className="d-inline-block position-relative filter-shadow" style={{ width: 50 }}>
              {isInclude(data.opponent, '_shadow') && (
                <img height={28} alt="img-shadow" className="shadow-icon" src={APIService.getPokeShadow()} />
              )}
              <img
                alt="img-league"
                className="pokemon-sprite-accordion"
                src={form ? APIService.getPokemonModel(form) : APIService.getPokeFullSprite(id)}
              />
            </span>
          </div>
          <div>
            <b className="text-white text-shadow">
              #{id} {splitAndCapitalize(name, '-', ' ')}
            </b>
            <TypeInfo shadow={true} hideText={true} height={20} arr={pokemon?.types} />
          </div>
        </div>
        <div style={{ marginRight: 15 }}>
          <span
            className="ranking-score score-ic text-white text-shadow filter-shadow"
            style={{ backgroundColor: bgType === 0 ? 'lightgreen' : 'lightcoral' }}
          >
            {data.rating}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <div className="row" style={{ margin: 0 }}>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Matchups</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
          </div>
        </div>
        {data?.matchups
          .sort((a, b) => b.rating - a.rating)
          .map((matchup, index) => (
            <Fragment key={index}>{renderItemList(matchup, 0)}</Fragment>
          ))}
      </div>
      <div className="col-lg-6 element-top" style={{ padding: 0 }}>
        <div className="title-item-ranking">
          <h4 className="text-white text-shadow">Best Counters</h4>
          <div style={{ marginRight: 15 }}>
            <span className="ranking-score score-ic">Rating</span>
          </div>
        </div>
        {data?.counters
          .sort((a, b) => a.rating - b.rating)
          .map((counter, index) => (
            <Fragment key={index}>{renderItemList(counter, 1)}</Fragment>
          ))}
      </div>
    </div>
  );
};

export const OverAllStats = (data: IPokemonBattleRanking | undefined, statsRanking: IStatsRank | null, cp: string) => {
  const calculateStatsTopRank = (stats: IStatsBase | undefined, level = MAX_LEVEL) => {
    const maxCP = toNumber(cp);

    let calcCP = calculateCP(
      getValueOrDefault(Number, stats?.atk) + MAX_IV,
      getValueOrDefault(Number, stats?.def) + MAX_IV,
      getValueOrDefault(Number, stats?.sta) + MAX_IV,
      level
    );
    if (maxCP === 10000) {
      return BattleBaseStats.create({
        CP: isNaN(calcCP) ? 0 : calcCP,
        id: getValueOrDefault(Number, data?.id),
      });
    } else {
      let minCP = maxCP === 500 ? 0 : maxCP === 1500 ? 500 : maxCP === 2500 ? 1500 : 2500;
      if (isNaN(calcCP)) {
        calcCP = 0;
      }

      if (calcCP < minCP) {
        if (calcCP <= 500) {
          minCP = 0;
        } else if (calcCP <= 1500) {
          minCP = 500;
        } else if (calcCP <= 2500) {
          minCP = 1500;
        } else {
          minCP = 2500;
        }
      }
      const allStats = calStatsProd(
        getValueOrDefault(Number, stats?.atk),
        getValueOrDefault(Number, stats?.def),
        getValueOrDefault(Number, stats?.sta),
        minCP,
        maxCP
      );
      return allStats[allStats.length - 1];
    }
  };

  const renderTopStats = (stats: IStatsBase | undefined, id: number) => {
    const maxCP = toNumber(cp);
    const currStats = calculateStatsTopRank(stats);
    return (
      <ul className="element-top">
        <li className="element-top">
          CP:{' '}
          <b>
            {maxCP === 10000
              ? `${calculateStatsTopRank(stats, MAX_LEVEL - 1)?.CP}-${currStats?.CP}`
              : `${getValueOrDefault(Number, currStats?.CP)}`}
          </b>
        </li>
        <li className={getValueOrDefault(Number, currStats?.level) <= 40 ? 'element-top' : ''}>
          Level: <b>{maxCP === 10000 ? `${MAX_LEVEL - 1}-${MAX_LEVEL}` : `${getValueOrDefault(Number, currStats?.level)}`} </b>
          {(getValueOrDefault(Number, currStats?.level) > 40 || maxCP === 10000) && (
            <b>
              (
              <CandyXL id={id} style={{ filter: 'drop-shadow(1px 1px 1px black)' }} />
              XL Candy required)
            </b>
          )}
        </li>
        <li className="element-top">
          <IVBar title="Attack" iv={maxCP === 10000 ? MAX_IV : getValueOrDefault(Number, currStats?.IV?.atk)} style={{ maxWidth: 500 }} />
          <IVBar title="Defense" iv={maxCP === 10000 ? MAX_IV : getValueOrDefault(Number, currStats?.IV?.def)} style={{ maxWidth: 500 }} />
          <IVBar title="HP" iv={maxCP === 10000 ? MAX_IV : getValueOrDefault(Number, currStats?.IV?.sta)} style={{ maxWidth: 500 }} />
        </li>
      </ul>
    );
  };

  return (
    <div className="row w-100" style={{ margin: 0 }}>
      {data?.data?.scores && (
        <div className="col-lg-4 d-flex justify-content-center" style={{ padding: 10 }}>
          <div>
            <h5>
              <b>Overall Performance</b>
            </h5>
            <Hexagon
              animation={0}
              borderSize={320}
              size={180}
              stats={HexagonStats.create({
                lead: getValueOrDefault(Number, data.data.scores.at(0)),
                atk: getValueOrDefault(Number, data.data.scores.at(4)),
                cons: getValueOrDefault(Number, data.data.scores.at(5)),
                closer: getValueOrDefault(Number, data.data.scores.at(1)),
                charger: getValueOrDefault(Number, data.data.scores.at(3)),
                switching: getValueOrDefault(Number, data.data.scores.at(2)),
              })}
            />
          </div>
        </div>
      )}
      <div className={combineClasses(data?.data?.scores ? 'col-lg-8' : '', 'container status-ranking')}>
        <div>
          <h5>
            <b>Overall Stats</b>
          </h5>
          <Stats
            statATK={data?.atk}
            statDEF={data?.def}
            statSTA={data?.sta}
            statProd={data?.prod}
            pokemonStats={statsRanking}
            id={data?.pokemon?.num}
            form={getValueOrDefault(String, data?.pokemon?.forme)}
          />
        </div>
        <div>
          <h5>
            <b>Top Rank League</b>
          </h5>
          {renderTopStats(data?.stats, getValueOrDefault(Number, data?.id))}
        </div>
      </div>
    </div>
  );
};

export const TypeEffective = (types: string[]) => {
  return (
    <div className="row text-white">
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center weakness-bg-text">
            <b>Weakness</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.WEAK} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center neutral-bg-text">
            <b>Neutral</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.NEUTRAL} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center resistance-bg-text">
            <b>Resistance</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.RESISTANCE} types={types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
    </div>
  );
};

export const MoveSet = (moves: IMovePokemonRanking | undefined, combatList: IPokemonData | undefined, combatData: ICombat[]) => {
  const findArchetype = (archetype: string) => {
    return Object.values(ArcheType).map((value, index) => (
      <Fragment key={index}>
        {isInclude(archetype, value) && !(isInclude(archetype, ArcheType.SelfDebuff) && value === ArcheType.Debuff) && (
          <div className="filter-shadow" title={value} key={index}>
            {value === ArcheType.General && <CircleIcon />}
            {value === ArcheType.Nuke && <RocketLaunchIcon sx={{ color: 'gray' }} />}
            {value === ArcheType.SpamBait && <BakeryDiningIcon sx={{ color: 'pink' }} />}
            {value === ArcheType.HighEnergy && <EnergySavingsLeafIcon sx={{ color: 'orange' }} />}
            {value === ArcheType.LowQuality && <StairsIcon sx={{ color: 'lightgray' }} />}
            {value === ArcheType.Debuff && <ArrowDownwardIcon sx={{ color: 'lightcoral' }} />}
            {value === ArcheType.Boost && <ArrowUpwardIcon sx={{ color: 'lightgreen' }} />}
            {value === ArcheType.FastCharge && <BoltIcon sx={{ color: '#f8d030' }} />}
            {value === ArcheType.HeavyDamage && <BrokenImageIcon sx={{ color: 'brown' }} />}
            {value === ArcheType.Multipurpose && <SpokeIcon sx={{ color: 'lightskyblue' }} />}
            {value === ArcheType.SelfDebuff && (
              <div className="position-relative">
                <PersonIcon sx={{ color: 'black' }} />
                <KeyboardDoubleArrowDownIcon fontSize="small" className="position-absolute" sx={{ color: 'red', left: '50%', bottom: 0 }} />
              </div>
            )}
          </div>
        )}
      </Fragment>
    ));
  };

  const findMove = (name: string, uses: number) => {
    const oldName = name;
    if (isInclude(name, 'HIDDEN_POWER')) {
      name = 'HIDDEN_POWER';
    }
    let move = combatData.find((move) => isEqual(move.name, name));
    if (move && isInclude(oldName, 'HIDDEN_POWER')) {
      move = Combat.create({ ...move, type: getValueOrDefault(String, oldName.split('_').at(2)) });
    }

    let elite = false;
    let special = false;
    if (isIncludeList(combatList?.eliteQuickMove, name)) {
      elite = true;
    }
    if (isIncludeList(combatList?.eliteCinematicMove, name)) {
      elite = true;
    }
    if (isIncludeList(combatList?.specialMoves, name)) {
      special = true;
    }

    return (
      <Link
        to={`/move/${move?.id}`}
        className={combineClasses(
          move?.type?.toLowerCase(),
          'filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'
        )}
      >
        <div className="d-flex" style={{ columnGap: 10 }}>
          <img
            className="filter-shadow"
            width={24}
            height={24}
            alt="img-pokemon"
            src={APIService.getTypeSprite(getValueOrDefault(String, move?.type))}
          />
          <span className="filter-shadow">
            {splitAndCapitalize(oldName, '_', ' ')} {(elite || special) && <b className="filter-shadow">*</b>}
          </span>
        </div>
        <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
          {move?.archetype && findArchetype(move.archetype)}
          <span className="ranking-score score-ic filter-shadow">{uses}</span>
        </div>
      </Link>
    );
  };

  const moveOverlay = () => {
    return (
      <OverlayTrigger
        placement="auto"
        overlay={
          <PopoverConfig id="popover-info-evo">
            <span className="info-evo">
              <span className="d-block caption">
                - <CircleIcon className="filter-shadow" sx={{ color: 'white' }} /> General
              </span>
              <span className="d-block caption">
                - <RocketLaunchIcon className="filter-shadow" sx={{ color: 'gray' }} /> Nuke
              </span>
              <span className="d-block caption">
                - <BakeryDiningIcon className="filter-shadow" sx={{ color: 'pink' }} /> Spam/Bait
              </span>
              <span className="d-block caption">
                - <EnergySavingsLeafIcon className="filter-shadow" sx={{ color: 'orange' }} /> High Energy
              </span>
              <span className="d-block caption">
                - <StairsIcon className="filter-shadow" sx={{ color: 'lightgray' }} /> Low Quality
              </span>
              <span className="d-block caption">
                - <ArrowDownwardIcon className="filter-shadow" sx={{ color: 'lightcoral' }} /> Debuff
              </span>
              <span className="d-block caption">
                - <ArrowUpwardIcon className="filter-shadow" sx={{ color: 'lightgreen' }} /> Boost
              </span>
              <span className="d-block caption">
                - <BoltIcon className="filter-shadow" sx={{ color: '#f8d030' }} /> Fast Charge
              </span>
              <span className="d-block caption">
                - <BrokenImageIcon className="filter-shadow" sx={{ color: 'brown' }} /> Heavy Damage
              </span>
              <span className="d-block caption">
                - <SpokeIcon className="filter-shadow" sx={{ color: 'lightskyblue' }} /> Multipurpose
              </span>
              <span className="d-block caption">
                -{' '}
                <span className="position-relative filter-shadow" style={{ marginRight: 5 }}>
                  <PersonIcon sx={{ color: 'black' }} />
                  <KeyboardDoubleArrowDownIcon
                    fontSize="small"
                    className="position-absolute"
                    sx={{ color: 'red', left: '50%', bottom: 0 }}
                  />
                </span>{' '}
                Self-Debuff
              </span>
            </span>
          </PopoverConfig>
        }
      >
        <span className="tooltips-info">
          <InfoOutlinedIcon color="primary" />
        </span>
      </OverlayTrigger>
    );
  };

  return (
    <div className="row" style={{ margin: 0 }}>
      <div className="col-xl-6" style={{ padding: 0, backgroundColor: 'lightgray' }}>
        <div className="moves-title">Fast Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {moves?.fastMoves
            .map((move) => {
              move.uses ??= 0;
              return move;
            })
            .sort((a, b) => getValueOrDefault(Number, b.uses) - getValueOrDefault(Number, a.uses))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, getValueOrDefault(Number, value.uses))}</Fragment>
            ))}
        </div>
      </div>
      <div className="col-xl-6" style={{ padding: 0, backgroundColor: 'lightgray' }}>
        <div className="moves-title">Charged Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {moves?.chargedMoves
            .map((move) => {
              move.moveId = replaceTempMovePvpName(move.moveId);
              if (!move.uses) {
                move.uses = 0;
              }
              return move;
            })
            .sort((a, b) => getValueOrDefault(Number, b.uses) - getValueOrDefault(Number, a.uses))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, getValueOrDefault(Number, value.uses))}</Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};
