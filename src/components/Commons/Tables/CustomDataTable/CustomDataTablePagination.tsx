import React from 'react';
import { TablePagination } from '@mui/material';
import { PaginationComponentProps } from 'react-data-table-component';

const CustomDataTablePagination = ({
  currentPage,
  onChangePage,
  onChangeRowsPerPage,
  paginationComponentOptions,
  paginationRowsPerPageOptions,
  rowCount,
  rowsPerPage,
}: PaginationComponentProps) => {
  const rowsPerPageOptions = paginationComponentOptions?.noRowsPerPage
    ? []
    : (paginationRowsPerPageOptions ?? [10, 15, 20, 25, 30]);

  return (
    <TablePagination
      className="rdt-mui-pagination tw-border-0 tw-bg-[var(--table-primary)] tw-text-[var(--text-primary)]"
      component="div"
      count={rowCount}
      page={Math.max(0, currentPage - 1)}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={paginationComponentOptions?.rowsPerPageText ?? 'Rows per page:'}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${paginationComponentOptions?.rangeSeparatorText ?? 'of'} ${count}`
      }
      onPageChange={(_, page) => onChangePage(page + 1, rowCount)}
      onRowsPerPageChange={(event) => onChangeRowsPerPage(Number(event.target.value), currentPage)}
      showFirstButton
      showLastButton
      slotProps={{
        select: {
          inputProps: {
            'aria-label': paginationComponentOptions?.rowsPerPageText ?? 'Rows per page',
          },
        },
      }}
    />
  );
};

export default CustomDataTablePagination;
