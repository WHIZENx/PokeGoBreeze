import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const CircularProgressTable = () => {
  return (
    <div className="theme-bg-default w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="m-2">
        <CircularProgress />
      </div>
    </div>
  );
};

export default CircularProgressTable;
