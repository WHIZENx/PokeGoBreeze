import React from 'react';
import APIService from '../../services/api.service';
import { getWeatherDisplayName } from '../../utils/utils';
import { combineClasses } from '../../utils/extension';

interface QuickWeatherSelectProps {
  weather: string[];
  value: string;
  onChange: (value: string) => void;
}

const QuickWeatherSelect = ({ weather, value, onChange }: QuickWeatherSelectProps) => (
  <div
    className="tw-grid tw-grid-cols-4 tw-gap-2 sm:tw-grid-cols-7"
    role="group"
    aria-label="Quick select weather"
    data-testid="quick-weather-select"
  >
    {weather.map((item) => {
      const selected = item === value;
      const label = getWeatherDisplayName(item);
      return (
        <button
          key={item}
          type="button"
          className={combineClasses(
            'tw-flex tw-min-w-0 tw-flex-col tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-solid tw-border-gray-400 tw-bg-table-primary tw-p-2 tw-transition-colors hover:tw-border-primary focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-primary',
            selected && '!tw-border-primary tw-bg-table-info'
          )}
          aria-label={label}
          aria-pressed={selected}
          title={label}
          onClick={() => onChange(item)}
        >
          <img className="tw-h-10 tw-w-10 tw-object-contain" alt="" src={APIService.getWeatherSprite(item)} />
          <span className="tw-mt-1 tw-w-full tw-truncate tw-text-caption">{label}</span>
        </button>
      );
    })}
  </div>
);

export default QuickWeatherSelect;
