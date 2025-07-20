import React, { Fragment } from 'react';
import { IButtonGroupFormComponent } from '../models/component.model';
import { combineClasses, toNumber } from '../../../utils/extension';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import { capitalize, formIconAssets, splitAndCapitalize } from '../../../utils/utils';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import apiService from '../../../services/api.service';
import ButtonMui from './ButtonMui';

const ButtonGroupForm = (props: IButtonGroupFormComponent) => {
  return (
    <div className={combineClasses(props.scrollClass, props.isLoaded && props.isFullWidth ? 'w-100' : '')}>
      {props.isLoaded ? (
        <Fragment>
          {props.forms.map((value, index) => (
            <Fragment key={index}>
              {value.map((value, index) => (
                <ButtonMui
                  key={index}
                  active={value.form.id === props.id}
                  onClick={() => props.changeForm(value)}
                  label={
                    <>
                      <div className="d-flex w-100 justify-content-center">
                        <div className="position-relative w-9">
                          <PokemonIconType pokemonType={value.form.pokemonType} size={24}>
                            <img
                              className="pokemon-sprite-medium"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = apiService.getPokeIconSprite();
                              }}
                              alt="Image Icon Form"
                              src={formIconAssets(value)}
                            />
                          </PokemonIconType>
                        </div>
                      </div>
                      <p>
                        {!value.form.formName
                          ? capitalize(formNormal())
                          : splitAndCapitalize(value.form.formName, '-', ' ')}
                      </p>
                      <div className="d-flex flex-column">
                        {toNumber(value.form.id) > 0 && value.form.id === props.defaultId && (
                          <b>
                            <small>(Default)</small>
                          </b>
                        )}
                        {toNumber(value.form.id) <= 0 && <small className="text-danger">* Only in GO</small>}
                      </div>
                    </>
                  }
                />
              ))}
            </Fragment>
          ))}
        </Fragment>
      ) : (
        props.loading
      )}
    </div>
  );
};

export default ButtonGroupForm;
