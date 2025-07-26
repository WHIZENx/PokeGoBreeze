import { ButtonBaseOwnProps } from '@mui/material';

export interface IAppMenuItem<T> {
  label: string | number | React.ReactNode;
  value?: number | string | T;
  subMenus?: IAppMenuItem<T>[];
  isHeader?: boolean;
  path?: string;
  icon?: React.ReactNode;
}

export interface IMenuItem<T> extends ButtonBaseOwnProps, IAppMenuItem<T> {
  onClick?: () => void;
  disabled?: boolean;
  isClose?: boolean;
  isSubHeader?: boolean;
  defaultChecked?: boolean;
}
