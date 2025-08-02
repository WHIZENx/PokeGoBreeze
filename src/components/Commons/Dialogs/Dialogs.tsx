import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { IDialogMuiComponent } from '../models/component.model';
import ButtonMui from '../Buttons/ButtonMui';
import { styled } from '@mui/material/styles';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const DialogMui = (props: IDialogMuiComponent) => {
  return (
    <CustomDialog
      open={props.open || false}
      onClose={props.onClose}
      keepMounted={props.keepMounted || false}
      fullWidth
      maxWidth={props.width || 'md'}
    >
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent dividers>
        {typeof props.content === 'string' ? (
          <DialogContentText>{props.content}</DialogContentText>
        ) : (
          <>{props.content}</>
        )}
      </DialogContent>
      <DialogActions>
        {props.actions?.map((action, index) => (
          <ButtonMui
            key={index}
            onClick={action?.isClose ? props.onClose : action?.onClick}
            label={action.label}
            variant={action.variant}
            color={action.color}
          />
        ))}
      </DialogActions>
    </CustomDialog>
  );
};

export default DialogMui;
