import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ButtonMui from '../../components/Commons/Buttons/ButtonMui';
import InputMuiSearch from '../../components/Commons/Inputs/InputMuiSearch';
import SelectMui from '../../components/Commons/Selects/SelectMui';
import Candy from '../../components/Sprites/Candy/Candy';
import type {
  GameMasterChange,
  GameMasterChangeStatus,
  GameMasterEntityType,
  GameMasterFieldChange,
  GameMasterFieldValue,
  GameMasterMoveReference,
  GameMasterPokemonReference,
  GameMasterPatchSection,
  GameMasterPatchSummary,
  GameMasterUpdateSummary,
  GameMasterUpdatesResponse,
} from '../../core/models/API/game-master-updates.model';
import IconType from '../../components/Sprites/Icon/Type/Type';
import { LinkToTop } from '../../components/Link/LinkToTop';
import APIService from '../../services/api.service';
import { Params } from '../../utils/constants';
import { useTitle } from '../../utils/hooks/useTitle';
import { generateParamForm } from '../../utils/utils';

import './GameMasterUpdates.scss';

const statusConfig: Record<
  GameMasterChangeStatus,
  { color: 'success' | 'warning' | 'error'; icon: React.ReactElement; label: string }
> = {
  added: { color: 'success', icon: <AddCircleOutlineIcon />, label: 'Added' },
  updated: { color: 'warning', icon: <EditOutlinedIcon />, label: 'Updated' },
  removed: { color: 'error', icon: <RemoveCircleOutlineIcon />, label: 'Removed' },
};

const entityIcon: Record<GameMasterEntityType, React.ReactElement> = {
  pokemon: <CatchingPokemonIcon />,
  item: <Inventory2OutlinedIcon />,
  move: <SportsMmaIcon />,
  setting: <SettingsOutlinedIcon />,
};

const sectionConfig: Record<GameMasterPatchSection, { icon: React.ReactElement; description: string }> = {
  pokemon: {
    icon: <CatchingPokemonIcon />,
    description: 'Pokémon availability, forms, typing, stats, move pools, and evolution data used across the app.',
  },
  moves: {
    icon: <SportsMmaIcon />,
    description: 'PvE and PvP move additions or balance changes used by battle and damage tools.',
  },
  battle: {
    icon: <ShieldOutlinedIcon />,
    description: 'Battle leagues, combat rules, multipliers, and settings that affect simulations and rankings.',
  },
  items: {
    icon: <Inventory2OutlinedIcon />,
    description: 'Items, event tickets, and stickers displayed by the webapp.',
  },
  progression: {
    icon: <TrendingUpIcon />,
    description: 'Trainer levels, CP multipliers, experience, and power-up data.',
  },
  systems: {
    icon: <SettingsOutlinedIcon />,
    description: 'Type effectiveness, weather boosts, and other shared calculations.',
  },
};

const conciseValueLabels: Record<string, string> = {
  tempEvoOverrides: 'Temporary Evolutions',
  tempEvoId: 'Evolution',
  baseStamina: 'Stamina',
  baseAttack: 'Attack',
  baseDefense: 'Defense',
  averageHeightM: 'Average Height (m)',
  averageWeightKg: 'Average Weight (kg)',
  typeOverride1: 'Primary Type',
  typeOverride2: 'Secondary Type',
  durationMs: 'Duration',
  damageWindowStartMs: 'Damage Window Start',
  damageWindowEndMs: 'Damage Window End',
  energyDelta: 'Energy',
  movementId: 'Move',
  uniqueId: 'Move',
  pokemonId: 'Pokémon',
  familyId: 'Family',
  regionId: 'Region',
  itemId: 'Item',
  nameOverride: 'Name',
  descriptionOverride: 'Description',
  iconUrl: 'Icon',
  backgroundImageUrl: 'Background Image',
  eventBannerUrl: 'Event Banner',
  titleImageUrl: 'Title Image',
  clientEventStartTimeUtcMs: 'Client Start Time',
  clientEventEndTimeUtcMs: 'Client End Time',
  eventDatetimeRangeKey: 'Event Date Range Text',
  itemBagDescriptionKey: 'Bag Description',
  textRewardsKey: 'Reward Text',
  grantBadgeBeforeEventStartMs: 'Badge Grant Lead Time',
  disableTransferToPokemonHome: 'Pokémon HOME Transfer',
  buffActivationChance: 'Activation Chance',
  evolution: 'Evolves Into',
  candyCost: 'Candy',
  purificationStardustNeeded: 'Purification Stardust',
  purificationCandyNeeded: 'Purification Candy',
  purifiedChargeMove: 'Purified Move',
  shadowChargeMove: 'Shadow Move',
  candyCostPurified: 'Purified Candy',
  isCostume: 'Costume',
  pokemonEncounter: 'Pokémon Encounter',
  questDisplay: 'Quest',
  questRequirementTemplateId: 'Requirement',
  pokemonDisplay: 'Pokémon Form',
  exp: 'XP',
  stardust: 'Stardust',
  cylinderRadiusM: 'Hitbox Radius (m)',
  cylinderHeightM: 'Hitbox Height (m)',
  cylinderGroundM: 'Hitbox Ground Offset (m)',
  modelHeight: 'Model Height',
  temporaryEvolution: 'Temporary Evolution',
  temporaryEvolutionEnergyCost: 'Initial Energy Cost',
  temporaryEvolutionEnergyCostSubsequent: 'Repeat Energy Cost',
  evolutionItemRequirement: 'Required Item',
  evolutionItemRequirementCost: 'Required Item Quantity',
  modelScaleV2: 'Model Scale',
  noCandyCostViaTrade: 'Free After Trade',
  lureItemRequirement: 'Required Lure',
  onlyDaytime: 'Daytime Only',
  onlyNighttime: 'Nighttime Only',
  onlyUpsideDown: 'Upside-down Evolution',
  mustBeBuddy: 'Buddy Required',
  kmBuddyDistanceRequirement: 'Buddy Distance (km)',
  evolutionLikelihoodWeight: 'Evolution Chance Weight',
  neutralAvatarItemTemplate: 'Avatar Item',
  neutralAvatarItemTemplateString1: 'Avatar Item 1',
  neutralAvatarItemTemplateString2: 'Avatar Item 2',
  buddyPortraitOffset: 'Buddy Portrait Position',
  assetBundleValue: 'Asset',
  headerMessage: 'Header',
  evolutionInfos: 'Evolutions',
  groupNumber: 'Group',
  overrideDisplayForm: 'Display Form',
  raidBossDistanceOffset: 'Raid Boss Distance',
  withPokemonType: 'Pokémon Type Rule',
  pokemonType: 'Pokémon Type',
  withCombatType: 'Battle Type Rule',
  combatType: 'Battle Type',
  pokemonBanList: 'Banned Pokémon',
  pokemonWhiteList: 'Allowed Pokémon',
  targetDefenseStatStageChange: 'Target Defense Stages',
  targetAttackStatStageChange: 'Target Attack Stages',
  attackerDefenseStatStageChange: 'User Defense Stages',
  attackerAttackStatStageChange: 'User Attack Stages',
  sillouetteObfuscationGroup: 'Silhouette Group',
  avatarTemplateId: 'Avatar',
  pokecoin: 'PokéCoins',
  genderRequirement: 'Gender',
};

const humanizeValueName = (value: string): string => {
  const key = value.split('.').at(-1) ?? value;
  const concise = conciseValueLabels[value] ?? conciseValueLabels[key];
  if (concise) {
    return concise;
  }

  const pokemonTemplate = key.match(/^V0*(\d+)_POKEMON_(.+)$/);
  if (pokemonTemplate) {
    return `#${Number(pokemonTemplate[1])} ${humanizeValueName(pokemonTemplate[2])}`;
  }

  return key
    .replace(/^TEMP_EVOLUTION_/, '')
    .replace(/^POKEMON_TYPE_/, '')
    .replace(/_FAST$/, '')
    .replaceAll('_', ' ')
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bId\b/g, 'ID')
    .replace(/\bCp\b/g, 'CP')
    .replace(/\bPvp\b/g, 'PvP')
    .replace(/\bUtc\b/g, 'UTC')
    .replace(/\bMs\b/g, 'ms')
    .replace(/\bKg\b/g, 'kg');
};

const normalizeDetailValue = (value: GameMasterFieldValue): GameMasterFieldValue => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      return JSON.parse(trimmed) as GameMasterFieldValue;
    } catch {
      return value;
    }
  }
  const legacyItems = trimmed
    .split('; ')
    .map((item) => item.trim())
    .filter(Boolean);
  return legacyItems.length > 1 ? legacyItems : value;
};

const isDetailRecord = (value: GameMasterFieldValue): value is Record<string, GameMasterFieldValue> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isStructuredDetail = (value: GameMasterFieldValue) => Array.isArray(value) || isDetailRecord(value);

const formatDuration = (milliseconds: number) => {
  if (!Number.isFinite(milliseconds)) {
    return milliseconds.toLocaleString();
  }
  const units = [
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1_000],
  ] as const;
  let remaining = Math.abs(milliseconds);
  const parts = units.flatMap(([label, size]) => {
    const amount = Math.floor(remaining / size);
    remaining %= size;
    return amount ? [`${amount.toLocaleString()} ${label}${amount === 1 ? '' : 's'}`] : [];
  });
  if (parts.length === 0) {
    return `${milliseconds.toLocaleString()} ms`;
  }
  return `${milliseconds < 0 ? '-' : ''}${parts.join(' ')}`;
};

const readablePrimitive = (value: Exclude<GameMasterFieldValue, GameMasterFieldValue[] | object>, context = '') => {
  if (value === null || value === '') {
    return 'None';
  }
  if (typeof value === 'boolean') {
    return value ? 'Enabled' : 'Disabled';
  }

  const numericValue =
    typeof value === 'number' ? value : /^-?\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : null;
  if (
    numericValue !== null &&
    /timestamp|(?:start|end)time/i.test(context) &&
    Math.abs(numericValue) >= 100_000_000_000
  ) {
    return new Date(numericValue).toLocaleString();
  }
  if (numericValue !== null && /(?:Ms|Milliseconds)$/i.test(context)) {
    return formatDuration(numericValue);
  }
  if (typeof value === 'number') {
    return /move/i.test(context) ? `Move #${value}` : value.toLocaleString();
  }

  const trimmed = value.trim();
  return /^[A-Z0-9_]+$/.test(trimmed) || trimmed.includes('_') ? humanizeValueName(trimmed) : trimmed;
};

const referenceKey = (value: string | number) =>
  String(value)
    .replaceAll(/[^a-z0-9]/gi, '')
    .toLowerCase();

type DetailValueContentProps = {
  value: GameMasterFieldValue;
  context: string;
  moves?: GameMasterMoveReference[];
  pokemon?: GameMasterPokemonReference[];
  candyPokemonId?: number;
};

const DetailValueContent = ({ value, context, moves, pokemon, candyPokemonId }: DetailValueContentProps) => {
  const normalized = normalizeDetailValue(value);

  if (Array.isArray(normalized)) {
    if (normalized.length === 0) {
      return <Typography component="span">None</Typography>;
    }

    const items = normalized.map((item) => normalizeDetailValue(item));
    if (items.every(isStructuredDetail)) {
      return (
        <Box className="game-master-updates__detail-groups">
          {items.map((item, index) => (
            <Box className="game-master-updates__detail-group" key={`${context}:${index}`}>
              <DetailValueContent
                value={item}
                context={context}
                moves={moves}
                pokemon={pokemon}
                candyPokemonId={candyPokemonId}
              />
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Box component="ul" className="game-master-updates__detail-list">
        {items.map((item, index) => (
          <Box component="li" key={`${context}:${index}`}>
            <DetailValueContent
              value={item}
              context={context}
              moves={moves}
              pokemon={pokemon}
              candyPokemonId={candyPokemonId}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (isDetailRecord(normalized)) {
    const entries = Object.entries(normalized);
    if (entries.length === 0) {
      return <Typography component="span">None</Typography>;
    }
    return (
      <Box className="game-master-updates__detail-record">
        {entries.map(([key, item]) => {
          const normalizedItem = normalizeDetailValue(item);
          return (
            <Box className="game-master-updates__detail-row" key={key}>
              <Typography component="span" color="text.secondary" className="game-master-updates__detail-key">
                {humanizeValueName(key)}
              </Typography>
              <Box className="game-master-updates__detail-row-value">
                <DetailValueContent
                  value={normalizedItem}
                  context={key}
                  moves={moves}
                  pokemon={pokemon}
                  candyPokemonId={candyPokemonId}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  if (typeof normalized === 'string' && /^https?:\/\//i.test(normalized.trim())) {
    return (
      <Box
        component="img"
        className="game-master-updates__detail-image game-master-updates__detail-image--nested"
        src={normalized.trim()}
        alt={humanizeValueName(context)}
        loading="lazy"
      />
    );
  }

  const primitiveKey = typeof normalized === 'string' || typeof normalized === 'number' ? referenceKey(normalized) : '';
  const pokemonReference = /evolution/i.test(context)
    ? pokemon?.find(
        (reference) => referenceKey(reference.name) === primitiveKey || referenceKey(reference.id) === primitiveKey
      )
    : undefined;
  if (pokemonReference) {
    return (
      <LinkToTop
        className="game-master-updates__detail-pokemon"
        to={`/pokemon/${pokemonReference.id}${generateParamForm(pokemonReference.form)}`}
        title={`View ${pokemonReference.name} details`}
      >
        <Box
          component="img"
          src={pokemonReference.imageUrl ?? APIService.getPokeSprite(pokemonReference.id)}
          alt={pokemonReference.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = APIService.getPokeSprite(pokemonReference.id);
          }}
        />
        <Typography component="span">{pokemonReference.name}</Typography>
      </LinkToTop>
    );
  }

  const moveReference = /move/i.test(context)
    ? moves?.find(
        (reference) => referenceKey(reference.name) === primitiveKey || referenceKey(reference.id) === primitiveKey
      )
    : undefined;
  if (moveReference) {
    return (
      <Box className="game-master-updates__detail-move">
        {moveReference.type && (
          <IconType
            width={26}
            height={26}
            type={moveReference.type}
            alt={`${moveReference.name} ${humanizeValueName(moveReference.type)} type`}
            title={humanizeValueName(moveReference.type)}
          />
        )}
        <LinkToTop
          className="game-master-updates__entity-link"
          to={`/move/${encodeURIComponent(moveReference.id)}${
            moveReference.type ? `?${Params.MoveType}=${encodeURIComponent(moveReference.type.toLowerCase())}` : ''
          }`}
        >
          {moveReference.name}
        </LinkToTop>
      </Box>
    );
  }

  if (
    candyPokemonId &&
    /^(?:candyCost|candyCostPurified|purificationCandyNeeded|Candy|Purified Candy|Purification Candy|Candy Cost Purified)$/i.test(
      context
    )
  ) {
    return (
      <Box className="game-master-updates__detail-candy">
        <Candy id={candyPokemonId} size={22} />
        <Typography component="span">{readablePrimitive(normalized, context)}</Typography>
      </Box>
    );
  }

  return <Typography component="span">{readablePrimitive(normalized, context)}</Typography>;
};

const DetailValue = ({
  value,
  moves,
  pokemon,
  candyPokemonId,
  label,
}: {
  value: GameMasterFieldChange['before'];
  moves?: GameMasterMoveReference[];
  pokemon?: GameMasterPokemonReference[];
  candyPokemonId?: number;
  label: string;
}) => {
  const imageUrl = typeof value === 'string' && /^https?:\/\//i.test(value.trim()) ? value.trim() : undefined;

  if (imageUrl) {
    return (
      <Box component="dd" className="game-master-updates__detail-image-wrap">
        <Box component="a" href={imageUrl} target="_blank" rel="noreferrer" aria-label={`Open ${label} image`}>
          <Box
            component="img"
            className="game-master-updates__detail-image"
            src={imageUrl}
            alt={label}
            loading="lazy"
          />
        </Box>
      </Box>
    );
  }

  if (moves?.length && !isStructuredDetail(normalizeDetailValue(value ?? null))) {
    return (
      <Box component="dd" className="game-master-updates__detail-moves">
        {moves.map((move) => (
          <Box key={`${move.id}:${move.name}`} className="game-master-updates__detail-move">
            {move.type && (
              <IconType
                width={26}
                height={26}
                type={move.type}
                alt={`${move.name} ${humanizeValueName(move.type)} type`}
                title={humanizeValueName(move.type)}
              />
            )}
            <LinkToTop
              className="game-master-updates__entity-link"
              to={`/move/${encodeURIComponent(move.id)}${
                move.type ? `?${Params.MoveType}=${encodeURIComponent(move.type.toLowerCase())}` : ''
              }`}
            >
              {move.name}
            </LinkToTop>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box component="dd" className="game-master-updates__detail-value">
      <DetailValueContent
        value={value ?? null}
        context={label}
        moves={moves}
        pokemon={pokemon}
        candyPokemonId={candyPokemonId}
      />
    </Box>
  );
};

const FieldChange = ({ field, pokemonId }: { field: GameMasterFieldChange; pokemonId?: number }) => {
  const beforeMissing = field.before === undefined || field.before === null || field.before === '';
  const afterMissing = field.after === undefined || field.after === null || field.after === '';

  if (beforeMissing && !afterMissing) {
    return (
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--added">
        <Typography component="dt" variant="overline">
          <AddCircleOutlineIcon fontSize="inherit" /> Added
        </Typography>
        <DetailValue
          value={field.after}
          moves={field.afterMoves}
          pokemon={field.afterPokemon}
          candyPokemonId={pokemonId}
          label={field.label}
        />
      </Box>
    );
  }

  if (!beforeMissing && afterMissing) {
    return (
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--removed">
        <Typography component="dt" variant="overline">
          <RemoveCircleOutlineIcon fontSize="inherit" /> Removed
        </Typography>
        <DetailValue
          value={field.before}
          moves={field.beforeMoves}
          pokemon={field.beforePokemon}
          candyPokemonId={pokemonId}
          label={field.label}
        />
      </Box>
    );
  }

  return (
    <Box className="game-master-updates__change-transition">
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--removed">
        <Typography component="dt" variant="overline">
          <RemoveCircleOutlineIcon fontSize="inherit" /> Before
        </Typography>
        <DetailValue
          value={field.before}
          moves={field.beforeMoves}
          pokemon={field.beforePokemon}
          candyPokemonId={pokemonId}
          label={field.label}
        />
      </Box>
      <ArrowForwardIcon className="game-master-updates__change-arrow" aria-hidden="true" />
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--added">
        <Typography component="dt" variant="overline">
          <AddCircleOutlineIcon fontSize="inherit" /> Now
        </Typography>
        <DetailValue
          value={field.after}
          moves={field.afterMoves}
          pokemon={field.afterPokemon}
          candyPokemonId={pokemonId}
          label={field.label}
        />
      </Box>
    </Box>
  );
};

const missingFieldValue = (value: GameMasterFieldChange['before']) =>
  value === undefined || value === null || value === '';

const mergeComplementaryFields = (fields: GameMasterFieldChange[]) => {
  const merged: GameMasterFieldChange[] = [];
  const consumed = new Set<number>();

  fields.forEach((field, index) => {
    if (consumed.has(index)) {
      return;
    }
    const isRemoval = !missingFieldValue(field.before) && missingFieldValue(field.after);
    const isAddition = missingFieldValue(field.before) && !missingFieldValue(field.after);
    if (!isRemoval && !isAddition) {
      merged.push(field);
      return;
    }

    const pairIndex = fields.findIndex((candidate, candidateIndex) => {
      if (candidateIndex === index || consumed.has(candidateIndex) || candidate.label !== field.label) {
        return false;
      }
      const candidateIsRemoval = !missingFieldValue(candidate.before) && missingFieldValue(candidate.after);
      const candidateIsAddition = missingFieldValue(candidate.before) && !missingFieldValue(candidate.after);
      return (isRemoval && candidateIsAddition) || (isAddition && candidateIsRemoval);
    });
    if (pairIndex < 0) {
      merged.push(field);
      return;
    }

    const pair = fields[pairIndex];
    const beforeField = isRemoval ? field : pair;
    const afterField = isAddition ? field : pair;
    consumed.add(pairIndex);
    merged.push({
      path: `${beforeField.path}->${afterField.path}`,
      label: field.label,
      before: beforeField.before,
      after: afterField.after,
      beforeMoves: beforeField.beforeMoves,
      afterMoves: afterField.afterMoves,
      beforePokemon: beforeField.beforePokemon,
      afterPokemon: afterField.afterPokemon,
    });
  });

  return merged;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatCompactDateRange = (startValue: string, endValue: string) => {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${formatDate(startValue)} – ${formatDate(endValue)}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const startFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const endFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startFormatter.format(start)} – ${endFormatter.format(end)}`;
};

const patchPathSlug = (version: GameMasterPatchSummary['previous']) =>
  version.timestamp.slice(0, 19).replace('T', '-').replaceAll(':', '-');

const patchImageUrl = (value: string) => {
  const pokemonFolder = '/Images/Pokemon%20-%20256x256/';
  const addressableFolder = `${pokemonFolder}Addressable%20Assets/`;
  if (!value.includes(pokemonFolder) || value.includes(addressableFolder)) {
    return value;
  }
  return value.replace(pokemonFolder, addressableFolder);
};

const uniqueChanges = (changes: GameMasterChange[]) =>
  Array.from(new Map(changes.map((change) => [`${change.status}:${change.templateId}`, change])).values());

type GameMasterPatchCard = Omit<GameMasterPatchSummary, 'summary'> & {
  summary?: GameMasterUpdateSummary;
};

const patchCardsFromResponse = (data?: GameMasterUpdatesResponse['data']): GameMasterPatchCard[] => {
  if (!data) {
    return [];
  }
  if (data.patches?.length) {
    return data.patches;
  }
  const fallbackImage = data.changes.find((change) => change.imageUrl);
  return data.versions.map((version) => ({
    compareTo: version.name,
    slug: patchPathSlug(version),
    current: data.current,
    previous: version,
    summary: version.name === data.previous.name ? data.summary : undefined,
    heroImage:
      version.name === data.previous.name && fallbackImage?.imageUrl
        ? { url: fallbackImage.imageUrl, label: fallbackImage.label }
        : undefined,
  }));
};

const entityDetailPath = (change: GameMasterChange) => {
  if (change.entityType === 'pokemon' && change.pokemonId) {
    const rawForm = change.forms?.length === 1 ? change.forms[0] : change.forms?.length ? undefined : change.form;
    const form = rawForm && !/^\d+$/.test(rawForm) ? rawForm : undefined;
    return `/pokemon/${change.pokemonId}${generateParamForm(form)}`;
  }
  if (change.entityType === 'move' && change.entityId) {
    return `/move/${encodeURIComponent(change.entityId)}${
      change.moveType ? `?${Params.MoveType}=${encodeURIComponent(change.moveType.toLowerCase())}` : ''
    }`;
  }
  return undefined;
};

const PatchEntry = ({
  change,
  showFormTag,
  onImageError,
}: {
  change: GameMasterChange;
  showFormTag: boolean;
  onImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const status = statusConfig[change.status];
  const hasForms = Boolean(change.forms && change.forms.length > 1);
  const hasDetails = hasForms || change.fields.length > 0;
  const formLabel = change.forms?.length === 1 ? change.forms[0] : change.form;
  const detailPath = entityDetailPath(change);
  const displayFields = mergeComplementaryFields(change.fields);
  const entityTitle = (
    <Typography component="h3" variant="h6">
      {change.pokemonId ? `#${change.pokemonId} ` : ''}
      {change.label}
    </Typography>
  );
  const summary = (
    <Box className="game-master-updates__entry">
      {change.entityType === 'move' && change.moveType ? (
        <Box className="game-master-updates__entry-placeholder game-master-updates__move-profile">
          <IconType
            width={56}
            height={56}
            alt={`${humanizeValueName(change.moveType)} type`}
            title={humanizeValueName(change.moveType)}
            type={change.moveType}
          />
        </Box>
      ) : change.imageUrl ? (
        <Box
          component="img"
          className="game-master-updates__entry-image"
          src={patchImageUrl(change.imageUrl)}
          alt=""
          loading="lazy"
          onError={onImageError}
        />
      ) : (
        <Box className="game-master-updates__entry-placeholder">{entityIcon[change.entityType]}</Box>
      )}

      <Box className="game-master-updates__entry-content">
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          {entityTitle}
          {showFormTag && formLabel && <Chip size="small" variant="outlined" label={humanizeValueName(formLabel)} />}
          <Chip
            size="small"
            color={status.color}
            icon={status.icon}
            label={status.label}
            className="game-master-updates__status"
          />
        </Stack>

        <Typography className="game-master-updates__entry-description">{change.description}</Typography>
        {detailPath && (
          <LinkToTop
            className="game-master-updates__entry-action"
            to={detailPath}
            title={`View ${change.label} details`}
            funcOnClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Typography component="span">
              View {change.entityType === 'pokemon' ? 'Pokémon' : change.entityType === 'move' ? 'Move' : 'details'}
            </Typography>
            <ArrowForwardIcon fontSize="small" />
          </LinkToTop>
        )}
      </Box>
    </Box>
  );

  if (!hasDetails) {
    return (
      <Paper component="article" variant="outlined" className="game-master-updates__item-card">
        {summary}
      </Paper>
    );
  }

  return (
    <Accordion
      component="article"
      TransitionProps={{ unmountOnExit: true }}
      disableGutters
      variant="outlined"
      className="game-master-updates__item-accordion"
    >
      <AccordionSummary className="game-master-updates__item-summary" expandIcon={<ExpandMoreIcon />}>
        {summary}
      </AccordionSummary>

      <AccordionDetails className="game-master-updates__item-details">
        {hasForms && (
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Forms:
            </Typography>
            {change.forms?.map((form) => (
              <Chip key={form} size="small" variant="outlined" label={humanizeValueName(form)} />
            ))}
          </Stack>
        )}

        {change.fields.length > 0 && (
          <Box component="section" className="game-master-updates__technical">
            <Typography component="h4" variant="overline" className="game-master-updates__change-label">
              Changes
            </Typography>
            <Box component="ul" className="game-master-updates__change-list">
              {displayFields.map((field) => (
                <Box component="li" key={field.path} className="game-master-updates__change-item">
                  <Typography component="h5" variant="subtitle2" className="game-master-updates__change-heading">
                    {field.label}
                  </Typography>
                  <FieldChange field={field} pokemonId={change.pokemonId} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const PatchIndex = ({
  patches,
  loading,
  error,
  patchPage,
  patchPages,
  onOpen,
  onPageChange,
}: {
  patches: GameMasterPatchCard[];
  loading: boolean;
  error?: string;
  patchPage: number;
  patchPages: number;
  onOpen: (compareTo: string) => void;
  onPageChange: (page: number) => void;
}) => {
  return (
    <Container component="main" maxWidth="xl" className="game-master-updates game-master-updates--index">
      <Box className="game-master-updates__layout">
        {error && <Alert severity="error">{error}</Alert>}

        <Box component="section" className="game-master-updates__index-heading">
          <Typography component="h1" variant="h4">
            Latest data patches
          </Typography>
          <Typography color="text.secondary">Select a data patch to read its complete update notes.</Typography>
        </Box>

        {loading && patches.length === 0 ? (
          <Box className="game-master-updates__index-loading">
            <CircularProgress aria-label="Loading Game Master patch index" />
          </Box>
        ) : (
          <Box className="game-master-updates__patch-grid">
            {patches.map((patch, index) => (
              <Card
                key={patch.compareTo}
                variant="outlined"
                className={`game-master-updates__patch-card${patchPage === 1 && index === 0 ? ' game-master-updates__patch-card--featured' : ''}`}
              >
                <CardActionArea onClick={() => onOpen(patch.slug ?? patchPathSlug(patch.previous))}>
                  <Box
                    className="game-master-updates__patch-card-visual"
                    role={patch.backgroundImage || patch.heroImage ? 'img' : undefined}
                    aria-label={patch.backgroundImage?.label ?? patch.heroImage?.label}
                  >
                    {patch.backgroundImage && (
                      <Box
                        component="img"
                        className="game-master-updates__patch-card-background"
                        src={patchImageUrl(patch.backgroundImage.url)}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    )}
                    {patch.heroImage && (
                      <Box
                        component="img"
                        className="game-master-updates__patch-card-entity"
                        src={patchImageUrl(patch.heroImage.url)}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.hidden = true;
                        }}
                      />
                    )}
                    {!patch.backgroundImage && !patch.heroImage && <SystemUpdateAltIcon />}
                    <Chip
                      size="small"
                      color={patchPage === 1 && index === 0 ? 'primary' : 'default'}
                      label={patchPage === 1 && index === 0 ? 'Latest' : 'Archive'}
                    />
                  </Box>
                  <CardContent className="game-master-updates__patch-card-content">
                    <Typography variant="overline" color="primary">
                      Update period: {formatDate(patch.previous.timestamp)} – {formatDate(patch.current.timestamp)}
                    </Typography>
                    <Typography component="h2" variant="h5">
                      {patch.title ?? 'Changes since ' + formatDate(patch.previous.timestamp)}
                    </Typography>
                    {patch.summary ? (
                      <>
                        <Typography color="text.secondary">
                          {patch.description ??
                            patch.summary.total.toLocaleString() +
                              ' webapp-relevant changes across Pokémon, moves, battles, items, and shared systems.'}
                        </Typography>
                        {patch.highlights && patch.highlights.length > 0 && (
                          <Box component="ul" className="game-master-updates__patch-card-highlights">
                            {patch.highlights.map((highlight) => (
                              <Box component="li" key={highlight}>
                                {highlight}
                              </Box>
                            ))}
                          </Box>
                        )}
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          flexWrap="wrap"
                          className="game-master-updates__patch-card-counts"
                        >
                          <span>{patch.summary.added.toLocaleString()} added</span>
                          <span>{patch.summary.updated.toLocaleString()} updated</span>
                          <span>{patch.summary.removed.toLocaleString()} removed</span>
                        </Stack>
                      </>
                    ) : (
                      <Typography color="text.secondary">
                        Open this archived patch to load its complete update details.
                      </Typography>
                    )}
                    <Box className="game-master-updates__patch-card-link">
                      <Typography variant="button">Read patch notes</Typography>
                      <ArrowForwardIcon fontSize="small" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
            {patchPages > 1 && (
              <Box
                component="nav"
                aria-label="Game Master patch pages"
                className="game-master-updates__patch-pagination"
              >
                <Pagination
                  page={patchPage}
                  count={patchPages}
                  onChange={(_, value) => onPageChange(value)}
                  color="primary"
                  disabled={loading}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

const GameMasterUpdates = () => {
  useTitle({
    title: 'PokéGO Breeze - Game Master Patch Notes',
    description: 'See the Game Master changes that affect PokéGO Breeze features and tools.',
    keywords: ['Pokémon GO Game Master', 'Game Master patch notes', 'Pokémon GO changes'],
  });

  const navigate = useNavigate();
  const { patchSlug } = useParams<{ patchSlug?: string }>();
  const compareTo = patchSlug ?? '';
  const isIndex = !patchSlug;
  const [response, setResponse] = useState<GameMasterUpdatesResponse['data']>();
  const [changes, setChanges] = useState<GameMasterChange[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [patchPage, setPatchPage] = useState(1);
  const [patchPages, setPatchPages] = useState(1);
  const [status, setStatus] = useState<GameMasterChangeStatus | ''>('');
  const [section, setSection] = useState<GameMasterPatchSection | ''>('');
  const [expandedSections, setExpandedSections] = useState<GameMasterPatchSection[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setChanges([]);
  }, [compareTo, status, section, debouncedSearch]);

  useEffect(() => {
    setExpandedSections([]);
  }, [compareTo]);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(undefined);
    APIService.getFetchUrl<GameMasterUpdatesResponse>(
      APIService.getGameMasterUpdates({
        page,
        limit: isIndex ? 1 : 30,
        patchPage,
        patchLimit: 6,
        patchFirstPageLimit: 5,
        compareTo,
        status,
        section,
        q: debouncedSearch,
      }),
      { signal: controller.signal }
    )
      .then(({ data }) => {
        if (currentRequest !== requestId.current) {
          return;
        }
        setResponse(data.data);
        if (!isIndex) {
          const selectedPatch =
            data.data.selectedPatch ?? data.data.patches?.find((patch) => patch.compareTo === data.meta.compareTo);
          if (selectedPatch?.slug && selectedPatch.slug !== patchSlug) {
            navigate('/game-master-updates/' + encodeURIComponent(selectedPatch.slug), { replace: true });
          }
        }
        setPages(data.meta.pages);
        setPatchPages(data.meta.patchPages);
        setChanges((current) => uniqueChanges(page === 1 ? data.data.changes : [...current, ...data.data.changes]));
      })
      .catch((reason: unknown) => {
        if (currentRequest === requestId.current && !APIService.isCancel(reason)) {
          setError(
            'Unable to load Game Master patch notes. The data service is temporarily unavailable. Please try again.'
          );
        }
      })
      .finally(() => {
        if (currentRequest === requestId.current) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [page, patchPage, compareTo, status, section, debouncedSearch, isIndex]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || loading || page >= pages) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPage((current) => (current < pages ? current + 1 : current));
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, page, pages]);

  const groupedChanges = useMemo(() => {
    const groups = new Map<GameMasterPatchSection, GameMasterChange[]>();
    changes.forEach((change) => groups.set(change.section, [...(groups.get(change.section) ?? []), change]));
    return groups;
  }, [changes]);

  const pokemonIdsWithMultipleForms = useMemo(() => {
    const formsByPokemon = new Map<number, Set<string>>();
    changes.forEach((change) => {
      if (!change.pokemonId) {
        return;
      }
      const forms = change.forms?.length ? change.forms : [change.form ?? 'NORMAL'];
      const knownForms = formsByPokemon.get(change.pokemonId) ?? new Set<string>();
      forms.forEach((form) => knownForms.add(form));
      formsByPokemon.set(change.pokemonId, knownForms);
    });
    return new Set([...formsByPokemon.entries()].filter(([, forms]) => forms.size > 1).map(([pokemonId]) => pokemonId));
  }, [changes]);

  const onImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const fallback = APIService.getPokeIconSprite();
    if (image.src !== fallback) {
      image.src = fallback;
    }
  };

  const hasFilters = Boolean(search || status || section);
  const activePatch =
    response?.selectedPatch ?? response?.patches?.find((patch) => patch.compareTo === response.previous.name);

  if (isIndex) {
    return (
      <PatchIndex
        patches={patchCardsFromResponse(response)}
        loading={loading}
        error={error}
        patchPage={patchPage}
        patchPages={patchPages}
        onOpen={(selectedPath) => navigate('/game-master-updates/' + encodeURIComponent(selectedPath))}
        onPageChange={(selectedPage) => {
          setResponse(undefined);
          setPatchPage(selectedPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <Container component="main" maxWidth="xl" className="game-master-updates game-master-updates--detail">
      <Box className="game-master-updates__layout">
        <Box className="game-master-updates__back-link">
          <ButtonMui
            variant="text"
            startIcon={<ArrowBackIcon />}
            label="All patch notes"
            onClick={() => navigate('/game-master-updates')}
          />
        </Box>
        {error && <Alert severity="error">{error}</Alert>}

        {response && (
          <>
            <Box component="section" aria-labelledby="patch-overview" className="game-master-updates__overview">
              <Box className="game-master-updates__overview-copy">
                <Typography id="patch-overview" component="h1" variant="h5">
                  Patch overview
                </Typography>
                <Typography component="p" variant="overline" color="primary">
                  {formatCompactDateRange(response.previous.timestamp, response.current.timestamp)} ·{' '}
                  {response.summary.total.toLocaleString()} relevant changes
                </Typography>
                <Typography className="game-master-updates__overview-summary" color="text.secondary">
                  {activePatch?.description ??
                    `${response.summary.total.toLocaleString()} changes affect the Pokémon GO data used by PokéGO Breeze.`}
                </Typography>
                {activePatch?.highlights && activePatch.highlights.length > 0 && (
                  <Box component="ul" className="game-master-updates__overview-highlights">
                    {activePatch.highlights.map((highlight) => (
                      <Box component="li" key={highlight}>
                        {highlight}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="game-master-updates__counts">
                <Box>
                  <AddCircleOutlineIcon color="success" />
                  <strong>{response.summary.added.toLocaleString()}</strong>
                  <span>Added</span>
                </Box>
                <Box>
                  <EditOutlinedIcon color="warning" />
                  <strong>{response.summary.updated.toLocaleString()}</strong>
                  <span>Updated</span>
                </Box>
                <Box>
                  <RemoveCircleOutlineIcon color="error" />
                  <strong>{response.summary.removed.toLocaleString()}</strong>
                  <span>Removed</span>
                </Box>
              </Stack>
            </Box>

            <Box className="game-master-updates__controls">
              <Box component="nav" aria-label="Patch note sections" className="game-master-updates__section-nav">
                <ButtonMui
                  variant={section ? 'outlined' : 'contained'}
                  startIcon={<SystemUpdateAltIcon />}
                  label={`All updates (${response.summary.total.toLocaleString()})`}
                  onClick={() => setSection('')}
                />
                {response.summary.sections.map((item) => (
                  <ButtonMui
                    key={item.key}
                    variant={section === item.key ? 'contained' : 'outlined'}
                    startIcon={sectionConfig[item.key].icon}
                    label={`${item.label} (${item.total.toLocaleString()})`}
                    onClick={() => setSection(item.key)}
                  />
                ))}
              </Box>

              <Paper variant="outlined" className="game-master-updates__tools">
                <InputMuiSearch
                  label="Search patch notes"
                  value={search}
                  onChange={setSearch}
                  isShowRemove={Boolean(search)}
                />
                <SelectMui<GameMasterChangeStatus | ''>
                  fullWidth
                  inputLabel="Change type"
                  value={status}
                  onChangeSelect={setStatus}
                  menuItems={[
                    { label: 'All changes', value: '' },
                    { label: 'Added', value: 'added' },
                    { label: 'Updated', value: 'updated' },
                    { label: 'Removed', value: 'removed' },
                  ]}
                />
                <ButtonMui
                  disabled={!hasFilters}
                  variant="text"
                  startIcon={<RestartAltIcon />}
                  label="Reset"
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setSection('');
                  }}
                />
              </Paper>
            </Box>
          </>
        )}

        <Box className="game-master-updates__patch-sections">
          {response?.summary.sections
            .filter((item) => groupedChanges.has(item.key))
            .map((item) => {
              const config = sectionConfig[item.key];
              return (
                <Accordion
                  key={item.key}
                  component="section"
                  disableGutters
                  expanded={expandedSections.includes(item.key)}
                  onChange={(_, isExpanded) =>
                    setExpandedSections((current) =>
                      isExpanded ? [...new Set([...current, item.key])] : current.filter((key) => key !== item.key)
                    )
                  }
                  variant="outlined"
                  className="game-master-updates__patch-section"
                >
                  <AccordionSummary className="game-master-updates__section-summary" expandIcon={<ExpandMoreIcon />}>
                    <Box className="game-master-updates__section-heading">
                      <Box className="game-master-updates__section-icon">{config.icon}</Box>
                      <Box className="game-master-updates__section-copy">
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                          <Typography component="h2" variant="h4">
                            {item.label}
                          </Typography>
                          <Chip size="small" variant="outlined" label={`${item.total.toLocaleString()} changes`} />
                        </Stack>
                        <Typography color="text.secondary">{config.description}</Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails className="game-master-updates__section-details">
                    <Stack className="game-master-updates__item-list">
                      {groupedChanges.get(item.key)?.map((change) => (
                        <PatchEntry
                          key={`${change.status}-${change.templateId}`}
                          change={change}
                          showFormTag={Boolean(
                            change.pokemonId &&
                              pokemonIdsWithMultipleForms.has(change.pokemonId) &&
                              (change.forms?.length ?? 0) <= 1
                          )}
                          onImageError={onImageError}
                        />
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Box>

        {!loading && changes.length === 0 && !error && (
          <Alert severity="info">No patch notes match these filters.</Alert>
        )}

        <Box
          ref={loadMoreRef}
          className="game-master-updates__footer"
          aria-live="polite"
          aria-label={page < pages ? 'More patch notes load automatically while scrolling' : 'All patch notes loaded'}
        >
          {loading && <CircularProgress aria-label="Loading Game Master patch notes" />}
        </Box>
      </Box>
    </Container>
  );
};

export default GameMasterUpdates;
