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
import { findAssetForm, getPokemonBattleLeagueIcon, getPokemonBattleLeagueName } from '../../../utils/compute';
import { calculateCP, calculateStatsByTag, getBaseStatsByIVandLevel } from '../../../utils/calculate';
import { Accordion, Button, Card, Form, useAccordionButton } from 'react-bootstrap';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import Timeline from './Timeline/Timeline';
import TimelineFit from './Timeline/TimelineFit';
import TimelineVertical from './Timeline/TimelineVertical';

import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
} from '@mui/material';

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
import { useDispatch } from 'react-redux';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useSnackbar } from 'notistack';
import { BattlePokemonData, IBattlePokemonData, RankingsPVP, Toggle } from '../../../core/models/pvp.model';
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
import { PokemonType, TypeAction, VariantType } from '../../../enums/type.enum';
import { SpinnerActions } from '../../../store/actions';
import {
  DynamicObj,
  getPropertyName,
  getValueOrDefault,
  isEqual,
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
import { LinkToTop, useNavigateToTop } from '../../../utils/hooks/LinkToTop';
import PokemonIconType from '../../../components/Sprites/PokemonIconType/PokemonIconType';
import { HexagonStats } from '../../../core/models/stats.model';
import { IncludeMode } from '../../../utils/enums/string.enum';
import Error from '../../Error/Error';
import { AxiosError } from 'axios';
import { useTitle } from '../../../utils/hooks/useTitle';
import { TitleSEOProps } from '../../../utils/models/hook.model';
import { getRandomNumber, overlappingPos } from '../utils/battle.utils';
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
import useDataStore from '../../../composables/useDataStore';
import usePVP from '../../../composables/usePVP';

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
  const dispatch = useDispatch();
  const { pokemonsData, assetsData } = useDataStore();
  const { loadPVPMoves } = usePVP();
  const params = useParams();
  const navigateToTop = useNavigateToTop();

  const { enqueueSnackbar } = useSnackbar();
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
      enqueueSnackbar('Something went wrong! Please try again.', {
        variant: VariantType.Error,
      });
      return;
    }

    if (
      (!pokemonCurr.disableCMoveSec && !pokemonCurr.cMoveSec) ||
      (!pokemonObj.disableCMoveSec && !pokemonObj.cMoveSec) ||
      (!pokemonCurr.disableCMovePri && !pokemonCurr.cMovePri) ||
      (!pokemonObj.disableCMovePri && !pokemonObj.cMovePri)
    ) {
      enqueueSnackbar('Required charge move', {
        variant: VariantType.Error,
      });
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
      dispatch(SpinnerActions.ShowSpinner.create());
      try {
        clearData();
        const file = (
          await APIService.getFetchUrl<RankingsPVP[]>(
            APIService.getRankingFile(LeagueBattleType.All, league, getKeyWithData(ScoreType, ScoreType.Overall))
          )
        ).data;
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
            const pokemon = pokemonsData().find((pokemon) => isEqual(pokemon.slug, name));
            if (!pokemon) {
              return new BattlePokemonData();
            }

            const id = pokemon.num;
            const form = findAssetForm(assetsData(), pokemon.num, pokemon.form);

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
        dispatch(SpinnerActions.HideSpinner.create());
      } catch (e) {
        if ((e as AxiosError)?.status === 404) {
          setIsFound(false);
        } else {
          dispatch(
            SpinnerActions.ShowSpinnerMsg.create({
              isError: true,
              message: (e as AxiosError).message,
            })
          );
        }
      }
    },
    [pokemonsData(), assetsData(), dispatch]
  );

  useEffect(() => {
    const fetchPokemon = async (league: number) => {
      await fetchPokemonBattle(league);
    };
    if (isNotEmpty(pokemonsData()) && isNotEmpty(assetsData())) {
      fetchPokemon(league);
    }
    return () => {
      dispatch(SpinnerActions.HideSpinner.create());
    };
  }, [fetchPokemonBattle, league, dispatch]);

  useEffect(() => {
    loadPVPMoves();
  }, []);

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
        arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
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
        arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
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
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
      } else {
        const clientWidth = toNumber(timelineFit.current?.clientWidth);
        xCurrent = elem.style.transform ? (getTranslation(elem) >= clientWidth - 1 ? 0 : getTranslation(elem)) : 0;
        xFit.current = clientWidth;
        if (!isNotEmpty(arrStore.current)) {
          for (let i = 0; i < range; i++) {
            arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
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

  const onChangeTimeline = (type: TimelineType, prevWidth: number | undefined) => {
    stopTimeline();
    let elem = document.getElementById('play-line');
    let xCurrent = 0,
      transform;
    if (elem) {
      xCurrent = toNumber(elem.style.transform.replace('translate(', '').replace('px, -50%)', ''));
    }
    setOptions({ ...options, timelineType: type });
    setTimeout(() => {
      if (type === TimelineType.Normal) {
        if (!isNotEmpty(arrBound.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrBound.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / toNumber(prevWidth)) * toNumber(timelineNormal.current?.clientWidth) - 2;
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = `translate(${Math.max(0, transform)}px, -50%)`;
        }
        timelineNormalContainer.current?.scrollTo({
          left: Math.min(transform, transform - timelineNormalContainer.current?.clientWidth / 2),
        });
      } else {
        if (!isNotEmpty(arrStore.current) && isNotEmpty(pokemonCurr.timeline)) {
          for (let i = 0; i < pokemonCurr.timeline.length; i++) {
            arrStore.current.push(document.getElementById(i.toString())?.getBoundingClientRect());
          }
        }
        transform = (xCurrent / toNumber(prevWidth)) * toNumber(timelineFit.current?.clientWidth);
        elem = document.getElementById('play-line');
        if (elem) {
          elem.style.transform = `translate(${transform}px, -50%)`;
        }
      }
    }, 100);
  };

  const findBuff = (move: ICombat | undefined) => {
    if (!isNotEmpty(move?.buffs)) {
      return <></>;
    }
    return (
      <div className="bufs-container d-flex flex-row column-gap-1">
        {move?.buffs.map((value, index) => (
          <div key={index} className="d-flex position-relative column-gap-1">
            <img width={15} height={15} alt="Image ATK" src={value.type === TypeAction.Atk ? ATK_LOGO : DEF_LOGO} />
            <div className="position-absolute icon-buff">
              {value.power >= 2 && <KeyboardDoubleArrowUpIcon fontSize="small" sx={{ color: 'green' }} />}
              {value.power === 1 && <KeyboardArrowUpIcon fontSize="small" sx={{ color: 'green' }} />}
              {value.power === -1 && <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'red' }} />}
              {value.power <= -2 && <KeyboardDoubleArrowDownIcon fontSize="small" sx={{ color: 'red' }} />}
              <span className={value.power < 0 ? 'text-danger' : 'text-success'} style={{ fontSize: 12 }}>
                {value.power}
              </span>
            </div>
            <b style={{ fontSize: 12 }}>{toNumber(value.buffChance) * 100}%</b>
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
      enqueueSnackbar('Pokémon not found.', {
        variant: VariantType.Error,
      });
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
      enqueueSnackbar(`This stats Pokémon CP is greater than ${paramCP}, which is not permitted by the league.`, {
        variant: VariantType.Error,
      });
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
      <Accordion defaultActiveKey={[]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Information</Accordion.Header>
          <Accordion.Body>
            <div className="w-100 d-flex justify-content-center">
              <div className="position-relative filter-shadow" style={{ width: 128 }}>
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
            <div className="w-100 d-flex justify-content-center align-items-center gap-1">
              <LinkToTop
                to={`/pvp/${params.cp}/${getKeyWithData(
                  ScoreType,
                  ScoreType.Overall
                )?.toLowerCase()}/${pokemon.pokemonData?.speciesId?.replaceAll('_', '-')}`}
              >
                <VisibilityIcon className="view-pokemon theme-text-primary" fontSize="large" />
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
            <img className="me-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} />
            {'Attack: '}
            <b>
              {Math.floor(
                toNumber(pokemon.pokemonData?.currentStats?.stats?.statATK) *
                  getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Atk)
              )}
            </b>
            <br />
            <img className="me-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} />
            {'Defense: '}
            <b>
              {Math.floor(
                toNumber(pokemon.pokemonData?.currentStats?.stats?.statDEF) *
                  getDmgMultiplyBonus(pokemon.pokemonType, TypeAction.Def)
              )}
            </b>
            <br />
            <img className="me-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
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
              onSubmit={(e) => {
                calculateStatPokemon(e, type, pokemon, setPokemon);
              }}
            >
              <div className="mt-2 input-group">
                <span className="input-group-text">Level</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.level}
                  id={`level${battleType}`}
                  type="number"
                  step={stepLevel()}
                  min={minLevel()}
                  max={maxLevel()}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">Attack IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.atkIV}
                  id={`atkIV${battleType}`}
                  type="number"
                  step={1}
                  min={minIv()}
                  max={maxIv()}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">Defense IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.defIV}
                  id={`defIV${battleType}`}
                  type="number"
                  step={1}
                  min={minIv()}
                  max={maxIv()}
                />
              </div>
              <div className="input-group">
                <span className="input-group-text">HP IV</span>
                <input
                  className="form-control shadow-none"
                  defaultValue={pokemon.pokemonData?.currentStats?.IV?.staIV}
                  id={`hpIV${battleType}`}
                  type="number"
                  step={1}
                  min={minIv()}
                  max={maxIv()}
                />
              </div>
              <div className="w-100 mt-2">
                <Button type="submit" className="w-100" color="primary">
                  Calculate Stats
                </Button>
              </div>
            </form>
            <div className="w-100 mt-2">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon, true)}>
                Set Random Stats
              </Button>
            </div>
            <div className="w-100 mt-2">
              <Button className="w-100" color="primary" onClick={() => onSetStats(type, pokemon, setPokemon)}>
                Set Best Stats
              </Button>
            </div>
            <hr />
            <TypeBadge
              isFind
              title="Fast Move"
              move={pokemon.fMove}
              moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.fMove?.name)}
            />
            <div className="d-flex w-100 position-relative column-gap-2">
              <TypeBadge
                isFind
                title="Primary Charged Move"
                move={pokemon.cMovePri}
                moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMovePri?.name)}
              />
              {findBuff(pokemon.cMovePri)}
            </div>
            {pokemon.cMoveSec && (
              <div className="d-flex w-100 position-relative column-gap-2">
                <TypeBadge
                  isFind
                  title="Secondary Charged Move"
                  move={pokemon.cMoveSec}
                  moveType={getMoveType(pokemon.pokemonData?.pokemon, pokemon.cMoveSec.name)}
                />
                {findBuff(pokemon.cMoveSec)}
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
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
            <div className="input-group">
              <span className="input-group-text">Energy</span>
              <input
                className="form-control shadow-none"
                defaultValue={pokemon.energy}
                type="number"
                min={0}
                max={battleMaxEnergy()}
                onInput={(e) => {
                  const value = toNumber(e.currentTarget.value);
                  if (isNaN(value)) {
                    return;
                  }
                  if (type === BattleType.Current) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonCurr: PokemonBattleData.create({
                        ...playTimeline.pokemonCurr,
                        energy: value,
                      }),
                    });
                  } else if (type === BattleType.Object) {
                    setPlayTimeline({
                      ...playTimeline,
                      pokemonObj: PokemonBattleData.create({
                        ...playTimeline.pokemonObj,
                        energy: value,
                      }),
                    });
                  }
                  setPokemon(PokemonBattle.create({ ...pokemon, timeline: [], energy: value }));
                }}
              />
            </div>
            <div className="input-group">
              <span className="input-group-text">Block</span>
              <Form.Select
                className="form-control rounded-0"
                defaultValue={pokemon.block}
                onChange={(e) => {
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
                    PokemonBattle.create({ ...pokemon, timeline: [], energy: 0, block: toNumber(e.target.value) })
                  );
                }}
              >
                {getArrayBySeq(defaultBlock() + 1).map((value, index) => (
                  <option key={index} value={value}>
                    {value}
                  </option>
                ))}
              </Form.Select>
            </div>
            {(!pokemon.disableCMovePri || !pokemon.disableCMoveSec) && (pokemon.cMovePri || pokemon.cMoveSec) && (
              <div className="input-group">
                <span className="input-group-text">Charge Slot</span>
                <Form.Select
                  className="form-control rounded-0"
                  value={pokemon.chargeSlot}
                  onChange={(e) => {
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
                        chargeSlot: toNumber(e.target.value),
                      })
                    );
                  }}
                >
                  <option value={ChargeType.Primary} disabled={pokemon.disableCMovePri || !pokemon.cMovePri}>
                    {ChargeType.Primary}
                  </option>
                  <option value={ChargeType.Secondary} disabled={pokemon.disableCMoveSec || !pokemon.cMoveSec}>
                    {ChargeType.Secondary}
                  </option>
                  <option
                    value={ChargeType.Random}
                    disabled={
                      pokemon.disableCMovePri || pokemon.disableCMoveSec || !pokemon.cMovePri || !pokemon.cMoveSec
                    }
                  >
                    Random
                  </option>
                </Form.Select>
              </div>
            )}
            {pokemon && (
              <div className="w-100 bg-ref-pokemon">
                <div className="w-100 bg-type-moves">
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

  const CustomToggle = (props: Toggle) => {
    const decoratedOnClick = useAccordionButton(props.eventKey);

    return (
      <div className="btn-collapse-battle" onClick={decoratedOnClick}>
        {openBattle ? (
          <RemoveCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="error" />
        ) : (
          <AddCircleIcon onClick={() => setOpenBattle(!openBattle)} fontSize="large" color="primary" />
        )}
      </div>
    );
  };

  return (
    <Error isError={!isFound}>
      <div className="container mt-2 battle-body-container">
        <Form.Select
          onChange={(e) => {
            navigateToTop(`/pvp/battle/${toNumber(e.target.value)}`);
            setOptions({ ...options, league: toNumber(e.target.value) });
          }}
          defaultValue={league}
        >
          <option value={BattleLeagueCPType.Little}>{getPokemonBattleLeagueName(BattleLeagueCPType.Little)}</option>
          <option value={BattleLeagueCPType.Great}>{getPokemonBattleLeagueName(BattleLeagueCPType.Great)}</option>
          <option value={BattleLeagueCPType.Ultra}>{getPokemonBattleLeagueName(BattleLeagueCPType.Ultra)}</option>
          <option value={BattleLeagueCPType.InsMaster}>{getPokemonBattleLeagueName(BattleLeagueCPType.Master)}</option>
        </Form.Select>
        <div className="row mt-2 m-0">
          <div className="col-lg-3">
            {renderPokemonInfo(BattleType.Current, pokemonCurr, setPokemonCurr, clearDataPokemonCurr)}
          </div>
          <div className="col-lg-6">
            {pokemonCurr.pokemonData &&
              pokemonObj.pokemonData &&
              isNotEmpty(pokemonCurr.timeline) &&
              isNotEmpty(pokemonObj.timeline) && (
                <Fragment>
                  <Accordion defaultActiveKey={[]}>
                    <Card className="position-relative">
                      <Card.Header className="p-0">
                        <div className="d-flex timeline-vertical">
                          <div className="w-50">
                            <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-start gap-2">
                              <div className="position-relative filter-shadow" style={{ width: 35 }}>
                                <PokemonIconType pokemonType={pokemonCurr.pokemonType} size={20}>
                                  <img
                                    alt="Image League"
                                    className="sprite-type"
                                    src={APIService.getPokemonModel(
                                      pokemonCurr.pokemonData.form,
                                      pokemonCurr.pokemonData.id
                                    )}
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
                              <b>{splitAndCapitalize(pokemonCurr.pokemonData.name, '-', ' ')}</b>
                            </div>
                          </div>
                          <div className="w-50">
                            <div className="w-100 h-100 pokemon-battle-header d-flex align-items-center justify-content-end gap-2">
                              <div className="position-relative filter-shadow" style={{ width: 35 }}>
                                <PokemonIconType pokemonType={pokemonObj.pokemonType} size={20}>
                                  <img
                                    alt="Image League"
                                    className="sprite-type"
                                    src={APIService.getPokemonModel(
                                      pokemonObj.pokemonData.form,
                                      pokemonObj.pokemonData.id
                                    )}
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
                              <b>{splitAndCapitalize(pokemonObj.pokemonData.name, '-', ' ')}</b>
                            </div>
                          </div>
                        </div>
                        <CustomToggle eventKey="0" />
                      </Card.Header>
                      <Accordion.Collapse eventKey="0">
                        <Card.Body className="p-0">{TimelineVertical(pokemonCurr, pokemonObj)}</Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
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
                    <div className="d-flex justify-content-center">
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
                        onChange={(e) =>
                          onChangeTimeline(
                            toNumber(e.target.value),
                            timelineType === TimelineType.Normal
                              ? timelineNormal.current?.clientWidth
                              : timelineFit.current?.clientWidth
                          )
                        }
                      >
                        <FormControlLabel
                          value={TimelineType.Fit}
                          control={<Radio />}
                          label={<span>Fit Timeline</span>}
                        />
                        <FormControlLabel
                          value={TimelineType.Normal}
                          control={<Radio />}
                          label={<span>Normal Timeline</span>}
                        />
                      </RadioGroup>
                      <FormControl variant={VariantType.Standard} sx={{ m: 1, minWidth: 120 }} disabled={playState}>
                        <InputLabel>Speed</InputLabel>
                        <Select
                          value={duration}
                          onChange={(e) => setOptions({ ...options, duration: toFloat(e.target.value) })}
                          label="Speed"
                        >
                          <MenuItem value={0.5}>x0.5</MenuItem>
                          <MenuItem value={1}>Normal</MenuItem>
                          <MenuItem value={2}>x2</MenuItem>
                          <MenuItem value={5}>x5</MenuItem>
                          <MenuItem value={10}>x10</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                    <div className="d-flex justify-content-center column-gap-2">
                      <button
                        className="btn btn-primary"
                        onMouseDown={() => (playState ? stopTimeline() : playingTimeline())}
                        onTouchEnd={() => (playState ? stopTimeline() : playingTimeline())}
                      >
                        {playState ? (
                          <Fragment>
                            <PauseIcon /> Stop
                          </Fragment>
                        ) : (
                          <Fragment>
                            <PlayArrowIcon /> Play
                          </Fragment>
                        )}
                      </button>
                      <button disabled={playState} className="btn btn-danger" onClick={() => resetTimeline()}>
                        <RestartAltIcon /> Reset
                      </button>
                    </div>
                  </div>
                </Fragment>
              )}
          </div>
          <div className="col-lg-3">
            {renderPokemonInfo(BattleType.Object, pokemonObj, setPokemonObj, clearDataPokemonObj)}
          </div>
        </div>
        {pokemonCurr.pokemonData && pokemonObj.pokemonData && (
          <div className="text-center mt-2">
            <button className="btn btn-primary" style={{ height: 50 }} onClick={() => battleAnimation()}>
              {isNotEmpty(pokemonCurr.timeline) && isNotEmpty(pokemonObj.timeline) ? (
                <Fragment>
                  <RestartAltIcon /> Reset Battle
                </Fragment>
              ) : (
                <Fragment>
                  <span className="position-relative">
                    <img height={36} alt="ATK Left" src={ATK_LOGO} />
                    <img className="battle-logo" height={36} alt="ATK Right" src={ATK_LOGO} />
                  </span>
                  {' Battle Simulator'}
                </Fragment>
              )}
            </button>
          </div>
        )}
      </div>
    </Error>
  );
};

export default Battle;
