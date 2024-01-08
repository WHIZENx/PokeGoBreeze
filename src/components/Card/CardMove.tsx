import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../util/Utils';
import { StoreState } from '../../store/models/state.model';
import { Combat } from '../../core/models/combat.model';
import { SelectMoveModel } from '../Input/models/select-move.model';

const CardMove = (props: { value: SelectMoveModel | Combat | undefined }) => {
  const combat = useSelector((state: StoreState) => state.store.data?.combat ?? []);

  const [data, setData]: [Combat | undefined, any] = useState();

  useEffect(() => {
    if (combat.length > 0 && props.value) {
      const move = combat.find((item) => item.name === props.value?.name);
      setData(move);
    }
  }, [combat, props.value]);

  return (
    <Fragment>
      {data && (
        <div className="d-flex align-items-center w-100 h-100" style={{ padding: 5, overflowX: 'hidden', whiteSpace: 'nowrap' }}>
          <img
            width={64}
            height={64}
            alt="type-logo"
            style={{ marginRight: 10 }}
            src={APIService.getTypeSprite(capitalize(data?.type ?? ''))}
          />
          <span style={{ marginRight: 5 }}>
            <b>{splitAndCapitalize(data?.name.replaceAll('_PLUS', '+'), '_', ' ')}</b>
          </span>
          <span className="d-flex">
            {data?.elite && <span className="type-icon-small ic elite-ic">Elite</span>}
            {data?.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}
            {data?.purified && <span className="type-icon-small ic purified-ic">Purified</span>}
            {data?.special && <span className="type-icon-small ic special-ic">Special</span>}
          </span>
        </div>
      )}
    </Fragment>
  );
};

export default CardMove;
