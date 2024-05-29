import { useTheme } from '@mui/material';
import React from 'react';
import APIService from '../../services/API.service';
import { PokemonGenderRatio } from '../../core/models/pokemon.model';

const Gender = (props: {
  sex: string;
  ratio?: PokemonGenderRatio | undefined;
  default_m?: string;
  default_f?: string;
  shiny_m?: string;
  shiny_f?: string;
}) => {
  const theme = useTheme();
  const calculateRatio = (sex: string, ratio: PokemonGenderRatio) => {
    const maleRatio = ratio.M;
    const femaleRatio = ratio.F;
    return sex.toLowerCase() === 'male' ? maleRatio * 100 : femaleRatio * 100;
  };

  return (
    <div className="element-top" style={{ marginRight: 15 }}>
      <div className="d-flex align-items-center" style={{ columnGap: 15 }}>
        <img className="img-gender" width={40} height={40} alt="img-pokemon-sex" src={APIService.getGenderSprite(props.sex)} />
        <h6 className="ratio-gender" style={{ margin: 0 }}>
          {props.sex} {props.ratio && `ratio: ${calculateRatio(props.sex, props.ratio)}%`}
        </h6>
      </div>
      <div className="element-top d-flex" style={{ marginLeft: 30, columnGap: 15 }}>
        <div className="img-form-gender-group">
          <img
            width={96}
            height={96}
            alt="img-pokemon"
            src={
              props.sex.toLowerCase() === 'male'
                ? props.default_m ?? props.default_f ?? APIService.getPokeSprite(0)
                : props.default_f ?? props.default_m ?? APIService.getPokeSprite(0)
            }
          />
          <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
            Default
          </span>
        </div>
        <div className="img-form-gender-group">
          <img
            width={96}
            height={96}
            alt="img-pokemon"
            src={
              props.sex.toLowerCase() === 'male'
                ? props.shiny_m ?? props.shiny_f ?? APIService.getPokeSprite(0)
                : props.shiny_f ?? props.shiny_m ?? APIService.getPokeSprite(0)
            }
          />
          <span className="caption" style={{ color: (theme.palette as any).customText.caption }}>
            Shiny
          </span>
        </div>
      </div>
    </div>
  );
};

export default Gender;
