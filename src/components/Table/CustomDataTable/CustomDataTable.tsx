import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { ICustomDataTableProps } from '../../models/component.model';
import { convertColumnDataType } from '../../../util/extension';
import { getCustomThemeDataTable } from '../../../util/utils';
import { isNotEmpty } from '../../../util/extension';
import { debounce } from 'lodash';
import SettingsIcon from '@mui/icons-material/Settings';
import { Button, Modal } from 'react-bootstrap';
import { VariantType } from '../../../enums/type.enum';
import CustomInput from '../../Input/CustomInput';

const CustomDataTable = <T,>(props: ICustomDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);

  const [showOption, setShowOption] = useState(false);

  useEffect(() => {
    if (isNotEmpty(props.data)) {
      const debouncedSearch = debounce(() => {
        const results = props.data?.filter((item) => {
          if (!props.searchFunction) {
            return true;
          }
          return props.searchFunction(item, searchTerm);
        });
        setPokemonListFilter(results || []);
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
      <DataTable
        {...props}
        subHeader={props.isShowSearch}
        subHeaderComponent={
          props.isShowSearch && (
            <CustomInput
              menuItems={props.menuItems}
              isAutoSearch={props.isAutoSearch}
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
