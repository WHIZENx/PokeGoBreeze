import { ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';

export interface TimelineTapPauseGroup {
  start: number;
  end: number;
}

const chargedAttackPauseTypes = new Set([
  AttackType.Spin,
  AttackType.Prepare,
  AttackType.Charge,
  AttackType.Block,
  AttackType.New,
]);

const isChargedAttackStep = (entry: ITimeline | undefined) =>
  entry?.type !== undefined && chargedAttackPauseTypes.has(entry.type);

export const getTimelineTapPauseGroups = (timeline: ITimeline[], opponentTimeline: ITimeline[]) => {
  const groups: TimelineTapPauseGroup[] = [];
  let current: TimelineTapPauseGroup | undefined;

  timeline.forEach((entry, index) => {
    const paused = !entry.isTap && (isChargedAttackStep(entry) || isChargedAttackStep(opponentTimeline[index]));
    if (paused) {
      if (current) {
        current.end = index;
      } else {
        current = { start: index, end: index };
        groups.push(current);
      }
      return;
    }
    current = undefined;
  });

  return groups;
};

export const getTimelineTapPauseWidth = (timeline: ITimeline[], group: TimelineTapPauseGroup, gap = 0) =>
  timeline
    .slice(group.start, group.end + 1)
    .reduce((width, entry) => width + (Number(entry.size) || 0), gap * (group.end - group.start));
