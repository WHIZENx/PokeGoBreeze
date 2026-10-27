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
  playerImageUrls?: string[];
  opponentImageUrls?: string[];
}

interface BattleEventRow {
  turn: number;
  timeSeconds: number;
  playerAction: string;
  playerMoveType?: string;
  playerState: string;
  opponentAction: string;
  opponentMoveType?: string;
  opponentState: string;
}

interface PokemonInfoLine {
  text: string;
  moveType?: string;
}

const canvasWidth = 1600;
const canvasPadding = 64;
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
  switch (entry.type) {
    case AttackType.Fast:
      return `Fast: ${detail || 'Attack'}`;
    case AttackType.Prepare:
      return `Prepare charged move${detail ? `: ${detail}` : ''}`;
    case AttackType.Charge:
      return `Charged: ${detail || 'Attack'}`;
    case AttackType.Block:
      return 'Shield';
    case AttackType.Dead:
      return 'Knocked out';
    case AttackType.Win:
      return 'Winner';
    case AttackType.Timeout:
      return `Time limit: ${entry.outcome?.toUpperCase() ?? 'TIE'}`;
    default:
      return entry.isTap ? 'Tap' : '—';
  }
};

const isReportableEvent = (entry: ITimeline | undefined) =>
  Boolean(
    entry &&
      (entry.type === AttackType.Fast ||
        entry.type === AttackType.Prepare ||
        entry.type === AttackType.Charge ||
        entry.type === AttackType.Block ||
        entry.type === AttackType.Dead ||
        entry.type === AttackType.Win ||
        entry.type === AttackType.Timeout ||
        entry.buff?.length)
  );

export const createBattleEventRows = (
  playerTimeline: ITimeline[],
  opponentTimeline: ITimeline[],
  turnDurationSeconds: number
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
      playerMoveType: player?.move?.type,
      playerState: player ? `HP ${Math.max(0, player.hp)} · E ${player.energy} · S ${player.block}` : '—',
      opponentAction: getActionText(opponent),
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
    { text: identity },
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
  outcome: string,
  x: number,
  y: number,
  width: number,
  accent: string,
  align: 'left' | 'right',
  fontFamily: string,
  typeIcons: Map<string, HTMLImageElement>,
  statusIcons: Map<PokemonType, HTMLImageElement>
) => {
  const height = 330;
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
  drawText(context, outcome, imageX + 80, y + 250, {
    color: outcome === 'WIN' ? colors.result : outcome === 'LOSE' ? colors.danger : colors.muted,
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
    drawText(context, line.text, textX + (hasIcon ? 34 : 0), lineY, {
      color: index === 0 ? colors.text : colors.muted,
      font: `${index === 0 ? 600 : 400} 19px ${fontFamily}`,
      maxWidth: textWidth - (hasIcon ? 34 : 0),
    });
  });
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
  playerImageUrls,
  opponentImageUrls,
}: BattleExportOptions) => {
  const safeTurnDuration = turnDurationSeconds > 0 ? turnDurationSeconds : 0.5;
  const events = createBattleEventRows(player.timeline, opponent.timeline, safeTurnDuration);
  const maxTurn = Math.max(
    1,
    ...player.timeline.map((entry) => entry.timer),
    ...opponent.timeline.map((entry) => entry.timer)
  );
  const eventRowHeight = 62;
  const headerHeight = 930;
  const canvasHeight = headerHeight + Math.max(1, events.length) * eventRowHeight + canvasPadding;
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

  const [playerImage, opponentImage, typeIcons, statusIcons] = await Promise.all([
    loadImage(playerImageUrls),
    loadImage(opponentImageUrls),
    loadMoveTypeIcons([
      player.fMove?.type,
      player.cMovePri?.type,
      player.cMoveSec?.type,
      opponent.fMove?.type,
      opponent.cMovePri?.type,
      opponent.cMoveSec?.type,
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
  drawPokemonCard(
    context,
    player,
    playerImage,
    getOutcome(player.timeline),
    canvasPadding,
    154,
    cardWidth,
    colors.player,
    'left',
    fontFamily,
    typeIcons,
    statusIcons
  );
  drawPokemonCard(
    context,
    opponent,
    opponentImage,
    getOutcome(opponent.timeline),
    canvasPadding + cardWidth + cardGap,
    154,
    cardWidth,
    colors.opponent,
    'right',
    fontFamily,
    typeIcons,
    statusIcons
  );

  drawText(context, 'Battle timeline', canvasPadding, 540, { font: `700 28px ${fontFamily}` });
  drawText(context, formatName(player.pokemonData?.name), canvasPadding, 584, {
    color: colors.player,
    font: `600 18px ${fontFamily}`,
  });
  drawTimelineLane(
    context,
    player.timeline,
    canvasPadding + 190,
    554,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.player
  );
  drawText(context, formatName(opponent.pokemonData?.name), canvasPadding, 646, {
    color: colors.opponent,
    font: `600 18px ${fontFamily}`,
  });
  drawTimelineLane(
    context,
    opponent.timeline,
    canvasPadding + 190,
    616,
    canvasWidth - canvasPadding * 2 - 190,
    maxTurn,
    colors.opponent
  );

  const legend = [
    ['Fast', colors.fast],
    ['Charged', colors.charged],
    ['Shield', colors.shield],
    ['Result', colors.result],
  ];
  legend.forEach(([label, color], index) => {
    const x = canvasPadding + index * 170;
    context.fillStyle = color;
    context.fillRect(x, 686, 28, 12);
    drawText(context, label, x + 38, 700, { color: colors.muted, font: `400 17px ${fontFamily}` });
  });

  drawText(context, 'Battle events', canvasPadding, 770, { font: `700 28px ${fontFamily}` });
  fillRoundedRect(context, canvasPadding, 794, canvasWidth - canvasPadding * 2, 54, colors.surfaceAlt, 8);
  const columns = [
    canvasPadding + 20,
    canvasPadding + 145,
    canvasPadding + 570,
    canvasPadding + 860,
    canvasPadding + 1285,
  ];
  ['Time', formatName(player.pokemonData?.name), 'State', formatName(opponent.pokemonData?.name), 'State'].forEach(
    (label, index) =>
      drawText(context, label, columns[index], 828, {
        color: index === 1 ? colors.player : index === 3 ? colors.opponent : colors.text,
        font: `700 18px ${fontFamily}`,
      })
  );

  events.forEach((event, index) => {
    const y = 848 + index * eventRowHeight;
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
    drawText(context, `Turn ${event.turn}`, columns[1], y + 49, {
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
    drawText(context, `Turn ${event.turn}`, columns[3], y + 49, {
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
  await downloadCanvas(canvas, `pokego-battle-${playerName}-vs-${opponentName}.png`);
};
