import { RadioGroup, Rating, Slider, styled } from "@mui/material";

export const marks = [...Array(16).keys()].map(n => {return {value: n, label: n.toString()}});

export const PokeGoSlider = styled(Slider)(() => ({
    color: '#ee9219',
    height: 18,
    padding: '13px 0',
    '& .MuiSlider-thumb': {
      height: 18,
      width: 18,
      backgroundColor: '#ee9219',
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
        backgroundColor: '#ee9219',
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