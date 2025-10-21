import React from 'react';
import TypeEffectiveSelect from '../../../components/Effective/TypeEffectiveSelect';
import { TypeEffectiveComponent } from '../models/component.model';
import { getKeyWithData } from '../../../utils/utils';
import { EffectiveType } from '../../../components/Effective/enums/type-effective.enum';

const TypeEffectivePVP = (props: TypeEffectiveComponent) => {
  const renderTypeEffective = (effType: EffectiveType) => (
    <div className="lg:tw-w-1/3 tw-mb-3">
      <div className="tw-h-full">
        <h6 className={`tw-flex tw-justify-center ${getKeyWithData(EffectiveType, effType)?.toLowerCase()}-bg-text`}>
          <b>{getKeyWithData(EffectiveType, effType)}</b>
        </h6>
        <hr className="tw-w-full" />
        {<TypeEffectiveSelect effect={effType} types={props.types} />}
      </div>
      <hr className="tw-w-full !tw-m-0" />
    </div>
  );
  return (
    <div className="row tw-text-white text-shadow-black">
      {renderTypeEffective(EffectiveType.Weakness)}
      {renderTypeEffective(EffectiveType.Neutral)}
      {renderTypeEffective(EffectiveType.Resistance)}
    </div>
  );
};

export default TypeEffectivePVP;
