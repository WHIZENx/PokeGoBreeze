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
import type {
  GameMasterChange,
  GameMasterChangeStatus,
  GameMasterEntityType,
  GameMasterFieldChange,
  GameMasterFieldValue,
  GameMasterMoveReference,
  GameMasterPatchSection,
  GameMasterPatchSummary,
  GameMasterUpdateSummary,
  GameMasterUpdatesResponse,
} from '../../core/models/API/game-master-updates.model';
import IconType from '../../components/Sprites/Icon/Type/Type';
import APIService from '../../services/api.service';
import { useTitle } from '../../utils/hooks/useTitle';

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

const DetailValueContent = ({ value, context }: { value: GameMasterFieldValue; context: string }) => {
  const normalized = normalizeDetailValue(value);

  if (Array.isArray(normalized)) {
    if (normalized.length === 0) {
      return <Typography component="span">None</Typography>;
    }
    return (
      <Box component="ul" className="game-master-updates__detail-list">
        {normalized.map((item, index) => (
          <Box component="li" key={`${context}:${index}`}>
            <DetailValueContent value={item} context={context} />
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
      <Box component="ul" className="game-master-updates__detail-list game-master-updates__detail-list--nested">
        {entries.map(([key, item]) => {
          const normalizedItem = normalizeDetailValue(item);
          return (
            <Box component="li" key={key}>
              <Typography component="span" className="game-master-updates__detail-key">
                {humanizeValueName(key)}
              </Typography>
              {isStructuredDetail(normalizedItem) ? (
                <DetailValueContent value={normalizedItem} context={key} />
              ) : (
                <>
                  <Typography component="span">: </Typography>
                  <DetailValueContent value={normalizedItem} context={key} />
                </>
              )}
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

  return <Typography component="span">{readablePrimitive(normalized, context)}</Typography>;
};

const DetailValue = ({
  value,
  moves,
  label,
}: {
  value: GameMasterFieldChange['before'];
  moves?: GameMasterMoveReference[];
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

  if (moves?.length) {
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
            <Typography component="span">{move.name}</Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box component="dd" className="game-master-updates__detail-value">
      <DetailValueContent value={value ?? null} context={label} />
    </Box>
  );
};

const FieldChange = ({ field }: { field: GameMasterFieldChange }) => {
  const beforeMissing = field.before === undefined || field.before === null || field.before === '';
  const afterMissing = field.after === undefined || field.after === null || field.after === '';

  if (beforeMissing && !afterMissing) {
    return (
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--added">
        <Typography component="dt" variant="overline">
          <AddCircleOutlineIcon fontSize="inherit" /> Added
        </Typography>
        <DetailValue value={field.after} moves={field.afterMoves} label={field.label} />
      </Box>
    );
  }

  if (!beforeMissing && afterMissing) {
    return (
      <Box component="dl" className="game-master-updates__change-delta game-master-updates__change-delta--removed">
        <Typography component="dt" variant="overline">
          <RemoveCircleOutlineIcon fontSize="inherit" /> Removed
        </Typography>
        <DetailValue value={field.before} moves={field.beforeMoves} label={field.label} />
      </Box>
    );
  }

  return (
    <Box component="dl" className="game-master-updates__change-comparison">
      <Box className="game-master-updates__change-value game-master-updates__change-value--old">
        <Typography component="dt" variant="overline">
          Before
        </Typography>
        <DetailValue value={field.before} moves={field.beforeMoves} label={field.label} />
      </Box>
      <ArrowForwardIcon className="game-master-updates__change-arrow" aria-hidden="true" />
      <Box className="game-master-updates__change-value game-master-updates__change-value--new">
        <Typography component="dt" variant="overline">
          Now
        </Typography>
        <DetailValue value={field.after} moves={field.afterMoves} label={field.label} />
      </Box>
    </Box>
  );
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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

const PatchEntry = ({
  change,
  onImageError,
}: {
  change: GameMasterChange;
  onImageError: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}) => {
  const status = statusConfig[change.status];

  return (
    <Accordion
      component="article"
      TransitionProps={{ unmountOnExit: true }}
      disableGutters
      variant="outlined"
      className="game-master-updates__item-accordion"
    >
      <AccordionSummary className="game-master-updates__item-summary" expandIcon={<ExpandMoreIcon />}>
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
              <Typography component="h3" variant="h6">
                {change.pokemonId ? `#${change.pokemonId} ` : ''}
                {change.label}
              </Typography>
              <Chip
                size="small"
                color={status.color}
                icon={status.icon}
                label={status.label}
                className="game-master-updates__status"
              />
            </Stack>

            <Typography className="game-master-updates__entry-description">{change.description}</Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails className="game-master-updates__item-details">
        {change.forms && change.forms.length > 1 && (
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Forms:
            </Typography>
            {change.forms.map((form) => (
              <Chip key={form} size="small" variant="outlined" label={humanizeValueName(form)} />
            ))}
          </Stack>
        )}

        {change.fields.length > 0 ? (
          <Box component="section" className="game-master-updates__technical">
            <Typography component="h4" variant="overline" className="game-master-updates__change-label">
              Changes
            </Typography>
            <Box component="ul" className="game-master-updates__change-list">
              {change.fields.map((field) => (
                <Box component="li" key={field.path} className="game-master-updates__change-item">
                  <Typography component="h5" variant="subtitle2" className="game-master-updates__change-heading">
                    {field.label}
                  </Typography>
                  <FieldChange field={field} />
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary" className="game-master-updates__item-empty">
            This template was {change.status} as a complete entry, with no individual field changes to list.
          </Typography>
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
                    role={patch.heroImage ? 'img' : undefined}
                    aria-label={patch.heroImage ? patch.heroImage.label : undefined}
                    style={
                      patch.heroImage
                        ? {
                            backgroundImage:
                              'linear-gradient(145deg, rgb(10 35 57 / 30%), rgb(10 35 57 / 78%)), url("' +
                              patchImageUrl(patch.heroImage.url) +
                              '")',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover, contain',
                          }
                        : undefined
                    }
                  >
                    {!patch.heroImage && <SystemUpdateAltIcon />}
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
        patchLimit: 5,
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
          setError(`Unable to load Game Master patch notes: ${String(reason)}`);
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

  const onImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const fallback = APIService.getPokeIconSprite();
    if (image.src !== fallback) {
      image.src = fallback;
    }
  };

  const hasFilters = Boolean(search || status || section);

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
              <Typography id="patch-overview" component="h1" variant="h5" gutterBottom>
                Patch overview
              </Typography>
              <Typography color="text.secondary" paragraph>
                {response.summary.total.toLocaleString()} webapp-relevant changes were detected in this patch, covering{' '}
                {formatDate(response.previous.timestamp)} to {formatDate(response.current.timestamp)}.
              </Typography>
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
