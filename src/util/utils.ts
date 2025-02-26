import { RadioGroup, Rating, Slider, styled } from '@mui/material';
import Moment from 'moment';
import { IPokemonData, PokemonData, PokemonModel } from '../core/models/pokemon.model';
import {
  IStatsAtk,
  IStatsDef,
  IStatsRank,
  IStatsPokemon,
  IStatsProd,
  IStatsSta,
  StatsRankPokemonGO,
  StatsPokemon,
  OptionsRank,
  IStatsPokemonGO,
} from '../core/models/stats.model';
import { IPokemonDetail, Stats } from '../core/models/API/info.model';
import {
  CLASS_LEGENDARY,
  CLASS_MYTHIC,
  CLASS_ULTRA_BEAST,
  FORM_ALOLA,
  FORM_GALAR,
  FORM_GMAX,
  FORM_HISUI,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PRIMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
  MAX_IV,
  MIN_IV,
  Params,
  PURIFIED_ATK_BONUS,
  PURIFIED_DEF_BONUS,
  SHADOW_ATK_BONUS,
  SHADOW_DEF_BONUS,
} from './constants';
import { IPokemonFormModify, PokemonFormModifyModel, PokemonSprit, IPokemonFormDetail } from '../core/models/API/form.model';
import { PokemonSearching } from '../core/models/pokemon-searching.model';
import APIService from '../services/API.service';
import { ThemeModify } from './models/overrides/themes.model';
import { TableStyles } from 'react-data-table-component';
import {
  DynamicObj,
  getValueOrDefault,
  isEqual,
  isInclude,
  isIncludeList,
  isNotEmpty,
  isNumber,
  isNullOrUndefined,
  isUndefined,
  toNumber,
} from './extension';
import { EqualMode, IncludeMode } from './enums/string.enum';
import { MoveType, PokemonClass, PokemonType, TypeAction, TypeMove } from '../enums/type.enum';
import { Options } from '../core/models/options.model';
import { ISelectMoveModel, SelectMoveModel } from '../components/Input/models/select-move.model';
import { TypeEffChart } from '../core/models/type-eff.model';
import { EffectiveType } from '../components/Effective/enums/type-effective.enum';
import { ItemTicketRewardType, TicketRewardType } from '../core/enums/information.enum';
import { ItemLureRequireType, ItemLureType } from '../core/enums/option.enum';
import { ItemName } from '../pages/News/enums/item-type.enum';
import { APIUrl } from '../services/constants';
import { BonusType } from '../core/enums/bonus-type.enum';

class Mask {
  value: number;
  label: string;

  constructor(value: number, label: string) {
    this.value = value;
    this.label = label;
  }
}

export const marks = [...Array(MAX_IV + 1).keys()].map((n) => new Mask(n, n.toString()));

export const isInvalidIV = (value: number | null | undefined) => isNullOrUndefined(value) || value < MIN_IV || value > MAX_IV;

export const PokeGoSlider = styled(Slider)(() => ({
  color: '#ef911d',
  height: 18,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    height: 18,
    width: 18,
    backgroundColor: '#ef911d',
    '&:hover, &.Mui-focusVisible, &.Mui-active': {
      boxShadow: 'none',
    },
    '&:before': {
      boxShadow: 'none',
    },
    '& .airbnb-bar': {
      height: 12,
      width: 1,
      backgroundColor: 'currentColor',
      marginLeft: 1,
      marginRight: 1,
    },
  },
  '& .MuiSlider-track': {
    height: 18,
    border: 'none',
    borderTopRightRadius: '1px',
    borderBottomRightRadius: '1px',
  },
  '& .MuiSlider-rail': {
    color: 'lightgray',
    opacity: 0.5,
    height: 18,
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#ef911d',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
  '& .MuiSlider-mark': {
    backgroundColor: '#bfbfbf',
    height: 13,
    width: 1,
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: '#fff',
      height: 13,
    },
  },
}));

export const LevelRating = styled(Rating)({
  '& .MuiRating-iconFilled': {
    color: '#ff3d47',
  },
  '& .MuiRating-iconHover': {
    color: '#ff3d47',
  },
});

export const LevelSlider = styled(Slider)(() => ({
  '& .MuiSlider-mark': {
    backgroundColor: 'currentColor',
    height: 13,
    width: 2,
    '&.MuiSlider-markActive': {
      opacity: 1,
      backgroundColor: 'red',
      height: 13,
    },
  },
}));

export const TypeRadioGroup = styled(RadioGroup)(() => ({
  '&.MuiFormGroup-root, &.MuiFormGroup-row': {
    display: 'block',
  },
}));

export const HundoRate = styled(Rating)(() => ({
  '& .MuiRating-icon': {
    color: 'red',
  },
}));

export const capitalize = (str: string | undefined | null, defaultText = '') =>
  getValueOrDefault(String, str?.charAt(0).toUpperCase()) + getValueOrDefault(String, str?.slice(1).toLowerCase(), defaultText);

export const splitAndCapitalize = (str: string | undefined | null, splitBy: string | RegExp, joinBy: string, defaultText = '') =>
  getValueOrDefault(
    String,
    str
      ?.split(splitBy)
      .map((text) => capitalize(text))
      .join(joinBy),
    defaultText
  );

export const reversedCapitalize = (str: string | undefined | null, splitBy: string, joinBy: string, defaultText = '') =>
  getValueOrDefault(String, str?.replaceAll(joinBy, splitBy).toLowerCase(), defaultText);

export const getTime = (value: string | number | undefined, notFull = false) => {
  if (isNullOrUndefined(value)) {
    return value;
  }
  const date = Moment(new Date(isNumber(value) ? toNumber(value) : value));
  return notFull ? date.format('D MMMM YYYY') : date.format('HH:mm D MMMM YYYY');
};

export const convertModelSpritName = (text: string | undefined) =>
  getValueOrDefault(String, text)
    .toLowerCase()
    .replaceAll('_', '-')
    .replaceAll('%', '')
    .replace('mime-jr', 'mime_jr')
    .replace(
      '-female',
      `${
        isInclude(text, 'meowstic', IncludeMode.IncludeIgnoreCaseSensitive) ||
        isInclude(text, 'indeedee', IncludeMode.IncludeIgnoreCaseSensitive)
          ? '-'
          : '_'
      }f`
    )
    .replace(
      '-male',
      (isInclude(text, 'meowstic', IncludeMode.IncludeIgnoreCaseSensitive)
        ? '-'
        : isInclude(text, 'indeedee', IncludeMode.IncludeIgnoreCaseSensitive)
        ? ''
        : '_') + isInclude(text, 'indeedee', IncludeMode.IncludeIgnoreCaseSensitive)
        ? ''
        : 'm'
    )
    .replace('-altered', '')
    .replace('-land', '')
    .replace(`-${FORM_STANDARD.toLowerCase()}`, '')
    .replace('-ordinary', '')
    .replace('-aria', '')
    .replace('-average', '')
    .replace('-baile', '')
    .replace('-midday', '')
    .replace('-solo', '')
    .replace('-disguised', '')
    .replace('-red', '')
    .replace('-natural', '')
    .replace('-amped', '')
    .replace('eiscue-ice', 'eiscue')
    .replace('-hangry', '-hangry-mode')
    .replace('-white-striped', '')
    .replace('-single-strike', '')
    .replace(`-${FORM_SHADOW.toLowerCase()}`, '')
    .replace('-armor', '')
    .replace(`-${FORM_NORMAL.toLowerCase()}`, '');

export const convertNameRankingToForm = (text: string) => {
  let form = '';
  if (isInclude(text, '_')) {
    form = ` (${capitalize(text.split('_').at(1))})`;
  }
  return text + form;
};

export const convertNameRankingToOri = (text: string | undefined, form: string) => {
  if (!text) {
    return '';
  }
  const formOri = form;
  if (text === 'lanturnw') {
    text = 'lanturn';
  } else if (text === 'unown') {
    text = 'unown-a';
  } else if (text === 'clodsiresb') {
    text = 'clodsire';
  }
  if (isInclude(text, 'pyroar') || isInclude(text, 'frillish') || isInclude(text, 'jellicent') || isInclude(text, 'urshifu')) {
    return text.split('_').at(0);
  }
  if (
    isInclude(text, `_${FORM_MEGA}`.toLowerCase()) ||
    text === 'ho_oh' ||
    isInclude(text, 'castform') ||
    isInclude(text, 'tapu') ||
    isInclude(text, 'basculin_blue')
  ) {
    return text.replaceAll('_', '-');
  }
  if (isInclude(formOri, '(') && isInclude(formOri, ')')) {
    form = `-${form.split(' (').at(1)?.replace(')', '').toLowerCase()}`;
  }
  text = text
    .toLowerCase()
    .replaceAll('_', '-')
    .replace(`-${FORM_SHADOW.toLowerCase()}`, '')
    .replace('alolan', FORM_ALOLA.toLowerCase())
    .replace('-xs', '')
    .replace('-male', '')
    .replace(/^meowstic$/, 'meowstic-male')
    .replace(/^nidoran$/, 'nidoran-male')
    .replace(/^deoxys$/, 'deoxys-normal')
    .replace('-sea', '')
    .replace('-reine', '')
    .replace('-red-striped', '')
    .replace('-full-belly', '')
    .replace('-sword', '')
    .replace('-shield', '')
    .replace('-rider', '')
    .replace('-5th-anniversary', '')
    .replace('-10', '-ten-percent')
    .replace('-shaymin', '');
  if (isInclude(text, FORM_STANDARD, IncludeMode.IncludeIgnoreCaseSensitive)) {
    form = `-${FORM_STANDARD.toLowerCase()}`;
  }
  const invalidForm: string[] = [
    '-therian',
    '-o',
    '-origin',
    '-defense',
    '-sunshine',
    '-jr',
    '-mime',
    '-rime',
    '-null',
    '-low',
    '-small',
    '-large',
    '-average',
    '-super',
    '-female',
    '-male',
    '-attack',
    '-speed',
    '-dusk',
    '-dawn',
    `-${`${FORM_GALAR}IAN`.toLowerCase()}`,
    `-${`${FORM_HISUI}AN`.toLowerCase()}`,
  ];
  return isInclude(formOri, '(') && isInclude(formOri, ')') && !isIncludeList(invalidForm, form)
    ? text.replaceAll(form.toLowerCase(), '')
    : text;
};

interface CSSRuleSelector extends CSSRule {
  selectorText?: string;
  style?: DynamicObj<string>;
}

export const getStyleSheet = (selector: string) => {
  const sheets = document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    const sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule = sheet.cssRules[j] as CSSRuleSelector;
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
        return sheet;
      }
    }
  }
  return;
};

export const getStyleRuleValue = (style: string, selector: string, sheet?: CSSStyleSheet) => {
  const sheets = !isUndefined(sheet) ? [sheet] : document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule = sheet.cssRules[j] as CSSRuleSelector;
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1 && rule.style) {
        return rule.style[style];
      }
    }
  }
  return;
};

export const findMoveTeam = (move: string, moveSet: string[], isSelectFirst = false) => {
  const mSet: string[] = [];
  if (!move) {
    return mSet;
  }
  const result = move.match(/[A-Z]?[a-z]+|([A-Z])/g);
  for (let value of moveSet) {
    value = replaceTempMovePvpName(value);
    const m = value.split('_');
    if (result && isNotEmpty(m) && m.length === result.length) {
      let count = 0;
      for (let i = 0; i < result.length; i++) {
        if (isInclude(capitalize(m[i]), result[i])) {
          count++;
        }
      }
      if (count === m.length) {
        mSet.push(value);
        if (isSelectFirst) {
          return mSet;
        }
      }
    }
  }
  if (!isNotEmpty(mSet)) {
    for (const value of moveSet) {
      if (
        move
          .toLowerCase()
          .split('')
          .every((m) => isInclude(value.toLowerCase(), m))
      ) {
        const m = value.split('_');
        if (result && isNotEmpty(m) && m.length === result.length) {
          let count = 0;
          for (let i = 0; i < result.length; i++) {
            if (isEqual(m[i][0], result[i][0])) {
              count++;
            }
          }
          if (count === m.length) {
            mSet.push(value);
            if (isSelectFirst) {
              return mSet;
            }
          }
        }
      }
    }
  }

  return mSet;
};

export const checkPokemonGO = (id: number, name: string | undefined, details: IPokemonData[]) =>
  details.find((pokemon) => pokemon.num === id && isEqual(pokemon.fullName, name));

export const convertFormGif = (name: string | undefined) => {
  if (name === 'nidoran') {
    name = 'nidoran_m';
  } else if (name === 'zygarde') {
    name = 'zygarde-10';
  }

  return name
    ?.replace('mr', 'mr.')
    .replace('-hisui', '')
    .replace('-plant', '')
    .replace('-overcast', '')
    .replace('-east', '')
    .replace('-west', '')
    .replace('-spring', '')
    .replace('-incarnate', '')
    .replace('-neutral', '')
    .replace('-confined', '')
    .replace('-red-striped', '')
    .replace('slowking-galar', 'slowking')
    .replace('articuno-galar', 'articuno')
    .replace('zapdos-galar', 'zapdos')
    .replace('moltres-galar', 'moltres')
    .replace('complete-ten-percent', '10')
    .replace('-complete-fifty-percent', '')
    .replace('ten-percent', '10')
    .replace('-fifty-percent', '')
    .replaceAll('-phony', '')
    .replaceAll('-antique', '')
    .replace('-hero', '');
};

export const checkRankAllAvailable = (pokemonStats: IStatsRank | null, stats: IStatsPokemonGO) => {
  const data = new StatsRankPokemonGO();
  const checkRankAtk = pokemonStats?.attack.ranking.find((item) => item.attack === stats.atk);
  const checkRankDef = pokemonStats?.defense.ranking.find((item) => item.defense === stats.def);
  const checkRankSta = pokemonStats?.stamina.ranking.find((item) => item.stamina === stats.sta);
  const checkRankProd = pokemonStats?.statProd.ranking.find((item) => item.product === stats.prod);
  if (checkRankAtk) {
    data.attackRank = checkRankAtk.rank;
  }
  if (checkRankDef) {
    data.defenseRank = checkRankDef.rank;
  }
  if (checkRankSta) {
    data.staminaRank = checkRankSta.rank;
  }
  if (checkRankProd) {
    data.statProdRank = checkRankProd.rank;
  }

  return data;
};

export const calRank = (pokemonStats: DynamicObj<OptionsRank>, type: string, rank: number) =>
  ((pokemonStats[type].maxRank - rank + 1) * 100) / pokemonStats[type].maxRank;

export const mappingPokemonName = (pokemonData: IPokemonData[]) =>
  pokemonData
    .filter(
      (pokemon) =>
        pokemon.num > 0 &&
        (pokemon.forme === FORM_NORMAL ||
          (pokemon.num === 744 && pokemon.forme === 'DUSK') ||
          (pokemon.baseForme && isEqual(pokemon.baseForme, pokemon.forme)))
    )
    .map((pokemon) => new PokemonSearching(pokemon))
    .sort((a, b) => a.id - b.id);

export const getPokemonById = (pokemonData: IPokemonData[], id: number) => {
  const result = pokemonData
    .filter((pokemon) => pokemon.num === id)
    .find(
      (pokemon) =>
        isEqual(pokemon.forme, FORM_NORMAL, EqualMode.IgnoreCaseSensitive) ||
        (pokemon.baseForme && isEqual(pokemon.baseForme, pokemon.forme, EqualMode.IgnoreCaseSensitive))
    );
  if (!result) {
    return;
  }
  return new PokemonModel(result.num, result.name);
};

export const getCustomThemeDataTable = (theme: ThemeModify): TableStyles => ({
  rows: {
    style: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.tablePrimary,
      '&:not(:last-of-type)': {
        borderBottomColor: theme.palette.background.tableDivided,
      },
    },
    stripedStyle: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.tableStrip,
    },
    highlightOnHoverStyle: {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.background.tableHover,
      borderBottomColor: theme.palette.background.tableDivided,
      outlineColor: theme.palette.background.tablePrimary,
    },
  },
  headCells: {
    style: {
      backgroundColor: theme.palette.background.tablePrimary,
      color: theme.palette.text.primary,
    },
  },
  cells: {
    style: {
      color: theme.palette.text.primary,
    },
  },
});

export const getDataWithKey = <T>(data: object, findKey: string | number | undefined | null, mode = EqualMode.CaseSensitive) => {
  const result = Object.entries(data).find(([key]) => isEqual(key, findKey, mode));
  return result && isNotEmpty(result) ? (result[1] as T) : undefined;
};

export const getKeyWithData = <T>(data: object, findValue: T) => {
  const result = Object.entries(data).find(([, value]: [string, T]) => value === findValue);
  return result && isNotEmpty(result) ? result[0] : undefined;
};

export const getKeysObj = (data: object) =>
  Object.values(data)
    .map((v) => getValueOrDefault<string>(String, v.toString()))
    .filter((_, i) => i < Object.values(data).length / 2);

export const getValuesObj = <T extends object>(data: T) =>
  Object.keys(data)
    .map((v) => v as unknown as T)
    .filter((_, i) => i < Object.keys(data).length / 2);

export const checkMoveSetAvailable = (pokemon: IPokemonData | undefined) => {
  if (!pokemon) {
    return false;
  }

  const fastMoves = getAllMoves(pokemon, TypeMove.Fast);
  const chargeMoves = getAllMoves(pokemon, TypeMove.Charge);
  const allMoves = fastMoves.concat(chargeMoves);
  return (
    allMoves.length > 2 ||
    (!isEqual(fastMoves[0], 'STRUGGLE') && !isInclude(fastMoves[0], 'SPLASH')) ||
    !isEqual(chargeMoves[0], 'STRUGGLE')
  );
};

export const checkPokemonIncludeShadowForm = (pokemon: IPokemonData[], form: string) =>
  pokemon.some((p) => p.hasShadowForm && isEqual(convertPokemonAPIDataName(form), getValueOrDefault(String, p.fullName, p.name)));

const convertNameEffort = (name: string) => {
  switch (name) {
    case 'attack':
      return 'atk';
    case 'defense':
      return 'def';
    case 'special-attack':
      return 'spa';
    case 'special-defense':
      return 'spd';
    case 'speed':
      return 'spe';
    default:
      return name;
  }
};

export const convertStatsEffort = (stats: Stats[] | undefined) => {
  const result = new StatsPokemon() as unknown as DynamicObj<number>;

  stats?.forEach((stat) => {
    result[convertNameEffort(stat.stat.name)] = stat.base_stat;
  });

  return result as unknown as IStatsPokemon;
};

export const replacePokemonGoForm = (form: string) => form.replace(/_MALE$/, '').replace(/_FEMALE$/, '');

export const formIconAssets = (value: IPokemonFormModify) =>
  isInclude(value.form.name, `-${FORM_SHADOW}`, IncludeMode.IncludeIgnoreCaseSensitive) ||
  isInclude(value.form.name, `-${FORM_PURIFIED}`, IncludeMode.IncludeIgnoreCaseSensitive)
    ? APIService.getPokeIconSprite(value.name)
    : APIService.getPokeIconSprite(value.form.name);

export const convertPokemonAPIDataFormName = (form: string | undefined | null, name: string | undefined | null) => {
  if (isEqual(name, 'ZACIAN-CROWNED', EqualMode.IgnoreCaseSensitive)) {
    form += '-SWORD';
  } else if (isEqual(name, 'ZAMAZENTA-CROWNED', EqualMode.IgnoreCaseSensitive)) {
    form += '-SHIELD';
  }
  return form?.toLowerCase();
};

// Convert Pokémon from Storage data to GO name
export const convertPokemonDataName = (text: string | undefined | null, defaultName = '') => {
  if (!text) {
    return defaultName;
  }
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll('.', '')
    .replaceAll(':', '')
    .replaceAll('É', 'E')
    .replaceAll('’', '')
    .replaceAll("'", '')
    .replaceAll('%', '')
    .replace(/_F$/, '_FEMALE')
    .replace(/_M$/, '_MALE')
    .replace(/^F$/, 'FEMALE')
    .replace(/^M$/, 'MALE')
    .replace(/GALAR/, `${FORM_GALAR}IAN`)
    .replace(/HISUI/, `${FORM_HISUI}AN`)
    .replace(/GALARIAN_STANDARD/, `${FORM_GALAR}IAN`)
    .replace(/_SUNSHINE$/, '_SUNNY')
    .replace(/_TOTEM$/, '')
    .replace(/_CAP$/, '')
    .replace(/_PALDEA$/, '')
    .replace(/_EAST$/, '')
    .replace(/10$/, 'TEN_PERCENT')
    .replace(/50$/, 'FIFTY_PERCENT')
    .replace('ZACIAN_CROWNED', 'ZACIAN_CROWNED_SWORD')
    .replace('ZAMAZENTA_CROWNED', 'ZAMAZENTA_CROWNED_SHIELD')
    .replace(/_ICE$/, '_ICE_RIDER')
    .replace(/_SHADOW$/, '_SHADOW_RIDER')
    .replace(/_ORIGINAL$/, '_ORIGINAL_COLOR')
    .replace(/_WEST$/, '_WEST_SEA')
    .replace(/_EAST$/, '_EAST_SEA')
    .replace(/^WEST$/, 'WEST_SEA')
    .replace(/^EAST$/, 'EAST_SEA')
    .replace(/_ACTIVE$/, '')
    .replace(/_NEUTRAL$/, '')
    .replace(/_A$/, '');
};

// Convert Pokémon from API data to GO name
export const convertPokemonAPIDataName = (text: string | undefined | null, defaultName = '') => {
  if (!text) {
    return defaultName;
  }
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replace(/_PURIFIED$/, '')
    .replace(/_SHADOW$/, '')
    .replace(/^PURIFIED$/, '')
    .replace(/^SHADOW$/, '')
    .replace(/_MALE$/, '')
    .replace(/GALAR$/, `${FORM_GALAR}IAN`)
    .replace(/HISUI$/, `${FORM_HISUI}AN`)
    .replace(/GALAR_/, `${`${FORM_GALAR}IAN`}_`)
    .replace(/GALARIAN_STANDARD/, `${FORM_GALAR}IAN`)
    .replace(/_TOTEM$/, '')
    .replace(/_PALDEA_COMBAT_BREED$/, '')
    .replace(/_PALDEA_BLAZE_BREED$/, '')
    .replace(/_PALDEA_AQUA_BREED$/, '')
    .replace(/_NORMAL$/, '')
    .replace(/10$/, 'TEN_PERCENT')
    .replace(/50$/, 'FIFTY_PERCENT')
    .replace(/_BATTLE_BOND$/, '')
    .replace(/_POWER_CONSTRUCT$/, '')
    .replace(/_POM_POM$/, 'POMPOM')
    .replace(/_OWN_TEMPO$/, '')
    .replace(/_WINGS$/, '')
    .replace(/_MANE$/, 'MANE')
    .replace(/_ORIGINAL$/, '_ORIGINAL_COLOR')
    .replace('ZACIAN_CROWNED', 'ZACIAN_CROWNED_SWORD')
    .replace('ZAMAZENTA_CROWNED', 'ZAMAZENTA_CROWNED_SHIELD')
    .replace(/_ICE$/, '_ICE_RIDER')
    .replace(/_SHADOW$/, '_SHADOW_RIDER')
    .replace('BASCULEGION_MALE', 'BASCULEGION')
    .replace(/_PLUMAGE$/, '')
    .replace(/_ROAMING$/, '')
    .replace(/_SEGMENT$/, '')
    .replace(/_M$/, '_MALE')
    .replace(/_F$/, '_FEMALE');
};

export const convertPokemonImageName = (text: string | undefined | null, defaultName = '') => {
  if (!text) {
    return defaultName;
  }
  return splitAndCapitalize(text.toLowerCase().replaceAll('_', '-'), '-', '-')
    .replace(/^Shadow$/, '')
    .replace(/^Purified$/, '')
    .replace(/^Normal$/, '')
    .replace(/-Shadow$/, '')
    .replace(/-Purified$/, '')
    .replace(/-Mane$/, '')
    .replace(/-Wings$/, '')
    .replace(/Crowned-Sword$/, 'Crowned')
    .replace(/Crowned-Shield$/, 'Crowned')
    .replace(/^Hero$/, '')
    .replace(/^Armor$/, '');
};

export const generatePokemonGoForms = (
  pokemonData: IPokemonData[],
  dataFormList: IPokemonFormDetail[][],
  formListResult: IPokemonFormModify[][],
  id: number,
  name: string,
  index = 0
) => {
  const formList: string[] = [];
  dataFormList.forEach((form) => form.forEach((p) => formList.push(convertPokemonAPIDataName(p.formName || FORM_NORMAL))));
  pokemonData
    .filter((pokemon) => pokemon.num === id)
    .forEach((pokemon) => {
      const isIncludeFormGO = formList.some((form) => isInclude(pokemon.forme, form));
      if (!isIncludeFormGO) {
        index--;
        const pokemonGOModify = new PokemonFormModifyModel(
          id,
          name,
          pokemon.pokemonId?.replaceAll('_', '-')?.toLowerCase(),
          pokemon.forme?.replaceAll('_', '-')?.toLowerCase(),
          pokemon.fullName?.replaceAll('_', '-')?.toLowerCase(),
          'Pokémon-GO',
          pokemon.types,
          new PokemonSprit(),
          index,
          PokemonType.Normal,
          false
        );
        formListResult.push([pokemonGOModify]);
      }
    });

  return index;
};

export const generatePokemonGoShadowForms = (
  dataPokeList: IPokemonDetail[],
  formListResult: IPokemonFormModify[][],
  id: number,
  name: string,
  index = 0
) => {
  dataPokeList
    .filter((p) => p.isIncludeShadow)
    .forEach((p) => {
      let form = '';
      if (!p.isDefault) {
        form = `${p.name.replace(`${name}-`, '')}-`;
      }
      index--;
      const pokemonShadowModify = new PokemonFormModifyModel(
        id,
        name,
        p.name,
        `${form}${FORM_SHADOW.toLowerCase()}`,
        `${p.name}-${FORM_SHADOW.toLowerCase()}`,
        'Pokémon-GO',
        p.types.map((item) => item.type.name),
        new PokemonSprit(),
        index,
        PokemonType.Shadow
      );
      index--;
      const pokemonPurifiedModify = new PokemonFormModifyModel(
        id,
        name,
        p.name,
        `${form}${FORM_PURIFIED.toLowerCase()}`,
        `${p.name}-${FORM_PURIFIED.toLowerCase()}`,
        'Pokémon-GO',
        p.types.map((item) => item.type.name),
        new PokemonSprit(),
        index,
        PokemonType.Purified
      );
      formListResult.push([pokemonShadowModify, pokemonPurifiedModify]);
    });

  return index;
};

export const getFormFromForms = (
  stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[] | undefined,
  id: number | undefined,
  formName: string | null | undefined
) => {
  const forms = stats?.filter((i) => i.id === id);
  formName = convertPokemonAPIDataName(formName);
  let filterForm = forms?.find((item) => isEqual(item.form, formName || FORM_NORMAL));
  if (!filterForm && isNotEmpty(forms)) {
    filterForm = forms?.find((item) => item.form === FORM_NORMAL);
    if (!filterForm) {
      filterForm = forms?.at(0);
    }
  }
  return filterForm;
};

export const retrieveMoves = (pokemon: IPokemonData[], id: number | undefined, form: string | null | undefined) => {
  if (isNotEmpty(pokemon)) {
    const resultFirst = pokemon.filter((item) => item.num === id);
    form = getValueOrDefault(
      String,
      form
        ?.toLowerCase()
        .replaceAll('-', '_')
        .replaceAll(`_${FORM_STANDARD.toLowerCase()}`, '')
        .toUpperCase()
        .replace(FORM_GMAX, FORM_NORMAL),
      FORM_NORMAL
    );
    const result = resultFirst.find((item) => isEqual(item.fullName, form) || isEqual(item.forme, form));
    return result ?? resultFirst[0];
  }
};

export const getPokemonDetails = (pokemonData: IPokemonData[], id: number, form: string | null | undefined, isDefault = false) => {
  let pokemonForm: IPokemonData | undefined = new PokemonData();

  if (form) {
    const name = convertPokemonAPIDataName(form.replaceAll(' ', '-'));
    pokemonForm = pokemonData.find((item) => item.num === id && isEqual(item.fullName, name));

    if (isDefault && !pokemonForm) {
      pokemonForm = pokemonData.find(
        (item) => item.num === id && (item.forme === FORM_NORMAL || (item.baseForme && isEqual(item.baseForme, item.forme)))
      );
    }
  }
  return pokemonForm;
};

export const replaceTempMoveName = (name: string | number) => {
  name = name.toString();
  const fastMove = getValueOrDefault(String, getKeyWithData(TypeMove, TypeMove.Fast)?.toUpperCase());
  if (name.endsWith(`_${fastMove}`) || isInclude(name, `_${fastMove}_`)) {
    name = name.replace(`_${fastMove}`, '');
  } else if (name.endsWith('_PLUS')) {
    name = name.replaceAll('_PLUS', '+');
  }
  return name.replace(/^V\d{4}_MOVE_/, '');
};

export const replaceTempMovePvpName = (name: string) => {
  if (isInclude(name, '_BLASTOISE')) {
    name = name.replace('_BLASTOISE', '');
  } else if (name === 'TECHNO_BLAST_WATER') {
    name = name = 'TECHNO_BLAST_DOUSE';
  } else if (name === 'FUTURE_SIGHT') {
    name = name = 'FUTURESIGHT';
  } else if (name === 'ROLLOUT') {
    name = 'ROLL_OUT';
  }
  return name;
};

export const reverseReplaceTempMovePvpName = (name: string | undefined) => {
  if (name === 'ROLL_OUT') {
    name = 'ROLLOUT';
  }
  return name;
};

export const getAllMoves = (pokemon: IPokemonData | undefined | null, moveType = TypeMove.All) => {
  const fastMove = getValueOrDefault(Array, pokemon?.quickMoves).concat(getValueOrDefault(Array, pokemon?.eliteQuickMoves));
  const chargeMoves = getValueOrDefault(Array, pokemon?.cinematicMoves).concat(
    getValueOrDefault(Array, pokemon?.eliteCinematicMoves),
    getValueOrDefault(Array, pokemon?.shadowMoves),
    getValueOrDefault(Array, pokemon?.purifiedMoves),
    getValueOrDefault(Array, pokemon?.specialMoves),
    getValueOrDefault(Array, pokemon?.exclusiveMoves),
    getValueOrDefault(Array, pokemon?.dynamaxMoves)
  );
  switch (moveType) {
    case TypeMove.Fast:
      return fastMove;
    case TypeMove.Charge:
      return chargeMoves;
    case TypeMove.All:
    default:
      return fastMove.concat(chargeMoves);
  }
};

export const moveTypeToFormType = (moveType?: MoveType) => {
  switch (moveType) {
    case MoveType.Shadow:
      return PokemonType.Shadow;
    case MoveType.Purified:
      return PokemonType.Purified;
    default:
      return PokemonType.Normal;
  }
};

export const getDmgMultiplyBonus = (form = PokemonType.Normal, options?: Options, type?: TypeAction) => {
  switch (type) {
    case TypeAction.Atk: {
      return form === PokemonType.Shadow ? SHADOW_ATK_BONUS(options) : form === PokemonType.Purified ? PURIFIED_ATK_BONUS(options) : 1;
    }
    case TypeAction.Def: {
      return form === PokemonType.Shadow ? SHADOW_DEF_BONUS(options) : form === PokemonType.Purified ? PURIFIED_DEF_BONUS(options) : 1;
    }
    case TypeAction.Prod: {
      return form === PokemonType.Shadow
        ? SHADOW_ATK_BONUS(options) * SHADOW_DEF_BONUS(options)
        : form === PokemonType.Purified
        ? PURIFIED_ATK_BONUS(options) * PURIFIED_DEF_BONUS(options)
        : 1;
    }
    default:
      return 1;
  }
};

export const addSelectMovesByType = (pokemonData: IPokemonData, moveType: TypeMove, selectMoves: ISelectMoveModel[] = []) => {
  if (moveType === TypeMove.Fast || moveType === TypeMove.All) {
    pokemonData.quickMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.None)));
    pokemonData.eliteQuickMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Elite)));
  }
  if (moveType === TypeMove.Charge || moveType === TypeMove.All) {
    pokemonData.cinematicMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.None)));
    pokemonData.eliteCinematicMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Elite)));
    pokemonData.shadowMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Shadow)));
    pokemonData.purifiedMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Purified)));
    pokemonData.specialMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Special)));
    pokemonData.exclusiveMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Exclusive)));
    pokemonData.dynamaxMoves?.forEach((value) => selectMoves.push(new SelectMoveModel(value, MoveType.Dynamax)));
  }
  return selectMoves;
};

export const getMoveType = (pokemonData?: IPokemonData, moveName?: string) => {
  if (isIncludeList(pokemonData?.eliteQuickMoves, moveName) || isIncludeList(pokemonData?.eliteCinematicMoves, moveName)) {
    return MoveType.Elite;
  } else if (isIncludeList(pokemonData?.shadowMoves, moveName)) {
    return MoveType.Shadow;
  } else if (isIncludeList(pokemonData?.purifiedMoves, moveName)) {
    return MoveType.Purified;
  } else if (isIncludeList(pokemonData?.specialMoves, moveName)) {
    return MoveType.Special;
  } else if (isIncludeList(pokemonData?.exclusiveMoves, moveName)) {
    return MoveType.Exclusive;
  } else if (isIncludeList(pokemonData?.dynamaxMoves, moveName)) {
    return MoveType.Dynamax;
  } else if (!isIncludeList(getAllMoves(pokemonData), moveName)) {
    return MoveType.Unavailable;
  }
  return MoveType.None;
};

export const getPokemonType = (formName?: string | number | null, isMega = false, isShadow = true) => {
  if (isInclude(formName, FORM_NORMAL, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonType.Normal;
  } else if (isInclude(formName, FORM_SHADOW, IncludeMode.IncludeIgnoreCaseSensitive) && isShadow) {
    return PokemonType.Shadow;
  } else if (isInclude(formName, FORM_PURIFIED, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonType.Purified;
  } else if (isInclude(formName, FORM_MEGA, IncludeMode.IncludeIgnoreCaseSensitive) || isMega) {
    return PokemonType.Mega;
  } else if (isInclude(formName, FORM_PRIMAL, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonType.Primal;
  } else if (isInclude(formName, FORM_GMAX, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonType.GMax;
  }
  return PokemonType.None;
};

export const getPokemonClass = (className?: string | number | null) => {
  if (isInclude(className, CLASS_LEGENDARY, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonClass.Legendary;
  } else if (isInclude(className, CLASS_MYTHIC, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonClass.Mythic;
  } else if (isInclude(className, CLASS_ULTRA_BEAST, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return PokemonClass.UltraBeast;
  }
  return PokemonClass.None;
};

export const getArrayBySeq = (length: number, startNumber = 0) => Array.from({ length }, (_, i) => i + startNumber);

export const generateParamForm = (form: string | null | undefined, pokemonType = PokemonType.None, prefix = '?') => {
  const isSpecialForm = pokemonType === PokemonType.Shadow || pokemonType === PokemonType.Purified;
  const formType = getDataWithKey<string>(PokemonType, pokemonType)?.toLowerCase();
  if (form) {
    if (isEqual(form, FORM_SHADOW, EqualMode.IgnoreCaseSensitive) || isEqual(form, FORM_PURIFIED, EqualMode.IgnoreCaseSensitive)) {
      return `${prefix}${Params.FormType}=${formType}`;
    } else {
      if (!isEqual(form, FORM_NORMAL, EqualMode.IgnoreCaseSensitive)) {
        return `${prefix}${Params.Form}=${form.toLowerCase().replaceAll('_', '-')}${
          isSpecialForm ? `&${Params.FormType}=${formType}` : ''
        }`;
      } else if (isSpecialForm) {
        return `${prefix}${Params.FormType}=${formType}`;
      }
    }
  } else if (isSpecialForm) {
    return `${prefix}${Params.FormType}=${formType}`;
  }
  return '';
};

export const getMultiplyTypeEffect = (data: TypeEffChart, valueEffective: number, key: string) => {
  if (valueEffective >= EffectiveType.VeryWeakness && !isIncludeList(data.veryWeak, key)) {
    data.veryWeak?.push(key);
  } else if (valueEffective >= EffectiveType.Weakness && !isIncludeList(data.weak, key)) {
    data.weak?.push(key);
  } else if (valueEffective >= EffectiveType.Neutral && !isIncludeList(data.neutral, key)) {
    data.neutral?.push(key);
  } else if (valueEffective >= EffectiveType.Resistance && !isIncludeList(data.resist, key)) {
    data.resist?.push(key);
  } else if (valueEffective >= EffectiveType.VeryResistance && !isIncludeList(data.veryResist, key)) {
    data.veryResist?.push(key);
  } else if (valueEffective >= EffectiveType.SuperResistance && !isIncludeList(data.superResist, key)) {
    data.superResist?.push(key);
  }
};

export const getTicketRewardType = (type?: string | number | null) => {
  if (isInclude(type, ItemTicketRewardType.Avatar, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.Avatar;
  } else if (isInclude(type, ItemTicketRewardType.Exp, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.Exp;
  } else if (isInclude(type, ItemTicketRewardType.Item, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.Item;
  } else if (isInclude(type, ItemTicketRewardType.PokeCoin, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.PokeCoin;
  } else if (isInclude(type, ItemTicketRewardType.Pokemon, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.Pokemon;
  } else if (isInclude(type, ItemTicketRewardType.Stardust, IncludeMode.IncludeIgnoreCaseSensitive)) {
    return TicketRewardType.Stardust;
  }
  return TicketRewardType.None;
};

export const getLureItemType = (lureItem: string | undefined | null) => {
  switch (lureItem) {
    case ItemLureType.Magnetic:
      return ItemLureRequireType.Magnetic;
    case ItemLureType.Mossy:
      return ItemLureRequireType.Mossy;
    case ItemLureType.Glacial:
      return ItemLureRequireType.Glacial;
    case ItemLureType.Rainy:
      return ItemLureRequireType.Rainy;
    case ItemLureType.Sparkly:
      return ItemLureRequireType.Sparkly;
  }
};

export const getItemSpritePath = (itemName: string | null | undefined) => {
  if (isEqual(itemName, ItemName.RaidTicket)) {
    return APIService.getItemSprite('Item_1401');
  } else if (isEqual(itemName, ItemName.RareCandy)) {
    return APIService.getItemSprite('Item_1301');
  } else if (isEqual(itemName, ItemName.XlRareCandy)) {
    return APIService.getItemSprite('RareXLCandy_PSD');
  } else if (isEqual(itemName, ItemName.PokeBall)) {
    return APIService.getItemSprite('pokeball_sprite');
  } else if (isEqual(itemName, ItemName.GreatBall)) {
    return APIService.getItemSprite('greatball_sprite');
  } else if (isEqual(itemName, ItemName.UltraBall)) {
    return APIService.getItemSprite('ultraball_sprite');
  } else if (isEqual(itemName, ItemName.MasterBall)) {
    return APIService.getItemSprite('masterball_sprite');
  } else if (isEqual(itemName, ItemName.RazzBerry)) {
    return APIService.getItemSprite('Item_0701');
  } else if (isEqual(itemName, ItemName.NanabBerry)) {
    return APIService.getItemSprite('Item_0703');
  } else if (isEqual(itemName, ItemName.PinapBerry)) {
    return APIService.getItemSprite('Item_0705');
  } else if (isEqual(itemName, ItemName.GoldenPinapBerry)) {
    return APIService.getItemSprite('Item_0707');
  } else if (isEqual(itemName, ItemName.LuckyEgg)) {
    return APIService.getItemSprite('luckyegg');
  } else if (isInclude(itemName, ItemName.Troy)) {
    const itemLure = getLureItemType(itemName);
    return APIService.getItemTroy(itemLure);
  } else if (isInclude(itemName, ItemName.PaidRaidTicket)) {
    return APIService.getItemSprite('Item_1402');
  } else if (isInclude(itemName, ItemName.StarPice)) {
    return APIService.getItemSprite('starpiece');
  } else if (isInclude(itemName, ItemName.Poffin)) {
    return APIService.getItemSprite('Item_0704');
  } else if (isInclude(itemName, ItemName.EliteFastAttack)) {
    return APIService.getItemSprite('Item_1203');
  } else if (isInclude(itemName, ItemName.EliteSpecialAttack)) {
    return APIService.getItemSprite('Item_1204');
  } else if (isInclude(itemName, ItemName.IncubatorBasic)) {
    return APIService.getItemSprite('EggIncubatorIAP_Empty');
  } else if (isInclude(itemName, ItemName.IncubatorSuper)) {
    return APIService.getItemSprite('EggIncubatorSuper_Empty');
  } else if (isInclude(itemName, ItemName.Incense)) {
    return APIService.getItemSprite('Incense_0');
  } else if (isInclude(itemName, ItemName.Potion)) {
    return APIService.getItemSprite('Item_0101');
  } else if (isInclude(itemName, ItemName.SuperPotion)) {
    return APIService.getItemSprite('Item_0102');
  } else if (isInclude(itemName, ItemName.HyperPotion)) {
    return APIService.getItemSprite('Item_0103');
  } else if (isInclude(itemName, ItemName.MaxPotion)) {
    return APIService.getItemSprite('Item_0104');
  } else if (isInclude(itemName, ItemName.Revive)) {
    return APIService.getItemSprite('Item_0201');
  } else if (isInclude(itemName, ItemName.MaxRevive)) {
    return APIService.getItemSprite('Item_0202');
  }
  return APIService.getPokeSprite();
};

export const getValidPokemonImgPath = (src: string | undefined | null, id?: number, form?: string | null) => {
  if ((isInclude(src, APIUrl.POGO_ASSET_API_URL) && isInclude(src, '256x256')) || isInclude(src, APIUrl.POKE_SPRITES_FULL_API_URL)) {
    return APIService.getPokeFullAsset(id);
  }
  if (isInclude(src, APIUrl.POGO_ASSET_API_URL)) {
    return APIService.getPokemonSqModel(form, id);
  }
  return APIService.getPokeFullSprite();
};

export const getBonusType = (bonusType: string | number) => {
  if (bonusType === BonusType.SlowFreezeBonus || bonusType === 6) {
    return BonusType.SlowFreezeBonus;
  } else if (isEqual(bonusType, 'SPACE_BONUS')) {
    return BonusType.SpaceBonus;
  } else if (isEqual(bonusType, 'TIME_BONUS')) {
    return BonusType.TimeBonus;
  } else if (isEqual(bonusType, 'DAY_BONUS')) {
    return BonusType.DayBonus;
  } else if (isEqual(bonusType, 'NIGHT_BONUS')) {
    return BonusType.NightBonus;
  }
  return BonusType.None;
};
