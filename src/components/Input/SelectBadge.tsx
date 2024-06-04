import React from 'react';
import APIService from '../../services/API.service';
import { priorityBadge } from '../../util/Compute';
import { capitalize } from '../../util/Utils';

// eslint-disable-next-line no-unused-vars
const SelectBadge = (props: { type: string; priority: number; setPriority: (priority: number) => void }) => {
  const Badge = (text: string, priorityNumber: number) => {
    const spiritBadge = priorityBadge(priorityNumber);

    return (
      <div className="text-center">
        <div
          className={'position-relative frame-badge' + (props.priority === priorityNumber ? ' frame-badge-select' : '')}
          onClick={() => props.setPriority(priorityNumber)}
        >
          <span style={{ width: 40 }}>
            <img alt="frame-type" className={'frame-type-sprit' + (priorityNumber === 4 ? ' filter-platinum' : '')} src={spiritBadge} />
          </span>
          {priorityNumber > 0 && (
            <span className="position-badge" style={{ width: 20 }}>
              <img alt="badge-type" className="badge-type-sprit" src={APIService.getTypeHqSprite(capitalize(props.type))} />
            </span>
          )}
        </div>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="w-100 element-top">
      <div className="d-flex justify-content-center align-items-center">
        <div className={'type-icon-small ' + props.type.toLowerCase()} style={{ width: 'max-content' }}>
          {capitalize(props.type)} Badge
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center element-top" style={{ gap: 10 }}>
        {Badge('None', 0)}
        {Badge('Bronze', 1)}
        {Badge('Silver', 2)}
        {Badge('Gold', 3)}
        {Badge('Platinum', 4)}
      </div>
    </div>
  );
};

export default SelectBadge;
