import React from 'react';
import APIService from '../../services/api.service';
import { IGenderComponent } from '../models/component.model';
import { TypeSex } from '../../enums/type.enum';
import { getKeyWithData } from '../../utils/utils';
import { getValueOrDefault } from '../../utils/extension';

const Gender = (props: IGenderComponent) => {
  return (
    <div className="tw-mt-3 tw-mr-3">
      <div className="tw-flex tw-items-center tw-gap-x-3">
        <img
          className="img-gender"
          width={40}
          height={40}
          alt="Image Pokémon Sex"
          src={APIService.getGenderSprite(getKeyWithData(TypeSex, props.sex))}
        />
        <h6 className="ratio-gender !tw-m-0">
          {`${getKeyWithData(TypeSex, props.sex)} ${
            props.ratio ? `ratio: ${props.sex === TypeSex.Male ? props.ratio.M * 100 : props.ratio.F * 100}%` : ''
          }`}
        </h6>
      </div>
      <div className="tw-mt-2 tw-flex tw-ml-4 tw-gap-x-3">
        <div className="img-form-gender-group">
          <div className="img-gender-group">
            <img
              width={96}
              height={96}
              alt="Pokémon Image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = APIService.getPokeSprite();
              }}
              src={
                props.sex === TypeSex.Male
                  ? getValueOrDefault(
                      String,
                      props.sprit?.frontDefault,
                      props.sprit?.frontFemale,
                      APIService.getPokeSprite()
                    )
                  : getValueOrDefault(
                      String,
                      props.sprit?.frontFemale,
                      props.sprit?.frontDefault,
                      APIService.getPokeSprite()
                    )
              }
            />
          </div>
          <span className="caption">Default</span>
        </div>
        <div className="img-form-gender-group">
          <div className="img-gender-group">
            <img
              width={96}
              height={96}
              alt="Pokémon Image"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = APIService.getPokeSprite();
              }}
              src={
                props.sex === TypeSex.Male
                  ? getValueOrDefault(
                      String,
                      props.sprit?.frontShiny,
                      props.sprit?.frontShinyFemale,
                      APIService.getPokeSprite()
                    )
                  : getValueOrDefault(
                      String,
                      props.sprit?.frontShinyFemale,
                      props.sprit?.frontShiny,
                      APIService.getPokeSprite()
                    )
              }
            />
          </div>
          <span className="caption">Shiny</span>
        </div>
      </div>
    </div>
  );
};

export default Gender;
