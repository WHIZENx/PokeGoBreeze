import React, { useEffect, useState } from 'react';
import './IVBar.scss';
import { IIVBarComponent } from '../../models/component.model';
import { combineClasses } from '../../../utils/extension';

const IVBar = (props: IIVBarComponent) => {
  const [ivWidthFirst, setIvWidthFirst] = useState(0);
  const [ivWidthSec, setIvWidthSec] = useState(0);
  const [ivWidthThird, setIvWidthThird] = useState(0);

  useEffect(() => {
    if (props.iv < 0) {
      setIvWidthFirst(0);
      setIvWidthSec(0);
      setIvWidthThird(0);
    }
  }, [props.iv]);

  useEffect(() => {
    setIvWidthFirst(props.iv < 5 ? 20 * props.iv : 100);
    setIvWidthSec(props.iv >= 5 ? (props.iv < 10 ? 20 * (props.iv - 5) : 100) : 0);
    setIvWidthThird(props.iv >= 10 ? (props.iv < 15 ? 20 * (props.iv - 10) : 100) : 0);
  }, [props.iv]);

  return (
    <div className="iv-container tw-mt-2" style={props.style}>
      <div className="tw-flex tw-justify-between tw-w-[99%]">
        <b>{props.title}</b>
        <b>{props.iv}</b>
      </div>
      <div className="iv-bg-group">
        <div className="iv iv-first-child tw-relative">
          <div
            className={combineClasses(
              `tw-absolute iv-bar tw-w-[${ivWidthFirst}%]`,
              props.iv <= 5 ? 'border-right-iv' : ''
            )}
          />
          <div className="iv-bg-bar tw-w-full" />
        </div>
        <div className="iv tw-relative">
          <div
            className={combineClasses(
              `tw-absolute iv-bar tw-w-[${ivWidthSec}%]`,
              props.iv > 5 && props.iv <= 10 ? 'border-right-iv' : ''
            )}
          />
          <div className="iv-bg-bar tw-w-full" />
        </div>
        <div className="iv iv-last-child tw-relative">
          <div
            className={combineClasses(
              `tw-absolute iv-bar tw-w-[${ivWidthThird}%]`,
              props.iv > 10 ? 'border-right-iv' : ''
            )}
          />
          <div className="iv-bg-bar tw-w-full" />
        </div>
      </div>
    </div>
  );
};

export default IVBar;
