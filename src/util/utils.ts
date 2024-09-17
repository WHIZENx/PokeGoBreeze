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
  FORM_ALOLA,
  FORM_GALARIAN,
  FORM_GMAX,
  FORM_HISUIAN,
  FORM_NORMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
  MAX_IV,
} from './constants';
import { IPokemonFormModify, PokemonFormModifyModel, PokemonSprit, IPokemonFormDetail } from '../core/models/API/form.model';
import { PokemonSearching } from '../core/models/pokemon-searching.model';
import APIService from '../services/API.service';
import { ThemeModify } from './models/overrides/themes.model';
import { TableStyles } from 'react-data-table-component';
import { DynamicObj, getValueOrDefault, isNotEmpty, isNullOrEmpty, isNullOrUndefined } from './extension';

class Mask {
  value: number;
  label: string;

  constructor(value: number, label: string) {
    this.value = value;
    this.label = label;
  }
}

export const marks = [...Array(MAX_IV + 1).keys()].map((n) => {
  return new Mask(n, n.toString());
});

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

export const capitalize = (str: string | undefined | null) => {
  if (isNullOrEmpty(str)) {
    return '';
  }
  return getValueOrDefault(String, str?.charAt(0).toUpperCase()) + getValueOrDefault(String, str?.slice(1).toLowerCase());
};

export const splitAndCapitalize = (str: string | undefined | null, splitBy: string, joinBy: string) => {
  if (isNullOrEmpty(str)) {
    return '';
  }
  return getValueOrDefault(
    String,
    str
      ?.split(splitBy)
      .map((text) => capitalize(text))
      .join(joinBy)
  );
};

export const reversedCapitalize = (str: string, splitBy: string, joinBy: string) => {
  if (isNullOrEmpty(str)) {
    return '';
  }
  return str.replaceAll(joinBy, splitBy).toLowerCase();
};

export const getTime = (value: string | number | undefined, notFull = false) => {
  if (isNullOrUndefined(value)) {
    return value;
  }

  return notFull
    ? Moment(new Date(parseInt(getValueOrDefault(String, value?.toString())))).format('D MMMM YYYY')
    : Moment(new Date(parseInt(getValueOrDefault(String, value?.toString())))).format('HH:mm D MMMM YYYY');
};

export const convertModelSpritName = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll('_', '-')
    .replaceAll('%', '')
    .replace('mime-jr', 'mime_jr')
    .replace('-female', `${text.toLowerCase().includes('meowstic') || text.toLowerCase().includes('indeedee') ? '-' : '_'}f`)
    .replace(
      '-male',
      (text.toLowerCase().includes('meowstic') ? '-' : text.toLowerCase().includes('indeedee') ? '' : '_') +
        text.toLowerCase().includes('indeedee')
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
};

export const convertNameRankingToForm = (text: string) => {
  let form = '';
  if (text.includes('_')) {
    form = ` (${capitalize(text.split('_').at(1))})`;
  }
  return text + form;
};

export const convertNameRankingToOri = (text: string, form: string) => {
  const formOri = form;
  if (text === 'lanturnw') {
    text = 'lanturn';
  }
  if (text === 'unown') {
    text = 'unown-a';
  }
  if (text.includes('pyroar') || text.includes('frillish') || text.includes('jellicent') || text.includes('urshifu')) {
    return text.split('_').at(0);
  }
  if (text.includes('_mega') || text === 'ho_oh' || text.includes('castform') || text.includes('tapu') || text.includes('basculin_blue')) {
    return text.replaceAll('_', '-');
  }
  if (formOri.includes('(') && formOri.includes(')')) {
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
  if (text.toUpperCase().includes(FORM_STANDARD)) {
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
    `-${FORM_GALARIAN.toLowerCase()}`,
    `-${FORM_HISUIAN.toLowerCase()}`,
  ];
  return formOri.includes('(') && formOri.includes(')') && !invalidForm.includes(form) ? text.replaceAll(form.toLowerCase(), '') : text;
};

export const getStyleSheet = (selector: string) => {
  const sheets = document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    const sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule: any = sheet.cssRules[j];
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
        return sheet;
      }
    }
  }
  return;
};

export const getStyleRuleValue = (style: string, selector: string, sheet?: CSSStyleSheet) => {
  const sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule: any = sheet.cssRules[j];
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
        return rule.style[style] as string;
      }
    }
  }
  return;
};

export const findMoveTeam = (move: string, moveSet: string[]) => {
  if (!move) {
    return;
  }
  const result = move.match(/[A-Z]?[a-z]+|([A-Z])/g);
  for (let value of moveSet) {
    value = replaceTempMovePvpName(value);
    const m = value.split('_');
    if (m.length === result?.length) {
      let count = 0;
      for (let i = 0; i < result.length; i++) {
        if (capitalize(m[i].toLowerCase()).includes(result[i])) {
          count++;
        }
      }
      if (count === m.length) {
        return value;
      }
    }
  }
  for (const value of moveSet) {
    if (
      move
        .toLowerCase()
        .split('')
        .every((m) => value.toLowerCase().includes(m))
    ) {
      const m = value.split('_');
      if (result && m.length === result.length) {
        let count = 0;
        for (let i = 0; i < result.length; i++) {
          if (m[i].at(0) === result[i].at(0)) {
            count++;
          }
        }
        if (count === m.length) {
          return value;
        }
      }
    }
  }
  return;
};

export const checkPokemonGO = (id: number, name: string, details: IPokemonData[]) => {
  return details.find((pokemon) => pokemon.num === id && pokemon.fullName === name);
};

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
  const checkRankProd = pokemonStats?.statProd.ranking.find((item) => item.prod === stats.prod);
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

export const calRank = (pokemonStats: DynamicObj<OptionsRank>, type: string, rank: number) => {
  return ((pokemonStats[type].maxRank - rank + 1) * 100) / pokemonStats[type].maxRank;
};

export const mappingPokemonName = (pokemonData: IPokemonData[]) => {
  return pokemonData
    .filter(
      (pokemon) =>
        pokemon.num > 0 &&
        (pokemon.forme === FORM_NORMAL ||
          (pokemon.num === 744 && pokemon.forme === 'DUSK') ||
          (pokemon.baseForme && pokemon.baseForme === pokemon.forme))
    )
    .map((pokemon) => new PokemonSearching(pokemon))
    .sort((a, b) => a.id - b.id);
};

export const getPokemonById = (pokemonData: IPokemonData[], id: number) => {
  const result = pokemonData
    .filter((pokemon) => pokemon.num === id)
    .find(
      (pokemon) => pokemon.forme?.toUpperCase() === FORM_NORMAL || (pokemon.baseForme && pokemon.baseForme === pokemon.forme?.toUpperCase())
    );
  if (!result) {
    return;
  }
  return new PokemonModel(result.num, result.name);
};

export const getCustomThemeDataTable = (theme: ThemeModify): TableStyles => {
  return {
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
  };
};

export const getDataWithKey = <T>(data: any, key: string | number) => {
  const result = Object.entries(data ?? new Object()).find((k) => k.at(0) === key.toString());
  if (result) {
    const [, data] = result;
    return data as T;
  }
  return new Object() as T;
};

export const checkMoveSetAvailable = (pokemon: PokemonModel | IPokemonData | undefined) => {
  if (!pokemon) {
    return false;
  }

  const eliteQuickMoves = getValueOrDefault(Array, (pokemon as PokemonModel).eliteQuickMove ?? (pokemon as IPokemonData).eliteQuickMove);
  const eliteCinematicMoves = getValueOrDefault(
    Array,
    (pokemon as PokemonModel).eliteCinematicMove ?? (pokemon as IPokemonData).eliteCinematicMove
  );
  const specialMoves = getValueOrDefault(Array, (pokemon as PokemonModel).obSpecialAttackMoves ?? (pokemon as IPokemonData).specialMoves);
  const allMoves = getValueOrDefault(
    Array,
    pokemon.quickMoves?.concat(getValueOrDefault(Array, pokemon.cinematicMoves), eliteQuickMoves, eliteCinematicMoves, specialMoves)
  );
  if (allMoves.length <= 2 && (allMoves.at(0) === 'STRUGGLE' || allMoves.at(0)?.includes('SPLASH')) && allMoves.at(1) === 'STRUGGLE') {
    return false;
  }
  return true;
};

export const checkPokemonIncludeShadowForm = (pokemon: IPokemonData[], form: string) => {
  return pokemon.some((p) => p.isShadow && convertPokemonAPIDataName(form) === (p.fullName ?? p.name));
};

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

export const replacePokemonGoForm = (form: string) => {
  return form.replace(/_MALE$/, '').replace(/_FEMALE$/, '');
};

export const formIconAssets = (value: IPokemonFormModify, id: number) => {
  return value.form.name.includes('-totem') ||
    value.form.name.includes('-hisui') ||
    value.form.name.includes('power-construct') ||
    value.form.name.includes('own-tempo') ||
    value.form.name.includes('-meteor') ||
    value.form.name === 'mewtwo-armor' ||
    value.form.name === 'arceus-unknown' ||
    value.form.name === 'dialga-origin' ||
    value.form.name === 'palkia-origin' ||
    value.form.name === 'mothim-sandy' ||
    value.form.name === 'mothim-trash' ||
    value.form.name === 'basculin-white-striped' ||
    value.form.name === 'greninja-battle-bond' ||
    value.form.name === 'urshifu-rapid-strike' ||
    id >= 899
    ? APIService.getPokeIconSprite('unknown-pokemon')
    : value.form.name.includes(`-${FORM_SHADOW.toLowerCase()}`) || value.form.name.includes(`-${FORM_PURIFIED.toLowerCase()}`)
    ? APIService.getPokeIconSprite(value.name)
    : APIService.getPokeIconSprite(value.form.name);
};

// Convert Pokemon from Storage data to GO name
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
    .replace(/GALAR/, FORM_GALARIAN)
    .replace(/HISUI/, FORM_HISUIAN)
    .replace(/GALARIAN_STANDARD/, FORM_GALARIAN)
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

// Convert Pokemon from API data to GO name
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
    .replace(/GALAR$/, FORM_GALARIAN)
    .replace(/HISUI$/, FORM_HISUIAN)
    .replace(/GALAR_/, `${FORM_GALARIAN}_`)
    .replace(/GALARIAN_STANDARD/, FORM_GALARIAN)
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
    .replace(/-Wings$/, '');
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
      const isIncludeFormGO = formList.some((form) => pokemon.forme?.includes(form));
      if (!isIncludeFormGO) {
        index--;
        const pokemonGOModify = new PokemonFormModifyModel(
          id,
          name,
          getValueOrDefault(String, pokemon.pokemonId?.replaceAll('_', '-')?.toLowerCase()),
          getValueOrDefault(String, pokemon.forme?.replaceAll('_', '-')?.toLowerCase()),
          getValueOrDefault(String, pokemon.fullName?.replaceAll('_', '-')?.toLowerCase()),
          'Pokémon-GO',
          pokemon.types,
          new PokemonSprit(),
          index,
          FORM_NORMAL,
          false,
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
        getValueOrDefault(
          Array,
          p.types.map((item) => item.type.name)
        ),
        new PokemonSprit(),
        index,
        FORM_SHADOW,
        true
      );
      index--;
      const pokemonPurifiedModify = new PokemonFormModifyModel(
        id,
        name,
        p.name,
        `${form}${FORM_PURIFIED.toLowerCase()}`,
        `${p.name}-${FORM_PURIFIED.toLowerCase()}`,
        'Pokémon-GO',
        getValueOrDefault(
          Array,
          p.types.map((item) => item.type.name)
        ),
        new PokemonSprit(),
        index,
        FORM_PURIFIED,
        true
      );
      formListResult.push([pokemonShadowModify, pokemonPurifiedModify]);
    });

  return index;
};

export const getFormFromForms = (
  stats: (IStatsAtk | IStatsDef | IStatsSta | IStatsProd)[] | undefined,
  id: number | undefined,
  formName: string | undefined
) => {
  const forms = stats?.filter((i) => i.id === id);
  formName = convertPokemonAPIDataName(formName);
  let filterForm = forms?.find((item) => item.form === (formName || FORM_NORMAL));
  if (!filterForm && isNotEmpty(forms)) {
    filterForm = forms?.find((item) => item.form === FORM_NORMAL);
    if (!filterForm) {
      filterForm = forms?.at(0);
    }
  }
  return filterForm;
};

export const retrieveMoves = (combat: IPokemonData[], id: number, form: string) => {
  if (isNotEmpty(combat)) {
    const resultFirst = combat.filter((item) => item.num === id);
    form =
      form
        .toLowerCase()
        .replaceAll('-', '_')
        .replaceAll(`_${FORM_STANDARD.toLowerCase()}`, '')
        .toUpperCase()
        .replace(FORM_GMAX, FORM_NORMAL) ?? FORM_NORMAL;
    const result = resultFirst.find((item) => item.fullName === form || item.forme === form);
    return result ?? resultFirst[0];
  }
};

export const getPokemonDetails = (pokemonData: IPokemonData[], id: number, form: string | null, isDefault = false) => {
  let pokemonForm: IPokemonData | undefined = new PokemonData();

  if (form) {
    const name = convertPokemonAPIDataName(form.replaceAll(' ', '-'));
    pokemonForm = pokemonData.find((item) => item.num === id && item.fullName === name);

    if (isDefault && !pokemonForm) {
      pokemonForm = pokemonData.find(
        (item) => item.num === id && (item.forme === FORM_NORMAL || (item.baseForme && item.baseForme === item.forme))
      );
    }
  }
  return pokemonForm;
};

export const replaceTempMoveName = (name: string) => {
  if (name.endsWith('_FAST') || name.includes('_FAST_')) {
    name = name.replace('_FAST', '');
  } else if (name.endsWith('_PLUS')) {
    name = name.replaceAll('_PLUS', '+');
  }
  return name.replace(/^V\d{4}_MOVE_/, '');
};

export const replaceTempMovePvpName = (name: string) => {
  if (name.includes('_BLASTOISE')) {
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

export const getAllMoves = (pokemon: IPokemonData | undefined | null) => {
  if (!pokemon) {
    return [];
  }

  return getValueOrDefault(Array, pokemon.quickMoves).concat(
    getValueOrDefault(Array, pokemon.eliteQuickMove),
    getValueOrDefault(Array, pokemon.cinematicMoves),
    getValueOrDefault(Array, pokemon.eliteCinematicMove),
    getValueOrDefault(Array, pokemon.shadowMoves),
    getValueOrDefault(Array, pokemon.purifiedMoves),
    getValueOrDefault(Array, pokemon.specialMoves)
  );
};
