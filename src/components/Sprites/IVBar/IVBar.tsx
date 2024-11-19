import React, { useEffect, useRef, useState } from 'react';
import './IVBar.scss';
import { IIVBarComponent } from '../../models/component.model';
import { combineClasses, toNumber } from '../../../util/extension';

const IVBar = (props: IIVBarComponent) => {
  const iv = useRef(toNumber(props.iv));
  const [ivWidthFirst, setIvWidthFirst] = useState(0);
  const [ivWidthSec, setIvWidthSec] = useState(0);
  const [ivWidthThird, setIvWidthThird] = useState(0);

  useEffect(() => {
    setIvWidthFirst(iv.current < 5 ? 20 * iv.current : 100);
    setIvWidthSec(iv.current >= 5 ? (iv.current < 10 ? 20 * (iv.current - 5) : 100) : 0);
    setIvWidthThird(iv.current >= 10 ? (iv.current < 15 ? 20 * (iv.current - 10) : 100) : 0);
  }, [props.iv]);

  return (
    <div className="iv-container element-top" style={props.style}>
      <div className="d-flex justify-content-between" style={{ width: '99%' }}>
        <b>{props.title}</b>
        <b>{props.iv}</b>
      </div>
      <div className="iv-bg-group">
        <div className="iv iv-first-child position-relative">
          <div
            style={{ width: `${ivWidthFirst}%` }}
            className={combineClasses('position-absolute iv-bar', iv.current <= 5 ? 'border-right-iv' : '')}
          />
          <div className="iv-bg-bar w-100" />
        </div>
        <div className="iv position-relative">
          <div
            style={{ width: `${ivWidthSec}%` }}
            className={combineClasses('position-absolute iv-bar', iv.current > 5 && iv.current <= 10 ? 'border-right-iv' : '')}
          />
          <div className="iv-bg-bar w-100" />
        </div>
        <div className="iv iv-last-child position-relative">
          <div style={{ width: `${ivWidthThird}%` }} className="position-absolute iv-bar" />
          <div className="iv-bg-bar w-100" />
        </div>
      </div>
    </div>
  );
};

export default IVBar;
