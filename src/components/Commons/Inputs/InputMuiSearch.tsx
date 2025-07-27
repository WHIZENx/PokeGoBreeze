import React, { useEffect, useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { IInputMuiSearchComponent } from '../models/component.model';
import { Box, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { InputSearchType } from './enums/input-type.enum';
import { combineClasses, isNotEmpty } from '../../../utils/extension';

const InputMuiSearch = (props: IInputMuiSearchComponent) => {
  const [searchTerm, setSearchTerm] = useState('');
  const position = useRef<'start' | 'end'>(props.inputType === InputSearchType.Prepend ? 'start' : 'end');
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchTerm(props.value || '');
  }, [props.value]);

  useEffect(() => {
    const paperElement = elementRef.current?.querySelector('.MuiPaper-root');

    const handleScroll = (event: Event) => {
      if (props.onScroll) {
        props.onScroll(event as unknown as React.UIEvent<HTMLDivElement, UIEvent>);
      }
    };

    if (paperElement) {
      paperElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (paperElement) {
        paperElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [elementRef.current]);

  const handleOnChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    props.onChange?.(event.target.value);
  };

  const handleOnKeyUpSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    props.onKeyUp?.(event);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onRemove) {
      onRemove();
    }
    if (props.onChange) {
      props.onChange('');
    } else if (props.onKeyUp) {
      props.onKeyUp({} as React.KeyboardEvent<HTMLInputElement>);
    }
  };

  const iconSearch = () => (
    <InputAdornment position={position.current}>
      {customIconStart && customIconStart}
      <IconButton
        disabled={textFieldProps.disabled}
        aria-label={searchTerm || isShowRemove ? 'clear' : 'search'}
        onClick={searchTerm || isShowRemove ? handleClear : props.onSearch}
        edge={position.current}
      >
        {searchTerm || isShowRemove ? (
          <CloseIcon color={textFieldProps.disabled ? 'disabled' : 'error'} />
        ) : (
          <SearchIcon />
        )}
      </IconButton>
      {customIconEnd && customIconEnd}
    </InputAdornment>
  );

  const {
    labelPrepend,
    isHideIcon,
    menuItems,
    maxHeight,
    customAppend,
    customPrepend,
    customIconStart,
    customIconEnd,
    isShowRemove,
    onRemove,
    sx,
    isNoWrap,
    prependRef,
    textRef,
    ...textFieldProps
  } = props;

  return (
    <Box className={combineClasses('input-control-group', isNoWrap ? 'flex-nowrap' : '')}>
      {labelPrepend && (
        <div ref={prependRef} className="input-group-text">
          {labelPrepend}
        </div>
      )}
      <TextField
        {...textFieldProps}
        ref={textRef}
        value={searchTerm}
        size={props.size || 'small'}
        onChange={props.onChange ? handleOnChangeSearch : undefined}
        onKeyUp={props.onKeyUp ? handleOnKeyUpSearch : undefined}
        InputProps={{
          startAdornment: isHideIcon
            ? undefined
            : position.current === 'start' || customPrepend
            ? customPrepend || iconSearch()
            : undefined,
          endAdornment: isHideIcon
            ? undefined
            : position.current === 'end' || customAppend
            ? customAppend || iconSearch()
            : undefined,
        }}
        SelectProps={{
          MenuProps: {
            ref: elementRef,
            id: `select-${props.id}`,
            sx: {
              '& .MuiPaper-root': {
                maxHeight: maxHeight || '100%',
              },
            },
          },
        }}
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: 0,
            width: props.width || '100%',
          },
          '& .MuiSelect-icon': {
            display: 'none',
          },
          alignItems: 'center',
          ...sx,
        }}
        fullWidth
        autoComplete="off"
        select={isNotEmpty(menuItems) && props.select}
      >
        {menuItems?.map((item, index) => (
          <MenuItem key={index} value={item.value} onClick={item.onClick} disabled={item.disabled}>
            {item.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default InputMuiSearch;
