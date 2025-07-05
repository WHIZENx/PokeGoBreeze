import React from 'react';
import { Alert } from 'react-bootstrap';
import APIService from '../../../services/api.service';
import { splitAndCapitalize, getPokemonFormWithNoneSpecialForm } from '../../../utils/utils';
import { IAlertReleasedComponent } from '../../models/page.model';
import { VariantType } from '../../../enums/type.enum';
import useSearch from '../../../composables/useSearch';

const AlertReleased = (props: IAlertReleasedComponent) => {
  const { searchingMainDetails } = useSearch();
  return (
    <>
      {searchingMainDetails && !searchingMainDetails.releasedGO && (
        <Alert variant={VariantType.Danger}>
          <h5 className="text-danger m-0">
            {'* '}
            <b>
              {splitAndCapitalize(
                getPokemonFormWithNoneSpecialForm(props.formName?.replaceAll(' ', '-'), props.pokemonType),
                '_',
                ' '
              )}
            </b>
            {' not released in Pokémon GO'}
            <img
              width={50}
              height={50}
              className="ms-2"
              alt="Pokémon GO Icon"
              src={APIService.getPokemonGoIcon(props.icon)}
            />
          </h5>
        </Alert>
      )}
    </>
  );
};

export default AlertReleased;
