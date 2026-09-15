import React, { useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HexagonIcon from '@mui/icons-material/Hexagon';
import { ICombat } from '../../core/models/combat.model';
import { PokemonType } from '../../enums/type.enum';
import type { TrainerBattleSimulatorApiResponse } from '../../services/models/tools-api.model';
import { TimelineElement } from '../../utils/models/overrides/dom.model';
import TimelineFit from '../PVP/Battle/Timeline/TimelineFit';
import { AttackType } from '../PVP/Battle/enums/attack-type.enum';
import { IPokemonBattle, ITimeline } from '../PVP/models/battle.model';
import '../PVP/PVP.scss';

type TrainerBattleEvent = TrainerBattleSimulatorApiResponse['data']['events'][number];

interface TrainerBattleTimelineProps {
  events: TrainerBattleEvent[];
  combats: ICombat[];
  durationSeconds: number;
  opponentLabel: string;
}

const normalize = (value?: string) => (value ?? '').toUpperCase().replaceAll('-', '_');

const eventType = (events: TrainerBattleEvent[]) => {
  if (events.some((event) => event.type === 'faint')) {
    return AttackType.Dead;
  }
  if (events.some((event) => event.type === 'shield')) {
    return AttackType.Block;
  }
  if (events.some((event) => event.type === 'charged')) {
    return AttackType.Charge;
  }
  return AttackType.New;
};

const ignoreTimelineMove: TimelineElement<HTMLDivElement> = () => undefined;

const TrainerBattleTimeline = ({ events, combats, durationSeconds, opponentLabel }: TrainerBattleTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const playLineRef = useRef<HTMLDivElement>(null);

  const moveByName = useMemo(() => new Map(combats.map((move) => [normalize(move.name), move])), [combats]);

  const turns = useMemo(() => {
    const grouped = new Map<number, TrainerBattleEvent[]>();
    events.forEach((event) => {
      grouped.set(event.turn, [...(grouped.get(event.turn) ?? []), event]);
    });
    return [...grouped.entries()].sort(([left], [right]) => left - right);
  }, [events]);

  const createTimeline = (side: TrainerBattleEvent['side']): ITimeline[] =>
    turns.map(([turn, turnEvents], index) => {
      const sideEvents = turnEvents.filter((event) => event.side === side);
      const chargedEvent = sideEvents.find((event) => event.type === 'charged');
      const move = chargedEvent?.move ? moveByName.get(normalize(chargedEvent.move)) : undefined;
      const previousTurn = turns[index - 1]?.[0] ?? turn;
      return {
        timer: turn / 2,
        size: Math.max(12, Math.min(30, (turn - previousTurn) * 1.5)),
        type: eventType(sideEvents),
        color: move?.type?.toLowerCase() ?? 'normal',
        move,
        block: sideEvents.some((event) => event.type === 'shield') ? 1 : 0,
        energy: 0,
        hp: 0,
      };
    });

  const createBattle = (side: TrainerBattleEvent['side']): IPokemonBattle => ({
    disableCMoveSec: false,
    disableCMovePri: false,
    pokemonType: PokemonType.Normal,
    timeline: createTimeline(side),
    energy: 0,
    block: 0,
    chargeSlot: 0,
  });

  const player = createBattle('player');
  const opponent = createBattle('opponent');

  return (
    <Box className="trainer-battle-timeline">
      <Box className="trainer-timeline-lanes">
        <Typography variant="caption" fontWeight={700}>
          You · upper lane
        </Typography>
        <Typography variant="caption" fontWeight={700}>
          {opponentLabel} · lower lane
        </Typography>
      </Box>
      {TimelineFit(player, opponent, timelineRef, playLineRef, ignoreTimelineMove, false)}
      <Box className="trainer-timeline-footer">
        <Typography variant="caption">0s</Typography>
        <Box className="trainer-timeline-legend">
          <span>
            <i className="trainer-legend-charge" /> Charged
          </span>
          <span>
            <HexagonIcon /> Shield
          </span>
          <span>
            <CloseIcon color="error" /> Fainted
          </span>
        </Box>
        <Typography variant="caption">{durationSeconds.toFixed(1)}s</Typography>
      </Box>
    </Box>
  );
};

export default TrainerBattleTimeline;
