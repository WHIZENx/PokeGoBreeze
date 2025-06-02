import * as React from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { ICustomInputComponent } from '../models/component.model';
import { Menu, MenuItem } from '@mui/material';
import { isNotEmpty } from '../../util/extension';

const CustomInput = (props: ICustomInputComponent) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement>();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(undefined);
  };

  return (
    <Paper className="d-flex align-items-center w-100 h-100 rounded-0">
      {isNotEmpty(props.menuItems) && (
        <>
          <IconButton
            className="p-2"
            aria-label="menu"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {props.menuItems?.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => {
                  item.onClick?.();
                  if (item.isClose) {
                    handleClose();
                  }
                }}
                disabled={item.disabled}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
      <InputBase
        className="ms-2"
        sx={{ flex: 1, minHeight: 40 }}
        placeholder={props.inputPlaceholder}
        defaultValue={props.defaultValue}
        onKeyUp={(e) => props.setSearchTerm?.(e.currentTarget.value)}
        inputProps={{ 'aria-label': props.inputPlaceholder }}
      />
      {!props.isAutoSearch && (
        <IconButton type="button" className="p-2" aria-label="search" onClick={() => props.setSearchData?.()}>
          <SearchIcon />
        </IconButton>
      )}
      {props.optionsIcon && <Divider className="m-1" sx={{ height: 28 }} orientation="vertical" />}
      <IconButton className="p-2" color="primary" aria-label="options" onClick={props.onOptionsClick}>
        {props.optionsIcon}
      </IconButton>
    </Paper>
  );
};

export default CustomInput;
