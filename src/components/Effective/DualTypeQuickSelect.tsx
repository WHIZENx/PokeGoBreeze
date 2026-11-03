import React from 'react';
import { combineClasses } from '../../utils/extension';
import QuickTypeSelect from './QuickTypeSelect';

export type TypeSlot = 'primary' | 'secondary';

interface DualTypeQuickSelectProps {
  types: string[];
  primaryType: string;
  secondaryType: string;
  activeSlot: TypeSlot;
  onActiveSlotChange: (slot: TypeSlot) => void;
  onPrimaryTypeChange: (value: string) => void;
  onSecondaryTypeChange: (value: string) => void;
  ariaLabel: string;
}

const slotClass = (active: boolean) =>
  combineClasses(
    'tw-rounded-full tw-border tw-border-solid tw-border-gray-400 tw-bg-table-primary tw-px-3 tw-py-1 tw-text-caption tw-font-medium hover:tw-border-primary',
    active && '!tw-border-primary !tw-bg-table-info !tw-text-default'
  );

const DualTypeQuickSelect = (props: DualTypeQuickSelectProps) => {
  const activeValue = props.activeSlot === 'primary' ? props.primaryType : props.secondaryType;
  const disabledTypes = [props.activeSlot === 'primary' ? props.secondaryType : props.primaryType].filter(Boolean);
  return (
    <div className="tw-mt-4">
      <div className="tw-mb-2 tw-flex tw-justify-center tw-gap-2" role="group" aria-label="Select type slot">
        <button
          type="button"
          className={slotClass(props.activeSlot === 'primary')}
          aria-pressed={props.activeSlot === 'primary'}
          onClick={() => props.onActiveSlotChange('primary')}
        >
          Type 1
        </button>
        <button
          type="button"
          className={slotClass(props.activeSlot === 'secondary')}
          aria-pressed={props.activeSlot === 'secondary'}
          onClick={() => props.onActiveSlotChange('secondary')}
        >
          Type 2
        </button>
      </div>
      <QuickTypeSelect
        types={props.types}
        value={activeValue}
        disabledTypes={disabledTypes}
        ariaLabel={props.ariaLabel}
        onChange={props.activeSlot === 'primary' ? props.onPrimaryTypeChange : props.onSecondaryTypeChange}
      />
    </div>
  );
};

export default DualTypeQuickSelect;
