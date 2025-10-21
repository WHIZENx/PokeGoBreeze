import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';

import SelectPoke from './Select';
import APIService from '../../../services/api.service';
import {
  convertNameRankingToOri,
  getArrayBySeq,
  getDmgMultiplyBonus,
  getKeyWithData,
  getMoveType,
  getValidPokemonImgPath,
  splitAndCapitalize,
} from '../../../utils/utils';
import { getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { calculateCP, calculateStatsByTag, getBaseStatsByIVandLevel } from '../../../utils/calculate';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import Timeline from './Timeline/Timeline';
import TimelineFit from './Timeline/TimelineFit';
import TimelineVertical from './Timeline/TimelineVertical';

import { Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import ATK_LOGO from '../../../assets/attack.png';
import DEF_LOGO from '../../../assets/defense.png';
import HP_LOGO from '../../../assets/hp.png';
import CircleBar from '../../../components/Sprites/ProgressBar/Circle';
import HpBar from '../../../components/Sprites/ProgressBar/HpBar';
import { useParams } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { BattlePokemonData, IBattlePokemonData, RankingsPVP } from '../../../core/models/pvp.model';
import { ICombat } from '../../../core/models/combat.model';
import {
  IPokemonBattleData,
  PokemonBattle,
  PokemonBattleData,
  IPokemonBattle,
  ChargeType,
  BattlePVP,
} from '../models/battle.model';
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
import { IncludeMode } from '../../../utils/enums/string.enum';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { getRandomNumber, overlappingPos, pushBoundingById } from '../utils/battle.utils';
import {
  battleDelay,
  battleMaxEnergy,
  defaultBlock,
  formShadow,
  maxIv,
  maxLevel,
  minCp,
  minIv,
  minLevel,
  stepLevel,
} from '../../../utils/helpers/options-context.helpers';
import usePVP from '../../../composables/usePVP';
import useAssets from '../../../composables/useAssets';
import useSpinner from '../../../composables/useSpinner';
import usePokemon from '../../../composables/usePokemon';
import { Params } from '../../../utils/constants';
import useDevice from '../../../composables/useDevice';
import InputMui from '../../../components/Commons/Inputs/InputMui';
import SelectMui from '../../../components/Commons/Selects/SelectMui';
import ButtonMui from '../../../components/Commons/Buttons/ButtonMui';
import AccordionMui from '../../../components/Commons/Accordions/AccordionMui';
import { useSnackbar } from '../../../contexts/snackbar.context';

interface OptionsBattle {
  showTap: boolean;
  timelineType: TimelineType;
  duration: number;
  league: number;
}

interface IBattleState {
  pokemonCurr: IPokemonBattleData;
  pokemonObj: IPokemonBattleData;
}

class BattleState implements IBattleState {
  pokemonCurr = new PokemonBattleData();
  pokemonObj = new PokemonBattleData();
}

const Battle = () => {
  const { findPokemonBySlug } = usePokemon();
  const { loadPVPMoves } = usePVP();
  const { findAssetForm } = useAssets();
  const { hideSpinner, showSpinner, showSpinnerMsg } = useSpinner();
  const { isMobile } = useDevice();
  const params = useParams();
  const navigateToTop = useNavigateToTop();

  const { showSnackbar } = useSnackbar();
  const [openBattle, setOpenBattle] = useState(false);
  const [data, setData] = useState<IBattlePokemonData[]>([]);
  const [options, setOptions] = useState<OptionsBattle>({
    showTap: false,
    timelineType: TimelineType.Normal,
    duration: 1,
    league: toNumber(params.cp, BattleLeagueCPType.Little),
  });
  const { showTap, timelineType, duration, league } = options;

  const timelineFit = useRef<HTMLDivElement>();
  const timelineNormal = useRef<HTMLDivElement>();
  const timelineNormalContainer = useRef<HTMLDivElement>();
  const playLine = useRef<HTMLDivElement>();

  let timelineInterval: NodeJS.Timeout;

  const [pokemonCurr, setPokemonCurr] = useState(new PokemonBattle());
  const [pokemonObj, setPokemonObj] = useState(new PokemonBattle());
  const [playTimeline, setPlayTimeline] = useState(new BattleState());

  const [isFound, setIsFound] = useState(true);

  const battleAnimation = () => {
    if (!pokemonCurr.pokemonData || !pokemonObj.pokemonData) {
      showSnackbar('Something went wrong! Please try again.', 'error');
      return;
    }

    if (
      (!pokemonCurr.disableCMoveSec && !pokemonCurr.cMoveSec) ||
      (!pokemonObj.disableCMoveSec && !pokemonObj.cMoveSec) ||
      (!pokemonCurr.disableCMovePri && !pokemonCurr.cMovePri) ||
      (!pokemonObj.disableCMovePri && !pokemonObj.cMovePri)
    ) {
      showSnackbar('Required charge move', 'error');
      return;
    }
    arrBound.current = [];
    arrStore.current = [];
    resetTimeline();
    clearInterval(timelineInterval);

    const battle = BattlePVP.create(pokemonCurr, pokemonObj);

    timelineInterval = setInterval(() => {
      battle.updateBattle();
      if (!battle.config.charged && !battle.configOpponent.charged) {
        battle.chargeAttack();
        battle.chargeAttack(true);

        battle.preCharge();
        battle.preCharge(true);
      } else {
        battle.charging();
        battle.charging(true);

        battle.timeline[battle.timer].isTap = false;
        battle.timelineOpponent[battle.timer].isTap = false;
      }

      if (!battle.isDelay) {
        if (battle.config.charged) {
          battle.turnChargeAttack();
        } else if (battle.config.preCharge) {
          battle.turnPreCharge();
        } else if (battle.configOpponent.charged) {
          battle.turnChargeAttack(true);
        } else if (battle.configOpponent.preCharge) {
          battle.turnPreCharge(true);
        }
      } else {
        if (battle.delay <= 0) {
          battle.isDelay = false;
          battle.clearCharge();
          battle.clearCharge(true);
          if (battle.config.immune) {
            battle.immuneChargeAttack();
          } else if (battle.configOpponent.immune) {
            battle.immuneChargeAttack(true);
          }
          battle.config.immune = false;
          battle.configOpponent.immune = false;
        } else {
          battle.delay -= battleDelay();
        }
      }

      if (battle.pokemon.hp <= 0 || battle.pokemonOpponent.hp <= 0) {
        clearInterval(timelineInterval);
        if (battle.pokemon.hp <= 0) {
          battle.result();
        } else if (battle.pokemonOpponent.hp <= 0) {
          battle.result(true);
        }
        if (battle.timeline.length === battle.timelineOpponent.length) {
          setPokemonCurr({ ...pokemonCurr, timeline: battle.timeline });
          setPokemonObj({ ...pokemonObj, timeline: battle.timelineOpponent });
        } else {
          battleAnimation();
        }
      }
    }, 1);
  };

  const clearData = () => {
    setPokemonObj(new PokemonBattle());
    setPokemonCurr(new PokemonBattle());
  };

  const [titleProps, setTitleProps] = useState<TitleSEOProps>({
    title: 'PVP Battle Simulator',
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
    async (league: number) => {
      showSpinner();
      try {
        clearData();
        const { data: file } = await APIService.getFetchUrl<RankingsPVP[]>(
          APIService.getRankingFile(LeagueBattleType.All, league, getKeyWithData(ScoreType, ScoreType.Overall))
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
            const pokemon = findPokemonBySlug(name);
            if (!pokemon) {
              return new BattlePokemonData();
            }

            const id = pokemon.num;
            const form = findAssetForm(pokemon.num, pokemon.form);

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
              form,
              stats,
              pokemonType,
            });
          })
          .filter((pokemon) => pokemon.id > 0);
        setData(result);
        hideSpinner();
      } catch (e) {
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
    [findPokemonBySlug]
  );

  useEffect(() => {
    const fetchPokemon = async (league: number) => {
      await fetchPokemonBattle(league);
    };
    fetchPokemon(league);
    return () => {
      hideSpinner();
    };
  }, [fetchPokemonBattle, league]);

  useEffect(() => {
    loadPVPMoves();
  }, []);

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
      arrBound.current = [];
      arrStore.current = [];
      const elem = document.getElementById('play-line');
      if (elem) {
        elem.style.transform = 'translate(0px, -50%)';
      }
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushBoundingById(arrBound.current, i);
      }
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushBoundingById(arrStore.current, i);
      }
    }
  }, [windowWidth]);

  const clearDataPokemonCurr = (removeCMoveSec: boolean) => {
    setPokemonObj(PokemonBattle.create({ ...pokemonObj, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, cMoveSec: undefined, timeline: [] }));
    } else {
      setPokemonCurr(new PokemonBattle());
    }
  };

  const clearDataPokemonObj = (removeCMoveSec: boolean) => {
    setPokemonCurr(PokemonBattle.create({ ...pokemonCurr, timeline: [] }));
    setPlayTimeline(new BattleState());
    if (removeCMoveSec) {
      setPokemonObj(PokemonBattle.create({ ...pokemonObj, cMoveSec: undefined, timeline: [] }));
    } else {
      setPokemonObj(new PokemonBattle());
    }
  };

  const timelinePlay = useRef<number | null>(null);
  const start = useRef(0);
  const [playState, setPlayState] = useState(false);
  const scrollWidth = useRef(0);
  const xFit = useRef(0);
  const xNormal = useRef<number | null>(null);
  const arrBound = useRef<(DOMRect | undefined)[]>([]);
  const arrStore = useRef<(DOMRect | undefined)[]>([]);

  const getTranslation = (elem: HTMLElement) =>
    elem ? toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', '')) : 0;

  const onPlayLineMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeline();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    const xPos = toNumber(xNormal.current);
    if (elem && x <= toNumber(timelineNormal.current?.clientWidth) - 2) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      !isNotEmpty(arrBound.current) &&
      isNotEmpty(pokemonCurr.timeline) &&
      arrBound.current.length < pokemonCurr.timeline.length
    ) {
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushBoundingById(arrBound.current, i);
      }
    }
    if (xPos <= 0) {
      if (timelineNormalContainer.current) {
        const rect = timelineNormalContainer.current.getBoundingClientRect();
        xNormal.current = rect.left;
      }
    }
    checkOverlap(arrBound.current, x + xPos);
  };

  const onPlayLineFitMove = (e: TimelineEvent<HTMLDivElement>) => {
    stopTimeline();
    const elem = document.getElementById('play-line');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, (e.clientX ?? e.changedTouches?.[0].clientX ?? 0) - rect.left);
    if (elem && x <= toNumber(timelineFit.current?.clientWidth)) {
      elem.style.transform = `translate(${x}px, -50%)`;
    }
    if (
      (xFit.current !== e.currentTarget.clientWidth || !isNotEmpty(arrStore.current)) &&
      isNotEmpty(pokemonCurr.timeline) &&
      arrStore.current.length < pokemonCurr.timeline.length
    ) {
      xFit.current = e.currentTarget.clientWidth;
      for (let i = 0; i < pokemonCurr.timeline.length; i++) {
        pushBoundingById(arrStore.current, i);
      }
    }
    checkOverlap(arrStore.current, elem?.getBoundingClientRect().left);
  };

  const playingTimeline = () => {
    setPlayState(true);
    const range = pokemonCurr.timeline.length;
    const elem = document.getElementById('play-line');
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
        if (!xNormal.current) {
          if (timelineNormalContainer.current) {
            const rect = timelineNormalContainer.current.getBoundingClientRect();
            xNormal.current = rect.left;
          }
        }
        if (!isNotEmpty(arrBound.current)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushBoundingById(arrBound.current, i);
          }
        }
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        xCurrent = elem.style.transform ? (getTranslation(elem) >= clientWidth - 1 ? 0 : getTranslation(elem)) : 0;
        xFit.current = clientWidth;
        if (!isNotEmpty(arrStore.current)) {
          for (let i = 0; i < range; i++) {
            pushBoundingById(arrStore.current, i);
          }
        }
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
          checkOverlap(arrBound.current, width + toNumber(xNormal.current));
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
          checkOverlap(arrStore.current, elem.getBoundingClientRect().left);
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
    return;
  };

  const resetTimeline = () => {
    stopTimeline();
    const elem = document.getElementById('play-line');
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
        Math.round(toNumber(pokemonCurr.pokemonData?.currentStats?.stats?.statSTA))
      ),
      pokemonObj: PokemonBattleData.setValue(
        pokemonObj.energy,
        Math.round(toNumber(pokemonObj.pokemonData?.currentStats?.stats?.statSTA))
      ),
    });
  };

  const checkOverlap = (arr: (DOMRect | undefined)[], pos = 0, sound = false) => {
    const index = overlappingPos(arr, pos);
    if (index >= 0 && index < arr.length) {
      updateTimeline(index, sound);
    }
  };

  const isPlaySound = (sound: HTMLAudioElement | undefined) =>
    sound && sound.currentTime > 0 && !sound.paused && !sound.ended && sound.readyState > sound.HAVE_CURRENT_DATA;

  const updateTimeline = (index: number, sound = false) => {
    const pokeCurrData = pokemonCurr.timeline.at(index);
    const pokeObjData = pokemonObj.timeline.at(index);
    if (sound && pokemonCurr.audio?.fMove && pokemonObj.audio?.fMove) {
      if (!isPlaySound(pokemonCurr.audio.fMove) && pokeCurrData?.type === AttackType.Fast) {
        pokemonCurr.audio.fMove.currentTime = 0;
        pokemonCurr.audio.fMove.play();
      } else if (isPlaySound(pokemonCurr.audio.fMove) && pokeCurrData?.type === AttackType.Fast) {
        pokemonCurr.audio.fMove.pause();
      }
      if (!isPlaySound(pokemonObj.audio.fMove) && pokeObjData?.type === AttackType.Fast) {
        pokemonObj.audio.fMove.currentTime = 0;
        pokemonObj.audio.fMove.play();
      } else if (isPlaySound(pokemonObj.audio.fMove) && pokeObjData?.type === AttackType.Fast) {
        pokemonObj.audio.fMove.pause();
      }
    }
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
    let elem = document.getElementById('play-line');
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
      elem = document.getElementById('play-line');
      const currentWidth = toNumber(
        type === TimelineType.Normal ? timelineNormal.current?.clientWidth : timelineFit.current?.clientWidth
      );
      transform = (xCurrent / prevWidth) * currentWidth;
      if (type === TimelineType.Normal) {
        if (!isNotEmpty(arrBound.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushBoundingById(arrBound.current, i);
          }
        }
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
          checkOverlap(arrBound.current, elem.getBoundingClientRect().left);
        }
        timelineNormalContainer.current?.scrollTo({
          left: Math.min(transform, transform - timelineNormalContainer.current?.clientWidth / 2),
        });
      } else {
        if (!isNotEmpty(arrStore.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            pushBoundingById(arrStore.current, i);
          }
        }
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
          checkOverlap(arrStore.current, elem.getBoundingClientRect().left);
        }
      }
    }, 100);
  };

  const findBuff = (move: ICombat | undefined) => {
    if (!isNotEmpty(move?.buffs)) {
      return <></>;
    }
    return (
      <div className="bufs-container tw-flex tw-flex-row tw-gap-y-1">
        {move?.buffs.map((value, index) => (
          <div key={index} className="tw-flex tw-relative tw-gap-y-1">
            <img width={15} height={15} alt="Image ATK" src={value.type === TypeAction.Atk ? ATK_LOGO : DEF_LOGO} />
            <div className="tw-absolute icon-buff">
              {value.power >= 2 && <KeyboardDoubleArrowUpIcon fontSize="small" color="success" />}
              {value.power === 1 && <KeyboardArrowUpIcon fontSize="small" color="success" />}
              {value.power === -1 && <KeyboardArrowDownIcon fontSize="small" color="error" />}
              {value.power <= -2 && <KeyboardDoubleArrowDownIcon fontSize="small" color="error" />}
              <span className={combineClasses('tw-text-sm', value.power < 0 ? 'text-danger' : 'text-success')}>
                {value.power}
              </span>
            </div>
            <b className="tw-text-sm">{toNumber(value.buffChance) * 100}%</b>
          </div>
        ))}
      </div>
    );
  };

  const calculateStatPokemon = (
    e: React.FormEvent<HTMLFormElement>,
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>
  ) => {
    e.preventDefault();
    if (!pokemon.pokemonData) {
      showSnackbar('Pokémon not found.', 'error');
      return;
    }
    const battleType = getKeyWithData(BattleType, type);
    const atk = toNumber(pokemon.pokemonData.stats?.atk);
    const def = toNumber(pokemon.pokemonData.stats?.def);
    const sta = toNumber(pokemon.pokemonData.stats?.sta);
    const atkIV = toNumber((document.getElementById(`atkIV${battleType}`) as HTMLInputElement).value);
    const defIV = toNumber((document.getElementById(`defIV${battleType}`) as HTMLInputElement).value);
    const staIV = toNumber((document.getElementById(`hpIV${battleType}`) as HTMLInputElement).value);
    const level = toNumber((document.getElementById(`level${battleType}`) as HTMLInputElement).value);
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

    const battleType = getKeyWithData(BattleType, type);
    (document.getElementById(`level${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.level?.toString()
    );
    (document.getElementById(`atkIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.atkIV.toString()
    );
    (document.getElementById(`defIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.defIV.toString()
    );
    (document.getElementById(`hpIV${battleType}`) as HTMLInputElement).value = getValueOrDefault(
      String,
      stats?.IV?.staIV.toString()
    );

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
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>
  ) => {
    const battleType = getKeyWithData(BattleType, type);
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
                      <img
                        alt="Image League"
                        className="pokemon-sprite-raid"
                        src={APIService.getPokemonModel(pokemon.pokemonData?.form, pokemon.pokemonData?.id)}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getValidPokemonImgPath(
                            e.currentTarget.src,
                            pokemon.pokemonData?.id,
                            pokemon.pokemonData?.form
                          );
                        }}
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
                HP: <b>{toNumber(Math.round(toNumber(pokemon.pokemonData?.currentStats?.stats?.statSTA)))}</b>
                <br />
                {'Stats Prod: '}
                <b>
                  {Math.round(
                    toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK) *
                      toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF) *
                      toNumber(pokemon.pokemonData?.currentStats?.stats?.statSTA) *
                      getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Prod)
                  )}
                </b>
                <br />
                <form
                  className="tw-mt-2"
                  onSubmit={(e) => {
                    calculateStatPokemon(e, type, pokemon, setPokemon);
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
                    id={`level${battleType}`}
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
                    id={`atkIV${battleType}`}
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
                    id={`defIV${battleType}`}
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
                    id={`hpIV${battleType}`}
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
                    onClick={() => onSetStats(type, pokemon, setPokemon, true)}
                    label="Set Random Stats"
                  />
                </div>
                <div className="tw-w-full tw-mt-2">
                  <ButtonMui
                    fullWidth
                    color="primary"
                    onClick={() => onSetStats(type, pokemon, setPokemon)}
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
                <div className="tw-flex tw-w-full tw-relative tw-gap-x-2">
                  <TypeBadge
                    isFind
                    title="Primary Charged Move"
                    move={pokemon.cMovePri}
                    moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMovePri?.name)}
                  />
                  {findBuff(pokemon.cMovePri)}
                </div>
                {pokemon.cMoveSec && (
                  <div className="tw-flex tw-w-full tw-relative tw-gap-x-2">
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

  const renderPokemonInfo = (
    type: BattleType,
    pokemon: IPokemonBattle,
    setPokemon: React.Dispatch<React.SetStateAction<IPokemonBattle>>,
    clearDataPokemon: (removeMove: boolean) => void
  ) => {
    const pokemonType = getPropertyName(playTimeline, (o) =>
      type === BattleType.Object ? o.pokemonObj : o.pokemonCurr
    );
    return (
      <Fragment>
        <SelectPoke
          data={data}
          league={league}
          pokemonBattle={pokemon}
          setPokemonBattle={setPokemon}
          clearData={clearDataPokemon}
        />
        {pokemon.pokemonData && (
          <Fragment>
            <InputMui
              labelPrepend="Energy"
              defaultValue={pokemon.energy}
              inputProps={{
                type: 'number',
                min: 0,
                max: battleMaxEnergy(),
                step: 1,
                required: true,
              }}
              id={`energy${type}`}
              fullWidth
              onChange={(value) => {
                const energy = toNumber(value);
                if (type === BattleType.Current) {
                  setPlayTimeline({
                    ...playTimeline,
                    pokemonCurr: PokemonBattleData.create({
                      ...playTimeline.pokemonCurr,
                      energy,
                    }),
                  });
                } else if (type === BattleType.Object) {
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
              labelPrepend="Block"
              defaultValue={pokemon.block}
              fullWidth
              onChange={(value) => {
                const block = toNumber(value);
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
                setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], energy: 0, block }));
              }}
              select
              menuItems={getArrayBySeq(defaultBlock() + 1).map((value) => ({
                label: value,
                value,
              }))}
            />
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
                    PokemonBattle.create({ ...pokemon, timeline: [], energy: 0, chargeSlot: toNumber(value) })
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
                    maxEnergy={battleMaxEnergy()}
                    moveEnergy={Math.abs(toNumber(pokemon.cMovePri?.pvpEnergy))}
                    energy={toNumber(
                      (playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType]?.energy,
                      pokemon.energy
                    )}
                    isDisable={pokemon.disableCMovePri}
                  />
                  {pokemon.cMoveSec && (
                    <CircleBar
                      text={splitAndCapitalize(pokemon.cMoveSec.name, '_', ' ')}
                      type={pokemon.cMoveSec.type}
                      size={80}
                      maxEnergy={battleMaxEnergy()}
                      moveEnergy={Math.abs(pokemon.cMoveSec.pvpEnergy)}
                      energy={toNumber(
                        (playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType]?.energy,
                        pokemon.energy
                      )}
                      isDisable={pokemon.disableCMoveSec}
                    />
                  )}
                </div>
                {isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) && (
                  <Fragment>
                    <HpBar
                      text="HP"
                      height={15}
                      hp={Math.round((playTimeline as unknown as DynamicObj<IPokemonBattleData>)[pokemonType].hp)}
                      maxHp={Math.round(toNumber(pokemon.pokemonData.currentStats?.stats?.statSTA))}
                    />
                  </Fragment>
                )}
              </div>
            )}
            {renderInfoPokemon(type, pokemon, setPokemon)}
          </Fragment>
        )}
      </Fragment>
    );
  };

  const CustomToggle = () => (
    <div className="btn-collapse-battle">
      {openBattle ? (
        <RemoveCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="error" />
      ) : (
        <AddCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="primary" />
      )}
    </div>
  );

  const renderHeader = (pokemonCurr: PokemonBattle, pokemonObj: PokemonBattle) => (
    <div className="tw-relative tw-w-full">
      <div className="tw-flex timeline-vertical">
        <div className="tw-w-1/2">
          <div className="tw-w-full tw-h-full pokemon-battle-header tw-flex tw-items-center tw-justify-start tw-gap-2">
            <div className="tw-relative filter-shadow tw-w-[35px]">
              <PokemonIconType pokemonType={pokemonCurr.pokemonType} size={20}>
                <img
                  alt="Image League"
                  className="sprite-type"
                  src={APIService.getPokemonModel(pokemonCurr.pokemonData?.form, pokemonCurr.pokemonData?.id)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getValidPokemonImgPath(
                      e.currentTarget.src,
                      pokemonCurr.pokemonData?.id,
                      pokemonCurr.pokemonData?.form
                    );
                  }}
                />
              </PokemonIconType>
            </div>
            <b>{splitAndCapitalize(pokemonCurr.pokemonData?.name, '-', ' ')}</b>
          </div>
        </div>
        <div className="tw-w-1/2">
          <div className="tw-w-full tw-h-full pokemon-battle-header tw-flex tw-items-center tw-justify-end tw-gap-2">
            <div className="tw-relative filter-shadow tw-w-[35px]">
              <PokemonIconType pokemonType={pokemonObj.pokemonType} size={20}>
                <img
                  alt="Image League"
                  className="sprite-type"
                  src={APIService.getPokemonModel(pokemonObj.pokemonData?.form, pokemonObj.pokemonData?.id)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getValidPokemonImgPath(
                      e.currentTarget.src,
                      pokemonObj.pokemonData?.id,
                      pokemonObj.pokemonData?.form
                    );
                  }}
                />
              </PokemonIconType>
            </div>
            <b>{splitAndCapitalize(pokemonObj.pokemonData?.name, '-', ' ')}</b>
          </div>
        </div>
      </div>
      <CustomToggle />
    </div>
  );

  return (
    <Error isError={!isFound}>
      <div className="tw-container tw-mt-2 battle-body-container">
        <SelectMui
          fullWidth
          value={league}
          onChangeSelect={(value) => {
            navigateToTop(`/pvp/battle/${value}`);
            setOptions({ ...options, league: value });
          }}
          menuItems={[
            { value: BattleLeagueCPType.Little, label: getPokemonBattleLeagueName(BattleLeagueCPType.Little) },
            { value: BattleLeagueCPType.Great, label: getPokemonBattleLeagueName(BattleLeagueCPType.Great) },
            { value: BattleLeagueCPType.Ultra, label: getPokemonBattleLeagueName(BattleLeagueCPType.Ultra) },
            { value: BattleLeagueCPType.InsMaster, label: getPokemonBattleLeagueName(BattleLeagueCPType.InsMaster) },
          ]}
        />
        <div className="row tw-mt-4 !tw-m-0">
          <div className="lg:tw-w-1/4">
            {renderPokemonInfo(BattleType.Current, pokemonCurr, setPokemonCurr, clearDataPokemonCurr)}
          </div>
          <div className="lg:tw-w-1/2">
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
                        sxSummary: { p: 0, '& .MuiAccordionSummary-content': { m: 0 } },
                        noPadding: true,
                        hideIcon: true,
                        value: 0,
                        label: renderHeader(pokemonCurr, pokemonObj),
                        children: TimelineVertical(pokemonCurr, pokemonObj),
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
                          showTap
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
                          showTap
                        )}
                      </Fragment>
                    )}
                    <div className="tw-flex tw-justify-center">
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
                        formClassName="tw-mt-2"
                        formSx={{ m: 1, minWidth: 120 }}
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
                    </div>
                    <div className="tw-flex tw-justify-center tw-gap-x-2">
                      <ButtonMui
                        startIcon={playState ? <PauseIcon /> : <PlayArrowIcon />}
                        label={playState ? 'Stop' : 'Play'}
                        onMouseDown={() => (isMobile ? undefined : playState ? stopTimeline() : playingTimeline())}
                        onTouchEnd={() => (isMobile ? (playState ? stopTimeline() : playingTimeline()) : undefined)}
                      />
                      <ButtonMui
                        color="error"
                        startIcon={<RestartAltIcon />}
                        label="Reset"
                        onClick={() => resetTimeline()}
                        disabled={playState}
                      />
                    </div>
                  </div>
                </Fragment>
              )}
          </div>
          <div className="lg:tw-w-1/4">
            {renderPokemonInfo(BattleType.Object, pokemonObj, setPokemonObj, clearDataPokemonObj)}
          </div>
        </div>
        {pokemonCurr.pokemonData && pokemonObj.pokemonData && (
          <div className="tw-text-center tw-mt-2">
            <ButtonMui
              className="tw-h-12.5"
              startIcon={
                isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) ? (
                  <RestartAltIcon />
                ) : (
                  <span className="tw-relative">
                    <img height={36} alt="ATK Left" src={ATK_LOGO} />
                    <img className="battle-logo" height={36} alt="ATK Right" src={ATK_LOGO} />
                  </span>
                )
              }
              label={
                isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline)
                  ? 'Reset Battle'
                  : 'Battle Simulator'
              }
              onClick={() => battleAnimation()}
            />
          </div>
        )}
      </div>
    </Error>
  );
};

export default Battle;
