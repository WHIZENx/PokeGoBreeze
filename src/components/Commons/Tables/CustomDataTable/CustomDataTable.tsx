import React, { useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import SettingsIcon from '@mui/icons-material/Settings';
import { StyleSheetManager } from 'styled-components';
import { ICustomDataTableProps } from '../../models/component.model';
import { convertColumnDataType, isIncludeList } from '../../../../utils/extension';
import { getCustomThemeDataTable } from '../../../../utils/utils';
import { debounce } from 'lodash';
import CustomInput from '../../Inputs/CustomInput';
import { StyleSheetConfig } from '../../../../utils/configs/style-sheet.config';
import { IncludeMode } from '../../../../utils/enums/string.enum';
import DialogMui from '../../Dialogs/Dialogs';
import CustomDataTablePagination from './CustomDataTablePagination';

const CustomDataTable = <T,>(props: ICustomDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);
  const [sortReset, setSortReset] = useState<{
    columnId: string | number | null | undefined;
    direction: 'asc' | 'desc';
    version: number;
  }>();
  const onSearchTermChangeRef = useRef(props.onSearchTermChange);
  const lastSortedColumnRef = useRef<Parameters<NonNullable<typeof props.onSort>>[0]>();

  const [showOption, setShowOption] = useState(false);

  const setSearchData = (isAutoSearch = false) => {
    const results = props.data?.filter((item) => {
      if (props.paginationServer || !props.searchFunction || !isAutoSearch) {
        return true;
      }
      return props.searchFunction(item, searchTerm);
    });
    setPokemonListFilter(results || []);
  };

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setSearchData(props.isAutoSearch);
    }, props.debounceTime || 0);
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [props.data, props.searchFunction, searchTerm]);

  useEffect(() => {
    onSearchTermChangeRef.current = props.onSearchTermChange;
  }, [props.onSearchTermChange]);

  useEffect(() => {
    const notifySearch = debounce(() => onSearchTermChangeRef.current?.(searchTerm), props.debounceTime || 0);
    notifySearch();
    return () => notifySearch.cancel();
  }, [props.debounceTime, searchTerm]);

  const handleShowOption = () => {
    setShowOption(true);
  };

  const handleSort: NonNullable<typeof props.onSort> = (column, direction, sortedRows, sortColumns) => {
    if (sortColumns.length === 0 && lastSortedColumnRef.current) {
      const sortedColumn = lastSortedColumnRef.current;
      setSortReset((current) => ({
        columnId: sortedColumn.id,
        direction,
        version: (current?.version ?? 0) + 1,
      }));
      props.onSort?.(sortedColumn, direction, sortedRows, [
        {
          column: sortedColumn,
          sortDirection: direction,
        },
      ]);
      return;
    }

    lastSortedColumnRef.current = column;
    props.onSort?.(column, direction, sortedRows, sortColumns);
  };

  const setCustomStyle = () => {
    const data = props.customDataStyles;
    if (!data) {
      return {
        tableWrapper: {
          style: {
            display: 'block',
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
          },
        },
        subHeader: {
          style: {
            padding: 0,
            minHeight: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
        },
      };
    }
    return {
      ...data,
      tableWrapper: {
        ...data.tableWrapper,
        style: {
          ...data.tableWrapper?.style,
          display: 'block',
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
        },
      },
      subHeader: {
        ...data.subHeader,
        style: {
          ...data.subHeader?.style,
          padding: 0,
          minHeight: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
      },
    };
  };

  return (
    <>
      <StyleSheetManager
        shouldForwardProp={(prop: string) =>
          !isIncludeList(StyleSheetConfig.NotAllowProps, prop, IncludeMode.IncludeIgnoreCaseSensitive)
        }
      >
        <div className="rdt-v7-compat">
          <DataTable
            key={sortReset?.version}
            {...props}
            defaultSortFieldId={sortReset?.columnId ?? props.defaultSortFieldId}
            defaultSortAsc={sortReset ? sortReset.direction === 'asc' : props.defaultSortAsc}
            headerSeparator={props.headerSeparator ?? false}
            onSort={handleSort}
            paginationComponent={props.paginationComponent ?? CustomDataTablePagination}
            progressSkeleton={props.progressSkeleton ?? false}
            subHeader={
              props.isShowSearch && (
                <CustomInput
                  menuItems={props.menuItems}
                  isAutoSearch={props.isAutoSearch}
                  setSearchData={() => setSearchData(true)}
                  inputPlaceholder={props.inputPlaceholder}
                  defaultValue={searchTerm}
                  setSearchTerm={(value) => {
                    setSearchTerm(value);
                  }}
                  onOptionsClick={handleShowOption}
                  optionsIcon={props.isShowModalOptions ? <SettingsIcon className="tw-text-xl" /> : undefined}
                />
              )
            }
            columns={(props.customColumns ? convertColumnDataType(props.customColumns) : props.columns) || []}
            customStyles={getCustomThemeDataTable(setCustomStyle())}
            data={props.paginationServer ? props.data || [] : pokemonListFilter}
          />
        </div>
      </StyleSheetManager>

      {props.isShowModalOptions && (
        <DialogMui
          open={showOption}
          onClose={() => setShowOption(false)}
          title={props.titleModalOptions}
          content={props.customOptionsModal?.()}
          actions={[
            {
              label: 'Close',
              color: 'tertiary',
              isClose: true,
            },
          ]}
        />
      )}
    </>
  );
};

export default CustomDataTable;
