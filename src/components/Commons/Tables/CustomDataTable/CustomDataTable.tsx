import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import SettingsIcon from '@mui/icons-material/Settings';
import { StyleSheetManager } from 'styled-components';
import { ICustomDataTableProps } from '../../models/component.model';
import { convertColumnDataType, isIncludeList } from '../../../../utils/extension';
import { getCustomThemeDataTable } from '../../../../utils/utils';
import { isNotEmpty } from '../../../../utils/extension';
import { debounce } from 'lodash';
import CustomInput from '../../Inputs/CustomInput';
import { StyleSheetConfig } from '../../../../utils/configs/style-sheet.config';
import { IncludeMode } from '../../../../utils/enums/string.enum';
import DialogMui from '../../Dialogs/Dialogs';

const CustomDataTable = <T,>(props: ICustomDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);

  const [showOption, setShowOption] = useState(false);

  const setSearchData = (isAutoSearch = false) => {
    const results = props.data?.filter((item) => {
      if (!props.searchFunction || !isAutoSearch) {
        return true;
      }
      return props.searchFunction(item, searchTerm);
    });
    setPokemonListFilter(results || []);
  };

  useEffect(() => {
    if (isNotEmpty(props.data)) {
      const debouncedSearch = debounce(() => {
        setSearchData(props.isAutoSearch);
      }, props.debounceTime || 0);
      debouncedSearch();
      return () => {
        debouncedSearch.cancel();
      };
    }
  }, [props.data, props.searchFunction, searchTerm]);

  const handleShowOption = () => {
    setShowOption(true);
  };

  const setCustomStyle = () => {
    const data = props.customDataStyles;
    if (!data) {
      return {
        tableWrapper: {
          style: {
            display: props.isXFixed ? 'block' : 'table',
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
          display: props.isXFixed ? 'block' : 'table',
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
        <DataTable
          {...props}
          subHeader={props.isShowSearch}
          subHeaderComponent={
            props.isShowSearch && (
              <CustomInput
                menuItems={props.menuItems}
                isAutoSearch={props.isAutoSearch}
                setSearchData={() => setSearchData(true)}
                inputPlaceholder={props.inputPlaceholder}
                defaultValue={searchTerm}
                setSearchTerm={setSearchTerm}
                onOptionsClick={handleShowOption}
                optionsIcon={props.isShowModalOptions ? <SettingsIcon className="tw-text-xl" /> : undefined}
              />
            )
          }
          columns={(props.customColumns ? convertColumnDataType(props.customColumns) : props.columns) || []}
          customStyles={getCustomThemeDataTable(setCustomStyle())}
          data={pokemonListFilter}
        />
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
