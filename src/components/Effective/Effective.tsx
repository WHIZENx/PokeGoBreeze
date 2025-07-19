import React, { Fragment } from 'react';
import { IEffectiveComponent } from '../models/component.model';

const Effective = (props: IEffectiveComponent) => {
  return (
    <Fragment>
      {props.children && (
        <div className="mt-2">
          <h5 className="mt-2">
            <li>{props.title}</li>
          </h5>
          {props.children}
        </div>
      )}
    </Fragment>
  );
};

export default Effective;
