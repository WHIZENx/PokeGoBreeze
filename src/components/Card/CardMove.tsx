import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import APIService from '../../services/API.service';
import { capitalize, isNotEmpty, splitAndCapitalize } from '../../util/utils';
import { StoreState } from '../../store/models/state.model';
import { ICombat } from '../../core/models/combat.model';
import { FORM_PURIFIED, FORM_SHADOW } from '../../util/constants';
import { ICardMoveComponent } from '../models/component.model';
import { getValueOrDefault } from '../../util/models/util.model';

const CardMove = (props: ICardMoveComponent) => {
  const combat = useSelector((state: StoreState) => getValueOrDefault(Array, state.store.data?.combat));

  const [data, setData] = useState<ICombat>();

  useEffect(() => {
    if (isNotEmpty(combat) && props.value) {
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
            src={APIService.getTypeSprite(capitalize(getValueOrDefault(String, data.type)))}
          />
          <span style={{ marginRight: 5 }}>
            <b>{splitAndCapitalize(data.name, '_', ' ')}</b>
          </span>
          <span className="d-flex">
            {data.elite && <span className="type-icon-small ic elite-ic">Elite</span>}
            {data.shadow && <span className="type-icon-small ic shadow-ic">{capitalize(FORM_SHADOW)}</span>}
            {data.purified && <span className="type-icon-small ic purified-ic">{capitalize(FORM_PURIFIED)}</span>}
            {data.special && <span className="type-icon-small ic special-ic">Special</span>}
          </span>
        </div>
      )}
    </Fragment>
  );
};

export default CardMove;
