import React from 'react';
import { ITableComponent } from '../models/component.model';
import { combineClasses, isUndefined } from '../../utils/extension';

const Table = (props: ITableComponent) => {
  return (
    <table
      className={combineClasses(
        (isUndefined(props.isTableInfo) || props.isTableInfo) && 'table-info',
        props.tableClass || 'table-result'
      )}
    >
      {props.colGroups?.map((colGroup, index) => (
        <colgroup key={index} className={colGroup.className}>
          {colGroup.cols?.map((col, colIndex) => (
            <col key={colIndex} className={col.className} />
          ))}
        </colgroup>
      ))}
      <thead>
        {props.headerRows?.map((row, index) => (
          <tr key={index} className={combineClasses(row.className, row.align && `text-${row.align}`)}>
            {row.subRows?.map((subRow, subIndex) => (
              <td
                key={subIndex}
                className={combineClasses(subRow.className, subRow.isSubTitle && 'table-sub-header')}
                colSpan={subRow.colSpan}
              >
                {subRow.value}
              </td>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {props.rows?.map((row, index) => (
          <tr key={index} className={combineClasses(row.className, row.align && `text-${row.align}`)}>
            {row.subRows?.map((subRow, subIndex) => (
              <td
                key={subIndex}
                className={combineClasses(subRow.className, subRow.isSubTitle && 'table-sub-header')}
                colSpan={subRow.colSpan}
              >
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
