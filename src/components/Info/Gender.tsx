import { useTheme } from '@mui/material';
import React from 'react';
import APIService from '../../services/API.service';
import { IPokemonGenderRatio } from '../../core/models/pokemon.model';
import { IGenderComponent } from '../models/component.model';
import { TypeSex } from '../../enums/type.enum';
import { ThemeModify } from '../../assets/themes/themes';

const Gender = (props: IGenderComponent) => {
  const theme = useTheme<ThemeModify>();
  const calculateRatio = (sex: string, ratio: IPokemonGenderRatio) => {
    const maleRatio = ratio.M;
    const femaleRatio = ratio.F;
    return sex.toLowerCase() === TypeSex.MALE ? maleRatio * 100 : femaleRatio * 100;
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
              props.sex.toLowerCase() === TypeSex.MALE
                ? props.defaultM || props.defaultF || APIService.getPokeSprite(0)
                : props.defaultF || props.defaultM || APIService.getPokeSprite(0)
            }
          />
          <span className="caption" style={{ color: theme.palette.customText.caption }}>
            Default
          </span>
        </div>
        <div className="img-form-gender-group">
          <img
            width={96}
            height={96}
            alt="img-pokemon"
            src={
              props.sex.toLowerCase() === TypeSex.MALE
                ? props.shinyM || props.shinyF || APIService.getPokeSprite(0)
                : props.shinyF || props.shinyM || APIService.getPokeSprite(0)
            }
          />
          <span className="caption" style={{ color: theme.palette.customText.caption }}>
            Shiny
          </span>
        </div>
      </div>
    </div>
  );
};

export default Gender;
