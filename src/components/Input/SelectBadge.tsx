import { capitalize } from '@mui/material';
import APIService from '../../services/API.service';
import { priorityBadge } from '../../util/Compute';

const SelectBadge = ({ type, priority, setPriority }: any) => {
  const Badge = (text: string, type: string, priorityNumber: number) => {
    const spiritBadge = priorityBadge(priorityNumber);

    return (
      <div className="text-center">
        <div
          className={'position-relative frame-badge' + (priority === priorityNumber ? ' frame-badge-select' : '')}
          onClick={() => setPriority(priorityNumber)}
        >
          <span style={{ width: 40 }}>
            <img alt="frame-type" className={'frame-type-sprit' + (priorityNumber === 4 ? ' filter-platinum' : '')} src={spiritBadge} />
          </span>
          {priorityNumber > 0 && (
            <span className="position-badge" style={{ width: 20 }}>
              <img alt="badge-type" className="badge-type-sprit" src={APIService.getTypeHqSprite(capitalize(type.toLowerCase()))} />
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
        <div className={'type-icon-small ' + type.toLowerCase()} style={{ width: 'max-content' }}>
          {capitalize(type.toLowerCase())} Badge
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-center align-items-center element-top" style={{ gap: 10 }}>
        {Badge('None', type, 0)}
        {Badge('Bronze', type, 1)}
        {Badge('Silver', type, 2)}
        {Badge('Gold', type, 3)}
        {Badge('Platinum', type, 4)}
      </div>
    </div>
  );
};

export default SelectBadge;
