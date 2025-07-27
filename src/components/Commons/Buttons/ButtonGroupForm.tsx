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
    <div
      style={{ width: props.width, height: props.height }}
      className={combineClasses('scroll-form', props.className, props.isLoaded && props.isFullWidth ? 'w-100' : '')}
    >
      {props.isLoaded ? (
        <Fragment>
          {props.forms.map((value, index) => (
            <Fragment key={index}>
              {value.map((value, subIndex) => (
                <ButtonMui
                  key={subIndex}
                  active={value.form.id === props.id}
                  onClick={() => props.changeForm(value)}
                  sx={{ minHeight: 142 }}
                  className={combineClasses(index + subIndex === 0 ? '' : 'ms-3', 'btn-default')}
                  color="default"
                  label={
                    <div className="h-100">
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
                    </div>
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
