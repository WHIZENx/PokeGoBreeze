import React, { Fragment, useEffect, useState } from 'react';
import { MoveSetComponent } from '../models/component.model';
import { OverlayTrigger } from 'react-bootstrap';
import PopoverConfig from '../../../components/Popover/PopoverConfig';

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

import { combineClasses, isEqual, isInclude, isNotEmpty, toNumber } from '../../../util/extension';
import { getMoveType, replaceTempMovePvpName, splitAndCapitalize } from '../../../util/utils';
import { ArcheType } from '../enums/arche-type.enum';
import { MoveType } from '../../../enums/type.enum';
import { PokemonRankingMove } from '../../../core/models/pvp.model';
import { IMoveSet, MoveSetModel } from '../models/move-set.model';
import { LinkToTop } from '../../../util/hooks/LinkToTop';
import IconType from '../../../components/Sprites/Icon/Type/Type';

const MoveSet = (props: MoveSetComponent) => {
  const [fastMoves, setFastMoves] = useState<IMoveSet[]>();
  const [chargedMoves, setChargedMoves] = useState<IMoveSet[]>();

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
                <KeyboardDoubleArrowDownIcon
                  fontSize="small"
                  className="position-absolute"
                  sx={{ color: 'red', left: '50%', bottom: 0 }}
                />
              </div>
            )}
          </div>
        )}
      </Fragment>
    ));
  };

  const moveOverlay = () => (
    <OverlayTrigger
      placement="auto"
      overlay={
        <PopoverConfig id="popover-info">
          <span className="info-evo">
            <span className="d-block caption">
              - <CircleIcon className="filter-shadow" sx={{ color: 'white' }} /> {ArcheType.General}
            </span>
            <span className="d-block caption">
              - <RocketLaunchIcon className="filter-shadow" sx={{ color: 'gray' }} /> {ArcheType.Nuke}
            </span>
            <span className="d-block caption">
              - <BakeryDiningIcon className="filter-shadow" sx={{ color: 'pink' }} /> {ArcheType.SpamBait}
            </span>
            <span className="d-block caption">
              - <EnergySavingsLeafIcon className="filter-shadow" sx={{ color: 'orange' }} /> {ArcheType.HighEnergy}
            </span>
            <span className="d-block caption">
              - <StairsIcon className="filter-shadow" sx={{ color: 'lightgray' }} /> {ArcheType.LowQuality}
            </span>
            <span className="d-block caption">
              - <ArrowDownwardIcon className="filter-shadow" sx={{ color: 'lightcoral' }} /> {ArcheType.Debuff}
            </span>
            <span className="d-block caption">
              - <ArrowUpwardIcon className="filter-shadow" sx={{ color: 'lightgreen' }} /> {ArcheType.Boost}
            </span>
            <span className="d-block caption">
              - <BoltIcon className="filter-shadow" sx={{ color: '#f8d030' }} /> {ArcheType.FastCharge}
            </span>
            <span className="d-block caption">
              - <BrokenImageIcon className="filter-shadow" sx={{ color: 'brown' }} /> {ArcheType.HeavyDamage}
            </span>
            <span className="d-block caption">
              - <SpokeIcon className="filter-shadow" sx={{ color: 'lightskyblue' }} /> {ArcheType.Multipurpose}
            </span>
            <span className="d-block caption">
              {'- '}
              <span className="position-relative filter-shadow me-1">
                <PersonIcon sx={{ color: 'black' }} />
                <KeyboardDoubleArrowDownIcon
                  fontSize="small"
                  className="position-absolute"
                  sx={{ color: 'red', left: '50%', bottom: 0 }}
                />
              </span>
              {` ${ArcheType.SelfDebuff}`}
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

  const renderMove = (move: IMoveSet) => (
    <LinkToTop
      to={`/move/${move?.id}`}
      className={combineClasses(
        move?.type?.toLowerCase(),
        'filter-shadow-hover text-white type-rank-item d-flex align-items-center justify-content-between'
      )}
    >
      <div className="d-flex" style={{ columnGap: 10 }}>
        <IconType width={24} height={24} alt="Pokémon GO Type Logo" type={move?.type} isBorder />
        <span className="filter-shadow">
          {splitAndCapitalize(move.name, '_', ' ')}{' '}
          {move.moveType !== MoveType.None && <b className="filter-shadow">*</b>}
        </span>
      </div>
      <div className="d-flex align-items-center" style={{ columnGap: 10 }}>
        {move?.archetype && findArchetype(move.archetype)}
        <span className="ranking-score score-ic text-black filter-shadow">{move.uses}</span>
      </div>
    </LinkToTop>
  );

  const setMoves = (moves: PokemonRankingMove[] | undefined) => {
    return moves
      ?.map((move) => {
        move.moveId = replaceTempMovePvpName(move.moveId);
        move.uses ??= 0;
        return move;
      })
      .sort((a, b) => toNumber(b.uses) - toNumber(a.uses))
      .map((move) => {
        const combat = props.combatData.find((m) => isEqual(m.name, move.moveId));
        if (combat) {
          combat.moveType = getMoveType(props.pokemon, move.moveId);
          return MoveSetModel.create({ ...combat, uses: toNumber(move.uses) });
        }
        return new MoveSetModel();
      })
      .filter((move) => move.id > 0);
  };

  useEffect(() => {
    setFastMoves(undefined);
    setChargedMoves(undefined);
  }, [props.pokemon?.num]);

  useEffect(() => {
    if (!isNotEmpty(fastMoves) && isNotEmpty(props.moves?.fastMoves)) {
      setFastMoves(setMoves(props.moves?.fastMoves));
    }
    if (!isNotEmpty(chargedMoves) && isNotEmpty(props.moves?.chargedMoves)) {
      setChargedMoves(setMoves(props.moves?.chargedMoves));
    }
  }, [fastMoves, chargedMoves, props.moves?.fastMoves, props.moves?.chargedMoves]);

  return (
    <div className="row m-0">
      <div className="col-xl-6 moves-title-container p-0">
        <div className="moves-title">Fast Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {fastMoves?.map((value, index) => (
            <Fragment key={index}>{renderMove(value)}</Fragment>
          ))}
        </div>
      </div>
      <div className="col-xl-6 moves-title-container p-0">
        <div className="moves-title">Charged Moves{moveOverlay()}</div>
        <div className="type-rank-list">
          {chargedMoves?.map((value, index) => (
            <Fragment key={index}>{renderMove(value)}</Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoveSet;
