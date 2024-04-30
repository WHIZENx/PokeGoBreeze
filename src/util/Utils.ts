import { RadioGroup, Rating, Slider, styled, Theme } from '@mui/material';
import Moment from 'moment';
import pokemonData from '../data/pokemon.json';
import {
  FORM_ALOLA,
  FORM_ARMOR,
  FORM_GALARIAN,
  FORM_GMAX,
  FORM_HERO,
  FORM_HISUIAN,
  FORM_INCARNATE,
  FORM_MEGA,
  FORM_NORMAL,
  FORM_PURIFIED,
  FORM_SHADOW,
  FORM_STANDARD,
  MAX_IV,
} from './Constants';
import { PokemonDataModel, PokemonModel, PokemonNameModel } from '../core/models/pokemon.model';
import { PokemonStatsRanking, StatsModel, StatsPokemon } from '../core/models/stats.model';
import { Stats } from '../core/models/API/info.model';
import { FormModel } from '../core/models/API/form.model';
import { ArrayStats } from './models/util.model';
import { PokemonSearchingModel } from '../core/models/pokemon-searching.model';

export const marks = [...Array(MAX_IV + 1).keys()].map((n) => {
  return { value: n, label: n.toString() };
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
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const splitAndCapitalize = (str: string | undefined | null, splitBy: string, joinBy: string) => {
  if (!str) {
    return '';
  }
  return str
    .split(splitBy)
    .map((text) => capitalize(text))
    .join(joinBy);
};

export const reversedCapitalize = (str: string, splitBy: string, joinBy: string) => {
  if (!str) {
    return '';
  }
  return str.replaceAll(joinBy, splitBy).toLowerCase();
};

export const getTime = (value: string | number | undefined, notFull = false) => {
  if (!value) {
    return value;
  }

  return notFull
    ? Moment(new Date(parseInt(value.toString()))).format('D MMMM YYYY')
    : Moment(new Date(parseInt(value.toString()))).format('HH:mm D MMMM YYYY');
};

export const convertModelSpritName = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll('_', '-')
    .replaceAll('%', '')
    .replace('mime-jr', 'mime_jr')
    .replace('-female', (text.toLowerCase().includes('meowstic') || text.toLowerCase().includes('indeedee') ? '-' : '_') + 'f')
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

export const convertName = (text: string | undefined, isChangeForm = true) => {
  if (!text) {
    return '';
  }
  if (isChangeForm) {
    text = text.toUpperCase().replaceAll('-', '_').replace('_GALAR', `_${FORM_GALARIAN}`).replace('_HISUI', `_${FORM_HISUIAN}`);
  }
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll('NIDORAN_F', 'NIDORAN_FEMALE')
    .replaceAll('NIDORAN_M', 'NIDORAN_MALE')
    .replaceAll('’', '')
    .replaceAll('.', '')
    .replaceAll('MR_', 'MR._')
    .replaceAll(':', '')
    .replaceAll(' ', '_')
    .replaceAll('É', 'E')
    .replace('PUMPKABOO_AVERAGE', 'PUMPKABOO')
    .replace('GOURGEIST_AVERAGE', 'GOURGEIST')
    .replace(`_${FORM_ARMOR}`, '_A')
    .replace('_POM_POM', '_POMPOM')
    .replace("_PA'U", '_PAU');
};

export const convertNameRanking = (text: string) => {
  return text
    .toLowerCase()
    .replaceAll('-', '_')
    .replaceAll('galar', FORM_GALARIAN.toLowerCase())
    .replaceAll(FORM_ALOLA.toLowerCase(), 'alolan');
};

export const convertNameRankingToForm = (text: string) => {
  let form = '';
  if (text.includes('_')) {
    form = ` (${capitalize(text.split('_').at(1))})`;
  }
  return text + form;
};

export const convertNameRankingToOri = (text: string, form: string, local = false) => {
  const formOri = form;
  if (text.includes('pyroar') || text.includes('frillish') || text.includes('jellicent') || text.includes('urshifu')) {
    return text.split('_').at(0);
  }
  if (text.includes('_mega') || text === 'ho_oh' || text.includes('castform') || text.includes('tapu') || text.includes('basculin_blue')) {
    return text.replaceAll('_', '-');
  }
  if (formOri.includes('(') && formOri.includes(')')) {
    form = '-' + form.split(' (').at(1)?.replace(')', '').toLowerCase();
  }
  text = text
    .toLowerCase()
    .replaceAll('_', '-')
    .replaceAll(FORM_GALARIAN.toLowerCase(), 'galar')
    .replaceAll('alolan', FORM_ALOLA.toLowerCase())
    .replaceAll(FORM_HISUIAN.toLowerCase(), 'hisui')
    .replace('-xs', '')
    .replace('indeedee-male', 'indeedee')
    .replace('female', 'f')
    .replace('male', 'm')
    .replace('-sea', '')
    .replace('-reine', '')
    .replace('-red-striped', '')
    .replace('-full-belly', '')
    .replace('-sword', '')
    .replace('-shield', '')
    .replace('-rider', '')
    .replace('cherrim-sunny', 'cherrim-sunshine')
    .replace('-5th-anniversary', '')
    .replace(`-${FORM_SHADOW.toLowerCase()}`, '')
    .replace(local ? 'mewtwo-a' : '-armored', local ? 'mewtwo-armor' : '-armor');
  if (local && text === 'mewtwo-armor') {
    return text;
  }
  if (text?.toUpperCase().includes(FORM_STANDARD)) {
    form = `-${FORM_STANDARD.toLowerCase()}`;
  }
  let invalidForm: string[] = [
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
  ];
  if (local) {
    invalidForm = invalidForm.concat([
      '-attack',
      '-speed',
      `-${FORM_STANDARD.toLowerCase()}`,
      '-zen',
      '-confined',
      '-unbound',
      '-incarnate',
    ]);
  }
  return formOri.includes('(') && formOri.includes(')') && !invalidForm.includes(form) ? text.replaceAll(form.toLowerCase(), '') : text;
};

export const convertArrStats = (data: PokemonDataModel[]) => {
  return data
    .filter((pokemon) => pokemon.num > 0)
    .map((value) => {
      return {
        id: value.num,
        name: value.slug,
        form: (value.forme ?? FORM_NORMAL).toLowerCase().replaceAll('_', '-').replace(`-${FORM_STANDARD.toLowerCase()}`, ''),
        base_stats: value.baseStats,
        baseStatsPokeGo: { attack: value.baseStats.atk, defense: value.baseStats.def, stamina: value.baseStats.sta ?? 0 },
        baseStatsProd: value.baseStats.atk * value.baseStats.def * (value.baseStats.sta ?? 0),
      } as ArrayStats;
    });
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
  return null;
};

export const getStyleRuleValue = (style: string, selector: string, sheet?: CSSStyleSheet | null) => {
  const sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule = sheet.cssRules[j] as any;
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
        return rule.style[style];
      }
    }
  }
  return null;
};

export const findMoveTeam = (move: string, moveSet: string[]) => {
  const result = move.match(/[A-Z]?[a-z]+|([A-Z])/g);
  for (let value of moveSet) {
    if (value === 'FUTURESIGHT') {
      value = 'FUTURE_SIGHT';
    }
    if (value === 'ROLLOUT') {
      value = 'ROLL_OUT';
    }
    if (value === 'TECHNO_BLAST_DOUSE') {
      value = 'TECHNO_BLAST_WATER';
    }
    const m = value.split('_');
    if (m.length === result?.length) {
      let count = 0;
      for (let i = 0; i < result.length; i++) {
        if (capitalize(m[i].toLowerCase()).includes(result[i])) {
          count++;
        }
      }
      if (count === m.length) {
        return value
          .replace('FUTURE_SIGHT', 'FUTURESIGHT')
          .replace('TECHNO_BLAST_WATER', 'TECHNO_BLAST_DOUSE')
          .replace('ROLL_OUT', 'ROLLOUT');
      }
    }
  }
  for (const value of moveSet) {
    const m = value.split('_');
    if (m.length === result?.length) {
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
  return null;
};

const filterPokemonGO = (id: number, name: string, pokemon: PokemonDataModel) => {
  return (
    pokemon.num === id &&
    pokemon.fullName ===
      (pokemon.num === 555 && !name.toLowerCase().includes('zen')
        ? name?.toUpperCase().replaceAll('-', '_').replace('_GALAR', `_${FORM_GALARIAN}`) + `_${FORM_STANDARD}`
        : convertName(name).replace('NIDORAN_F', 'NIDORAN_FEMALE').replace('NIDORAN_M', 'NIDORAN_MALE'))
  );
};

const convertPokemonGO = (id: number, name: string, pokemon: PokemonDataModel) => {
  if (name.toLowerCase().includes('_mega')) {
    return pokemon.num === id && pokemon.fullName === name?.toUpperCase().replaceAll('-', '_');
  } else {
    return filterPokemonGO(id, name, pokemon);
  }
};

export const checkPokemonGO = (id: number, name: string, details: PokemonDataModel[], isIgnoreMega = false) => {
  return details.find((pokemon) => {
    if (isIgnoreMega) {
      return filterPokemonGO(id, name, pokemon);
    }
    return convertPokemonGO(id, name, pokemon);
  });
};

export const mappingReleasedGO = (pokemon: PokemonDataModel[], details?: PokemonDataModel[]) => {
  return pokemon
    .filter((item) => item.num > 0)
    .map((item) => {
      const result = checkPokemonGO(item.num, item.name, details ?? []);
      return {
        ...item,
        releasedGO: result?.releasedGO ?? false,
      };
    });
};

export const convertFormName = (id: number, form: string) => {
  if (form === 'alola-totem') {
    return 'totem-alola';
  } else if (form === 'pokeball') {
    return 'poke-ball';
  } else if (form === 'f') {
    return 'female';
  } else if (form === '10%') {
    return '10';
  } else if (form === "pa'u") {
    return 'pau';
  } else if (form === 'dusk-mane') {
    return 'dusk';
  } else if (form === 'dawn-wings') {
    return 'dawn';
  } else if (id === 25 && ['origin', 'hoenn', 'sinnoh', 'unova', 'kalos', FORM_ALOLA.toLowerCase(), 'partner', 'world'].includes(form)) {
    return form + '-cap';
  }
  return form;
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

export const convertFormNameImg = (id: number, form: string) => {
  form = form.replaceAll('_', '-');
  if (
    id === 201 ||
    id === 414 ||
    id === 493 ||
    id === 649 ||
    id === 664 ||
    id === 665 ||
    id === 669 ||
    id === 670 ||
    id === 671 ||
    id === 716 ||
    id === 773 ||
    (id === 774 && form !== 'red') ||
    id === 854 ||
    id === 855 ||
    (id === 869 && form?.toUpperCase() !== FORM_GMAX) ||
    form === 'totem' ||
    form?.toUpperCase() === FORM_NORMAL ||
    form === 'plant' ||
    form === 'altered' ||
    form === 'overcast' ||
    form === 'land' ||
    form?.toUpperCase() === FORM_STANDARD ||
    form === 'spring' ||
    form?.toUpperCase() === FORM_INCARNATE ||
    form === 'ordinary' ||
    form === 'aria' ||
    form === 'natural' ||
    form === 'debutante' ||
    form === 'matron' ||
    form === 'dandy' ||
    form === 'la-reine' ||
    form === 'kabuki' ||
    form === 'pharaoh' ||
    form === 'male' ||
    form === 'shield' ||
    form === 'average' ||
    form === '50' ||
    form === 'confined' ||
    form === 'baile' ||
    form === 'midday' ||
    form === 'solo' ||
    form === 'disguised' ||
    form === 'amped' ||
    form === 'ice' ||
    form === 'full-belly' ||
    form === 'single-strike' ||
    form === 'spiky-eared' ||
    form === 'battle-bond' ||
    form === 'meteor'
  ) {
    return '';
  } else if (form?.includes('-totem')) {
    return form.replace('-totem', '');
  } else if (form?.includes('totem-')) {
    return form.replace('totem-', '').replace('disguised', '');
  } else if (id === 849 && form?.toUpperCase() === FORM_GMAX) {
    return 'amped-gmax';
  } else if (id === 892 && form?.toUpperCase() === FORM_GMAX) {
    return 'single-strike-gmax';
  } else if (form === 'armor') {
    return '';
  } else if (form === 'pokeball') {
    return 'poke-ball';
  } else if (form === 'f') {
    return 'female';
  } else if (form === '10%') {
    return '10';
  } else if (form === "pa'u") {
    return 'pau';
  } else if (form === 'dusk-mane') {
    return 'dusk';
  } else if (form === 'dawn-wings') {
    return 'dawn';
  } else if (form === 'dawn-wings') {
    return 'dawn';
  } else if (form === 'dawn-wings') {
    return 'dawn';
  } else if (id === 801 && form.includes('color')) {
    return form.replace('-color', '');
  } else if ((id === 888 || id === 889) && form.includes('crowned')) {
    return 'crowned';
  } else if (id === 898 && form.includes('rider')) {
    return form.replace('-rider', '');
  } else if (id === 25 && ['original', 'hoenn', 'sinnoh', 'unova', 'kalos', FORM_ALOLA.toLowerCase(), 'partner', 'world'].includes(form)) {
    return form + '-cap';
  }
  return form;
};

export const checkRankAllAvailable = (
  pokemonStats: StatsModel,
  stats: {
    atk: number;
    def: number;
    sta: number;
    prod: number;
  }
) => {
  const data = {
    attackRank: 0,
    defenseRank: 0,
    staminaRank: 0,
    statProdRank: 0,
  };
  const checkRankAtk = pokemonStats?.attack.ranking.find((item) => item.attack === stats.atk);
  const checkRankDef = pokemonStats?.defense.ranking.find((item) => item.defense === stats.def);
  const checkRankSta = pokemonStats?.stamina.ranking.find((item) => item.stamina === (stats?.sta ?? 0));
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

export const calRank = (
  pokemonStats: {
    [x: string]: { max_rank: number };
  },
  type: string,
  rank: number
) => {
  return ((pokemonStats[type].max_rank - rank + 1) * 100) / pokemonStats[type].max_rank;
};

export const mappingPokemonName = (pokemonData: PokemonDataModel[]) => {
  return pokemonData
    .filter(
      (pokemon) =>
        pokemon.num > 0 &&
        (pokemon.forme === FORM_NORMAL ||
          (pokemon.num === 744 && pokemon.forme === 'DUSK') ||
          (pokemon.baseForme && pokemon.baseForme === pokemon.forme))
    )
    .map((pokemon) => new PokemonSearchingModel(pokemon))
    .sort((a, b) => a.id - b.id);
};

export const getPokemonById = (pokemonData: PokemonDataModel[], id: number) => {
  const result = pokemonData
    .filter((pokemon) => pokemon.num === id)
    .find(
      (pokemon) => pokemon.forme?.toUpperCase() === FORM_NORMAL || (pokemon.baseForme && pokemon.baseForme === pokemon.forme?.toUpperCase())
    );
  if (!result) {
    return;
  }
  return new PokemonNameModel(result?.num ?? 0, result?.name ?? '');
};

export const getCustomThemeDataTable = (theme: Theme) => {
  return {
    rows: {
      style: {
        color: theme.palette.text.primary,
        backgroundColor: (theme.palette.background as any).tablePrimary,
        '&:not(:last-of-type)': {
          borderBottomColor: (theme.palette.background as any).tableDivided,
        },
      },
      stripedStyle: {
        color: theme.palette.text.primary,
        backgroundColor: (theme.palette.background as any).tableStrip,
      },
      highlightOnHoverStyle: {
        color: theme.palette.text.primary,
        backgroundColor: (theme.palette.background as any).tableHover,
        borderBottomColor: (theme.palette.background as any).tableDivided,
        outlineColor: (theme.palette.background as any).tablePrimary,
      },
    },
    headCells: {
      style: {
        backgroundColor: (theme.palette.background as any).tablePrimary,
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

export const getDataWithKey = (data: any, key: string | number) => {
  const result = Object.entries(data ?? {}).find((k) => k.at(0) === key.toString());
  return result ? result[1] : {};
};

export const checkMoveSetAvailable = (pokemon: PokemonModel | PokemonDataModel | undefined) => {
  if (!pokemon) {
    return false;
  }

  const eliteQuickMoves = (pokemon as PokemonModel).eliteQuickMove ?? (pokemon as PokemonDataModel).eliteQuickMove ?? [];
  const eliteCinematicMoves = (pokemon as PokemonModel).eliteCinematicMove ?? (pokemon as PokemonDataModel).eliteCinematicMove ?? [];
  const specialMoves = (pokemon as PokemonModel).obSpecialAttackMoves ?? (pokemon as PokemonDataModel).specialMoves ?? [];
  const allMoves = pokemon.quickMoves?.concat(pokemon.cinematicMoves ?? [], eliteQuickMoves, eliteCinematicMoves, specialMoves) ?? [];
  if (allMoves?.length <= 2 && (allMoves.at(0) === 'STRUGGLE' || allMoves.at(0)?.includes('SPLASH')) && allMoves.at(1) === 'STRUGGLE') {
    return false;
  }
  return true;
};

export const convertIdMove = (name: string) => {
  switch (name) {
    case '387':
      return 'GEOMANCY';
    case '389':
      return 'OBLIVION_WING';
    case '391':
      return 'TRIPLE_AXEL';
    case '392':
      return 'TRAILBLAZE';
    case '393':
      return 'SCORCHING_SANDS';
    default:
      return name;
  }
};

export const checkPokemonIncludeShadowForm = (pokemon: PokemonDataModel[], form: string) => {
  return pokemon.some((p) => splitAndCapitalize(form, '-', '_').toUpperCase() === (p.fullName ?? p.name) && p.isShadow);
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
  const result: { [x: string]: number } = { atk: 0, def: 0, hp: 0, spa: 0, spd: 0, spe: 0 };

  stats?.forEach((stat) => {
    result[convertNameEffort(stat.stat.name)] = stat.base_stat;
  });

  return result as unknown as StatsPokemon;
};

export const convertToPokemonForm = (pokemon: PokemonDataModel | PokemonStatsRanking): FormModel => {
  return {
    form_name: pokemon.forme ?? '',
    form_names: [],
    form_order: 0,
    id: pokemon.num,
    is_battle_only: false,
    is_default: true,
    is_mega: pokemon.slug?.toUpperCase().includes(FORM_MEGA),
    name: pokemon.name,
    sprites: null,
    types: pokemon.types ?? [],
    version_group: { name: pokemon.version ?? '' },
    is_shadow: false,
    is_purified: false,
  };
};

export const filterFormName = (form: string, formStats: string) => {
  form = form
    .toLowerCase()
    .replace('-power-construct', '')
    .replace('sunshine', 'sunny')
    .replace('active', FORM_NORMAL.toLowerCase())
    .replace('10', 'ten-percent')
    .replace('50', 'fifty-percent');

  form =
    form === '' || form?.toUpperCase() === FORM_STANDARD || form?.toUpperCase() === FORM_SHADOW || form?.toUpperCase() === FORM_PURIFIED
      ? capitalize(FORM_NORMAL)
      : form?.toUpperCase().includes(FORM_MEGA)
      ? form.toLowerCase()
      : capitalize(form);

  formStats = formStats.toUpperCase().includes(FORM_MEGA) ? formStats.toLowerCase() : formStats.replaceAll('_', '-');
  formStats = [FORM_HERO, FORM_STANDARD].includes(formStats.toUpperCase()) ? capitalize(FORM_NORMAL) : formStats;
  return form.toLowerCase().includes(formStats.toLowerCase());
};

export const replacePokemonGoForm = (form: string) => {
  return form.replace(/_MALE$/, '').replace(/_FEMALE$/, '');
};

export const convertPokemonGOName = (text: string | undefined) => {
  if (!text) {
    return '';
  }
  if (!text.includes('MEOWSTIC') || !text.includes('INDEEDEE')) {
    text = text.replace(/_FEMALE$/, '');
  }
  return text
    .replace(/_PALDEA$/, '')
    .replace(/_PLANT$/, '')
    .replace(/_SANDY$/, '')
    .replace(/_TRASH$/, '')
    .replace(/_OVERCAST$/, '')
    .replace('CHERRIM_SUNNY', 'CHERRIM_SUNSHINE')
    .replace(/_EAST_SEA$/, '')
    .replace(/_WEST_SEA$/, '')
    .replace(/_ALTERED$/, '')
    .replace(/_LAND$/, '')
    .replace(/_RED_STRIPED$/, '')
    .replace(/_STANDARD$/, '')
    .replace(/_AUTUMN$/, '')
    .replace(/_SPRING$/, '')
    .replace(/_SUMMER$/, '')
    .replace(/_WINTER$/, '')
    .replace(/_INCARNATE$/, '')
    .replace(/_ORDINARY$/, '')
    .replace(/_ARIA$/, '')
    .replace(/_BLUE$/, '')
    .replace(/_ORANGE$/, '')
    .replace(/_RED$/, '')
    .replace(/_WHITE$/, '')
    .replace(/_YELLOW$/, '')
    .replace(/_COMPLETE_TEN_PERCENT$/, '_10')
    .replace(/_COMPLETE_FIFTY_PERCENT$/, '')
    .replace(/_TEN_PERCENT$/, '_10')
    .replace(/_FIFTY_PERCENT$/, '')
    .replace(/_CONFINED$/, '')
    .replace(/_BAILE$/, '')
    .replace(/_POMPOM$/, '_POM_POM')
    .replace('ROCKRUFF_DUSK', 'ROCKRUFFDUSK')
    .replace(/_MIDDAY$/, '')
    .replace(/_SOLO$/, '')
    .replace(/_GREEN$/, '')
    .replace(/_INDIGO$/, '')
    .replace(/_VIOLET$/, '')
    .replace(/_DISGUISED$/, '')
    .replace(/_COLOR$/, '')
    .replace(/_AMPED$/, '')
    .replace(/_PHONY$/, '')
    .replace(/_ANTIQUE$/, '')
    .replace(/_ICE$/, '')
    .replace('INDEEDEE_MALE', 'INDEEDEE')
    .replace(/_FULL_BELLY$/, '')
    .replace(/_CROWNED_SWORD$/, '_CROWNED')
    .replace(/_HERO$/, '')
    .replace(/_CROWNED_SHIELD$/, '_CROWNED')
    .replace(/_RAPID_STRIKE$/, '')
    .replace(/_SINGLE_STRIKE$/, '')
    .replace(/_RIDER$/, '');
};

export const convertPokemonDataName = (text: string | undefined) => {
  if (!text) {
    return '';
  }
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replace('NIDORAN_F', 'NIDORAN')
    .replace('NIDORAN_M', 'NIDORAN_MALE')
    .replace('MEOWSTIC_F', 'MEOWSTIC_FEMALE')
    .replace(/_GALAR$/, `_${FORM_GALARIAN}`)
    .replace(/_HISUI$/, `_${FORM_HISUIAN}`);
};

export const findPokemonData = (id: number, name: string) => {
  return Object.values(pokemonData).find(
    (pokemon: PokemonDataModel) => pokemon.num === id && name === convertPokemonDataName(pokemon.slug)
  );
};
