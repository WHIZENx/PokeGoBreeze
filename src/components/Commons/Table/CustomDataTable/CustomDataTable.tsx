import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { Button, Modal } from 'react-bootstrap';
import SettingsIcon from '@mui/icons-material/Settings';
import { StyleSheetManager } from 'styled-components';
import { ICustomDataTableProps } from '../../models/component.model';
import { convertColumnDataType, isIncludeList } from '../../../../utils/extension';
import { getCustomThemeDataTable } from '../../../../utils/utils';
import { isNotEmpty } from '../../../../utils/extension';
import { debounce } from 'lodash';
import { VariantType } from '../../../../enums/type.enum';
import CustomInput from '../../Input/CustomInput';
import { StyleSheetConfig } from '../../../../utils/configs/style-sheet.config';
import { IncludeMode } from '../../../../utils/enums/string.enum';

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

  const handleCloseOption = () => {
    setShowOption(false);
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
                optionsIcon={props.isShowModalOptions ? <SettingsIcon className="u-fs-5" /> : undefined}
              />
            )
          }
          columns={(props.customColumns ? convertColumnDataType(props.customColumns) : props.columns) || []}
          customStyles={getCustomThemeDataTable(setCustomStyle())}
          data={pokemonListFilter}
        />
      </StyleSheetManager>

      {props.isShowModalOptions && (
        <Modal show={showOption} onHide={handleCloseOption} centered>
          <Modal.Header closeButton>
            <Modal.Title>{props.titleModalOptions}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="overflow-y-auto" style={{ maxHeight: '60vh', maxWidth: 400 }}>
              {props.customOptionsModal?.()}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant={VariantType.Secondary} onClick={handleCloseOption}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default CustomDataTable;
