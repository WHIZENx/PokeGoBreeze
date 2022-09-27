import { RadioGroup, Rating, Slider, styled } from '@mui/material';
import Moment from 'moment';
import { calculateStatsByTag } from './Calculate';
import { MAX_IV } from './Constants';

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

export const capitalize = (str: string) => {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const splitAndCapitalize = (str: string, splitBy: string, joinBy: string) => {
  return str
    .split(splitBy)
    .map((text: string) => capitalize(text))
    .join(joinBy);
};

export const reversedCapitalize = (str: string, splitBy: string, joinBy: string) => {
  return str.replaceAll(joinBy, splitBy).toLowerCase();
};

export const getTime = (value: string, notFull = false) => {
  return notFull ? Moment(new Date(parseInt(value))).format('D MMMM YYYY') : Moment(new Date(parseInt(value))).format('HH:mm D MMMM YYYY');
};

export const convertModelSpritName = (text: string) => {
  return text.toLowerCase().replaceAll('_', '-').replaceAll('%', '').replace('mime-jr', 'mime_jr').replace('mr-', 'mr.-');
};

export const convertName = (text: string) => {
  return text
    .toUpperCase()
    .replaceAll('-', '_')
    .replaceAll('NIDORAN_F', 'NIDORAN_FEMALE')
    .replaceAll('NIDORAN_M', 'NIDORAN_MALE')
    .replaceAll('’', '')
    .replaceAll('.', '')
    .replaceAll(':', '')
    .replaceAll(' ', '_')
    .replaceAll('É', 'E')
    .replace('PUMPKABOO_AVERAGE', 'PUMPKABOO')
    .replace('GOURGEIST_AVERAGE', 'GOURGEIST')
    .replace('_GALAR', '_GALARIAN')
    .replace('_HISUI', '_HISUIAN');
};

export const convertNameRanking = (text: string) => {
  return text.toLowerCase().replaceAll('-', '_').replaceAll('galar', 'galarian').replaceAll('alola', 'alolan');
};

export const convertNameRankingToForm = (text: string) => {
  let form = '';
  if (text.includes('_')) form = ` (${capitalize(text.split('_')[1])})`;
  return text + form;
};

export const convertNameRankingToOri = (text: string, form: string) => {
  const formOri = form;
  if (text.includes('pyroar') || text.includes('frillish') || text.includes('jellicent') || text.includes('urshifu'))
    return text.split('_')[0];
  if (text.includes('_mega') || text === 'ho_oh' || text.includes('castform') || text.includes('tapu') || text.includes('basculin_blue'))
    return text.replaceAll('_', '-');
  if (formOri.includes('(') && formOri.includes(')')) form = '-' + form.split(' (')[1].replace(')', '').toLowerCase();
  text = text
    .toLowerCase()
    .replaceAll('_', '-')
    .replaceAll('galarian', 'galar')
    .replaceAll('alolan', 'alola')
    .replaceAll('hisuian', 'hisui')
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
    .replace('-shadow', '')
    .replace('-armored', '-a');
  if (text.includes('standard')) form = '-standard';
  return formOri.includes('(') &&
    formOri.includes(')') &&
    form !== '-therian' &&
    form !== '-o' &&
    form !== '-origin' &&
    form !== '-defense' &&
    form !== '-sunshine' &&
    form !== '-jr' &&
    form !== '-mime' &&
    form !== '-rime' &&
    form !== '-null' &&
    form !== '-low' &&
    form !== '-small' &&
    form !== '-large' &&
    form !== '-average' &&
    form !== '-super'
    ? text.replaceAll(form.toLowerCase(), '')
    : text;
};

export const convertArrStats = (data: { [s: string]: any } | ArrayLike<any>) => {
  return Object.values(data).map((value: any) => {
    const stats = calculateStatsByTag(value.baseStats, value.slug);
    return {
      id: value.num,
      name: value.slug,
      base_stats: value.baseStats,
      baseStatsPokeGo: { attack: stats.atk, defense: stats.def, stamina: stats.sta },
    };
  });
};

export const getStyleSheet = (style: string, selector: string) => {
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

export const getStyleRuleValue = (style: string, selector: string, sheet?: any) => {
  const sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
  for (let i = 0, l = sheets.length; i < l; i++) {
    sheet = sheets[i];
    if (!sheet || !sheet.cssRules) {
      continue;
    }
    for (let j = 0, k = sheet.cssRules.length; j < k; j++) {
      const rule = sheet.cssRules[j];
      if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
        return rule.style[style];
      }
    }
  }
  return null;
};

export const findMoveTeam = (move: any, moveSet: any) => {
  move = move.match(/[A-Z]?[a-z]+|([A-Z])/g);
  for (let value of moveSet) {
    if (value === 'FUTURESIGHT') value = 'FUTURE_SIGHT';
    if (value === 'ROLLOUT') value = 'ROLL_OUT';
    if (value === 'TECHNO_BLAST_DOUSE') value = 'TECHNO_BLAST_WATER';
    const m = value.split('_');
    if (m.length === move.length) {
      let count = 0;
      for (let i = 0; i < move.length; i++) {
        if (capitalize(m[i].toLowerCase()).includes(move[i])) count++;
      }
      if (count === m.length)
        return value
          .replace('FUTURE_SIGHT', 'FUTURESIGHT')
          .replace('TECHNO_BLAST_WATER', 'TECHNO_BLAST_DOUSE')
          .replace('ROLL_OUT', 'ROLLOUT');
    }
  }
  for (const value of moveSet) {
    const m = value.split('_');
    if (m.length === move.length) {
      let count = 0;
      for (let i = 0; i < move.length; i++) {
        if (m[i][0] === move[i][0]) count++;
      }
      if (count === m.length) return value;
    }
  }
  return null;
};
