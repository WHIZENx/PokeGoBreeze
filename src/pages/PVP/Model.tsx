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
  getMoveType,
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
import { ICombat } from '../../core/models/combat.model';
import { MAX_IV, MAX_LEVEL } from '../../util/constants';
import { IMovePokemonRanking, PokemonVersus, RankingsPVP } from '../../core/models/pvp.model';
import { IPokemonBattleRanking } from './models/battle.model';
import { BattleBaseStats } from '../../util/models/calculate.model';
import TypeBadge from '../../components/Sprites/TypeBadge/TypeBadge';
import { combineClasses, isEqual, isInclude, toNumber } from '../../util/extension';
import { EffectiveType } from './enums/type-eff.enum';
import { ArcheType } from './enums/arche-type.enum';
import { BattleLeagueCPType } from '../../util/enums/compute.enum';
import { BackgroundType } from './enums/model-type.enum';
import { MoveType, PokemonType } from '../../enums/type.enum';

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
        <TypeInfo isShadow={true} isBlock={true} color="white" arr={data?.pokemon?.types} />
      </div>
      <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
        Recommend Moveset in PVP
      </h6>
      <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
        <TypeBadge
          isGrow={true}
          isFind={true}
          title="Fast Move"
          color="white"
          move={data?.fMove}
          moveType={getMoveType(data?.pokemon, data?.fMove?.name)}
        />
        <TypeBadge
          isGrow={true}
          isFind={true}
          title="Primary Charged Move"
          color="white"
          move={data?.cMovePri}
          moveType={getMoveType(data?.pokemon, data?.cMovePri?.name)}
        />
        {data?.cMoveSec && (
          <TypeBadge
            isGrow={true}
            isFind={true}
            title="Secondary Charged Move"
            color="white"
            move={data.cMoveSec}
            moveType={getMoveType(data.pokemon, data.cMoveSec.name)}
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
  const renderItemList = (data: PokemonVersus, bgType: BackgroundType) => {
    const name = convertNameRankingToOri(data.opponent, convertNameRankingToForm(data.opponent));
    const pokemon = pokemonData.find((pokemon) => isEqual(pokemon.slug, name));
    const id = pokemon?.num;
    const form = findAssetForm(assets, pokemon?.num, pokemon?.forme);

    return (
      <Link
        to={`/pvp/${cp}/${type}/${data.opponent.replaceAll('_', '-')}`}
        className="list-item-ranking"
        style={{
          backgroundImage: computeBgType(pokemon?.types, isInclude(data.opponent, '_shadow') ? PokemonType.Shadow : PokemonType.Normal),
        }}
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
            <TypeInfo isShadow={true} isHideText={true} height={20} arr={pokemon?.types} />
          </div>
        </div>
        <div style={{ marginRight: 15 }}>
          <span
            className="ranking-score score-ic text-white text-shadow filter-shadow"
            style={{ backgroundColor: bgType === BackgroundType.Matchup ? 'lightgreen' : 'lightcoral' }}
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
            <Fragment key={index}>{renderItemList(matchup, BackgroundType.Matchup)}</Fragment>
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
            <Fragment key={index}>{renderItemList(counter, BackgroundType.Counter)}</Fragment>
          ))}
      </div>
    </div>
  );
};

export const OverAllStats = (data: IPokemonBattleRanking | undefined, statsRanking: IStatsRank | null, cp: string | undefined) => {
  const calculateStatsTopRank = (stats: IStatsBase | undefined, level = MAX_LEVEL) => {
    const maxCP = toNumber(cp);

    const atk = toNumber(stats?.atk);
    const def = toNumber(stats?.def);
    const sta = toNumber(stats?.sta);
    let calcCP = calculateCP(atk + MAX_IV, def + MAX_IV, sta + MAX_IV, level);
    if (maxCP === BattleLeagueCPType.InsMaster) {
      return BattleBaseStats.create({
        CP: isNaN(calcCP) ? BattleLeagueCPType.Master : calcCP,
        id: toNumber(data?.id),
      });
    } else {
      let minCP =
        maxCP === BattleLeagueCPType.Little
          ? BattleLeagueCPType.Master
          : maxCP === BattleLeagueCPType.Great
          ? BattleLeagueCPType.Little
          : maxCP === BattleLeagueCPType.Ultra
          ? BattleLeagueCPType.Great
          : BattleLeagueCPType.Ultra;
      if (isNaN(calcCP)) {
        calcCP = BattleLeagueCPType.Master;
      }

      if (calcCP < minCP) {
        if (calcCP <= BattleLeagueCPType.Little) {
          minCP = 0;
        } else if (calcCP <= BattleLeagueCPType.Great) {
          minCP = BattleLeagueCPType.Little;
        } else if (calcCP <= BattleLeagueCPType.Ultra) {
          minCP = BattleLeagueCPType.Great;
        } else {
          minCP = BattleLeagueCPType.Ultra;
        }
      }
      const allStats = calStatsProd(atk, def, sta, minCP, maxCP);
      return allStats[allStats.length - 1];
    }
  };

  const renderTopStats = (stats: IStatsBase | undefined, id: number | undefined) => {
    const maxCP = toNumber(cp);
    const currStats = calculateStatsTopRank(stats);
    const level = toNumber(currStats?.level);
    return (
      <ul className="element-top">
        <li className="element-top">
          CP:{' '}
          <b>
            {maxCP === BattleLeagueCPType.InsMaster
              ? `${calculateStatsTopRank(stats, MAX_LEVEL - 1)?.CP}-${currStats?.CP}`
              : `${toNumber(currStats?.CP)}`}
          </b>
        </li>
        <li className={level <= 40 ? 'element-top' : ''}>
          Level: <b>{maxCP === BattleLeagueCPType.InsMaster ? `${MAX_LEVEL - 1}-${MAX_LEVEL}` : `${level}`} </b>
          {(level > 40 || maxCP === BattleLeagueCPType.InsMaster) && (
            <b>
              (
              <CandyXL id={id} style={{ filter: 'drop-shadow(1px 1px 1px black)' }} />
              XL Candy required)
            </b>
          )}
        </li>
        <li className="element-top">
          <IVBar title="Attack" iv={maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : currStats?.IV?.atk} style={{ maxWidth: 500 }} />
          <IVBar title="Defense" iv={maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : currStats?.IV?.def} style={{ maxWidth: 500 }} />
          <IVBar title="HP" iv={maxCP === BattleLeagueCPType.InsMaster ? MAX_IV : currStats?.IV?.sta} style={{ maxWidth: 500 }} />
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
                lead: toNumber(data.data.scores.at(0)),
                atk: toNumber(data.data.scores.at(4)),
                cons: toNumber(data.data.scores.at(5)),
                closer: toNumber(data.data.scores.at(1)),
                charger: toNumber(data.data.scores.at(3)),
                switching: toNumber(data.data.scores.at(2)),
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
            form={data?.pokemon?.forme}
          />
        </div>
        <div>
          <h5>
            <b>Top Rank League</b>
          </h5>
          {renderTopStats(data?.stats, data?.id)}
        </div>
      </div>
    </div>
  );
};

export const TypeEffective = (types: string[] | undefined) => {
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
  const findArchetype = (archetype: ArcheType) => {
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

  const findMove = (name: string, uses: number | null | undefined) => {
    const move = combatData.find((move) => isEqual(move.name, name));
    const moveType = getMoveType(combatList, name);

    return (
      <Link
        to={`/move/${move?.id}`}
        className={combineClasses(
          move?.type?.toLowerCase(),
          'filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'
        )}
      >
        <div className="d-flex" style={{ columnGap: 10 }}>
          <img className="filter-shadow" width={24} height={24} alt="img-pokemon" src={APIService.getTypeSprite(move?.type)} />
          <span className="filter-shadow">
            {splitAndCapitalize(name, '_', ' ')} {moveType !== MoveType.None && <b className="filter-shadow">*</b>}
          </span>
        </div>
        <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
          {move?.archetype && findArchetype(move.archetype)}
          <span className="ranking-score score-ic filter-shadow">{toNumber(uses)}</span>
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
            .sort((a, b) => toNumber(b.uses) - toNumber(a.uses))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, value.uses)}</Fragment>
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
            .sort((a, b) => toNumber(b.uses) - toNumber(a.uses))
            .map((value, index) => (
              <Fragment key={index}>{findMove(value.moveId, value.uses)}</Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};
