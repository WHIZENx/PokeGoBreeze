import React from 'react';
import { Alert } from 'react-bootstrap';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, getPokemonFormWithNoneSpecialForm } from '../../../util/utils';
import { IAlertReleasedComponent } from '../../models/page.model';
import { VariantType } from '../../../enums/type.enum';

const AlertReleased = (props: IAlertReleasedComponent) => {
  return (
    <>
      {!props.isReleased && (
        <Alert variant={VariantType.Danger}>
          <h5 className="text-danger" style={{ margin: 0 }}>
            {'* '}
            <b>
              {splitAndCapitalize(getPokemonFormWithNoneSpecialForm(props.formName?.replaceAll(' ', '-'), props.pokemonType), '_', ' ')}
            </b>
            {' not released in Pokémon GO'}
            <img width={50} height={50} style={{ marginLeft: 10 }} alt="pokemon-go-icon" src={APIService.getPokemonGoIcon(props.icon)} />
          </h5>
        </Alert>
      )}
    </>
  );
};

export default AlertReleased;
