import React, { useEffect, useState } from 'react';
import Input from './Input';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IInputSearchComponent } from '../models/component.model';
import { combineClasses } from '../../utils/extension';

const InputSearch = (props: IInputSearchComponent) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(props.value || '');
  }, [props.value]);

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
    if (props.onRemove) {
      props.onRemove();
    }
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
                value: props.prepend,
              },
            ]
          : undefined
      }
      append={
        !props.isHideIcon
          ? [
              {
                className: 'cursor-pointer',
                value: searchTerm || props.isShowRemove ? <CloseIcon color="error" /> : <SearchIcon />,
                onClick: searchTerm || props.isShowRemove ? handleClear : props.onSearch,
              },
            ]
          : undefined
      }
      controls={[
        {
          placeholder: props.placeholder,
          onBlur: props.onBlur,
          onFocus: props.onFocus,
          style: props.style,
          value: searchTerm,
          className: combineClasses('input-search', props.className),
          onChange: handleOnChangeSearch,
          onKeyUp: handleOnKeyUpSearch,
        },
      ]}
    />
  );
};

export default InputSearch;
