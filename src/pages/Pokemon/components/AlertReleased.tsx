import React from 'react';
import { Alert } from 'react-bootstrap';
import APIService from '../../../services/API.service';
import { splitAndCapitalize, convertName } from '../../../util/Utils';
import { FORM_ARMOR } from '../../../util/Constants';

const AlertReleased = (props: { released: boolean; formName: string | undefined; icon: string | undefined }) => {
  return (
    <>
      {!props.released && (
        <Alert variant="danger">
          <h5 className="text-danger" style={{ margin: 0 }}>
            * <b>{splitAndCapitalize(convertName(props.formName?.replaceAll(' ', '-')).replace(/_A$/g, `_${FORM_ARMOR}`), '_', ' ')}</b> not
            released in Pokémon GO
            <img
              width={50}
              height={50}
              style={{ marginLeft: 10 }}
              alt="pokemon-go-icon"
              src={APIService.getPokemonGoIcon(props.icon ?? 'Standard')}
            />
          </h5>
        </Alert>
      )}
    </>
  );
};

export default AlertReleased;
