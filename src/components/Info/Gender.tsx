import { useTheme } from '@mui/material';
import React from 'react';
import APIService from '../../services/API.service';
import { IGenderComponent } from '../models/component.model';
import { TypeSex } from '../../enums/type.enum';
import { ThemeModify } from '../../util/models/overrides/themes.model';
import { getKeyWithData } from '../../util/utils';

const Gender = (props: IGenderComponent) => {
  const theme = useTheme<ThemeModify>();

  return (
    <div className="element-top" style={{ marginRight: 15 }}>
      <div className="d-flex align-items-center" style={{ columnGap: 15 }}>
        <img
          className="img-gender"
          width={40}
          height={40}
          alt="img-pokemon-sex"
          src={APIService.getGenderSprite(getKeyWithData(TypeSex, props.sex))}
        />
        <h6 className="ratio-gender" style={{ margin: 0 }}>
          {getKeyWithData(TypeSex, props.sex)}{' '}
          {props.ratio && `ratio: ${props.sex === TypeSex.Male ? props.ratio.M * 100 : props.ratio.F * 100}%`}
        </h6>
      </div>
      <div className="element-top d-flex" style={{ marginLeft: 30, columnGap: 15 }}>
        <div className="img-form-gender-group">
          <img
            width={96}
            height={96}
            alt="img-pokemon"
            src={
              props.sex === TypeSex.Male
                ? props.sprit?.frontDefault || props.sprit?.frontFemale || APIService.getPokeSprite()
                : props.sprit?.frontFemale || props.sprit?.frontDefault || APIService.getPokeSprite()
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
              props.sex === TypeSex.Male
                ? props.sprit?.frontShiny || props.sprit?.frontShinyFemale || APIService.getPokeSprite()
                : props.sprit?.frontShinyFemale || props.sprit?.frontShiny || APIService.getPokeSprite()
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
