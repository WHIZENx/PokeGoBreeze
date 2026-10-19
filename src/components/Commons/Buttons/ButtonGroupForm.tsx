import React, { Fragment } from 'react';
import { IButtonGroupFormComponent } from '../models/component.model';
import { combineClasses, toNumber } from '../../../utils/extension';
import { formNormal } from '../../../utils/helpers/options-context.helpers';
import { capitalize, splitAndCapitalize } from '../../../utils/utils';
import PokemonIconType from '../../Sprites/PokemonIconType/PokemonIconType';
import PokemonTableIcon from '../../Sprites/PokemonTableIcon/PokemonTableIcon';
import ButtonMui from './ButtonMui';

const ButtonGroupForm = (props: IButtonGroupFormComponent) => {
  return (
    <div
      style={{ width: props.width, height: props.height }}
      className={combineClasses(
        'tw-relative tw-whitespace-nowrap tw-overflow-x-auto',
        props.className,
        props.isLoaded && props.isFullWidth ? 'tw-w-full' : ''
      )}
    >
      {props.isLoaded ? (
        <Fragment>
          {props.forms.map((value, index) => (
            <Fragment key={index}>
              {value.map((value, subIndex) => (
                <ButtonMui
                  key={subIndex}
                  active={value.form.id === props.id}
                  aria-pressed={value.form.id === props.id}
                  data-form-name={value.form.name}
                  data-form={value.form.formName ?? ''}
                  data-icon-name={value.name}
                  data-icon-base-species={value.defaultName}
                  data-pokemon-type={value.form.pokemonType ?? ''}
                  data-form-id={value.form.id}
                  data-sprite-front-default={value.form.sprites?.frontDefault ?? ''}
                  data-sprite-front-female={value.form.sprites?.frontFemale ?? ''}
                  data-sprite-front-shiny={value.form.sprites?.frontShiny ?? ''}
                  data-sprite-front-shiny-female={value.form.sprites?.frontShinyFemale ?? ''}
                  data-sprite-front-home={value.form.sprites?.frontHome ?? ''}
                  data-sprite-front-artwork={value.form.sprites?.frontArtwork ?? ''}
                  onClick={() => props.changeForm(value)}
                  className={combineClasses(
                    index + subIndex === 0 ? '' : '!tw-ml-3',
                    'btn-default !tw-min-h-selection-button'
                  )}
                  color="default"
                  label={
                    <div className="tw-h-full">
                      <div className="tw-flex tw-w-full tw-justify-center">
                        <div className="tw-relative tw-flex tw-h-16 tw-w-16 tw-items-center tw-justify-center">
                          <PokemonIconType
                            pokemonType={value.form.pokemonType}
                            size={24}
                            className="!tw-bottom-1 tw-right-0 tw-z-[1]"
                          >
                            <PokemonTableIcon
                              num={value.defaultId}
                              name={value.name}
                              fullName={value.form.name}
                              slug={value.form.name}
                              form={value.form.formName}
                              baseSpecies={value.defaultName}
                              pokemonType={value.form.pokemonType}
                              size={64}
                            />
                          </PokemonIconType>
                        </div>
                      </div>
                      <p>
                        {!value.form.formName
                          ? capitalize(formNormal())
                          : splitAndCapitalize(value.form.formName, '-', ' ')}
                      </p>
                      <div className="tw-flex tw-flex-col">
                        {toNumber(value.form.id) > 0 && value.form.id === props.defaultId && (
                          <b>
                            <small>(Default)</small>
                          </b>
                        )}
                        {toNumber(value.form.id) <= 0 && <small className="tw-text-error">* Only in GO</small>}
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
