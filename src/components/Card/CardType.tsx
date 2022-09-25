import React, { Fragment } from 'react';
import APIService from '../../services/API.service';

const CardType = (props: any) => {
  return (
    <Fragment>
      {props.value ? (
        <Fragment>
          <img width={64} height={64} alt="type-logo" style={{ marginRight: 10 }} src={APIService.getTypeSprite(props.value)} />
          <b>{props.name ?? props.value}</b> {props.elite && <span className="type-icon-small ic elite-ic">Elite</span>}
          {props.shadow && <span className="type-icon-small ic shadow-ic">Shadow</span>}
          {props.purified && <span className="type-icon-small ic purified-ic">Purified</span>}
        </Fragment>
      ) : (
        <Fragment>
          <div className="d-flex justify-content-center align-items-center w-100" style={{ height: 64 }}>
            <b>- Select -</b>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default CardType;
