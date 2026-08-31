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
  Divider,
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

const humanizeValueName = (value: string) =>
  value
    .replace(/^POKEMON_TYPE_/, '')
    .replace(/_FAST$/, '')
    .replaceAll('_', ' ')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const readableValue = (value: unknown, context = '', depth = 0): string => {
  if (value === undefined || value === null || value === '') {
    return 'none';
  }
  if (typeof value === 'boolean') {
    return value ? 'enabled' : 'disabled';
  }
  if (typeof value === 'number') {
    return /move/i.test(context) ? `move #${value}` : value.toLocaleString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/timestamp/i.test(context)) {
      const timestamps = trimmed.split(';').map((item) => item.trim());
      if (
        timestamps.every(
          (item) =>
            item.length === 13 &&
            [...item].every((character) => character.charCodeAt(0) >= 48 && character.charCodeAt(0) <= 57)
        )
      ) {
        return timestamps.map((item) => new Date(Number(item)).toLocaleString()).join('; ');
      }
    }
    const deltaParts = trimmed.split('; ');
    if (
      deltaParts.length > 1 &&
      deltaParts.every((part) => part.startsWith('{') || part.startsWith('[') || /^and [0-9,]+ more$/i.test(part))
    ) {
      return deltaParts
        .map((part) => {
          if (/^and [0-9,]+ more$/i.test(part)) {
            return part;
          }
          try {
            return readableValue(JSON.parse(part), context, depth);
          } catch {
            return humanizeValueName(part);
          }
        })
        .join('; ');
    }
    const looksStructured =
      trimmed.startsWith('[') ||
      trimmed.startsWith('{') ||
      (trimmed.includes('...') && (trimmed.includes('{') || trimmed.includes('[') || trimmed.includes(',')));
    if (looksStructured) {
      try {
        return readableValue(JSON.parse(trimmed), context, depth);
      } catch {
        const readable = trimmed
          .replace(/[{}[\]"]/g, '')
          .replaceAll('_', ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replaceAll(':', ': ')
          .replaceAll(',', '; ')
          .replace(/\s+/g, ' ')
          .trim();
        return readable + (trimmed.endsWith('...') ? ' (additional settings omitted)' : '');
      }
    }
    return /^[A-Z0-9_]+$/.test(trimmed) || trimmed.includes('_') ? humanizeValueName(trimmed) : trimmed;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'none';
    }
    const visible = value.slice(0, 6).map((item) => readableValue(item, context, depth + 1));
    const remaining = value.length - visible.length;
    return `${visible.join('; ')}${remaining > 0 ? `; and ${remaining.toLocaleString()} more` : ''}`;
  }
  if (typeof value === 'object') {
    if (depth >= 3) {
      return 'updated configuration';
    }
    const entries = Object.entries(value as Record<string, unknown>);
    const visible = entries
      .slice(0, 6)
      .map(([key, item]) => `${humanizeValueName(key)}: ${readableValue(item, key, depth + 1)}`);
    const remaining = entries.length - visible.length;
    return `${visible.join(', ')}${remaining > 0 ? `, and ${remaining.toLocaleString()} more settings` : ''}`;
  }
  return String(value);
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

  return <Typography component="dd">{readableValue(value, label)}</Typography>;
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
    <Box component="article" className="game-master-updates__entry">
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

        {change.fields.length > 0 && (
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
        )}
      </Box>
    </Box>
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
                    <Stack divider={<Divider flexItem />}>
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
