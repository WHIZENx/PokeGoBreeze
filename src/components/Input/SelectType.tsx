import React, { useEffect, useState } from 'react';
import { camelCase, splitAndCapitalize } from '../../utils/utils';
import { ISelectBadgeComponent } from '../models/component.model';
import CardType from '../Card/CardType';
import { isIncludeList } from '../../utils/extension';
import { IncludeMode } from '../../utils/enums/string.enum';

const SelectTypeComponent = <T extends object>(props: ISelectBadgeComponent<T>) => {
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
      <h6 className="text-center">
        <b>{props.title}</b>
      </h6>
      <div className=" d-flex justify-content-center">
        <div
          className="card-input mb-3"
          tabIndex={0}
          onClick={() => setShowType(true)}
          onBlur={() => setShowType(false)}
        >
          <div className="card-select">
            <CardType value={splitAndCapitalize(props.currentType, /(?=[A-Z])/, ' ')} isWeather={props.isWeather} />
            {props.isShowRemove && props.currentType && (
              <button
                type="button"
                className="btn-close btn-close-white remove-close"
                onMouseDown={closeType}
                aria-label="Remove"
              />
            )}
          </div>
          {showType && (
            <div className="result-type">
              <ul>
                {types.map((value, index) => (
                  <li className="container card-pokemon" key={index} onMouseDown={() => changeType(value)}>
                    <CardType value={splitAndCapitalize(value, /(?=[A-Z])/, ' ')} isWeather={props.isWeather} />
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
