import React, { useState } from 'react';
import Input from './Input';
import { LabelType } from '../../enums/type.enum';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IInputSearchComponent } from '../models/component.model';

const InputSearch = (props: IInputSearchComponent) => {
  const [searchTerm, setSearchTerm] = useState(props.value || '');
  const handleOnChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    props.onChange?.(event.target.value);
  };

  const handleOnKeyUpSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
    props.onKeyUp?.(event, event.currentTarget.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (props.onChange) {
      props.onChange('');
    } else if (props.onKeyUp) {
      props.onKeyUp({} as React.KeyboardEvent<HTMLInputElement>, '');
    }
  };

  return (
    <Input
      prepend={
        props.prepend
          ? [
              {
                type: LabelType.Text,
                value: props.prepend,
              },
            ]
          : undefined
      }
      append={
        !props.isHideIcon
          ? [
              {
                type: LabelType.Text,
                className: 'cursor-pointer',
                value: searchTerm ? <CloseIcon color="error" /> : <SearchIcon />,
                onClick: searchTerm ? handleClear : props.onSearch,
              },
            ]
          : undefined
      }
      controls={[
        {
          ...props,
          size: props.size || 12,
          value: searchTerm,
          className: 'input-search',
          onChange: handleOnChangeSearch,
          onKeyUp: handleOnKeyUpSearch,
        },
      ]}
    />
  );
};

export default InputSearch;
