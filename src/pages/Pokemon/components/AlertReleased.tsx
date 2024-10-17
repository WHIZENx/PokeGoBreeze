import React from 'react';
import { Alert } from 'react-bootstrap';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, convertPokemonAPIDataName } from '../../../util/utils';
import { IAlertReleasedComponent } from '../../models/page.model';
import { VariantType } from '../../../enums/type.enum';

const AlertReleased = (props: IAlertReleasedComponent) => {
  return (
    <>
      {!props.released && (
        <Alert variant={VariantType.Danger}>
          <h5 className="text-danger" style={{ margin: 0 }}>
            * <b>{splitAndCapitalize(convertPokemonAPIDataName(props.formName?.replaceAll(' ', '-')), '_', ' ')}</b> not released in Pokémon
            GO
            <img width={50} height={50} style={{ marginLeft: 10 }} alt="pokemon-go-icon" src={APIService.getPokemonGoIcon(props.icon)} />
          </h5>
        </Alert>
      )}
    </>
  );
};

export default AlertReleased;
