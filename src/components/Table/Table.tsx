import React from 'react';
import { ITableComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';

const Table = (props: ITableComponent) => {
  return (
    <table className={combineClasses('table-info', props.tableClass || 'table-result')}>
      <thead />
      <tbody>
        {props.rows.map((row, index) => (
          <tr key={index} className={row.isSubTitle ? 'text-center' : ''}>
            <td
              className={combineClasses(row.className, row.isSubTitle ? 'table-sub-header' : '')}
              colSpan={row.isSubTitle ? row.colSpan : undefined}
            >
              {row.value}
            </td>
            {row.subRows?.map((subRow, subIndex) => (
              <td key={subIndex} colSpan={subRow.colSpan} className={subRow.className}>
                {subRow.value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
