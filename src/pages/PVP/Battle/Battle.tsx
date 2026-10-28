import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import '../PVP.scss';

import SelectPoke, { type SelectPokeHandle } from './Select';
import APIService from '../../../services/api.service';
import {
  convertNameRankingToOri,
  getArrayBySeq,
  getDmgMultiplyBonus,
  getKeyWithData,
  getMoveType,
  getStatProd,
  getTime,
  splitAndCapitalize,
} from '../../../utils/utils';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { calculateCP, calculateStatsByTag, getBaseStatsByIVandLevel } from '../../../utils/calculate';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import Timeline from './Timeline/Timeline';
import TimelineFit from './Timeline/TimelineFit';
import TimelineVertical from './Timeline/TimelineVertical';

import { Checkbox, FormControlLabel, IconButton, Radio, RadioGroup, Slider } from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TuneIcon from '@mui/icons-material/Tune';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import CircleBar from '../../../components/Sprites/ProgressBar/Circle';
import HpBar from '../../../components/Sprites/ProgressBar/HpBar';
import { useParams } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CasinoIcon from '@mui/icons-material/Casino';
import { BattlePokemonData, IBattlePokemonData, RankingsPVP } from '../../../core/models/pvp.model';
import { ICombat } from '../../../core/models/combat.model';
import {
  IPokemonBattleData,
  ITimeline,
  PokemonBattle,
  PokemonBattleData,
  IPokemonBattle,
  ChargeType,
} from '../models/battle.model';
import type { PvpBattlePokemonRequest, PvpBattleStrategyRequest } from '../../../services/models/tools-api.model';
import { BattleBaseStats, IBattleBaseStats, StatsCalculate } from '../../../utils/models/calculate.model';
import { AttackType } from './enums/attack-type.enum';
import { PokemonType, TypeAction } from '../../../enums/type.enum';
import {
  combineClasses,
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isInclude,
  isNotEmpty,
  toFloat,
  toNumber,
} from '../../../utils/extension';
import { LeagueBattleType } from '../../../core/enums/league.enum';
import { BattleType, TimelineType } from './enums/battle.enum';
import { BattleLeagueCPType } from '../../../utils/enums/compute.enum';
import { ScoreType } from '../../../utils/enums/constants.enum';
import { TimelineEvent } from '../../../utils/models/overrides/dom.model';
import { LinkToTop, useNavigateToTop } from '../../../components/Link/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import type { ILeague } from '../../../core/models/league.model';
import { IncludeMode } from '../../../utils/enums/string.enum';
import Error from '../../Error/Error';
import Tooltips from '../../../components/Commons/Tooltips/Tooltips';
import { AxiosError } from 'axios';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { getBattleHp, getRandomNumber, overlappingPosFromOffsets, pushOffsetById } from '../utils/battle.utils';
import {
  battleDelay,
  combatMaxEnergy,
  defaultAmount,
  defaultBlock,
  defaultPlusSize,
  defaultSize,
  formShadow,
  maxIv,
  maxLevel,
  minCp,
  minIv,
  minLevel,
  stepLevel,
} from '../../../utils/helpers/options-context.helpers';
import useAssets from '../../../composables/useAssets';
import useSpinner from '../../../composables/useSpinner';
import usePokemon from '../../../composables/usePokemon';
import { Params } from '../../../utils/constants';
import useDevice from '../../../composables/useDevice';
import useDataStore from '../../../composables/useDataStore';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import SelectMui from '../../../components/Commons/Selects/SelectMui';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import AccordionMui from '../../../components/Commons/Accordions/AccordionMui';
import { useSnackbar } from '../../../contexts/snackbar.context';
import { exportBattleReportImage } from './utils/battle-export';
import BattlePokemonImage from './BattlePokemonImage';
import DismissibleAlert from '../../../components/Commons/Alerts/DismissibleAlert';
import PokemonTableIcon from '../../../components/Sprites/PokemonTableIcon/PokemonTableIcon';

const DialogMui = React.lazy(() => import('../../../components/Commons/Dialogs/Dialogs'));

interface OptionsBattle {
  showTap: boolean;
  timelineType: TimelineType;
  duration: number;
  league: number;
  volume: number;
  playerStrategy: PvpBattleStrategyRequest;
  opponentStrategy: PvpBattleStrategyRequest;
}

interface IBattleState {
  pokemonCurr: IPokemonBattleData;
  pokemonObj: IPokemonBattleData;
}

type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;

type AudioContextWindow = Window & {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
};

const isIOSAudioDevice =
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const audioContextWindow = window as AudioContextWindow;
const shouldUseHTMLAudioPlayback =
  isIOSAudioDevice || !(audioContextWindow.AudioContext ?? audioContextWindow.webkitAudioContext);
const htmlAudioPoolSize = 3;
const maxPvpTeamSize = 3;
const teamOrderOptions = (teamSize: number) => {
  const indexes = Array.from({ length: teamSize }, (_, index) => index);
  const permutations = (values: number[]): number[][] =>
    values.length <= 1
      ? [values]
      : values.flatMap((value, index) =>
          permutations(values.filter((_, itemIndex) => itemIndex !== index)).map((rest) => [value, ...rest])
        );
  return permutations(indexes).map((order) => ({
    value: order.join('-'),
    label: order.map((index) => index + 1).join(' → '),
  }));
};
const strategyForTeam = (strategy: PvpBattleStrategyRequest, teamSize: number): PvpBattleStrategyRequest => ({
  ...strategy,
  ...(teamSize <= 1
    ? {
        voluntarySwitch: 'none',
        forcedSwitch: 'first',
        switchOrder: undefined,
        actions: strategy.actions?.filter((action) => action.type !== 'switch'),
      }
    : {
        switchOrder: strategy.switchOrder?.filter((index) => index < teamSize),
      }),
});
const defaultLeagueId = (cp: number) =>
  cp === BattleLeagueCPType.Little
    ? 'DEFAULT_LITTLE'
    : cp === BattleLeagueCPType.Great
      ? 'DEFAULT_GREAT'
      : cp === BattleLeagueCPType.Ultra
        ? 'DEFAULT_ULTRA'
        : 'DEFAULT_MASTER';
const createPokemonStatRefs = () => ({
  level: React.createRef<HTMLInputElement>(),
  atk: React.createRef<HTMLInputElement>(),
  def: React.createRef<HTMLInputElement>(),
  hp: React.createRef<HTMLInputElement>(),
});
type PokemonStatRefs = ReturnType<typeof createPokemonStatRefs>;

class BattleState implements IBattleState {
  pokemonCurr = new PokemonBattleData();
  pokemonObj = new PokemonBattleData();
}

const stopAudio = (audio: HTMLAudioElement | undefined) => {
  if (audio && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
};

const stopPokemonAudio = (pokemon: IPokemonBattle) => {
  stopAudio(pokemon.audio?.fMove);
  stopAudio(pokemon.audio?.cMovePri);
  stopAudio(pokemon.audio?.cMoveSec);
};

const Battle = () => {
  const { pokemonsData, combatsData, assetsData, optionsData } = useDataStore();
  const { findPokemonByPvpokeSpeciesId, findPokemonBySlug } = usePokemon();
  const { findAssetForm } = useAssets();
  const { hideSpinner, showSpinner, showSpinnerMsg } = useSpinner();
  const { isMobile } = useDevice();
  const params = useParams();
  const navigateToTop = useNavigateToTop();

  const { showSnackbar } = useSnackbar();
  const [openBattle, setOpenBattle] = useState(false);
  const [strategyDialog, setStrategyDialog] = useState<'playerStrategy' | 'opponentStrategy'>();
  const [data, setData] = useState<IBattlePokemonData[]>([]);
  const [leagueRules, setLeagueRules] = useState<ILeague[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState(() =>
    defaultLeagueId(toNumber(params.cp, BattleLeagueCPType.Little))
  );
  const [options, setOptions] = useState<OptionsBattle>({
    showTap: false,
    timelineType: TimelineType.Normal,
    duration: 1,
    league: toNumber(params.cp, BattleLeagueCPType.Little),
    volume: 0,
    playerStrategy: {
      shield: 'always',
      charged: 'selected',
      voluntarySwitch: 'none',
      forcedSwitch: 'first',
    },
    opponentStrategy: {
      shield: 'always',
      charged: 'selected',
      voluntarySwitch: 'none',
      forcedSwitch: 'first',
    },
  });
  const { showTap, timelineType, duration, league, volume, playerStrategy, opponentStrategy } = options;

  const timelineFit = useRef<HTMLDivElement>();
  const timelineNormal = useRef<HTMLDivElement>();
  const timelineNormalContainer = useRef<HTMLDivElement>();
  const playLine = useRef<HTMLDivElement>();
  const timelineFocusRef = useRef<HTMLDivElement>(null);

  const levelCurrRef = useRef<HTMLInputElement>(null);
  const atkIVCurrRef = useRef<HTMLInputElement>(null);
  const defIVCurrRef = useRef<HTMLInputElement>(null);
  const hpIVCurrRef = useRef<HTMLInputElement>(null);
  const levelObjRef = useRef<HTMLInputElement>(null);
  const atkIVObjRef = useRef<HTMLInputElement>(null);
  const defIVObjRef = useRef<HTMLInputElement>(null);
  const hpIVObjRef = useRef<HTMLInputElement>(null);
  const pokemonCurrBenchStatRefs = useRef<PokemonStatRefs[]>([]).current;
  const pokemonObjBenchStatRefs = useRef<PokemonStatRefs[]>([]).current;
  const pokemonCurrSelectRefs = useRef<Array<SelectPokeHandle | null>>([]).current;
  const pokemonObjSelectRefs = useRef<Array<SelectPokeHandle | null>>([]).current;

  const [pokemonCurr, setPokemonCurr] = useState(new PokemonBattle());
  const [pokemonObj, setPokemonObj] = useState(new PokemonBattle());
  const [pokemonCurrBench, setPokemonCurrBench] = useState<IPokemonBattle[]>([]);
  const [pokemonObjBench, setPokemonObjBench] = useState<IPokemonBattle[]>([]);
  const [leadExpanded, setLeadExpanded] = useState({ player: true, opponent: true });
  const [pokemonCurrBenchExpanded, setPokemonCurrBenchExpanded] = useState<boolean[]>([]);
  const [pokemonObjBenchExpanded, setPokemonObjBenchExpanded] = useState<boolean[]>([]);
  const [activeTeamIndexes, setActiveTeamIndexes] = useState({ player: 0, opponent: 0 });
  const [timelineCursor, setTimelineCursor] = useState(-1);
  const [playTimeline, setPlayTimeline] = useState(new BattleState());

  const [isFound, setIsFound] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    APIService.getFetchUrl<{
      data: {
        data: ILeague[];
        schedules: Array<{ windows: Array<{ start: number; end: number; leagueIds: string[] }> }>;
      };
    }>(APIService.getBattleLeagues(), { signal: controller.signal })
      .then(({ data: response }) => {
        const now = Date.now();
        const activeIds = new Set(
          response.data.schedules.flatMap((season) =>
            season.windows.flatMap((window) => (window.start <= now && now < window.end ? window.leagueIds : []))
          )
        );
        setLeagueRules(response.data.data.filter((item) => item.id && activeIds.has(item.id)));
      })
      .catch((error: unknown) => {
        if (!APIService.isCancel(error)) {
          showSnackbar('Unable to load current cup rules.', 'error');
        }
      });
    return () => controller.abort();
  }, [showSnackbar]);

  const focusBattleTimeline = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timelineFocusRef.current?.focus({ preventScroll: true });
        timelineFocusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }, []);

  const createBattleRequest = (pokemon: IPokemonBattle): PvpBattlePokemonRequest => {
    const pokemonData = pokemon.pokemonData;
    const currentStats = pokemonData?.currentStats;
    const maxHp = getBattleHp(currentStats?.stats?.statSTA);
    return {
      id: pokemonData?.id,
      pokemonId: pokemonData?.pokemon?.pokemonId?.toString(),
      form: pokemonData?.form,
      cp: currentStats?.CP,
      caughtAt: pokemon.caughtAt,
      name: pokemonData?.name,
      stats: {
        atk: toNumber(pokemonData?.stats?.atk),
        def: toNumber(pokemonData?.stats?.def),
        sta: toNumber(pokemonData?.stats?.sta),
      },
      current: {
        level: toNumber(currentStats?.level, minLevel()),
        iv: {
          atk: toNumber(currentStats?.IV?.atkIV),
          def: toNumber(currentStats?.IV?.defIV),
          sta: toNumber(currentStats?.IV?.staIV),
        },
        hp: maxHp,
        startingHp: Math.max(1, Math.min(maxHp, pokemon.startingHp ?? maxHp)),
        statStages: {
          atk: toNumber(pokemon.attackStage),
          def: toNumber(pokemon.defenseStage),
        },
      },
      types: pokemonData?.pokemon?.types ?? [],
      pokemonType: pokemon.pokemonType,
      fastMove: pokemon.fMove as ICombat,
      primaryMove: pokemon.cMovePri,
      secondaryMove: pokemon.cMoveSec,
      energy: pokemon.energy,
      block: pokemon.block,
      chargeSlot: pokemon.chargeSlot,
      disablePrimary: pokemon.disableCMovePri,
      disableSecondary: pokemon.disableCMoveSec,
    };
  };

  const isBattlePokemonReady = (pokemon: IPokemonBattle) =>
    !!pokemon.pokemonData &&
    !!pokemon.fMove &&
    (pokemon.disableCMoveSec || !!pokemon.cMoveSec) &&
    (pokemon.disableCMovePri || !!pokemon.cMovePri);

  const battleAnimation = async () => {
    const playerTeam = [pokemonCurr, ...pokemonCurrBench];
    const opponentTeam = [pokemonObj, ...pokemonObjBench];
    const playerBenchExpanded = [...pokemonCurrBenchExpanded];
    const opponentBenchExpanded = [...pokemonObjBenchExpanded];
    if (!playerTeam.every(isBattlePokemonReady) || !opponentTeam.every(isBattlePokemonReady)) {
      showSnackbar('Select a Pokémon and moves for every team slot.', 'error');
      return;
    }

    arrBound.current = [];
    arrStore.current = [];
    resetTimeline();
    showSpinner();
    try {
      const response = await APIService.postPvpBattleSimulator({
        pokemon: createBattleRequest(pokemonCurr),
        opponent: createBattleRequest(pokemonObj),
        team: playerTeam.map(createBattleRequest),
        opponentTeam: opponentTeam.map(createBattleRequest),
        config: {
          battleDelay: battleDelay(),
          defaultSize: defaultSize(),
          defaultPlusSize: defaultPlusSize(),
          defaultAmount: defaultAmount(),
          minLevel: minLevel(),
          leagueId: selectedLeagueId,
          playerStrategy: strategyForTeam(playerStrategy, playerTeam.length),
          opponentStrategy: strategyForTeam(opponentStrategy, opponentTeam.length),
        },
      });
      setPokemonCurr(
        PokemonBattle.create({
          ...pokemonCurr,
          timeline: response.data.data.timeline,
        })
      );
      setPokemonObj(
        PokemonBattle.create({
          ...pokemonObj,
          timeline: response.data.data.timelineOpponent,
        })
      );
      setPokemonCurrBench(playerTeam.slice(1));
      setPokemonObjBench(opponentTeam.slice(1));
      setLeadExpanded({ player: false, opponent: false });
      setPokemonCurrBenchExpanded(playerBenchExpanded.map(() => false));
      setPokemonObjBenchExpanded(opponentBenchExpanded.map(() => false));
      const warningMessages = [...new Set((response.data.meta.warnings ?? []).map((warning) => warning.message))];
      if (warningMessages.length) {
        showSnackbar(warningMessages.join(' '), 'warning');
      }
      focusBattleTimeline();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      showSnackbar(axiosError.response?.data?.error ?? axiosError.message, 'error');
    } finally {
      hideSpinner();
    }
  };

  const clearBattleResult = () => {
    arrBound.current = [];
    arrStore.current = [];
    resetTimeline();
    setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, timeline: [] }));
    setPokemonObj(PokemonBattle.create({ ...pokemonObj, timeline: [] }));
  };

  const getBattleExportImageUrls = (pokemon: IPokemonBattle) => [
    APIService.getPokemonModel(pokemon.pokemonData?.assetForm, pokemon.pokemonData?.id),
    APIService.getPokemonSqModel(pokemon.pokemonData?.assetForm, pokemon.pokemonData?.id),
    APIService.getPokeFullSprite(pokemon.pokemonData?.id, pokemon.pokemonData?.form),
    APIService.getPokeFullAsset(pokemon.pokemonData?.id),
  ];

  const exportBattle = async () => {
    if (!pokemonCurr.pokemonData || !pokemonObj.pokemonData) {
      showSnackbar('Battle information is unavailable.', 'error');
      return;
    }
    showSpinner();
    try {
      const playerTeam = [pokemonCurr, ...pokemonCurrBench];
      const opponentTeam = [pokemonObj, ...pokemonObjBench];
      await exportBattleReportImage({
        leagueName: getPokemonBattleLeagueName(league),
        turnDurationSeconds: optionsData.combatOptions.turnDurationSeconds || 0.5,
        player: pokemonCurr,
        opponent: pokemonObj,
        playerTeam,
        opponentTeam,
        playerTeamImageUrls: playerTeam.map(getBattleExportImageUrls),
        opponentTeamImageUrls: opponentTeam.map(getBattleExportImageUrls),
      });
      showSnackbar('Battle report exported as PNG.', 'success');
    } catch (error) {
      showSnackbar(error instanceof globalThis.Error ? error.message : 'Unable to export battle report.', 'error');
    } finally {
      hideSpinner();
    }
  };

  const clearData = () => {
    stopPokemonAudio(pokemonCurr);
    stopPokemonAudio(pokemonObj);
    setPokemonObj(new PokemonBattle());
    setPokemonCurr(new PokemonBattle());
    setPokemonCurrBench([]);
    setPokemonObjBench([]);
    setLeadExpanded({ player: true, opponent: true });
    setPokemonCurrBenchExpanded([]);
    setPokemonObjBenchExpanded([]);
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PVP Battle Simulator | PokéGO Breeze',
    description:
      'Simulate Pokémon GO PVP battles between any Pokémon across different leagues. Test movesets, strategies, and optimize your team.',
    keywords: [
      'Pokémon GO',
      'PVP battles',
      'battle simulator',
      'Great League',
      'Ultra League',
      'Master League',
      'PokéGO Breeze',
    ],
  });

  useTitle(titleProps);

  const fetchPokemonBattle = useCallback(
    async (league: number, signal: AbortSignal) => {
      showSpinner();
      try {
        clearData();
        const { data: file } = await APIService.getFetchUrl<RankingsPVP[]>(
          APIService.getRankingFile(LeagueBattleType.All, league, getKeyWithData(ScoreType, ScoreType.Overall)),
          { signal }
        );
        if (!isNotEmpty(file)) {
          setIsFound(false);
          return;
        }
        setTitleProps({
          title: `PVP Battle Simulator - ${getPokemonBattleLeagueName(league)}`,
          description: `Simulate Pokémon GO PVP battles in the ${getPokemonBattleLeagueName(
            league
          )}. Test different Pokémon, movesets, and battle strategies.`,
          keywords: [
            'Pokémon GO',
            `${getPokemonBattleLeagueName(league)}`,
            'PVP battles',
            'battle simulator',
            'PVP strategies',
            'PokéGO Breeze',
          ],
          image: getPokemonBattleLeagueIcon(league),
        });

        const result = file
          .filter((pokemon) => !isInclude(pokemon.speciesId, '_xs'))
          .map((item) => {
            const name = convertNameRankingToOri(item.speciesId, item.speciesName);
            const pokemon = findPokemonByPvpokeSpeciesId(item.speciesId) ?? findPokemonBySlug(name);
            if (!pokemon) {
              return new BattlePokemonData();
            }

            const id = pokemon.num;
            const assetForm = findAssetForm(pokemon.num, pokemon.form);

            const stats = calculateStatsByTag(pokemon, pokemon.baseStats, pokemon.slug);

            item.scorePVP = HexagonStats.create(item.scores);

            let pokemonType = PokemonType.Normal;
            if (isInclude(item.speciesName, `(${formShadow()})`, IncludeMode.IncludeIgnoreCaseSensitive)) {
              pokemonType = PokemonType.Shadow;
            }

            return BattlePokemonData.create({
              ...item,
              name,
              pokemon,
              id,
              form: pokemon.form,
              assetForm,
              stats,
              pokemonType,
            });
          })
          .filter((pokemon) => pokemon.id > 0);
        setData(result);
        hideSpinner();
      } catch (e) {
        if (APIService.isCancel(e)) {
          return;
        }
        if ((e as AxiosError)?.status === 404) {
          setIsFound(false);
        } else {
          showSpinnerMsg({
            isError: true,
            message: (e as AxiosError).message,
          });
        }
      }
    },
    [findPokemonByPvpokeSpeciesId, findPokemonBySlug]
  );

  useEffect(() => {
    if (!isNotEmpty(pokemonsData) || !isNotEmpty(combatsData) || !isNotEmpty(assetsData)) {
      return;
    }
    const controller = new AbortController();
    fetchPokemonBattle(league, controller.signal);
    return () => {
      controller.abort();
      hideSpinner();
    };
  }, [assetsData, combatsData, fetchPokemonBattle, league, pokemonsData]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline)) {
      stopTimeline();
      const elem = playLine.current;
      if (timelineType === TimelineType.Fit) {
        const oldWidth = xFit.current;
        const newWidth = toNumber(timelineFit.current?.clientWidth);
        // offsetLeft values change proportionally with container width in Fit mode — re-collect
        arrStore.current = [];
        for (let i = 0; i < pokemonCurr.timeline.length; i++) {
          pushOffsetById(arrStore.current, i);
        }
        if (elem) {
          const oldX = getTranslation(elem);
          const newX = oldWidth > 0 ? (oldX / oldWidth) * newWidth : 0;
          elem.style.transform = `translate(${newX}px, -50%)`;
          checkOverlap(arrStore.current, newX);
        }
        xFit.current = newWidth;
      } else {
        // Normal mode: offsetLeft values are stable regardless of window width
        if (!isNotEmpty(arrBound.current)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushOffsetById(arrBound.current, i);
          }
        }
        if (elem) {
          checkOverlap(arrBound.current, getTranslation(elem));
        }
      }
    }
  }, [windowWidth]);

  useEffect(() => {
    if (!timelinePlay.current) {
      return;
    }
    cancelAnimationFrame(timelinePlay.current);
    timelinePlay.current = null;
    start.current = 0;
    playingTimeline();
  }, [duration]);

  useEffect(() => {
    pokemonStateRef.current = { curr: pokemonCurr, obj: pokemonObj };
  }, [pokemonCurr, pokemonObj]);

  useEffect(() => {
    const applyVol = (audio: HTMLAudioElement | undefined) => {
      if (audio) {
        audio.volume = volume;
        audio.muted = volume === 0;
        if (volume === 0) {
          stopAudio(audio);
        }
      }
    };
    applyVol(pokemonCurr.audio?.fMove);
    applyVol(pokemonCurr.audio?.cMovePri);
    applyVol(pokemonCurr.audio?.cMoveSec);
    applyVol(pokemonObj.audio?.fMove);
    applyVol(pokemonObj.audio?.cMovePri);
    applyVol(pokemonObj.audio?.cMoveSec);
  }, [volume, pokemonCurr.audio, pokemonObj.audio]);

  const toggleMute = () => {
    if (volume > 0) {
      prevVolume.current = volume;
      setOptions({ ...options, volume: 0 });
    } else {
      setOptions({ ...options, volume: prevVolume.current || 0 });
    }
  };

  useEffect(() => {
    return () => {
      if (timelinePlay.current) {
        cancelAnimationFrame(timelinePlay.current);
      }
      stopPokemonAudio(pokemonStateRef.current.curr);
      stopPokemonAudio(pokemonStateRef.current.obj);
    };
  }, []);

  const clearDataPokemonCurr = (removeCMoveSec: boolean) => {
    stopPokemonAudio(pokemonCurr);
    setPokemonObj(PokemonBattle.create({ ...pokemonObj, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonCurr(
        PokemonBattle.create({
          ...pokemonCurr,
          cMoveSec: undefined,
          timeline: [],
        })
      );
    } else {
      setPokemonCurr(new PokemonBattle());
    }
  };

  const clearDataPokemonObj = (removeCMoveSec: boolean) => {
    stopPokemonAudio(pokemonObj);
    setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonObj(
        PokemonBattle.create({
          ...pokemonObj,
          cMoveSec: undefined,
          timeline: [],
        })
      );
    } else {
      setPokemonObj(new PokemonBattle());
    }
  };

  const timelinePlay = useRef<number | null>(null);
  const start = useRef(0);
  const [playState, setPlayState] = useState(false);
  const scrollWidth = useRef(0);
  const xFit = useRef(0);
  const arrBound = useRef<number[]>([]);
  const arrStore = useRef<number[]>([]);
  const lastSoundIndex = useRef(-1);
  const lastTimelineIndex = useRef(-1);
  const pokemonStateRef = useRef({ curr: pokemonCurr, obj: pokemonObj });
  const prevVolume = useRef(1);
  const moveAudioContext = useRef<AudioContext>();
  const moveAudioGain = useRef<GainNode>();
  const moveAudioData = useRef(new Map<string, ArrayBuffer>());
  const moveAudioBuffers = useRef(new Map<string, AudioBuffer>());
  const moveAudioPending = useRef(new Map<string, Promise<ArrayBuffer | undefined>>());
  const moveAudioDecodePending = useRef(new Map<string, Promise<void>>());
  const activeMoveAudio = useRef(new Set<AudioBufferSourceNode>());
  const htmlMoveAudioPools = useRef(new Map<HTMLAudioElement, HTMLAudioElement[]>());
  const preparingMoveAudio = useRef(false);

  const getMoveAudioContext = useCallback(() => {
    if (!moveAudioContext.current) {
      const AudioContextClass = audioContextWindow.AudioContext ?? audioContextWindow.webkitAudioContext;
      if (!AudioContextClass) {
        return undefined;
      }
      const context = new AudioContextClass();
      const gain = context.createGain();
      gain.connect(context.destination);
      moveAudioContext.current = context;
      moveAudioGain.current = gain;
    }
    return moveAudioContext.current;
  }, []);

  const preloadMoveAudio = useCallback((audio: HTMLAudioElement | undefined) => {
    const url = audio?.src;
    if (!url) {
      return Promise.resolve(undefined);
    }
    const cached = moveAudioData.current.get(url);
    if (cached) {
      return Promise.resolve(cached);
    }
    const inProgress = moveAudioPending.current.get(url);
    if (inProgress) {
      return inProgress;
    }
    const pending = fetch(url, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) {
          throw new globalThis.Error(`Unable to load move audio: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        moveAudioData.current.set(url, data);
        return data;
      })
      .catch(() => undefined)
      .finally(() => {
        moveAudioPending.current.delete(url);
      });
    moveAudioPending.current.set(url, pending);
    return pending;
  }, []);

  const decodeMoveAudio = useCallback(
    (audio: HTMLAudioElement | undefined, context: AudioContext) => {
      const url = audio?.src;
      if (!url || moveAudioBuffers.current.has(url)) {
        return Promise.resolve();
      }
      const inProgress = moveAudioDecodePending.current.get(url);
      if (inProgress) {
        return inProgress;
      }
      const pending = preloadMoveAudio(audio)
        .then(async (data) => {
          if (!data || moveAudioBuffers.current.has(url)) {
            return;
          }
          const buffer = await context.decodeAudioData(data.slice(0));
          moveAudioBuffers.current.set(url, buffer);
        })
        .catch(() => undefined)
        .finally(() => {
          moveAudioDecodePending.current.delete(url);
        });
      moveAudioDecodePending.current.set(url, pending);
      return pending;
    },
    [preloadMoveAudio]
  );

  const getMoveAudio = useCallback(
    () => [
      pokemonCurr.audio?.fMove,
      pokemonCurr.audio?.cMovePri,
      pokemonCurr.audio?.cMoveSec,
      pokemonObj.audio?.fMove,
      pokemonObj.audio?.cMovePri,
      pokemonObj.audio?.cMoveSec,
    ],
    [pokemonCurr.audio, pokemonObj.audio]
  );

  const getHTMLMoveAudioPool = useCallback((audio: HTMLAudioElement) => {
    const cached = htmlMoveAudioPools.current.get(audio);
    if (cached) {
      return cached;
    }
    const pool = [audio, ...Array.from({ length: htmlAudioPoolSize - 1 }, () => new Audio(audio.src))];
    pool.forEach((item) => {
      item.preload = 'auto';
    });
    htmlMoveAudioPools.current.set(audio, pool);
    return pool;
  }, []);

  const prepareHTMLMoveAudioPlayback = useCallback(async () => {
    const audio = getMoveAudio()
      .filter((item): item is HTMLAudioElement => Boolean(item))
      .flatMap(getHTMLMoveAudioPool);
    const unlock = audio.map((item) => {
      item.muted = true;
      item.load();
      return item
        .play()
        .then(() => {
          stopAudio(item);
          item.volume = volume;
          item.muted = volume === 0;
        })
        .catch(() => undefined);
    });
    await Promise.all(unlock);
  }, [getHTMLMoveAudioPool, getMoveAudio, volume]);

  const prepareMoveAudioPlayback = useCallback(async () => {
    const context = getMoveAudioContext();
    if (!context) {
      return;
    }
    const gain = moveAudioGain.current;
    if (gain) {
      gain.gain.setValueAtTime(volume, context.currentTime);
    }

    // iOS Safari requires resume/start to happen synchronously inside the Play gesture.
    const resume = context.state === 'suspended' ? context.resume() : Promise.resolve();
    const unlock = context.createBufferSource();
    unlock.buffer = context.createBuffer(1, 1, context.sampleRate);
    unlock.connect(context.destination);
    unlock.start(0);

    await resume;
    await Promise.all(getMoveAudio().map((audio) => decodeMoveAudio(audio, context)));
  }, [decodeMoveAudio, getMoveAudio, getMoveAudioContext, volume]);

  const stopDecodedMoveAudio = useCallback(() => {
    activeMoveAudio.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // The source may already have ended.
      }
    });
    activeMoveAudio.current.clear();
  }, []);

  const stopHTMLMoveAudio = useCallback(() => {
    htmlMoveAudioPools.current.forEach((pool) => pool.forEach(stopAudio));
  }, []);

  useEffect(() => {
    getMoveAudio().forEach((audio) => void preloadMoveAudio(audio));
  }, [getMoveAudio, preloadMoveAudio]);

  useEffect(() => {
    const context = moveAudioContext.current;
    const gain = moveAudioGain.current;
    if (context && gain) {
      gain.gain.setValueAtTime(volume, context.currentTime);
    }
    if (volume === 0) {
      stopDecodedMoveAudio();
      stopHTMLMoveAudio();
    }
    htmlMoveAudioPools.current.forEach((pool) => {
      pool.forEach((audio) => {
        audio.volume = volume;
        audio.muted = volume === 0;
      });
    });
  }, [stopDecodedMoveAudio, stopHTMLMoveAudio, volume]);

  useEffect(
    () => () => {
      stopDecodedMoveAudio();
      stopHTMLMoveAudio();
      htmlMoveAudioPools.current.clear();
      const context = moveAudioContext.current;
      moveAudioContext.current = undefined;
      moveAudioGain.current = undefined;
      if (context?.state !== 'closed') {
        void context?.close();
      }
    },
    [stopDecodedMoveAudio, stopHTMLMoveAudio]
  );

  const getTranslation = (elem: HTMLElement) =>
    elem ? toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', '')) : 0;

  const onPlayLineMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeline();
    const elem = playLine.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    if (elem && x <= toNumber(timelineNormal.current?.clientWidth) - 2) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      !isNotEmpty(arrBound.current) &&
      isNotEmpty(pokemonCurr.timeline) &&
      arrBound.current.length < pokemonCurr.timeline.length
    ) {
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushOffsetById(arrBound.current, i);
      }
    }
    checkOverlap(arrBound.current, x);
  };

  const onPlayLineFitMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeline();
    const elem = playLine.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    if (elem && x <= toNumber(timelineFit.current?.clientWidth)) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      (xFit.current !== e.currentTarget.clientWidth || !isNotEmpty(arrStore.current)) &&
      isNotEmpty(pokemonCurr.timeline)
    ) {
      xFit.current = e.currentTarget.clientWidth;
      arrStore.current = [];
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushOffsetById(arrStore.current, i);
      }
    }
    checkOverlap(arrStore.current, x);
  };

  const playingTimeline = async () => {
    if (preparingMoveAudio.current) {
      return;
    }
    if (volume > 0) {
      preparingMoveAudio.current = true;
      try {
        if (shouldUseHTMLAudioPlayback) {
          await prepareHTMLMoveAudioPlayback();
        } else {
          await prepareMoveAudioPlayback();
        }
      } finally {
        preparingMoveAudio.current = false;
      }
    }
    setPlayState(true);
    lastSoundIndex.current = -1;
    lastTimelineIndex.current = -1;
    const range = pokemonCurr.timeline.length;
    const elem = playLine.current;
    let xCurrent = 0;
    if (elem) {
      if (timelineType === TimelineType.Normal) {
        xCurrent = elem.style.transform
          ? getTranslation(elem) >= toNumber(timelineNormal.current?.clientWidth) - 2
            ? 0
            : getTranslation(elem)
          : 0;
        timelineNormalContainer.current?.scrollTo({
          left: Math.max(0, xCurrent - timelineNormalContainer.current?.clientWidth / 2),
        });
        if (!isNotEmpty(arrBound.current)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushOffsetById(arrBound.current, i);
          }
        }
        checkOverlap(arrBound.current, xCurrent);
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        xCurrent = elem.style.transform ? (getTranslation(elem) >= clientWidth - 1 ? 0 : getTranslation(elem)) : 0;
        xFit.current = clientWidth;
        if (!isNotEmpty(arrStore.current)) {
          for (let i = 0; i < range; i++) {
            pushOffsetById(arrStore.current, i);
          }
        }
        checkOverlap(arrStore.current, xCurrent);
      }
    }
    if (!start.current) {
      start.current = performance.now();
    }
    timelinePlay.current = requestAnimationFrame(function animate(timestamp: number) {
      if (timelineType === TimelineType.Normal) {
        const durationFactor =
          Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrBound.current.length))) * duration;
        const clientWidth = toNumber(timelineNormal.current?.clientWidth);
        const clientWidthContainer = toNumber(timelineNormalContainer.current?.clientWidth);
        const width = Math.min(clientWidth - 2, xCurrent + durationFactor * (clientWidth - 2));
        if (width >= clientWidth - 2) {
          if (elem) {
            elem.style.transform = `translate(${clientWidth - 2}px, -50%)`;
          }
          return stopTimeline();
        }
        if (elem) {
          elem.style.transform = `translate(${width}px, -50%)`;
          checkOverlap(arrBound.current, width, true);
        }
        if (Math.min(width, clientWidthContainer / 2) === clientWidthContainer / 2) {
          timelineNormalContainer.current?.scrollTo({
            left: width - timelineNormalContainer.current?.clientWidth / 2,
          });
        }
        if (width < clientWidth) {
          timelinePlay.current = requestAnimationFrame(animate);
        }
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        const durationFactor =
          Math.min(1, Math.max(0, (timestamp - start.current) / (500 * arrStore.current.length))) * duration;
        const width = Math.min(clientWidth, xCurrent + durationFactor * clientWidth);
        if (elem) {
          elem.style.transform = `translate(${width}px, -50%)`;
          checkOverlap(arrStore.current, width, true);
        }
        if (width < clientWidth) {
          timelinePlay.current = requestAnimationFrame(animate);
        } else {
          if (elem) {
            elem.style.transform = `translate(${timelineFit.current?.clientWidth}px, -50%)`;
          }
          return stopTimeline();
        }
      }
    });
  };

  const stopTimeline = () => {
    setPlayState(false);
    cancelAnimationFrame(toNumber(timelinePlay.current));
    timelinePlay.current = null;
    start.current = 0;
    lastSoundIndex.current = -1;
    stopDecodedMoveAudio();
    stopHTMLMoveAudio();
    stopPokemonAudio(pokemonCurr);
    stopPokemonAudio(pokemonObj);
    return;
  };

  const resetTimeline = () => {
    stopTimeline();
    lastTimelineIndex.current = -1;
    setTimelineCursor(-1);
    setActiveTeamIndexes({ player: 0, opponent: 0 });
    const elem = playLine.current;
    if (timelineType === TimelineType.Normal && timelineNormalContainer.current) {
      timelineNormalContainer.current.scrollTo({
        left: 0,
      });
    }
    if (elem) {
      elem.style.transform = 'translate(0px, -50%)';
    }
    setPlayTimeline({
      pokemonCurr: PokemonBattleData.setValue(
        pokemonCurr.energy,
        getBattleHp(pokemonCurr.pokemonData?.currentStats?.stats?.statSTA)
      ),
      pokemonObj: PokemonBattleData.setValue(
        pokemonObj.energy,
        getBattleHp(pokemonObj.pokemonData?.currentStats?.stats?.statSTA)
      ),
    });
  };

  const checkOverlap = (offsets: number[], pos = 0, sound = false) => {
    const crossedMarkerCount = overlappingPosFromOffsets(offsets, pos);
    const eventIndex = crossedMarkerCount - 1;
    if (eventIndex >= -1 && eventIndex < offsets.length) {
      updateTimeline(eventIndex, sound);
    }
  };

  const playMoveAudio = (pokemon: IPokemonBattle, entry: ITimeline | undefined) => {
    if (!entry || volume === 0) {
      return;
    }
    let audio: HTMLAudioElement | undefined;
    if (entry.type === AttackType.Fast) {
      audio = pokemon.audio?.fMove;
    } else if (entry.type === AttackType.Charge) {
      audio =
        pokemon.cMoveSec && entry.move && entry.move.name === pokemon.cMoveSec.name
          ? pokemon.audio?.cMoveSec
          : pokemon.audio?.cMovePri;
    }
    if (audio) {
      if (shouldUseHTMLAudioPlayback) {
        const availableAudio = getHTMLMoveAudioPool(audio).find((item) => item.paused || item.ended);
        if (availableAudio) {
          availableAudio.muted = false;
          availableAudio.volume = volume;
          void availableAudio.play().catch(() => undefined);
        }
        return;
      }
      const context = getMoveAudioContext();
      const buffer = moveAudioBuffers.current.get(audio.src);
      if (context) {
        if (!buffer) {
          void decodeMoveAudio(audio, context);
          return;
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(moveAudioGain.current ?? context.destination);
        source.onended = () => activeMoveAudio.current.delete(source);
        activeMoveAudio.current.add(source);
        source.start();
        return;
      }
      audio.muted = false;
      audio.volume = volume;
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    }
  };

  const updateTimeline = (index: number, sound = false) => {
    if (index < 0) {
      if (index === lastTimelineIndex.current) {
        return;
      }
      lastTimelineIndex.current = -1;
      lastSoundIndex.current = -1;
      setTimelineCursor(-1);
      setActiveTeamIndexes({ player: 0, opponent: 0 });
      setPlayTimeline({
        pokemonCurr: PokemonBattleData.setValue(
          pokemonCurr.energy,
          getBattleHp(pokemonCurr.pokemonData?.currentStats?.stats?.statSTA)
        ),
        pokemonObj: PokemonBattleData.setValue(
          pokemonObj.energy,
          getBattleHp(pokemonObj.pokemonData?.currentStats?.stats?.statSTA)
        ),
      });
      return;
    }
    const pokeCurrData = pokemonCurr.timeline.at(index);
    const pokeObjData = pokemonObj.timeline.at(index);
    const playerTeam = [pokemonCurr, ...pokemonCurrBench];
    const opponentTeam = [pokemonObj, ...pokemonObjBench];
    const playerIndex = pokeCurrData?.activeIndex ?? 0;
    const opponentIndex = pokeObjData?.activeIndex ?? 0;
    if (sound && index !== lastSoundIndex.current) {
      lastSoundIndex.current = index;
      playMoveAudio(playerTeam[playerIndex] ?? pokemonCurr, pokeCurrData);
      playMoveAudio(opponentTeam[opponentIndex] ?? pokemonObj, pokeObjData);
    }
    if (index === lastTimelineIndex.current) {
      return;
    }
    lastTimelineIndex.current = index;
    setTimelineCursor(index);
    setActiveTeamIndexes({ player: playerIndex, opponent: opponentIndex });
    setPlayTimeline({
      pokemonCurr: PokemonBattleData.setValue(pokeCurrData?.energy, pokeCurrData?.hp),
      pokemonObj: PokemonBattleData.setValue(pokeObjData?.energy, pokeObjData?.hp),
    });
  };

  const onScrollTimeline = (e: React.SyntheticEvent<HTMLDivElement>) => {
    scrollWidth.current = e.currentTarget.scrollLeft;
  };

  const onChangeTimeline = (type: TimelineType) => {
    stopTimeline();
    let elem = playLine.current;
    let xCurrent = 0,
      transform;
    if (elem) {
      xCurrent = toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', ''));
    }
    const prevWidth = toNumber(
      timelineType === TimelineType.Normal ? timelineNormal.current?.clientWidth : timelineFit.current?.clientWidth
    );
    setOptions({ ...options, timelineType: type });
    setTimeout(() => {
      elem = playLine.current;
      const currentWidth = toNumber(
        type === TimelineType.Normal ? timelineNormal.current?.clientWidth : timelineFit.current?.clientWidth
      );
      transform = (xCurrent / prevWidth) * currentWidth;
      if (type === TimelineType.Normal) {
        if (!isNotEmpty(arrBound.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushOffsetById(arrBound.current, i);
          }
        }
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
          checkOverlap(arrBound.current, transform);
        }
        timelineNormalContainer.current?.scrollTo({
          left: Math.min(transform, transform - timelineNormalContainer.current?.clientWidth / 2),
        });
      } else {
        if (!isNotEmpty(arrStore.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushOffsetById(arrStore.current, i);
          }
        }
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
          checkOverlap(arrStore.current, transform);
        }
      }
      focusBattleTimeline();
    }, 100);
  };

  const findBuff = (move: ICombat | undefined) => {
    if (!isNotEmpty(move?.buffs)) {
      return <></>;
    }
    return (
      <div className="tw-flex tw-min-w-0 tw-flex-wrap tw-items-center tw-gap-x-2 tw-gap-y-5 tw-pt-5">
        {move?.buffs.map((value, index) => (
          <div key={index} className="tw-relative tw-flex tw-shrink-0">
            <img width={15} height={15} alt="Image ATK" src={value.type === TypeAction.Atk ? ATK_LOGO : DEF_LOGO} />
            <div className="tw-absolute icon-buff">
              {value.power >= 2 && <KeyboardDoubleArrowUpIcon fontSize="small" color="success" />}
              {value.power === 1 && <KeyboardArrowUpIcon fontSize="small" color="success" />}
              {value.power === -1 && <KeyboardArrowDownIcon fontSize="small" color="error" />}
              {value.power <= -2 && <KeyboardDoubleArrowDownIcon fontSize="small" color="error" />}
              <span className={combineClasses('tw-text-sm', value.power < 0 ? '!tw-text-error' : '!tw-text-success')}>
                {value.power}
              </span>
            </div>
            <b className="tw-text-sm">{toNumber(value.buffChance) * 100}%</b>
          </div>
        ))}
      </div>
    );
  };

  const getPokemonStatRefs = (type: BattleType, teamIndex: number) => {
    if (teamIndex > 0) {
      const benchRefs = type === BattleType.Current ? pokemonCurrBenchStatRefs : pokemonObjBenchStatRefs;
      const benchIndex = teamIndex - 1;
      benchRefs[benchIndex] ??= createPokemonStatRefs();
      return benchRefs[benchIndex];
    }
    return type === BattleType.Current
      ? { level: levelCurrRef, atk: atkIVCurrRef, def: defIVCurrRef, hp: hpIVCurrRef }
      : { level: levelObjRef, atk: atkIVObjRef, def: defIVObjRef, hp: hpIVObjRef };
  };

  const calculateStatPokemon = (
    e: React.FormEvent<HTMLFormElement>,
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    teamIndex: number
  ) => {
    e.preventDefault();
    if (!pokemon.pokemonData) {
      showSnackbar('Pokémon not found.', 'error');
      return;
    }
    const refs = getPokemonStatRefs(type, teamIndex);
    const atk = toNumber(pokemon.pokemonData.stats?.atk);
    const def = toNumber(pokemon.pokemonData.stats?.def);
    const sta = toNumber(pokemon.pokemonData.stats?.sta);
    const atkIV = toNumber(refs.atk.current?.value);
    const defIV = toNumber(refs.def.current?.value);
    const staIV = toNumber(refs.hp.current?.value);
    const level = toNumber(refs.level.current?.value);
    const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);

    const paramCP = toNumber(params?.cp);
    if (cp > paramCP) {
      showSnackbar(`This stats Pokémon CP is greater than ${paramCP}, which is not permitted by the league.`, 'error');
      return;
    }

    const id = toNumber(pokemon.pokemonData.pokemon?.num);
    const stats = getBaseStatsByIVandLevel(atk, def, sta, cp, id, level, atkIV, defIV, staIV);
    setPokemon(
      PokemonBattle.create({
        ...pokemon,
        timeline: [],
        pokemonData: PokemonBattleData.create({
          ...pokemon.pokemonData,
          currentStats: stats,
        }),
      })
    );
  };

  const randomCP = (atk: number, def: number, sta: number) => {
    const atkIV = getRandomNumber(minIv(), maxIv());
    const defIV = getRandomNumber(minIv(), maxIv());
    const staIV = getRandomNumber(minIv(), maxIv());
    const level = getRandomNumber(minLevel(), maxLevel(), stepLevel());
    const cp = calculateCP(atk + atkIV, def + defIV, sta + staIV, level);
    return new StatsCalculate(atkIV, defIV, staIV, cp, level);
  };

  const onSetStats = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    teamIndex: number,
    isRandom = false
  ) => {
    if (!pokemon.pokemonData) {
      return;
    }

    let stats: IBattleBaseStats | undefined = new BattleBaseStats();
    if (isRandom) {
      const maxCP = toNumber(params?.cp);
      const id = toNumber(pokemon.pokemonData.pokemon?.num);
      const atk = toNumber(pokemon.pokemonData.stats?.atk);
      const def = toNumber(pokemon.pokemonData.stats?.def);
      const sta = toNumber(pokemon.pokemonData.stats?.sta);
      let statsCalculate = randomCP(atk, def, sta);
      while (statsCalculate.CP < minCp() || statsCalculate.CP > maxCP) {
        statsCalculate = randomCP(atk, def, sta);
      }
      stats = getBaseStatsByIVandLevel(
        atk,
        def,
        sta,
        statsCalculate.CP,
        id,
        statsCalculate.level,
        statsCalculate.IV.atkIV,
        statsCalculate.IV.defIV,
        statsCalculate.IV.staIV
      );
    } else {
      stats = pokemon.pokemonData.bestStats;
    }

    const refs = getPokemonStatRefs(type, teamIndex);
    const { level: levelRef, atk: atkIVRef, def: defIVRef, hp: hpIVRef } = refs;
    if (levelRef.current) {
      levelRef.current.value = getValueOrDefault(String, stats?.level?.toString());
    }
    if (atkIVRef.current) {
      atkIVRef.current.value = getValueOrDefault(String, stats?.IV?.atkIV.toString());
    }
    if (defIVRef.current) {
      defIVRef.current.value = getValueOrDefault(String, stats?.IV?.defIV.toString());
    }
    if (hpIVRef.current) {
      hpIVRef.current.value = getValueOrDefault(String, stats?.IV?.staIV.toString());
    }

    setPokemon(
      PokemonBattle.create({
        ...pokemon,
        timeline: [],
        pokemonData: PokemonBattleData.create({
          ...pokemon.pokemonData,
          currentStats: stats,
        }),
      })
    );
  };

  const renderInfoPokemon = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    teamIndex: number
  ) => {
    const refs = getPokemonStatRefs(type, teamIndex);
    const { level: levelRef, atk: atkIVRef, def: defIVRef, hp: hpIVRef } = refs;
    return (
      <AccordionMui
        items={[
          {
            value: 0,
            label: 'Information',
            children: (
              <>
                <div className="tw-w-full tw-flex tw-justify-center">
                  <div className="tw-relative filter-shadow tw-w-32">
                    <PokemonIconType pokemonType={pokemon.pokemonType} size={64}>
                      <BattlePokemonImage
                        alt="Pokémon"
                        className="pokemon-sprite-raid"
                        fallbackSize={128}
                        pokemon={pokemon.pokemonData}
                      />
                    </PokemonIconType>
                  </div>
                </div>
                <div className="tw-w-full tw-flex tw-justify-center tw-items-center tw-gap-1">
                  <LinkToTop
                    to={`/pvp/${params.cp}/all/${pokemon.pokemonData?.speciesId?.replaceAll('_', '-')}?${
                      Params.LeagueType
                    }=${getKeyWithData(ScoreType, ScoreType.Overall)?.toLowerCase()}`}
                  >
                    <VisibilityIcon className="view-pokemon tw-text-default" fontSize="large" />
                  </LinkToTop>
                  <b>{`#${pokemon.pokemonData?.id} ${splitAndCapitalize(pokemon.pokemonData?.name, '-', ' ')}`}</b>
                </div>
                <h6>
                  <b>Stats</b>
                </h6>
                CP: <b>{Math.floor(toNumber(pokemon.pokemonData?.currentStats?.CP))}</b> | {'Level: '}
                <b>{pokemon.pokemonData?.currentStats?.level ?? minLevel()}</b>
                <br />
                {'IV: '}
                <b>
                  {toNumber(pokemon.pokemonData?.currentStats?.IV?.atkIV)}/
                  {toNumber(pokemon.pokemonData?.currentStats?.IV?.defIV)}/
                  {toNumber(pokemon.pokemonData?.currentStats?.IV?.staIV)}
                </b>
                <br />
                <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} />
                {'Attack: '}
                <b>
                  {Math.floor(
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK) *
                      getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Atk)
                  )}
                </b>
                <br />
                <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} />
                {'Defense: '}
                <b>
                  {Math.floor(
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF) *
                      getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Def)
                  )}
                </b>
                <br />
                <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
                HP: <b>{getBattleHp(pokemon.pokemonData?.currentStats?.stats?.statSTA)}</b>
                <br />
                {'Stats Prod: '}
                <b>
                  {getStatProd(
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK),
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF),
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statSTA),
                    pokemon.pokemonType
                  )}
                </b>
                <br />
                <form
                  className="tw-mt-2"
                  onSubmit={(e) => {
                    calculateStatPokemon(e, type, pokemon, setPokemon, teamIndex);
                  }}
                >
                  <InputMui
                    labelPrepend="Level"
                    defaultValue={pokemon.pokemonData?.currentStats?.level}
                    inputProps={{
                      type: 'number',
                      min: minLevel(),
                      max: maxLevel(),
                      step: stepLevel(),
                      required: true,
                    }}
                    placeholder="Enter Level"
                    inputRef={levelRef}
                    fullWidth
                  />
                  <InputMui
                    labelPrepend="Attack IV"
                    defaultValue={pokemon.pokemonData?.currentStats?.IV?.atkIV}
                    inputProps={{
                      type: 'number',
                      min: minIv(),
                      max: maxIv(),
                      required: true,
                    }}
                    placeholder="Enter Attack IV"
                    inputRef={atkIVRef}
                    fullWidth
                  />
                  <InputMui
                    labelPrepend="Defense IV"
                    defaultValue={pokemon.pokemonData?.currentStats?.IV?.defIV}
                    inputProps={{
                      type: 'number',
                      min: minIv(),
                      max: maxIv(),
                      required: true,
                    }}
                    placeholder="Enter Defense IV"
                    inputRef={defIVRef}
                    fullWidth
                  />
                  <InputMui
                    labelPrepend="HP IV"
                    defaultValue={pokemon.pokemonData?.currentStats?.IV?.staIV}
                    inputProps={{
                      type: 'number',
                      min: minIv(),
                      max: maxIv(),
                      required: true,
                    }}
                    placeholder="Enter HP IV"
                    inputRef={hpIVRef}
                    fullWidth
                  />
                  <div className="tw-w-full tw-mt-2">
                    <ButtonMui type="submit" color="success" fullWidth label="Calculate Stats" />
                  </div>
                </form>
                <div className="tw-w-full tw-mt-2">
                  <ButtonMui
                    fullWidth
                    color="primary"
                    onClick={() => onSetStats(type, pokemon, setPokemon, teamIndex, true)}
                    label="Set Random Stats"
                  />
                </div>
                <div className="tw-w-full tw-mt-2">
                  <ButtonMui
                    fullWidth
                    color="primary"
                    onClick={() => onSetStats(type, pokemon, setPokemon, teamIndex)}
                    label="Set Best Stats"
                  />
                </div>
                <hr />
                <TypeBadge
                  isFind
                  title="Fast Move"
                  move={pokemon.fMove}
                  moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.fMove?.name)}
                />
                <div className="tw-flex tw-w-full tw-flex-wrap tw-items-end tw-gap-x-2 tw-gap-y-2">
                  <TypeBadge
                    isFind
                    title="Primary Charged Move"
                    move={pokemon.cMovePri}
                    moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMovePri?.name)}
                  />
                  {findBuff(pokemon.cMovePri)}
                </div>
                {pokemon.cMoveSec && (
                  <div className="tw-flex tw-w-full tw-flex-wrap tw-items-end tw-gap-x-2 tw-gap-y-2">
                    <TypeBadge
                      isFind
                      title="Secondary Charged Move"
                      move={pokemon.cMoveSec}
                      moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMoveSec.name)}
                    />
                    {findBuff(pokemon.cMoveSec)}
                  </div>
                )}
              </>
            ),
          },
        ]}
      />
    );
  };

  const updateTeamBlock = (type: BattleType, block: number) => {
    arrBound.current = [];
    arrStore.current = [];
    setPlayTimeline(new BattleState());
    if (type === BattleType.Current) {
      setPokemonCurr((current) => PokemonBattle.create({ ...current, block, timeline: [] }));
      setPokemonCurrBench((current) =>
        current.map((member) => PokemonBattle.create({ ...member, block, timeline: [] }))
      );
      setPokemonObj((current) => PokemonBattle.create({ ...current, timeline: [] }));
    } else {
      setPokemonObj((current) => PokemonBattle.create({ ...current, block, timeline: [] }));
      setPokemonObjBench((current) =>
        current.map((member) => PokemonBattle.create({ ...member, block, timeline: [] }))
      );
      setPokemonCurr((current) => PokemonBattle.create({ ...current, timeline: [] }));
    }
  };

  const renderPokemonInfo = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    clearDataPokemon: (removeMove: boolean) => void,
    teamIndex: number
  ) => {
    const pokemonType = getPropertyName(playTimeline, (o) =>
      type === BattleType.Object ? o.pokemonObj : o.pokemonCurr
    );
    const displayedEnergy =
      teamIndex === 0
        ? toNumber((playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType]?.energy, pokemon.energy)
        : pokemon.energy;
    const maxHp = getBattleHp(pokemon.pokemonData?.currentStats?.stats?.statSTA);
    const startingHp = Math.max(1, Math.min(maxHp, pokemon.startingHp ?? maxHp));
    const minimumStatStage = optionsData.combatOptions.minimumStatStage ?? -4;
    const maximumStatStage = optionsData.combatOptions.maximumStatStage ?? 4;
    const statStageOptions = Array.from(
      { length: maximumStatStage - minimumStatStage + 1 },
      (_, index) => minimumStatStage + index
    ).map((value) => ({ label: value > 0 ? `+${value}` : `${value}`, value }));
    return (
      <Fragment>
        <SelectPoke
          ref={(instance) => {
            const selectRefs = type === BattleType.Current ? pokemonCurrSelectRefs : pokemonObjSelectRefs;
            selectRefs[teamIndex] = instance;
          }}
          data={data}
          league={league}
          pokemonBattle={pokemon}
          setPokemonBattle={setPokemon}
          clearData={clearDataPokemon}
        />
        {pokemon.pokemonData && (
          <Fragment>
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2">
              <InputMui
                labelPrepend="Energy"
                defaultValue={pokemon.energy}
                inputProps={{
                  type: 'number',
                  min: 0,
                  max: combatMaxEnergy(),
                  step: 1,
                  required: true,
                }}
                id={`energy${type}-${teamIndex}`}
                fullWidth
                onChange={(value) => {
                  const energy = toNumber(value);
                  if (teamIndex === 0 && type === BattleType.Current) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonCurr: PokemonBattleData.create({
                        ...playTimeline.pokemonCurr,
                        energy,
                      }),
                    });
                  } else if (teamIndex === 0 && type === BattleType.Object) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonObj: PokemonBattleData.create({
                        ...playTimeline.pokemonObj,
                        energy,
                      }),
                    });
                  }
                  setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], energy }));
                }}
              />
              <InputMui
                labelPrepend="Starting HP"
                value={startingHp}
                inputProps={{ type: 'number', min: 1, max: maxHp, step: 1, required: true }}
                id={`starting-hp-${type}-${teamIndex}`}
                fullWidth
                onChange={(value) =>
                  setPokemon(
                    PokemonBattle.create({
                      ...pokemon,
                      timeline: [],
                      startingHp: Math.max(1, Math.min(maxHp, toNumber(value, maxHp))),
                    })
                  )
                }
              />
              {teamIndex === 0 && (
                <>
                  <InputMui
                    labelPrepend="Attack Stage"
                    value={toNumber(pokemon.attackStage)}
                    id={`attack-stage-${type}`}
                    fullWidth
                    select
                    menuItems={statStageOptions}
                    onChange={(value) =>
                      setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], attackStage: toNumber(value) }))
                    }
                  />
                  <InputMui
                    labelPrepend="Defense Stage"
                    value={toNumber(pokemon.defenseStage)}
                    id={`defense-stage-${type}`}
                    fullWidth
                    select
                    menuItems={statStageOptions}
                    onChange={(value) =>
                      setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], defenseStage: toNumber(value) }))
                    }
                  />
                </>
              )}
            </div>
            <InputMui
              labelPrepend="Block"
              value={pokemon.block}
              fullWidth
              onChange={(value) => {
                const block = toNumber(value);
                updateTeamBlock(type, block);
              }}
              select
              menuItems={getArrayBySeq(defaultBlock() + 1).map((value) => ({
                label: value,
                value,
              }))}
            />
            {leagueRules.find((item) => item.id === selectedLeagueId)?.conditions.timestamp && (
              <InputMui
                labelPrepend="Caught at"
                type="datetime-local"
                required
                value={
                  pokemon.caughtAt
                    ? new Date(pokemon.caughtAt - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(value) => {
                  const caughtAt = Date.parse(value);
                  setPokemon(
                    PokemonBattle.create({
                      ...pokemon,
                      timeline: [],
                      caughtAt: Number.isFinite(caughtAt) ? caughtAt : undefined,
                    })
                  );
                }}
              />
            )}
            {(!pokemon.disableCMovePri || !pokemon.disableCMoveSec) && (pokemon.cMovePri || pokemon.cMoveSec) && (
              <InputMui
                labelPrepend="Charge Slot"
                value={pokemon.chargeSlot}
                fullWidth
                onChange={(value) => {
                  setPlayTimeline({
                    ...playTimeline,
                    pokemonCurr: PokemonBattleData.create({
                      ...playTimeline.pokemonCurr,
                      energy: 0,
                    }),
                    pokemonObj: PokemonBattleData.create({
                      ...playTimeline.pokemonObj,
                      energy: 0,
                    }),
                  });
                  setPokemon(
                    PokemonBattle.create({
                      ...pokemon,
                      timeline: [],
                      energy: 0,
                      chargeSlot: toNumber(value),
                    })
                  );
                }}
                select
                menuItems={[
                  {
                    label: ChargeType.Primary,
                    value: ChargeType.Primary,
                    disabled: pokemon.disableCMovePri || !pokemon.cMovePri,
                  },
                  {
                    label: ChargeType.Secondary,
                    value: ChargeType.Secondary,
                    disabled: pokemon.disableCMoveSec || !pokemon.cMoveSec,
                  },
                  {
                    label: 'Random',
                    value: ChargeType.Random,
                    disabled:
                      pokemon.disableCMovePri || pokemon.disableCMoveSec || !pokemon.cMovePri || !pokemon.cMoveSec,
                  },
                ]}
              />
            )}
            {pokemon && (
              <div className="tw-w-full bg-ref-pokemon">
                <div className="tw-w-full bg-type-moves">
                  <CircleBar
                    text={splitAndCapitalize(pokemon.cMovePri?.name, '_', ' ')}
                    type={pokemon.cMovePri?.type}
                    size={80}
                    maxEnergy={combatMaxEnergy()}
                    moveEnergy={Math.abs(toNumber(pokemon.cMovePri?.pvpEnergy))}
                    energy={displayedEnergy}
                    isDisable={pokemon.disableCMovePri}
                  />
                  {pokemon.cMoveSec && (
                    <CircleBar
                      text={splitAndCapitalize(pokemon.cMoveSec.name, '_', ' ')}
                      type={pokemon.cMoveSec.type}
                      size={80}
                      maxEnergy={combatMaxEnergy()}
                      moveEnergy={Math.abs(pokemon.cMoveSec.pvpEnergy)}
                      energy={displayedEnergy}
                      isDisable={pokemon.disableCMoveSec}
                    />
                  )}
                </div>
                {teamIndex === 0 && isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) && (
                  <Fragment>
                    <HpBar
                      text="HP"
                      height={15}
                      hp={Math.round((playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType].hp)}
                      maxHp={getBattleHp(pokemon.pokemonData.currentStats?.stats?.statSTA)}
                    />
                  </Fragment>
                )}
              </div>
            )}
            {renderInfoPokemon(type, pokemon, setPokemon, teamIndex)}
          </Fragment>
        )}
      </Fragment>
    );
  };

  const getTeamMemberHp = (pokemon: IPokemonBattle, teamIndex: number, isOpponent: boolean) => {
    const maxHp = getBattleHp(pokemon.pokemonData?.currentStats?.stats?.statSTA);
    const configuredHp = maxHp > 0 ? Math.max(1, Math.min(maxHp, pokemon.startingHp ?? maxHp)) : 0;
    const timeline = (isOpponent ? pokemonObj.timeline : pokemonCurr.timeline).slice(0, timelineCursor + 1);
    if (timeline.some((entry) => entry.faintedIndex === teamIndex)) {
      return { hp: 0, maxHp };
    }
    const latest = timeline.findLast((entry) => (entry.activeIndex ?? 0) === teamIndex);
    return { hp: Math.max(0, latest?.hp ?? configuredHp), maxHp };
  };

  const isTimelineTeamMemberActive = (isOpponent: boolean, teamIndex: number) =>
    timelineCursor >= 0 && (isOpponent ? activeTeamIndexes.opponent : activeTeamIndexes.player) === teamIndex;

  const timelineActiveAccordionSx = (isOpponent: boolean, teamIndex: number) => {
    const active = isTimelineTeamMemberActive(isOpponent, teamIndex);
    return {
      borderColor: active ? 'var(--primary-main)' : 'divider',
      boxShadow: active
        ? 'inset 4px 0 0 0 var(--primary-main), 0 0 0 1px var(--primary-main)'
        : 'inset 0 0 0 0 transparent, 0 0 0 1px transparent',
      transition: 'border-color 280ms ease-out, box-shadow 280ms ease-out',
      '& .MuiAccordionSummary-root': {
        ...(active ? { backgroundColor: 'action.selected' } : {}),
        transition: 'background-color 280ms ease-out',
      },
      '& .accordion-header-actions': {
        ...(active ? { backgroundColor: 'action.selected' } : {}),
        transition: 'background-color 280ms ease-out',
      },
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
        '& .MuiAccordionSummary-root': {
          transition: 'none',
        },
        '& .accordion-header-actions': {
          transition: 'none',
        },
      },
    };
  };

  const teamAccordionSummarySx = {
    '& .MuiAccordionSummary-expandIconWrapper': {
      order: -1,
      marginLeft: 0,
      marginRight: 1,
    },
    '& .MuiAccordionSummary-content': {
      marginLeft: 0,
    },
  };

  const renderTeamMemberSummary = (
    pokemon: IPokemonBattle,
    slot: number,
    sideLabel: string,
    isOpponent: boolean,
    isExpanded: boolean
  ) => {
    const { hp, maxHp } = getTeamMemberHp(pokemon, slot - 1, isOpponent);
    const isActive = isTimelineTeamMemberActive(isOpponent, slot - 1);
    const hpRatio = maxHp > 0 ? hp / maxHp : 0;
    const hpColor = hpRatio > 0.5 ? 'tw-bg-success' : hpRatio > 0.25 ? 'tw-bg-yellow-400' : 'tw-bg-error';
    return (
      <div
        aria-current={isActive ? 'true' : undefined}
        className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-col tw-overflow-hidden"
        data-active-battler={isActive ? (isOpponent ? 'opponent' : 'player') : undefined}
      >
        <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
          {pokemon.pokemonData ? (
            <span className="tw-relative tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center">
              <PokemonIconType pokemonType={pokemon.pokemonType} size={20}>
                <BattlePokemonImage
                  alt="Pokémon"
                  className="tw-h-10 tw-w-10 tw-object-contain"
                  fallbackSize={40}
                  pokemon={pokemon.pokemonData}
                />
              </PokemonIconType>
            </span>
          ) : (
            <span className="tw-flex tw-h-8 tw-w-8 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-primary tw-text-revert">
              {slot}
            </span>
          )}
          <span className="tw-min-w-0 tw-flex-1 tw-overflow-hidden">
            <b
              className={combineClasses(
                'tw-block tw-leading-small',
                pokemon.pokemonData ? 'tw-break-words' : 'tw-whitespace-nowrap'
              )}
            >
              {pokemon.pokemonData
                ? splitAndCapitalize(pokemon.pokemonData.name, '-', ' ')
                : `${sideLabel} Pokémon ${slot}`}
            </b>
            {pokemon.pokemonData && (
              <span className="tw-block tw-break-words tw-text-xs tw-leading-small tw-text-[var(--text-secondary)]">
                CP {Math.floor(toNumber(pokemon.pokemonData.currentStats?.CP))} ·{' '}
                {splitAndCapitalize(pokemon.fMove?.name, '_', ' ')} ·{' '}
                {splitAndCapitalize(pokemon.cMovePri?.name, '_', ' ')}
              </span>
            )}
          </span>
        </div>
        {!isExpanded && pokemon.pokemonData && (
          <div className="tw-mt-2 tw-flex tw-items-center tw-gap-2">
            <div
              className="tw-h-2 tw-min-w-0 tw-flex-1 tw-overflow-hidden tw-rounded-full tw-bg-[var(--divider)]"
              role="progressbar"
              aria-label={`${pokemon.pokemonData.name} HP`}
              aria-valuemin={0}
              aria-valuemax={maxHp}
              aria-valuenow={hp}
            >
              <div
                className={`tw-h-full tw-rounded-full tw-transition-[width] ${hpColor}`}
                style={{ width: `${Math.max(0, Math.min(100, hpRatio * 100))}%` }}
              />
            </div>
            <span className="tw-w-16 tw-shrink-0 tw-text-right tw-text-caption tw-tabular-nums tw-text-[var(--text-secondary)]">
              {hp}/{maxHp}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderTeam = (isOpponent: boolean) => {
    const lead = isOpponent ? pokemonObj : pokemonCurr;
    const bench = isOpponent ? pokemonObjBench : pokemonCurrBench;
    const setBench = isOpponent ? setPokemonObjBench : setPokemonCurrBench;
    const benchExpanded = isOpponent ? pokemonObjBenchExpanded : pokemonCurrBenchExpanded;
    const setBenchExpanded = isOpponent ? setPokemonObjBenchExpanded : setPokemonCurrBenchExpanded;
    const benchStatRefs = isOpponent ? pokemonObjBenchStatRefs : pokemonCurrBenchStatRefs;
    const selectRefs = isOpponent ? pokemonObjSelectRefs : pokemonCurrSelectRefs;
    const sideLabel = isOpponent ? 'Opponent' : 'Player';
    const updateMember = (index: number, value: React.SetStateAction<IPokemonBattle>) => {
      setBench((current) =>
        current.map((member, memberIndex) =>
          memberIndex === index ? (typeof value === 'function' ? value(member) : value) : member
        )
      );
      clearBattleResult();
    };
    const removeBenchMember = (index: number, pokemon: IPokemonBattle) => {
      stopPokemonAudio(pokemon);
      benchStatRefs.splice(index, 1);
      selectRefs.splice(index + 1, 1);
      setBench((current) => current.filter((_, memberIndex) => memberIndex !== index));
      setBenchExpanded((current) => current.filter((_, memberIndex) => memberIndex !== index));
      clearBattleResult();
    };
    const stopHeaderAction = (event: React.SyntheticEvent) => event.stopPropagation();
    const renderHeaderActions = (teamIndex: number, pokemon: IPokemonBattle, benchIndex?: number) => (
      <span className="tw-flex tw-w-16 tw-shrink-0 tw-items-center tw-justify-end tw-gap-1">
        <Tooltips title="Random Pokémon">
          <IconButton
            aria-label={`Random ${sideLabel} Pokémon ${teamIndex + 1}`}
            disabled={!isNotEmpty(data)}
            size="small"
            onMouseDown={stopHeaderAction}
            onClick={(event) => {
              stopHeaderAction(event);
              selectRefs[teamIndex]?.selectRandomPokemon();
            }}
          >
            <CasinoIcon fontSize="small" />
          </IconButton>
        </Tooltips>
        {benchIndex !== undefined && (
          <Tooltips title="Remove Pokémon">
            <IconButton
              aria-label={`Remove ${sideLabel} Pokémon ${teamIndex + 1}`}
              color="error"
              size="small"
              onMouseDown={stopHeaderAction}
              onClick={(event) => {
                stopHeaderAction(event);
                removeBenchMember(benchIndex, pokemon);
              }}
            >
              <RemoveCircleIcon fontSize="small" />
            </IconButton>
          </Tooltips>
        )}
      </span>
    );
    const leadExpandedForSide = isOpponent ? leadExpanded.opponent : leadExpanded.player;
    return (
      <div aria-label={`${sideLabel} team`}>
        <AccordionMui
          defaultValue={0}
          resetItemOnChange={isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline)}
          onChange={(value) => {
            const expandedSlot = typeof value === 'number' ? value : undefined;
            setLeadExpanded((current) => ({
              ...current,
              [isOpponent ? 'opponent' : 'player']: expandedSlot === 0,
            }));
            setBenchExpanded(bench.map((_, index) => expandedSlot === index + 1));
          }}
          items={[
            {
              value: 0,
              keepMounted: true,
              sxHeader: timelineActiveAccordionSx(isOpponent, 0),
              sxSummary: teamAccordionSummarySx,
              label: renderTeamMemberSummary(lead, 1, sideLabel, isOpponent, leadExpandedForSide),
              headerActions: renderHeaderActions(0, lead),
              children: renderPokemonInfo(
                isOpponent ? BattleType.Object : BattleType.Current,
                lead,
                isOpponent ? setPokemonObj : setPokemonCurr,
                isOpponent ? clearDataPokemonObj : clearDataPokemonCurr,
                0
              ),
            },
            ...bench.map((pokemon, index) => ({
              value: index + 1,
              keepMounted: true,
              sxHeader: timelineActiveAccordionSx(isOpponent, index + 1),
              sxSummary: teamAccordionSummarySx,
              label: renderTeamMemberSummary(pokemon, index + 2, sideLabel, isOpponent, benchExpanded[index] ?? false),
              headerActions: renderHeaderActions(index + 1, pokemon, index),
              children: renderPokemonInfo(
                isOpponent ? BattleType.Object : BattleType.Current,
                pokemon,
                (value) => updateMember(index, value),
                (removeMove) =>
                  updateMember(
                    index,
                    removeMove
                      ? PokemonBattle.create({ ...pokemon, cMoveSec: undefined, timeline: [] })
                      : new PokemonBattle()
                  ),
                index + 1
              ),
            })),
          ]}
        />
        <div className="tw-mt-3">
          {bench.length < maxPvpTeamSize - 1 && (
            <ButtonMui
              fullWidth
              variant="outlined"
              startIcon={<AddCircleIcon />}
              label="Add Pokémon"
              onClick={() => {
                setBench((current) => [
                  ...current,
                  PokemonBattle.create({
                    ...new PokemonBattle(),
                    block: isOpponent ? pokemonObj.block : pokemonCurr.block,
                  }),
                ]);
                setBenchExpanded((current) => [...current, false]);
                clearBattleResult();
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderHeader = (pokemonCurr: PokemonBattle, pokemonObj: PokemonBattle) => (
    <div className="tw-flex tw-w-full timeline-vertical">
      <div className="tw-w-1/2">
        <div className="tw-w-full tw-h-full pokemon-battle-header tw-flex tw-items-center tw-justify-start tw-gap-2">
          <div className="tw-relative filter-shadow tw-w-battle-icon">
            <PokemonIconType pokemonType={pokemonCurr.pokemonType} size={20}>
              <BattlePokemonImage
                alt="Pokémon"
                className="sprite-type"
                fallbackSize={40}
                pokemon={pokemonCurr.pokemonData}
              />
            </PokemonIconType>
          </div>
          <b>{splitAndCapitalize(pokemonCurr.pokemonData?.name, '-', ' ')}</b>
        </div>
      </div>
      <div className="tw-flex tw-items-center tw-justify-center tw-px-1 tw-cursor-pointer tw-bg-inherit">
        {openBattle ? (
          <RemoveCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="small" color="error" />
        ) : (
          <AddCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="small" color="primary" />
        )}
      </div>
      <div className="tw-w-1/2">
        <div className="tw-w-full tw-h-full pokemon-battle-header tw-flex tw-items-center tw-justify-end tw-gap-2">
          <div className="tw-relative filter-shadow tw-w-battle-icon">
            <PokemonIconType pokemonType={pokemonObj.pokemonType} size={20}>
              <BattlePokemonImage
                alt="Pokémon"
                className="sprite-type"
                fallbackSize={40}
                pokemon={pokemonObj.pokemonData}
              />
            </PokemonIconType>
          </div>
          <b>{splitAndCapitalize(pokemonObj.pokemonData?.name, '-', ' ')}</b>
        </div>
      </div>
    </div>
  );

  const updateStrategy = (side: 'playerStrategy' | 'opponentStrategy', value: Partial<PvpBattleStrategyRequest>) => {
    setOptions({ ...options, [side]: { ...options[side], ...value } });
    clearBattleResult();
  };

  const renderStrategy = (side: 'playerStrategy' | 'opponentStrategy', teamSize: number) => {
    const strategy = options[side];
    const canSwitch = teamSize > 1;
    const actions = (strategy.actions ?? []).filter((action) => canSwitch || action.type !== 'switch');
    const orderOptions = teamOrderOptions(teamSize);
    const defaultOrder = Array.from({ length: teamSize }, (_, index) => index);
    const selectedOrder =
      strategy.switchOrder?.length === teamSize && strategy.switchOrder.every((index) => index < teamSize)
        ? strategy.switchOrder
        : defaultOrder;
    return (
      <div className="tw-w-full">
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-2">
          <SelectMui
            inputLabel="Shield"
            value={strategy.shield ?? 'always'}
            onChangeSelect={(value) => updateStrategy(side, { shield: value })}
            menuItems={[
              { value: 'always', label: 'Always' },
              { value: 'lethal', label: 'Only lethal' },
              { value: 'never', label: 'Never' },
            ]}
          />
          <SelectMui
            inputLabel="Charged Attack"
            value={strategy.charged ?? 'selected'}
            onChangeSelect={(value) => updateStrategy(side, { charged: value })}
            menuItems={[
              { value: 'selected', label: 'Selected move' },
              { value: 'bait', label: 'Bait' },
              { value: 'nuke', label: 'Highest damage' },
              { value: 'farm', label: 'Farm energy' },
              { value: 'manual', label: 'Action script only' },
            ]}
          />
          {strategy.charged === 'farm' && (
            <InputMui
              label="Farm until energy"
              type="number"
              value={strategy.farmEnergy ?? 100}
              inputProps={{ min: 0, max: 100 }}
              onChange={(value) =>
                updateStrategy(side, { farmEnergy: Math.min(100, Math.max(0, toNumber(value, 100))) })
              }
            />
          )}
          {canSwitch && (
            <>
              <SelectMui
                inputLabel="Voluntary Switch"
                value={strategy.voluntarySwitch ?? 'none'}
                onChangeSelect={(value) => updateStrategy(side, { voluntarySwitch: value })}
                menuItems={[
                  { value: 'none', label: 'None' },
                  { value: 'safe', label: 'Safe switch' },
                  { value: 'random', label: 'Random' },
                ]}
              />
              <SelectMui
                inputLabel="Forced Switch"
                value={strategy.forcedSwitch ?? 'first'}
                onChangeSelect={(value) => updateStrategy(side, { forcedSwitch: value })}
                menuItems={[
                  { value: 'first', label: 'First available' },
                  { value: 'best_matchup', label: 'Best matchup' },
                  { value: 'highest_hp', label: 'Highest HP' },
                  { value: 'highest_energy', label: 'Highest energy' },
                  { value: 'random', label: 'Random' },
                  { value: 'ordered', label: 'Team order' },
                ]}
              />
            </>
          )}
          {canSwitch && strategy.forcedSwitch === 'ordered' && (
            <SelectMui
              inputLabel="Team order"
              value={selectedOrder.join('-')}
              onChangeSelect={(value) => updateStrategy(side, { switchOrder: value.split('-').map(Number) })}
              menuItems={orderOptions}
            />
          )}
        </div>
        {actions.map((action, index) => (
          <div className="tw-mt-2 tw-flex tw-flex-wrap tw-items-center tw-gap-2" key={`${side}-action-${index}`}>
            <InputMui
              className="tw-max-w-24"
              label="Turn"
              type="number"
              value={action.turn}
              inputProps={{ min: 1, max: 540 }}
              onChange={(value) => {
                const next = [...actions];
                next[index] = { ...action, turn: Math.max(1, toNumber(value, 1)) };
                updateStrategy(side, { actions: next });
              }}
            />
            <SelectMui
              inputLabel="Action"
              value={action.type}
              onChangeSelect={(value) => {
                const next = [...actions];
                next[index] = { turn: action.turn, type: value };
                updateStrategy(side, { actions: next });
              }}
              menuItems={[
                { value: 'charged', label: 'Charged Attack' },
                ...(canSwitch ? [{ value: 'switch', label: 'Switch' }] : []),
                { value: 'shield', label: 'Shield decision' },
              ]}
            />
            {action.type === 'charged' && (
              <SelectMui
                inputLabel="Move / power"
                value={`${action.moveSlot ?? 1}:${action.undercharge ?? 1}`}
                onChangeSelect={(value) => {
                  const [moveSlot, undercharge] = value.split(':').map(Number);
                  const next = [...actions];
                  next[index] = { ...action, moveSlot: moveSlot as 1 | 2, undercharge };
                  updateStrategy(side, { actions: next });
                }}
                menuItems={[
                  { value: '1:1', label: 'Move 1 · 100%' },
                  { value: '1:0.75', label: 'Move 1 · 75%' },
                  { value: '1:0.5', label: 'Move 1 · 50%' },
                  { value: '1:0.25', label: 'Move 1 · 25%' },
                  { value: '2:1', label: 'Move 2 · 100%' },
                  { value: '2:0.75', label: 'Move 2 · 75%' },
                  { value: '2:0.5', label: 'Move 2 · 50%' },
                  { value: '2:0.25', label: 'Move 2 · 25%' },
                ]}
              />
            )}
            {action.type === 'switch' && (
              <SelectMui
                inputLabel="Switch to"
                value={action.targetIndex ?? 1}
                onChangeSelect={(value) => {
                  const next = [...actions];
                  next[index] = { ...action, targetIndex: value };
                  updateStrategy(side, { actions: next });
                }}
                menuItems={Array.from({ length: teamSize }, (_, value) => ({
                  value,
                  label: `Pokémon ${value + 1}`,
                }))}
              />
            )}
            {action.type === 'shield' && (
              <SelectMui
                inputLabel="Decision"
                value={action.shield === false ? 'no' : 'yes'}
                onChangeSelect={(value) => {
                  const next = [...actions];
                  next[index] = { ...action, shield: value === 'yes' };
                  updateStrategy(side, { actions: next });
                }}
                menuItems={[
                  { value: 'yes', label: 'Use Shield' },
                  { value: 'no', label: 'Do not Shield' },
                ]}
              />
            )}
            <ButtonMui
              color="error"
              variant="outlined"
              label="Remove"
              onClick={() => updateStrategy(side, { actions: actions.filter((_, item) => item !== index) })}
            />
          </div>
        ))}
        <ButtonMui
          className="!tw-mt-2"
          variant="outlined"
          label="Add Action"
          onClick={() => updateStrategy(side, { actions: [...actions, { turn: 1, type: 'charged', moveSlot: 1 }] })}
        />
      </div>
    );
  };

  const strategySummary = (side: 'playerStrategy' | 'opponentStrategy', teamSize: number) => {
    const strategy = options[side];
    const shieldLabels: Record<string, string> = {
      always: 'Shield always',
      lethal: 'Shield lethal attacks',
      never: 'No shields',
    };
    const chargedLabels: Record<string, string> = {
      selected: 'Selected Charged Move',
      bait: 'Bait',
      nuke: 'Highest damage',
      farm: `Farm to ${strategy.farmEnergy ?? 100} energy`,
      manual: 'Action script only',
    };
    const forcedSwitchLabels: Record<string, string> = {
      first: 'First available',
      best_matchup: 'Best matchup',
      highest_hp: 'Highest HP',
      highest_energy: 'Highest energy',
      random: 'Random',
      ordered: 'Team order',
    };
    const summary = [shieldLabels[strategy.shield ?? 'always'], chargedLabels[strategy.charged ?? 'selected']];
    if (teamSize > 1) {
      const voluntarySwitch = strategy.voluntarySwitch ?? 'none';
      if (voluntarySwitch !== 'none') {
        summary.push(`Switch: ${voluntarySwitch === 'safe' ? 'Safe switch' : 'Random'}`);
      }
      summary.push(`After faint: ${forcedSwitchLabels[strategy.forcedSwitch ?? 'first']}`);
    }
    const actionCount = (strategy.actions ?? []).filter((action) => teamSize > 1 || action.type !== 'switch').length;
    if (actionCount) {
      summary.push(`${actionCount} scripted action${actionCount === 1 ? '' : 's'}`);
    }
    return summary.join(' · ');
  };

  const renderStrategyButton = (title: string, side: 'playerStrategy' | 'opponentStrategy', teamSize: number) => (
    <ButtonMui
      aria-haspopup="dialog"
      className="!tw-min-h-16 !tw-w-full !tw-justify-start !tw-px-3 !tw-py-2 !tw-text-left"
      color={side === 'playerStrategy' ? 'primary' : 'secondary'}
      startIcon={<TuneIcon />}
      variant="outlined"
      label={
        <span className="tw-flex tw-min-w-0 tw-flex-col tw-items-start">
          <b>{title}</b>
          <span className="tw-whitespace-normal tw-text-xs tw-font-normal tw-leading-snug tw-opacity-80">
            {strategySummary(side, teamSize)}
          </span>
        </span>
      }
      onClick={() => setStrategyDialog(side)}
    />
  );

  const renderBattleControls = () =>
    pokemonCurr.pokemonData && pokemonObj.pokemonData ? (
      <div aria-label="Simulation controls" className="tw-order-3 tw-mt-2 md:tw-col-span-2">
        <div className="tw-rounded tw-border tw-border-solid tw-border-[var(--divider)] tw-p-3">
          <div className="tw-grid tw-w-full tw-grid-cols-1 tw-gap-2 sm:tw-grid-cols-2">
            {renderStrategyButton('Player Strategy', 'playerStrategy', 1 + pokemonCurrBench.length)}
            {renderStrategyButton('Opponent Strategy', 'opponentStrategy', 1 + pokemonObjBench.length)}
          </div>
          <div className="tw-mt-3 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2">
            {isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) ? (
              <>
                <ButtonMui
                  className="tw-h-12.5"
                  startIcon={<RestartAltIcon />}
                  label="Reset Battle"
                  onClick={() => void battleAnimation()}
                />
                <ButtonMui
                  className="tw-h-12.5"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteSweepIcon />}
                  label="Clear Battle"
                  onClick={() => {
                    clearBattleResult();
                    focusBattleTimeline();
                  }}
                />
                <ButtonMui
                  className="tw-h-12.5"
                  color="success"
                  startIcon={<FileDownloadIcon />}
                  label="Export Battle"
                  onClick={() => void exportBattle()}
                />
              </>
            ) : (
              <ButtonMui
                className="tw-h-12.5"
                startIcon={
                  <span className="tw-relative">
                    <img height={36} alt="ATK Left" src={ATK_LOGO} />
                    <img className="battle-logo" height={36} alt="ATK Right" src={ATK_LOGO} />
                  </span>
                }
                label="Battle Simulator"
                onClick={() => void battleAnimation()}
              />
            )}
          </div>
        </div>
      </div>
    ) : null;

  const selectedBattleRule = leagueRules.find((item) => item.id === selectedLeagueId);
  const ruleConditions = selectedBattleRule?.conditions;
  const rulePokemonName = (name: string | undefined, id: number | undefined, form: string | undefined) =>
    `${name ? splitAndCapitalize(name.toLowerCase(), '_', ' ') : `#${id ?? '?'}`}${
      form && form.toLowerCase() !== 'normal' ? ` (${splitAndCapitalize(form.toLowerCase(), '_', ' ')})` : ''
    }`;
  const standardMaxCp = league === BattleLeagueCPType.InsMaster ? undefined : league;
  const renderRulePokemonList = (items: ILeague['conditions']['whiteList']) => (
    <div className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-wrap tw-gap-1.5">
      {items.map((item, index) => (
        <span
          className="tw-inline-flex tw-items-center tw-gap-1 tw-rounded tw-bg-[var(--background)] tw-px-1.5 tw-py-0.5"
          key={`${item.id}-${item.form}-${index}`}
        >
          <PokemonTableIcon
            num={item.id ?? 0}
            name={item.name}
            form={item.form}
            pokemonType={item.pokemonType}
            size={28}
          />
          <span>{rulePokemonName(item.name, item.id, item.form)}</span>
        </span>
      ))}
    </div>
  );

  return (
    <Error isError={!isFound} isShowTitle={!isFound}>
      <div className="tw-container tw-mt-4 battle-body-container">
        <div className="tw-grid tw-grid-cols-1 tw-gap-2 md:tw-grid-cols-2">
          <SelectMui
            fullWidth
            inputLabel="League"
            value={league}
            onChangeSelect={(value) => {
              navigateToTop(`/pvp/battle/${value}`);
              setOptions({ ...options, league: value });
              setSelectedLeagueId(defaultLeagueId(value));
              clearBattleResult();
            }}
            menuItems={[
              {
                value: BattleLeagueCPType.Little,
                label: getPokemonBattleLeagueName(BattleLeagueCPType.Little),
              },
              {
                value: BattleLeagueCPType.Great,
                label: getPokemonBattleLeagueName(BattleLeagueCPType.Great),
              },
              {
                value: BattleLeagueCPType.Ultra,
                label: getPokemonBattleLeagueName(BattleLeagueCPType.Ultra),
              },
              {
                value: BattleLeagueCPType.InsMaster,
                label: getPokemonBattleLeagueName(BattleLeagueCPType.InsMaster),
              },
            ]}
          />
          <SelectMui
            fullWidth
            inputLabel="Battle rules"
            value={selectedLeagueId}
            onChangeSelect={(value) => {
              setSelectedLeagueId(value);
              clearBattleResult();
            }}
            menuItems={[
              {
                value: defaultLeagueId(league),
                label: `${getPokemonBattleLeagueName(league)} · Standard`,
              },
              ...leagueRules
                .filter(
                  (item) =>
                    item.conditions.maxCp === league ||
                    (league === BattleLeagueCPType.InsMaster && toNumber(item.conditions.maxCp) >= 6_000)
                )
                .filter((item) => item.id !== defaultLeagueId(league))
                .map((item) => ({ value: item.id ?? '', label: item.title })),
            ]}
          />
        </div>
        <DismissibleAlert
          resetKey={selectedLeagueId}
          severity="info"
          className="!tw-mt-2 tw-items-start"
          aria-label="Battle rule details"
        >
          <div className="tw-w-full tw-min-w-0">
            <b className="tw-block">
              {selectedBattleRule?.title ?? `${getPokemonBattleLeagueName(league)} · Standard`}
            </b>
            <div className="tw-mt-1 tw-flex tw-flex-wrap tw-gap-x-4 tw-gap-y-1">
              <Tooltips title="CP limit">
                <span className="tw-inline-flex tw-items-center tw-gap-1" aria-label="CP limit">
                  <SpeedIcon fontSize="small" /> {ruleConditions?.maxCp ?? standardMaxCp ?? 'None'} CP
                </span>
              </Tooltips>
              <Tooltips title="Team size">
                <span className="tw-inline-flex tw-items-center tw-gap-1" aria-label="Team size">
                  <GroupsIcon fontSize="small" /> ≤ {selectedBattleRule?.pokemonCount || maxPvpTeamSize}
                </span>
              </Tooltips>
              {ruleConditions?.maxLevel !== undefined && (
                <Tooltips title="Level limit">
                  <span className="tw-inline-flex tw-items-center tw-gap-1" aria-label="Level limit">
                    <TrendingUpIcon fontSize="small" /> Lv. {ruleConditions.maxLevel}
                  </span>
                </Tooltips>
              )}
              <Tooltips title="Duplicate species not allowed">
                <span className="tw-inline-flex tw-items-center tw-gap-1" aria-label="Duplicate species not allowed">
                  <ContentCopyIcon fontSize="small" />
                  <BlockIcon fontSize="small" color="error" />
                </span>
              </Tooltips>
              <Tooltips title="Mega Evolution">
                <span
                  className="tw-inline-flex tw-items-center tw-gap-1"
                  aria-label={`Mega Evolution ${selectedBattleRule?.allowEvolutions ? 'allowed' : 'not allowed'}`}
                >
                  <AutoAwesomeIcon fontSize="small" />
                  {selectedBattleRule?.allowEvolutions ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <BlockIcon fontSize="small" color="error" />
                  )}
                </span>
              </Tooltips>
            </div>
            {ruleConditions?.timestamp && (
              <div className="tw-mt-1">
                <Tooltips title="Eligible catch time">
                  <span className="tw-flex tw-items-center tw-gap-1">
                    <ScheduleIcon fontSize="small" />
                    <span>
                      {getTime(ruleConditions.timestamp.start)} – {getTime(ruleConditions.timestamp.end)}
                    </span>
                  </span>
                </Tooltips>
              </div>
            )}
            {isNotEmpty(ruleConditions?.uniqueType) && (
              <div className="tw-mt-1">
                <Tooltips title="Allowed types">
                  <span className="tw-flex tw-items-center tw-gap-1">
                    <CategoryIcon fontSize="small" />
                    <span>
                      {ruleConditions?.uniqueType
                        .map((type) => splitAndCapitalize(type.toLowerCase(), '_', ' '))
                        .join(', ')}
                    </span>
                  </span>
                </Tooltips>
              </div>
            )}
            {isNotEmpty(ruleConditions?.whiteList) && (
              <div className="tw-mt-2 tw-flex tw-max-h-32 tw-items-start tw-gap-2 tw-overflow-auto">
                <Tooltips title="Allowed Pokémon">
                  <span className="tw-mt-1 tw-inline-flex tw-shrink-0 tw-items-center" aria-label="Allowed Pokémon">
                    <CheckCircleIcon fontSize="small" color="success" />
                  </span>
                </Tooltips>
                {renderRulePokemonList(ruleConditions?.whiteList ?? [])}
              </div>
            )}
            {isNotEmpty(ruleConditions?.banned) && (
              <div className="tw-mt-2 tw-flex tw-max-h-32 tw-items-start tw-gap-2 tw-overflow-auto">
                <Tooltips title="Banned Pokémon">
                  <span className="tw-mt-1 tw-inline-flex tw-shrink-0 tw-items-center" aria-label="Banned Pokémon">
                    <BlockIcon fontSize="small" color="error" />
                  </span>
                </Tooltips>
                {renderRulePokemonList(ruleConditions?.banned ?? [])}
              </div>
            )}
          </div>
        </DismissibleAlert>
        <div className="row tw-mt-4 !tw-m-0 md:!tw-grid md:tw-grid-cols-2">
          <div className="tw-order-1 !tw-my-3">{renderTeam(false)}</div>
          <Fragment>
            {!pokemonCurr.pokemonData && !pokemonObj.pokemonData && <hr className="tw-block !tw-mt-4 md:tw-hidden" />}
          </Fragment>
          <div
            ref={timelineFocusRef}
            aria-label="Battle timeline"
            className="tw-order-4 tw-mt-4 tw-scroll-mt-20 tw-outline-none md:tw-col-span-2"
            tabIndex={-1}
          >
            {pokemonCurr.pokemonData &&
              pokemonObj.pokemonData &&
              isNotEmpty(pokemonCurr.timeline) &&
              isNotEmpty(pokemonObj.timeline) && (
                <Fragment>
                  <AccordionMui
                    onChange={(value) => {
                      setOpenBattle(value === 0);
                    }}
                    items={[
                      {
                        sxSummary: {
                          p: 0,
                          '& .MuiAccordionSummary-content': { m: 0 },
                        },
                        noPadding: true,
                        hideIcon: true,
                        value: 0,
                        label: renderHeader(
                          [pokemonCurr, ...pokemonCurrBench][activeTeamIndexes.player] ?? pokemonCurr,
                          [pokemonObj, ...pokemonObjBench][activeTeamIndexes.opponent] ?? pokemonObj
                        ),
                        children: TimelineVertical(
                          pokemonCurr,
                          pokemonObj,
                          [pokemonCurr, ...pokemonCurrBench],
                          [pokemonObj, ...pokemonObjBench]
                        ),
                      },
                    ]}
                  />
                  <div>
                    {timelineType === TimelineType.Normal ? (
                      <Fragment>
                        {Timeline(
                          pokemonCurr,
                          pokemonObj,
                          timelineNormalContainer as React.LegacyRef<HTMLDivElement>,
                          onScrollTimeline,
                          timelineNormal as React.LegacyRef<HTMLDivElement>,
                          playLine as React.LegacyRef<HTMLDivElement>,
                          onPlayLineMove,
                          showTap,
                          [pokemonCurr, ...pokemonCurrBench],
                          [pokemonObj, ...pokemonObjBench]
                        )}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {TimelineFit(
                          pokemonCurr,
                          pokemonObj,
                          timelineFit as React.LegacyRef<HTMLDivElement>,
                          playLine as React.LegacyRef<HTMLDivElement>,
                          onPlayLineFitMove,
                          showTap,
                          [pokemonCurr, ...pokemonCurrBench],
                          [pokemonObj, ...pokemonObjBench]
                        )}
                      </Fragment>
                    )}
                    <div className="tw-flex tw-flex-wrap tw-justify-center tw-items-center">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showTap}
                            onChange={(_, check) => setOptions({ ...options, showTap: check })}
                          />
                        }
                        label="Show Tap Move"
                      />
                      <RadioGroup
                        row
                        aria-labelledby="row-timeline-group-label"
                        name="row-timeline-group"
                        value={timelineType}
                        onChange={(e) => onChangeTimeline(toNumber(e.target.value))}
                      >
                        <FormControlLabel value={TimelineType.Fit} control={<Radio />} label="Fit Timeline" />
                        <FormControlLabel value={TimelineType.Normal} control={<Radio />} label="Normal Timeline" />
                      </RadioGroup>
                      <SelectMui
                        formClassName="tw-m-2 tw-min-w-[120px]"
                        onChangeSelect={(value) => setOptions({ ...options, duration: toFloat(value) })}
                        value={duration}
                        inputLabel="Speed"
                        menuItems={[
                          { value: 0.5, label: 'x0.5' },
                          { value: 1, label: 'Normal' },
                          { value: 2, label: 'x2' },
                          { value: 5, label: 'x5' },
                          { value: 10, label: 'x10' },
                        ]}
                      />
                      <div className="tw-flex tw-items-center tw-gap-x-4 tw-mx-2 tw-min-w-[160px]">
                        <IconButton
                          size="small"
                          onClick={toggleMute}
                          sx={{
                            transition: 'color 0.2s',
                            color: volume === 0 ? 'text.disabled' : 'primary.main',
                          }}
                        >
                          {volume === 0 ? (
                            <VolumeOffIcon fontSize="small" />
                          ) : volume < 0.5 ? (
                            <VolumeDownIcon fontSize="small" />
                          ) : (
                            <VolumeUpIcon fontSize="small" />
                          )}
                        </IconButton>
                        <Slider
                          size="small"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={(_, val) => setOptions({ ...options, volume: val as number })}
                          aria-label="Sound volume"
                          sx={{
                            width: 100,
                            color: volume === 0 ? 'text.disabled' : 'primary.main',
                            transition: 'color 0.2s',
                            '& .MuiSlider-thumb': {
                              width: 14,
                              height: 14,
                              transition: 'box-shadow 0.2s, width 0.2s, height 0.2s',
                              '&:hover': { width: 18, height: 18 },
                            },
                          }}
                        />
                        <span
                          className={`tw-w-8 tw-text-right tw-text-xs tw-tabular-nums ${
                            volume === 0 ? 'tw-text-gray-400' : ''
                          }`}
                        >
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="tw-mt-4 tw-flex tw-flex-wrap tw-justify-center tw-gap-2 tw-pb-2">
                      <ButtonMui
                        startIcon={playState ? <PauseIcon /> : <PlayArrowIcon />}
                        label={playState ? 'Stop' : 'Play'}
                        onMouseDown={() => (isMobile ? undefined : playState ? stopTimeline() : playingTimeline())}
                        onTouchEnd={() => (isMobile ? (playState ? stopTimeline() : playingTimeline()) : undefined)}
                      />
                      <ButtonMui
                        color="error"
                        startIcon={<RestartAltIcon />}
                        label="Reset Timeline"
                        onClick={() => {
                          resetTimeline();
                          focusBattleTimeline();
                        }}
                        disabled={playState}
                      />
                    </div>
                  </div>
                </Fragment>
              )}
          </div>
          <div className="tw-order-2 !tw-my-3">{renderTeam(true)}</div>
          {renderBattleControls()}
        </div>
        {strategyDialog && (
          <React.Suspense fallback={null}>
            <DialogMui
              open={strategyDialog !== undefined}
              width="md"
              title={
                <span className="tw-flex tw-items-center tw-gap-2">
                  <TuneIcon color={strategyDialog === 'opponentStrategy' ? 'secondary' : 'primary'} />
                  {strategyDialog === 'opponentStrategy' ? 'Opponent Strategy' : 'Player Strategy'}
                </span>
              }
              content={renderStrategy(
                strategyDialog,
                strategyDialog === 'playerStrategy' ? 1 + pokemonCurrBench.length : 1 + pokemonObjBench.length
              )}
              actions={[{ label: 'Done', isClose: true }]}
              onClose={() => setStrategyDialog(undefined)}
            />
          </React.Suspense>
        )}
      </div>
    </Error>
  );
};

export default Battle;
