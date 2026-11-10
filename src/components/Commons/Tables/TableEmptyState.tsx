import React from 'react';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { combineClasses } from '../../../utils/extension';

interface TableEmptyStateProps {
  className?: string;
  description?: string;
  spacious?: boolean;
  testId?: string;
  title?: string;
}

const TableEmptyState = ({
  className,
  description = 'No data matches your current search or filters. Try adjusting or clearing them.',
  spacious = false,
  testId = 'table-filter-empty-state',
  title = 'No results found',
}: TableEmptyStateProps) => (
  <div
    className={combineClasses(
      'tw-flex tw-w-full tw-items-center tw-justify-center tw-px-4 tw-py-8',
      spacious ? 'tw-min-h-[360px]' : 'tw-min-h-64',
      className
    )}
    data-testid={testId}
    role="status"
  >
    <div className="tw-flex tw-w-full tw-max-w-2xl tw-flex-col tw-items-center tw-rounded tw-border tw-border-dashed tw-border-[var(--divider)] tw-bg-[var(--background-selected)] tw-px-6 tw-py-10 tw-text-center">
      <div className="tw-mb-4 tw-flex tw-h-20 tw-w-20 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--table-info)] tw-text-primary">
        <SearchOffRoundedIcon className="!tw-text-[3.5rem]" aria-hidden="true" />
      </div>
      <span className="tw-text-body1 tw-font-bold tw-text-[var(--text-primary)]">{title}</span>
      <span className="tw-mt-2 tw-max-w-xl tw-text-body2 tw-text-[var(--text-secondary)]">{description}</span>
    </div>
  </div>
);

export default TableEmptyState;
