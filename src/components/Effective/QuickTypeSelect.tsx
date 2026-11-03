import React from 'react';
import IconType from '../Sprites/Icon/Type/Type';
import { capitalize } from '../../utils/utils';
import { combineClasses, isIncludeList } from '../../utils/extension';

interface QuickTypeSelectProps {
  types: string[];
  value: string;
  onChange: (value: string) => void;
  disabledTypes?: string[];
  ariaLabel: string;
}

const QuickTypeSelect = ({ types, value, onChange, disabledTypes = [], ariaLabel }: QuickTypeSelectProps) => (
  <div
    className="tw-grid tw-grid-cols-6 tw-gap-2 sm:tw-grid-cols-9"
    role="group"
    aria-label={ariaLabel}
    data-testid="quick-type-select"
  >
    {types.map((type) => {
      const selected = type === value;
      const disabled = !selected && isIncludeList(disabledTypes, type);
      return (
        <button
          key={type}
          type="button"
          className={combineClasses(
            'tw-flex tw-h-11 tw-min-w-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-solid tw-border-gray-400 tw-bg-table-primary tw-p-1.5 tw-transition-colors hover:tw-border-primary focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-primary',
            selected && '!tw-border-primary tw-bg-table-info',
            disabled && 'tw-cursor-not-allowed tw-opacity-35'
          )}
          aria-label={capitalize(type)}
          aria-pressed={selected}
          disabled={disabled}
          title={capitalize(type)}
          onClick={() => onChange(type)}
        >
          <IconType type={type} width={32} height={32} alt="" className="tw-pointer-events-none" />
        </button>
      );
    })}
  </div>
);

export default QuickTypeSelect;
