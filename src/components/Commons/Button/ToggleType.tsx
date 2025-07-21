import React from 'react';
import { IToggleTypeComponent } from '../models/component.model';
import ToggleGroupMui from './ToggleGroupMui';
import { getTypes } from '../../../utils/helpers/options-context.helpers';
import TypeInfo from '../../Sprites/Type/Type';
import { combineClasses } from '../../../utils/extension';

const ToggleType = (props: IToggleTypeComponent) => {
  const { onSelectType, ...toggleProps } = props;

  return (
    <ToggleGroupMui
      {...toggleProps}
      className={combineClasses('row', props.fullWidth ? 'w-100' : '')}
      isDivContain
      isDivClassName="col img-group m-0 p-0"
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
