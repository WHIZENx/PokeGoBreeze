import React from 'react';
import { combineClasses } from '../../../utils/extension';

interface DataTableSortIconProps {
  direction: 'asc' | 'desc';
  className?: string;
}

const DataTableSortIcon = ({ direction, className }: DataTableSortIconProps) => (
  <span
    aria-hidden="true"
    className={combineClasses(
      'tw-ml-0.5 tw-inline-flex tw-shrink-0 tw-grow-0 tw-transition-opacity tw-duration-150',
      className
    )}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="presentation"
      className="tw-h-[var(--rdt-sort-icon-size,12px)] tw-w-[var(--rdt-sort-icon-size,12px)] tw-transition-transform tw-duration-150"
      style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M12 19V5M6 11L12 5L18 11" />
    </svg>
  </span>
);

export default DataTableSortIcon;
