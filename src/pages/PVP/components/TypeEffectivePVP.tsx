import React from 'react';
import TypeEffectiveSelect from '../../../components/Effective/TypeEffectiveSelect';
import { EffectiveType } from '../enums/type-eff.enum';
import { TypeEffectiveComponent } from '../models/component.model';

const TypeEffectivePVP = (props: TypeEffectiveComponent) => {
  return (
    <div className="row text-white">
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center weakness-bg-text">
            <b>Weakness</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.Weak} types={props.types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center neutral-bg-text">
            <b>Neutral</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.Neutral} types={props.types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
      <div className="col-lg-4" style={{ marginBottom: 15 }}>
        <div className="h-100">
          <h6 className="d-flex justify-content-center resistance-bg-text">
            <b>Resistance</b>
          </h6>
          <hr className="w-100" />
          {<TypeEffectiveSelect effect={EffectiveType.Resistance} types={props.types} />}
        </div>
        <hr className="w-100" style={{ margin: 0 }} />
      </div>
    </div>
  );
};

export default TypeEffectivePVP;
