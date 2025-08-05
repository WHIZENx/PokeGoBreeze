import React, { useEffect, useState } from 'react';
import { camelCase, splitAndCapitalize } from '../../../utils/utils';
import { ISelectTypeComponent } from '../models/component.model';
import Card from '../../Card/Card';
import { isIncludeList } from '../../../utils/extension';
import { IncludeMode } from '../../../utils/enums/string.enum';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

const SelectTypeComponent = <T extends object>(props: ISelectTypeComponent<T>) => {
  const [types, setTypes] = useState<string[]>([]);
  const [showType, setShowType] = useState(false);

  useEffect(() => {
    const results = Object.keys(props.data).filter(
      (item) => !isIncludeList(props.filterType, item, IncludeMode.IncludeIgnoreCaseSensitive)
    );
    setTypes(results);
  }, [props.filterType, props.data]);

  const changeType = (value: string) => {
    setShowType(false);
    props.setCurrentType(camelCase(value));
  };

  const closeType = () => {
    setShowType(false);
    props.setCurrentType('');
  };
  return (
    <div>
      <h6 className="tw-text-center">
        <b>{props.title}</b>
      </h6>
      <div className="tw-flex tw-justify-center">
        <div
          className="card-input tw-mb-3"
          tabIndex={0}
          onClick={() => setShowType(true)}
          onBlur={() => setShowType(false)}
        >
          <div className="card-select tw-h-full tw-flex tw-justify-between tw-items-center">
            <Card value={splitAndCapitalize(props.currentType, /(?=[A-Z])/, ' ')} cardType={props.cardType} />
            {props.isShowRemove && props.currentType && (
              <IconButton className="tw-h-fit" sx={{ color: 'red' }} onMouseDown={closeType}>
                <CloseIcon />
              </IconButton>
            )}
          </div>
          {showType && (
            <div className="result-type">
              <ul>
                {types.map((value, index) => (
                  <li className="tw-container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                    <Card value={splitAndCapitalize(value, /(?=[A-Z])/, ' ')} cardType={props.cardType} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectTypeComponent;
