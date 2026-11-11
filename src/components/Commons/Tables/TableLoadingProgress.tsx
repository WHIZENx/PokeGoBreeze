import { LinearProgress } from '@mui/material';

interface TableLoadingProgressProps {
  loading: boolean;
  label?: string;
}

const TableLoadingProgress = ({ loading, label = 'Loading table data' }: TableLoadingProgressProps) =>
  loading ? (
    <LinearProgress aria-label={label} className="!tw-absolute tw-inset-x-0 tw-bottom-0" color="primary" />
  ) : null;

export default TableLoadingProgress;
