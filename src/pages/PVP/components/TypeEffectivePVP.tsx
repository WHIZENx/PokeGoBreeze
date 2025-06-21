import React from 'react';
import TypeEffectiveSelect from '../../../components/Effective/TypeEffectiveSelect';
import { TypeEffectiveComponent } from '../models/component.model';
import { getKeyWithData } from '../../../utils/utils';
import { EffectiveType } from '../../../components/Effective/enums/type-effective.enum';

const TypeEffectivePVP = (props: TypeEffectiveComponent) => {
  const renderTypeEffective = (effType: EffectiveType) => (
    <div className="col-lg-4 mb-3">
      <div className="h-100">
        <h6
          className={`d-flex justify-content-center ${getKeyWithData(EffectiveType, effType)?.toLowerCase()}-bg-text`}
        >
          <b>{getKeyWithData(EffectiveType, effType)}</b>
        </h6>
        <hr className="w-100" />
        {<TypeEffectiveSelect effect={effType} types={props.types} />}
      </div>
      <hr className="w-100 m-0" />
    </div>
  );
  return (
    <div className="row text-white">
      {renderTypeEffective(EffectiveType.Weakness)}
      {renderTypeEffective(EffectiveType.Neutral)}
      {renderTypeEffective(EffectiveType.Resistance)}
    </div>
  );
};

export default TypeEffectivePVP;
