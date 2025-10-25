import React, { Fragment, useEffect, useState } from 'react';
import { MoveSetComponent } from '../models/component.model';
import { OverlayTrigger } from 'react-bootstrap';
import CustomPopover from '../../../components/Commons/Popovers/CustomPopover';

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

import { combineClasses, isInclude, isNotEmpty, toNumber } from '../../../utils/extension';
import { getMoveType, replaceTempMovePvpName, splitAndCapitalize } from '../../../utils/utils';
import { ArcheType } from '../enums/arche-type.enum';
import { MoveType } from '../../../enums/type.enum';
import { PokemonRankingMove } from '../../../core/models/pvp.model';
import { IMoveSet, MoveSetModel } from '../models/move-set.model';
import { LinkToTop } from '../../../components/Link/LinkToTop';
import IconType from '../../../components/Sprites/Icon/Type/Type';
import useCombats from '../../../composables/useCombats';

const MoveSet = (props: MoveSetComponent) => {
  const { findMoveByName } = useCombats();
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
              <div className="tw-relative">
                <PersonIcon sx={{ color: 'black' }} />
                <KeyboardDoubleArrowDownIcon
                  fontSize="small"
                  className="tw-absolute"
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
        <CustomPopover id="popover-info">
          <span className="info-evo">
            <span className="tw-block caption">
              - <CircleIcon className="filter-shadow" sx={{ color: 'white' }} /> {ArcheType.General}
            </span>
            <span className="tw-block caption">
              - <RocketLaunchIcon className="filter-shadow" sx={{ color: 'gray' }} /> {ArcheType.Nuke}
            </span>
            <span className="tw-block caption">
              - <BakeryDiningIcon className="filter-shadow" sx={{ color: 'pink' }} /> {ArcheType.SpamBait}
            </span>
            <span className="tw-block caption">
              - <EnergySavingsLeafIcon className="filter-shadow" sx={{ color: 'orange' }} /> {ArcheType.HighEnergy}
            </span>
            <span className="tw-block caption">
              - <StairsIcon className="filter-shadow" sx={{ color: 'lightgray' }} /> {ArcheType.LowQuality}
            </span>
            <span className="tw-block caption">
              - <ArrowDownwardIcon className="filter-shadow" sx={{ color: 'lightcoral' }} /> {ArcheType.Debuff}
            </span>
            <span className="tw-block caption">
              - <ArrowUpwardIcon className="filter-shadow" sx={{ color: 'lightgreen' }} /> {ArcheType.Boost}
            </span>
            <span className="tw-block caption">
              - <BoltIcon className="filter-shadow" sx={{ color: '#f8d030' }} /> {ArcheType.FastCharge}
            </span>
            <span className="tw-block caption">
              - <BrokenImageIcon className="filter-shadow" sx={{ color: 'brown' }} /> {ArcheType.HeavyDamage}
            </span>
            <span className="tw-block caption">
              - <SpokeIcon className="filter-shadow" sx={{ color: 'lightskyblue' }} /> {ArcheType.Multipurpose}
            </span>
            <span className="tw-block caption">
              {'- '}
              <span className="tw-relative filter-shadow tw-mr-1">
                <PersonIcon sx={{ color: 'black' }} />
                <KeyboardDoubleArrowDownIcon
                  fontSize="small"
                  className="tw-absolute"
                  sx={{ color: 'red', left: '50%', bottom: 0 }}
                />
              </span>
              {` ${ArcheType.SelfDebuff}`}
            </span>
          </span>
        </CustomPopover>
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
        'filter-shadow-hover tw-text-white type-rank-item tw-flex tw-items-center tw-justify-between'
      )}
    >
      <div className="tw-flex tw-gap-x-2">
        <IconType width={24} height={24} alt="Pokémon GO Type Logo" type={move?.type} isBorder />
        <span className="filter-shadow">
          {splitAndCapitalize(move.name, '_', ' ')}{' '}
          {move.moveType !== MoveType.None && <b className="filter-shadow">*</b>}
        </span>
      </div>
      <div className="tw-flex tw-items-center tw-gap-x-2">
        {move?.archetype && findArchetype(move.archetype)}
        <span className="ranking-score score-ic tw-text-black filter-shadow">{move.uses}</span>
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
        const combat = findMoveByName(move.moveId);
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
    <div className="row !tw-m-0">
      <div className="xl:tw-w-1/2 moves-title-container !tw-p-0">
        <div className="moves-title tw-flex tw-items-center tw-justify-center tw-gap-2">
          <span>Fast Moves</span>
          {moveOverlay()}
        </div>
        <div className="type-rank-list">
          {fastMoves?.map((value, index) => (
            <Fragment key={index}>{renderMove(value)}</Fragment>
          ))}
        </div>
      </div>
      <div className="xl:tw-w-1/2 moves-title-container !tw-p-0">
        <div className="moves-title tw-flex tw-items-center tw-justify-center tw-gap-2">
          <span>Charged Moves</span>
          {moveOverlay()}
        </div>
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
