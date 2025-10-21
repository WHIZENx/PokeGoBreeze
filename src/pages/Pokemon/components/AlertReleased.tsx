import React from 'react';
import APIService from '../../../services/api.service';
import { splitAndCapitalize, getPokemonFormWithNoneSpecialForm } from '../../../utils/utils';
import { IAlertReleasedComponent } from '../../models/page.model';
import useSearch from '../../../composables/useSearch';
import { Alert } from '@mui/material';

const AlertReleased = (props: IAlertReleasedComponent) => {
  const { searchingMainDetails } = useSearch();
  return (
    <>
      {searchingMainDetails && !searchingMainDetails.releasedGO && (
        <Alert sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }} severity="error">
          <div className="tw-flex tw-items-center tw-text-base tw-gap-2">
            <span>
              <b>
                {splitAndCapitalize(
                  getPokemonFormWithNoneSpecialForm(props.formName?.replaceAll(' ', '-'), props.pokemonType),
                  '_',
                  ' '
                )}
              </b>
              {' not released in Pokémon GO'}
            </span>
            <img width={50} height={50} alt="Pokémon GO Icon" src={APIService.getPokemonGoIcon(props.icon)} />
          </div>
        </Alert>
      )}
    </>
  );
};

export default AlertReleased;
