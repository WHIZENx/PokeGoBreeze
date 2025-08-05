import React from 'react';
import { IToggleTypeComponent } from '../models/component.model';
import ToggleGroupMui from './ToggleGroupMui';
import { getTypes } from '../../../utils/helpers/options-context.helpers';
import TypeInfo from '../../Sprites/Type/Type';

const ToggleType = (props: IToggleTypeComponent) => {
  const { onSelectType, ...toggleProps } = props;

  return (
    <ToggleGroupMui
      {...toggleProps}
      className="row"
      isDivContain
      isDivClassName="col tw-inline-block tw-vertical-align-top !tw-m-0 !tw-p-0"
      isNoneBorder
      toggles={getTypes()?.map((item) => ({
        label: <TypeInfo isBlock arr={[item]} />,
        value: item,
        onClick: () => onSelectType?.(item),
      }))}
    />
  );
};

export default ToggleType;
