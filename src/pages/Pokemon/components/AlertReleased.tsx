import React from 'react';
import { Alert } from 'react-bootstrap';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, convertPokemonAPIDataName } from '../../../util/Utils';

const AlertReleased = (props: { released: boolean; formName: string | undefined; icon: string | undefined }) => {
  return (
    <>
      {!props.released && (
        <Alert variant="danger">
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
