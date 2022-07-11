import { RadioGroup, Rating, Slider, styled } from "@mui/material";
import Moment from 'moment';
import { calculateStatsByTag } from "./Calculate";
import { MAX_IV } from "./Constants";

export const marks = [...Array(MAX_IV+1).keys()].map(n => {return {value: n, label: n.toString()}});

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
          height: 13
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
          height: 13
        },
    },
}));

export const TypeRadioGroup = styled(RadioGroup)(() => ({
    '&.MuiFormGroup-root, &.MuiFormGroup-row': {
        display: 'block',
    }
}));

export const HundoRate = styled(Rating)(() => ({
    '& .MuiRating-icon': {
        color: 'red',
    },
}));

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const splitAndCapitalize = (string, splitBy, joinBy) => {
  return string.split(splitBy).map(text => capitalize(text.toLowerCase())).join(joinBy);
};

export const reversedCapitalize = (string, splitBy, joinBy) => {
  return string.replaceAll(joinBy, splitBy).toLowerCase();
};

export const getTime = (value, notFull) => {
  return notFull ? Moment((new Date(parseInt(value)))).format('D MMMM YYYY') : Moment((new Date(parseInt(value)))).format('HH:mm D MMMM YYYY')
}

export const convertName = (text) => {
  return text.toUpperCase()
  .replaceAll("-", "_")
  .replaceAll("NIDORAN_F", "NIDORAN_FEMALE")
  .replaceAll("NIDORAN_M", "NIDORAN_MALE")
  .replaceAll("’", "")
  .replaceAll(".", "")
  .replaceAll(":", "")
  .replaceAll(" ", "_")
  .replaceAll("É", "E")
};

export const convertNameRanking = (text) => {
  return text.toLowerCase()
  .replaceAll("-", "_")
  .replaceAll("galar", "galarian")
  .replaceAll("alola", "alolan")
};

export const convertNameRankingToForm = (text) => {
  let form = "";
  if (text.includes("_")) form = ` (${capitalize(text.split("_")[1])})`;
  return text + form;
}

export const convertNameRankingToOri = (text, form) => {
  const formOri = form;
  if (formOri.includes("(") && formOri.includes(")")) form = "-"+form.split(" (")[1].replace(")", "").toLowerCase();
  text = text.toLowerCase()
  .replaceAll("_", "-")
  .replaceAll("galarian", "galar")
  .replaceAll("alolan", "alola")
  .replace("-xs", "")
  .replace("female", "f")
  .replace("male", "m")
  .replace("-sea", "")
  .replace("cherrim-sunny", "cherrim-sunshine")
  .replace("-5th-anniversary", "")
  .replace("-shadow", "")
  if (text.includes("standard")) form = "-standard";
  return formOri.includes("(") && formOri.includes(")") &&
  form !== "-defense" &&
  form !== "-sunshine" &&
  form !== "-jr" &&
  form !== "-small" &&
  form !== "-large" &&
  form !== "-average" &&
  form !== "-super" ? text.replaceAll(form.toLowerCase(), "") : text;
};

export const convertArrStats = (data) => {
  return Object.values(data).map(value => {
      let stats = calculateStatsByTag(value.baseStats, value.forme);
      return {id: value.num, name: value.slug, base_stats: value.baseStats,
      baseStatsPokeGo: {attack: stats.atk, defense: stats.def, stamina: stats.sta}}
  })
};

export const getStyleRuleValue = (style, selector, sheet) => {
  var sheets = typeof sheet !== 'undefined' ? [sheet] : document.styleSheets;
  for (var i = 0, l = sheets.length; i < l; i++) {
      sheet = sheets[i];
      if( !sheet.cssRules ) { continue; }
      for (var j = 0, k = sheet.cssRules.length; j < k; j++) {
          var rule = sheet.cssRules[j];
          if (rule.selectorText && rule.selectorText.split(',').indexOf(selector) !== -1) {
              return rule.style[style];
          }
      }
  }
  return null;
}