import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { ICustomDataTableProps } from '../../models/component.model';
import { convertColumnDataType } from '../../../util/extension';
import { getCustomThemeDataTable } from '../../../util/utils';
import { isNotEmpty } from '../../../util/extension';
import { debounce } from 'lodash';

const CustomDataTable = <T,>(props: ICustomDataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemonListFilter, setPokemonListFilter] = useState<T[]>([]);

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
  }, [props.data, searchTerm]);

  const subHeaderComponentMemo = React.useMemo(() => {
    return (
      <div className="d-flex">
        <span className="input-group-text">{props.inputName}</span>
        <input
          type="text"
          className="form-control input-search"
          placeholder={props.inputPlaceholder}
          defaultValue={searchTerm}
          onKeyUp={(e) => setSearchTerm(e.currentTarget.value)}
        />
      </div>
    );
  }, [searchTerm]);

  return (
    <DataTable
      {...props}
      subHeader={props.isShowSearch}
      subHeaderComponent={subHeaderComponentMemo}
      columns={(props.customColumns ? convertColumnDataType(props.customColumns) : props.columns) || []}
      customStyles={getCustomThemeDataTable(props.customDataStyles)}
      data={pokemonListFilter}
    />
  );
};

export default CustomDataTable;
