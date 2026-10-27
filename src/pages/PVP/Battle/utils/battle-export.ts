import { PokemonType, TypeAction } from '../../../../enums/type.enum';
import { getLocalTypeIcon, LocalPokemonGoUi } from '../../../../assets/local-ui-assets';
import { getBattleHp } from '../../utils/battle.utils';
import { IPokemonBattle, ITimeline } from '../../models/battle.model';
import { AttackType } from '../enums/attack-type.enum';

interface BattleExportOptions {
  leagueName: string;
  turnDurationSeconds: number;
  player: IPokemonBattle;
  opponent: IPokemonBattle;
  playerTeam?: IPokemonBattle[];
  opponentTeam?: IPokemonBattle[];
  playerTeamImageUrls?: string[][];
  opponentTeamImageUrls?: string[][];
}

interface BattleEventRow {
  turn: number;
  timeSeconds: number;
  playerAction: string;
  playerPokemon: string;
  playerMoveType?: string;
  playerState: string;
  opponentAction: string;
  opponentPokemon: string;
  opponentMoveType?: string;
  opponentState: string;
}

interface PokemonInfoLine {
  text: string;
  moveType?: string;
  scoreBadge?: string;
}

const canvasWidth = 1600;
const canvasPadding = 64;
const pokemonCardHeight = 330;
const colors = {
  background: '#0f172a',
  surface: '#172033',
  surfaceAlt: '#202c43',
  border: '#334155',
  text: '#f8fafc',
  muted: '#a8b3c7',
  player: '#38bdf8',
  opponent: '#fb7185',
  fast: '#60a5fa',
  charged: '#f59e0b',
  shield: '#a78bfa',
  result: '#34d399',
  danger: '#f87171',
};

const formatName = (value: string | undefined) =>
  (value ?? 'Unknown')
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');

const formatNumber = (value: number | undefined, digits = 0) =>
  Number.isFinite(value) ? Number(value).toFixed(digits) : '—';

const getOutcome = (timeline: ITimeline[]) => {
  const result = timeline.at(-1);
  if (result?.type === AttackType.Win || result?.outcome === 'win') {
    return 'WIN';
  }
  if (result?.type === AttackType.Dead || result?.outcome === 'lose') {
    return 'LOSE';
  }
  if (result?.type === AttackType.Timeout) {
    return result.outcome?.toUpperCase() ?? 'TIE';
  }
  return 'TIE';
};

const getBuffText = (entry: ITimeline) =>
  (entry.buff ?? [])
    .map((buff) => `${buff.type === TypeAction.Atk ? 'ATK' : 'DEF'} ${buff.power > 0 ? '+' : ''}${buff.power}`)
    .join(', ');

const getActionText = (entry: ITimeline | undefined) => {
  if (!entry) {
    return '—';
  }
  const move = entry.move?.name ? formatName(entry.move.name) : '';
  const buff = getBuffText(entry);
  const detail = [move, buff].filter(Boolean).join(' · ');
  const switchAction =
    entry.switchedFromIndex !== undefined && entry.type !== AttackType.Switch
      ? `Switch ${formatName(entry.switchedFromPokemonName)} → ${formatName(entry.pokemonName)}`
      : '';
  const switchPrefix = switchAction ? `${switchAction} · ` : '';
  switch (entry.type) {
    case AttackType.Fast:
      return `${switchPrefix}Fast: ${detail || 'Attack'}`;
    case AttackType.Prepare:
      return `${switchPrefix}Prepare charged move${detail ? `: ${detail}` : ''}`;
    case AttackType.Charge:
      return `${switchPrefix}Charged: ${detail || 'Attack'}`;
    case AttackType.Block:
      return `${switchPrefix}Shield`;
    case AttackType.Switch:
      return `${entry.faintedPokemonName ? `${formatName(entry.faintedPokemonName)} fainted · ` : ''}Switch to ${formatName(entry.pokemonName)}`;
    case AttackType.Dead:
      return 'Knocked out';
    case AttackType.Win:
      return 'Winner';
    case AttackType.Timeout:
      return `Time limit: ${entry.outcome?.toUpperCase() ?? 'TIE'}`;
    default:
      return switchAction || (entry.isTap ? 'Tap' : '—');
  }
};

const isReportableEvent = (entry: ITimeline | undefined) =>
  Boolean(
    entry &&
      (entry.type === AttackType.Fast ||
        entry.type === AttackType.Prepare ||
        entry.type === AttackType.Charge ||
        entry.type === AttackType.Block ||
        entry.type === AttackType.Switch ||
        entry.type === AttackType.Dead ||
        entry.type === AttackType.Win ||
        entry.type === AttackType.Timeout ||
        entry.switchedFromIndex !== undefined ||
        entry.buff?.length)
  );

export const createBattleEventRows = (
  playerTimeline: ITimeline[],
  opponentTimeline: ITimeline[],
  turnDurationSeconds: number,
  playerTeam: IPokemonBattle[] = [],
  opponentTeam: IPokemonBattle[] = []
) => {
  const rows: BattleEventRow[] = [];
  const length = Math.max(playerTimeline.length, opponentTimeline.length);
  for (let index = 0; index < length; index += 1) {
    const player = playerTimeline[index];
    const opponent = opponentTimeline[index];
    if (!isReportableEvent(player) && !isReportableEvent(opponent)) {
      continue;
    }
    const turn = Math.max(player?.timer ?? index, opponent?.timer ?? index);
    rows.push({
      turn,
      timeSeconds: turn * turnDurationSeconds,
      playerAction: getActionText(player),
      playerPokemon: formatName(playerTeam[player?.activeIndex ?? 0]?.pokemonData?.name),
      playerMoveType: player?.move?.type,
      playerState: player ? `HP ${Math.max(0, player.hp)} · E ${player.energy} · S ${player.block}` : '—',
      opponentAction: getActionText(opponent),
      opponentPokemon: formatName(opponentTeam[opponent?.activeIndex ?? 0]?.pokemonData?.name),
      opponentMoveType: opponent?.move?.type,
      opponentState: opponent ? `HP ${Math.max(0, opponent.hp)} · E ${opponent.energy} · S ${opponent.block}` : '—',
    });
  }
  return rows;
};

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 18
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
};

const fillRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  radius = 18
) => {
  context.fillStyle = color;
  roundedRect(context, x, y, width, height, radius);
  context.fill();
};

const drawText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { color?: string; font?: string; align?: CanvasTextAlign; maxWidth?: number } = {}
) => {
  context.fillStyle = options.color ?? colors.text;
  context.font = options.font ?? context.font;
  context.textAlign = options.align ?? 'left';
  context.textBaseline = 'alphabetic';
  context.fillText(text, x, y, options.maxWidth);
};

const loadImage = async (urls: string[] | undefined) => {
  for (const url of [...new Set(urls?.filter(Boolean) ?? [])]) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      URL.revokeObjectURL(objectUrl);
      return image;
    } catch {
      // Continue through the same fallback chain used by Pokémon images in the UI.
    }
  }
  return undefined;
};

const drawContainedImage = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  if (!image?.naturalWidth || !image.naturalHeight) {
    return;
  }
  const analysisCanvas = document.createElement('canvas');
  analysisCanvas.width = image.naturalWidth;
  analysisCanvas.height = image.naturalHeight;
  const analysisContext = analysisCanvas.getContext('2d', { willReadFrequently: true });
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = image.naturalWidth;
  let sourceHeight = image.naturalHeight;
  if (analysisContext) {
    analysisContext.drawImage(image, 0, 0);
    const pixels = analysisContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
    let minX = image.naturalWidth;
    let minY = image.naturalHeight;
    let maxX = -1;
    let maxY = -1;
    for (let pixel = 0; pixel < pixels.length; pixel += 4) {
      if (pixels[pixel + 3] <= 8) {
        continue;
      }
      const position = pixel / 4;
      const pixelX = position % image.naturalWidth;
      const pixelY = Math.floor(position / image.naturalWidth);
      minX = Math.min(minX, pixelX);
      minY = Math.min(minY, pixelY);
      maxX = Math.max(maxX, pixelX);
      maxY = Math.max(maxY, pixelY);
    }
    if (maxX >= minX && maxY >= minY) {
      sourceX = minX;
      sourceY = minY;
      sourceWidth = maxX - minX + 1;
      sourceHeight = maxY - minY + 1;
    }
  }
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
};

const pokemonInfoLines = (pokemon: IPokemonBattle) => {
  const data = pokemon.pokemonData;
  const stats = data?.currentStats;
  const calculated = stats?.stats;
  const types = data?.pokemon?.types?.map((type) => formatName(type)).join(' / ') || '—';
  const iv = stats?.IV;
  const moves = [pokemon.fMove, pokemon.cMovePri, pokemon.cMoveSec]
    .filter(Boolean)
    .map((move) => ({ name: formatName(move?.name), type: move?.type }));
  const meaningfulForm = data?.form
    ?.split(/[_-]/)
    .filter((part) => !['normal', 'shadow', 'purified'].includes(part.toLowerCase()))
    .join('_');
  const identity = [`#${data?.id ?? '—'}`, meaningfulForm ? formatName(meaningfulForm) : undefined, types]
    .filter(Boolean)
    .join(' · ');
  const lines: PokemonInfoLine[] = [
    { text: identity, scoreBadge: data?.score && data.score > 0 ? String(data.score) : undefined },
    {
      text: `CP ${formatNumber(stats?.CP)} · Level ${formatNumber(stats?.level, 1)} · IV ${iv ? `${iv.atkIV}/${iv.defIV}/${iv.staIV}` : '—'}`,
    },
    {
      text: `ATK ${formatNumber(calculated?.statATK, 1)} · DEF ${formatNumber(calculated?.statDEF, 1)} · HP ${formatNumber(getBattleHp(calculated?.statSTA))}`,
    },
    { text: `Start energy ${pokemon.energy} · Shields ${pokemon.block}` },
    ...moves.map((move, index) => ({
      text: `${index === 0 ? 'Fast' : `Charged ${index}`}: ${move.name}`,
      moveType: move.type,
    })),
  ];
  return lines;
};

const drawMoveTypeIcon = (
  context: CanvasRenderingContext2D,
  icons: Map<string, HTMLImageElement>,
  type: string | undefined,
  x: number,
  y: number,
  size: number
) => {
  const icon = type ? icons.get(type.toLowerCase()) : undefined;
  if (!icon) {
    return false;
  }
  context.drawImage(icon, x, y, size, size);
  return true;
};

const loadMoveTypeIcons = async (types: Array<string | undefined>) => {
  const uniqueTypes = [
    ...new Set(types.filter((type): type is string => Boolean(type)).map((type) => type.toLowerCase())),
  ];
  const entries = await Promise.all(
    uniqueTypes.map(async (type) => {
      const icon = await loadImage([getLocalTypeIcon(type)].filter((url): url is string => Boolean(url)));
      return [type, icon] as const;
    })
  );
  return new Map(entries.filter((entry): entry is readonly [string, HTMLImageElement] => Boolean(entry[1])));
};

const loadPokemonStatusIcons = async () => {
  const [shadow, purified] = await Promise.all([
    loadImage([LocalPokemonGoUi.shadow]),
    loadImage([LocalPokemonGoUi.purified]),
  ]);
  const entries: Array<[PokemonType, HTMLImageElement | undefined]> = [
    [PokemonType.Shadow, shadow],
    [PokemonType.Purified, purified],
  ];
  return new Map(entries.filter((entry): entry is [PokemonType, HTMLImageElement] => Boolean(entry[1])));
};

const drawPokemonCard = (
  context: CanvasRenderingContext2D,
  pokemon: IPokemonBattle,
  image: HTMLImageElement | undefined,
  battleState: string,
  x: number,
  y: number,
  width: number,
  accent: string,
  align: 'left' | 'right',
  fontFamily: string,
  typeIcons: Map<string, HTMLImageElement>,
  statusIcons: Map<PokemonType, HTMLImageElement>,
  slot: number
) => {
  const height = pokemonCardHeight;
  fillRoundedRect(context, x, y, width, height, colors.surface);
  context.strokeStyle = accent;
  context.lineWidth = 3;
  roundedRect(context, x, y, width, height);
  context.stroke();
  const imageX = align === 'left' ? x + 24 : x + width - 184;
  const textX = align === 'left' ? x + 202 : x + 24;
  const textWidth = width - 226;
  drawContainedImage(context, image, imageX, y + 52, 160, 160);
  const statusIcon = statusIcons.get(pokemon.pokemonType);
  if (statusIcon) {
    context.drawImage(statusIcon, imageX + 108, y + 160, 52, 52);
  }
  drawText(context, battleState, imageX + 80, y + 250, {
    color: battleState === 'FAINTED' ? colors.danger : colors.result,
    font: `700 28px ${fontFamily}`,
    align: 'center',
  });
  drawText(context, formatName(pokemon.pokemonData?.name), textX, y + 48, {
    color: accent,
    font: `700 30px ${fontFamily}`,
    maxWidth: textWidth,
  });
  pokemonInfoLines(pokemon).forEach((line, index) => {
    const lineY = y + 86 + index * 34;
    const hasIcon = drawMoveTypeIcon(context, typeIcons, line.moveType, textX, lineY - 21, 24);
    const lineTextX = textX + (hasIcon ? 34 : 0);
    const lineFont = `${index === 0 ? 600 : 400} 19px ${fontFamily}`;
    drawText(context, line.text, lineTextX, lineY, {
      color: index === 0 ? colors.text : colors.muted,
      font: lineFont,
      maxWidth: textWidth - (hasIcon ? 34 : 0),
    });
    if (line.scoreBadge) {
      context.font = `700 15px ${fontFamily}`;
      const badgeWidth = Math.max(38, context.measureText(line.scoreBadge).width + 18);
      context.font = lineFont;
      const badgeX = Math.min(lineTextX + context.measureText(line.text).width + 10, textX + textWidth - badgeWidth);
      fillRoundedRect(context, badgeX, lineY - 22, badgeWidth, 26, '#f8d030', 13);
      drawText(context, line.scoreBadge, badgeX + badgeWidth / 2, lineY - 4, {
        color: '#332b00',
        font: `700 15px ${fontFamily}`,
        align: 'center',
      });
    }
  });
  drawText(context, `Team slot ${slot}${slot === 1 ? ' · Lead' : ''}`, x + 24, y + 310, {
    color: colors.muted,
    font: `500 16px ${fontFamily}`,
    maxWidth: width - 48,
  });
};

const getTeamMemberFinalHp = (timeline: ITimeline[], pokemon: IPokemonBattle, teamIndex: number) => {
  const maxHp = getBattleHp(pokemon.pokemonData?.currentStats?.stats?.statSTA);
  if (timeline.some((entry) => entry.faintedIndex === teamIndex)) {
    return { hp: 0, maxHp };
  }
  const latest = timeline.findLast((entry) => (entry.activeIndex ?? 0) === teamIndex);
  return { hp: Math.max(0, latest?.hp ?? maxHp), maxHp };
};

const timelineColor = (entry: ITimeline | undefined) => {
  switch (entry?.type) {
    case AttackType.Fast:
      return colors.fast;
    case AttackType.Prepare:
    case AttackType.Charge:
      return colors.charged;
    case AttackType.Block:
      return colors.shield;
    case AttackType.Switch:
      return colors.player;
    case AttackType.Dead:
      return colors.danger;
    case AttackType.Win:
    case AttackType.Timeout:
      return colors.result;
    default:
      return colors.border;
  }
};

const drawTimelineLane = (
  context: CanvasRenderingContext2D,
  timeline: ITimeline[],
  x: number,
  y: number,
  width: number,
  maxTurn: number,
  accent: string
) => {
  fillRoundedRect(context, x, y, width, 42, colors.surfaceAlt, 8);
  timeline.forEach((entry, index) => {
    const turn = entry.timer ?? index;
    const nextTurn = timeline[index + 1]?.timer ?? turn + 1;
    const left = x + (turn / maxTurn) * width;
    const eventWidth = Math.max(2, ((nextTurn - turn) / maxTurn) * width);
    context.fillStyle = timelineColor(entry);
    context.fillRect(left, y + 4, eventWidth, 34);
  });
  context.strokeStyle = accent;
  context.lineWidth = 2;
  roundedRect(context, x, y, width, 42, 8);
  context.stroke();
};

const drawTeamTimelinePokemon = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  teamIndex: number,
  centerX: number,
  centerY: number,
  fainted: boolean,
  fontFamily: string
) => {
  context.fillStyle = colors.surface;
  context.beginPath();
  context.arc(centerX, centerY, 19, 0, Math.PI * 2);
  context.fill();
  if (image) {
    drawContainedImage(context, image, centerX - 16, centerY - 16, 32, 32);
  } else {
    drawText(context, String(teamIndex + 1), centerX, centerY + 6, {
      color: colors.text,
      font: `700 16px ${fontFamily}`,
      align: 'center',
    });
  }
  if (fainted) {
    context.strokeStyle = colors.danger;
    context.lineCap = 'round';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(centerX - 10, centerY - 10);
    context.lineTo(centerX + 10, centerY + 10);
    context.moveTo(centerX + 10, centerY - 10);
    context.lineTo(centerX - 10, centerY + 10);
    context.stroke();
  }
};

const drawTeamEventLane = (
  context: CanvasRenderingContext2D,
  timeline: ITimeline[],
  teamImages: Array<HTMLImageElement | undefined>,
  x: number,
  y: number,
  width: number,
  maxTurn: number,
  accent: string,
  fontFamily: string
) => {
  fillRoundedRect(context, x, y, width, 46, colors.surfaceAlt, 8);
  timeline.forEach((entry, index) => {
    const switched = entry.type === AttackType.Switch || entry.switchedFromIndex !== undefined;
    const fainted = entry.faintedIndex !== undefined || entry.type === AttackType.Dead;
    if (!switched && !fainted) {
      return;
    }
    const previousActiveIndex =
      timeline.slice(0, index).findLast((candidate) => candidate.activeIndex !== undefined)?.activeIndex ?? 0;
    const sourceIndex = entry.faintedIndex ?? entry.switchedFromIndex ?? previousActiveIndex;
    const targetIndex = entry.activeIndex ?? sourceIndex;
    const rawCenterX = x + ((entry.timer ?? index) / maxTurn) * width;
    const centerX = Math.max(x + 46, Math.min(x + width - 46, rawCenterX));
    const centerY = y + 23;
    context.strokeStyle = fainted ? colors.danger : accent;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX, y + 2);
    context.lineTo(centerX, y + 44);
    context.stroke();
    if (switched && targetIndex !== sourceIndex) {
      drawTeamTimelinePokemon(
        context,
        teamImages[sourceIndex],
        sourceIndex,
        centerX - 24,
        centerY,
        fainted,
        fontFamily
      );
      drawText(context, '→', centerX, centerY + 6, {
        color: fainted ? colors.danger : accent,
        font: `700 18px ${fontFamily}`,
        align: 'center',
      });
      drawTeamTimelinePokemon(context, teamImages[targetIndex], targetIndex, centerX + 24, centerY, false, fontFamily);
    } else {
      drawTeamTimelinePokemon(context, teamImages[sourceIndex], sourceIndex, centerX, centerY, true, fontFamily);
    }
  });
  context.strokeStyle = accent;
  context.lineWidth = 2;
  roundedRect(context, x, y, width, 46, 8);
  context.stroke();
};

const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) =>
  new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to generate battle image.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });

export const exportBattleReportImage = async ({
  leagueName,
  turnDurationSeconds,
  player,
  opponent,
  playerTeam = [player],
  opponentTeam = [opponent],
  playerTeamImageUrls,
  opponentTeamImageUrls,
}: BattleExportOptions) => {
  const safeTurnDuration = turnDurationSeconds > 0 ? turnDurationSeconds : 0.5;
  const events = createBattleEventRows(player.timeline, opponent.timeline, safeTurnDuration, playerTeam, opponentTeam);
  const maxTurn = Math.max(
    1,
    ...player.timeline.map((entry) => entry.timer),
    ...opponent.timeline.map((entry) => entry.timer)
  );
  const eventRowHeight = 62;
  const cardStartY = 190;
  const cardRowGap = 20;
  const teamRows = Math.max(1, playerTeam.length, opponentTeam.length);
  const teamSectionHeight = teamRows * pokemonCardHeight + (teamRows - 1) * cardRowGap;
  const timelineTitleY = cardStartY + teamSectionHeight + 58;
  const playerTimelineY = timelineTitleY + 20;
  const playerTeamEventY = timelineTitleY + 70;
  const opponentTimelineY = timelineTitleY + 128;
  const opponentTeamEventY = timelineTitleY + 178;
  const legendY = timelineTitleY + 244;
  const eventsTitleY = timelineTitleY + 328;
  const eventsHeaderY = eventsTitleY + 24;
  const eventRowsStartY = eventsHeaderY + 54;
  const canvasHeight = eventRowsStartY + Math.max(1, events.length) * eventRowHeight + canvasPadding;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is unavailable.');
  }

  const fontFamily = getComputedStyle(document.body).fontFamily || 'sans-serif';
  context.fillStyle = colors.background;
  context.fillRect(0, 0, canvasWidth, canvasHeight);
  context.font = `400 20px ${fontFamily}`;

  const [playerImages, opponentImages, typeIcons, statusIcons] = await Promise.all([
    Promise.all(playerTeam.map((_, index) => loadImage(playerTeamImageUrls?.[index]))),
    Promise.all(opponentTeam.map((_, index) => loadImage(opponentTeamImageUrls?.[index]))),
    loadMoveTypeIcons([
      ...playerTeam.flatMap((member) => [member.fMove?.type, member.cMovePri?.type, member.cMoveSec?.type]),
      ...opponentTeam.flatMap((member) => [member.fMove?.type, member.cMovePri?.type, member.cMoveSec?.type]),
      ...events.flatMap((event) => [event.playerMoveType, event.opponentMoveType]),
    ]),
    loadPokemonStatusIcons(),
  ]);
  drawText(context, 'PokéGO Breeze · Battle Report', canvasPadding, 78, {
    font: `700 40px ${fontFamily}`,
  });
  drawText(context, leagueName, canvasPadding, 116, {
    color: colors.muted,
    font: `500 22px ${fontFamily}`,
  });
  drawText(
    context,
    `Battle time ${(maxTurn * safeTurnDuration).toFixed(1)}s · ${maxTurn} turns · Exported ${new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    ).format(new Date())}`,
    canvasWidth - canvasPadding,
    116,
    { color: colors.muted, font: `400 18px ${fontFamily}`, align: 'right' }
  );

  const cardGap = 28;
  const cardWidth = (canvasWidth - canvasPadding * 2 - cardGap) / 2;
  drawText(context, `Player team · ${getOutcome(player.timeline)}`, canvasPadding, 166, {
    color: colors.player,
    font: `700 24px ${fontFamily}`,
  });
  drawText(context, `Opponent team · ${getOutcome(opponent.timeline)}`, canvasWidth - canvasPadding, 166, {
    color: colors.opponent,
    font: `700 24px ${fontFamily}`,
    align: 'right',
  });
  playerTeam.forEach((member, index) => {
    const { hp, maxHp } = getTeamMemberFinalHp(player.timeline, member, index);
    drawPokemonCard(
      context,
      member,
      playerImages[index],
      hp <= 0 ? 'FAINTED' : `HP ${hp}/${maxHp}`,
      canvasPadding,
      cardStartY + index * (pokemonCardHeight + cardRowGap),
      cardWidth,
      colors.player,
      'left',
      fontFamily,
      typeIcons,
      statusIcons,
      index + 1
    );
  });
  opponentTeam.forEach((member, index) => {
    const { hp, maxHp } = getTeamMemberFinalHp(opponent.timeline, member, index);
    drawPokemonCard(
      context,
      member,
      opponentImages[index],
      hp <= 0 ? 'FAINTED' : `HP ${hp}/${maxHp}`,
      canvasPadding + cardWidth + cardGap,
      cardStartY + index * (pokemonCardHeight + cardRowGap),
      cardWidth,
      colors.opponent,
      'right',
      fontFamily,
      typeIcons,
      statusIcons,
      index + 1
    );
  });

  drawText(context, 'Battle timeline', canvasPadding, timelineTitleY, { font: `700 28px ${fontFamily}` });
  drawText(context, 'Player actions', canvasPadding, playerTimelineY + 30, {
    color: colors.player,
    font: `600 18px ${fontFamily}`,
  });
  drawTimelineLane(
    context,
    player.timeline,
    canvasPadding + 190,
    playerTimelineY,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.player
  );
  drawText(context, 'Player switch / faint', canvasPadding, playerTeamEventY + 29, {
    color: colors.player,
    font: `600 16px ${fontFamily}`,
  });
  drawTeamEventLane(
    context,
    player.timeline,
    playerImages,
    canvasPadding + 190,
    playerTeamEventY,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.player,
    fontFamily
  );
  drawText(context, 'Opponent actions', canvasPadding, opponentTimelineY + 30, {
    color: colors.opponent,
    font: `600 18px ${fontFamily}`,
  });
  drawTimelineLane(
    context,
    opponent.timeline,
    canvasPadding + 190,
    opponentTimelineY,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.opponent
  );
  drawText(context, 'Opponent switch / faint', canvasPadding, opponentTeamEventY + 29, {
    color: colors.opponent,
    font: `600 16px ${fontFamily}`,
  });
  drawTeamEventLane(
    context,
    opponent.timeline,
    opponentImages,
    canvasPadding + 190,
    opponentTeamEventY,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.opponent,
    fontFamily
  );

  const legend = [
    ['Fast', colors.fast],
    ['Charged', colors.charged],
    ['Shield', colors.shield],
    ['Result', colors.result],
    ['Switch', colors.player],
    ['Faint', colors.danger],
  ];
  legend.forEach(([label, color], index) => {
    const x = canvasPadding + index * 170;
    context.fillStyle = color;
    context.fillRect(x, legendY, 28, 12);
    drawText(context, label, x + 38, legendY + 14, { color: colors.muted, font: `400 17px ${fontFamily}` });
  });

  drawText(context, 'Battle events', canvasPadding, eventsTitleY, { font: `700 28px ${fontFamily}` });
  fillRoundedRect(context, canvasPadding, eventsHeaderY, canvasWidth - canvasPadding * 2, 54, colors.surfaceAlt, 8);
  const columns = [
    canvasPadding + 20,
    canvasPadding + 145,
    canvasPadding + 570,
    canvasPadding + 860,
    canvasPadding + 1285,
  ];
  ['Time', 'Player action', 'State', 'Opponent action', 'State'].forEach((label, index) =>
    drawText(context, label, columns[index], eventsHeaderY + 34, {
      color: index === 1 ? colors.player : index === 3 ? colors.opponent : colors.text,
      font: `700 18px ${fontFamily}`,
    })
  );

  events.forEach((event, index) => {
    const y = eventRowsStartY + index * eventRowHeight;
    if (index % 2 === 0) {
      context.fillStyle = colors.surface;
      context.fillRect(canvasPadding, y, canvasWidth - canvasPadding * 2, eventRowHeight);
    }
    drawText(context, `${event.timeSeconds.toFixed(1)}s`, columns[0], y + 36, {
      color: colors.muted,
      font: `500 17px ${fontFamily}`,
    });
    const hasPlayerMoveIcon = drawMoveTypeIcon(context, typeIcons, event.playerMoveType, columns[1], y + 12, 22);
    drawText(context, event.playerAction, columns[1] + (hasPlayerMoveIcon ? 30 : 0), y + 28, {
      color: colors.text,
      font: `500 17px ${fontFamily}`,
      maxWidth: 405 - (hasPlayerMoveIcon ? 30 : 0),
    });
    drawText(context, `${event.playerPokemon} · Turn ${event.turn}`, columns[1], y + 49, {
      color: colors.muted,
      font: `400 14px ${fontFamily}`,
    });
    drawText(context, event.playerState, columns[2], y + 36, {
      color: colors.muted,
      font: `400 15px ${fontFamily}`,
      maxWidth: 270,
    });
    const hasOpponentMoveIcon = drawMoveTypeIcon(context, typeIcons, event.opponentMoveType, columns[3], y + 12, 22);
    drawText(context, event.opponentAction, columns[3] + (hasOpponentMoveIcon ? 30 : 0), y + 28, {
      color: colors.text,
      font: `500 17px ${fontFamily}`,
      maxWidth: 405 - (hasOpponentMoveIcon ? 30 : 0),
    });
    drawText(context, `${event.opponentPokemon} · Turn ${event.turn}`, columns[3], y + 49, {
      color: colors.muted,
      font: `400 14px ${fontFamily}`,
    });
    drawText(context, event.opponentState, columns[4], y + 36, {
      color: colors.muted,
      font: `400 15px ${fontFamily}`,
      maxWidth: 250,
    });
  });

  const playerName = formatName(player.pokemonData?.name).replaceAll(' ', '-').toLowerCase();
  const opponentName = formatName(opponent.pokemonData?.name).replaceAll(' ', '-').toLowerCase();
  const filename =
    playerTeam.length > 1 || opponentTeam.length > 1
      ? `pokego-team-battle-${playerTeam.length}v${opponentTeam.length}-${playerName}-vs-${opponentName}.png`
      : `pokego-battle-${playerName}-vs-${opponentName}.png`;
  await downloadCanvas(canvas, filename);
};
