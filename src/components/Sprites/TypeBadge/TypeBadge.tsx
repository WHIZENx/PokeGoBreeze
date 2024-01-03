import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import APIService from '../../../services/API.service';
import { capitalize, splitAndCapitalize } from '../../../util/Utils';

import './TypeBadge.scss';
import { useSelector } from 'react-redux';
import { StoreState } from '../../../store/models/state.model';
import { Combat } from '../../../core/models/combat.model';

const TypeBadge = (props: {
  move: Combat | undefined | null;
  find?: boolean;
  grow?: boolean;
  style?: React.CSSProperties | undefined;
  color?: string;
  title?: string;
  elite?: boolean;
  shadow?: boolean;
  purified?: boolean;
  special?: boolean;
}) => {
  const combat = useSelector((state: StoreState) => state.store.data?.combat ?? []);

  const [move, setMove]: [Combat | undefined, any] = useState();
  useEffect(() => {
    if (props.move?.name && combat.length > 0) {
      setMove(combat.find((item) => item.name === props.move?.name));
    }
  }, [combat, props.move?.name]);

  return (
    <div className={'type-badge-container' + (props.grow ? ' filter-shadow' : '')} style={props.style}>
      <span className="caption text-type-border" style={{ color: props.color ?? 'gray' }}>
        {props.title}
      </span>
      <Link to={'/move/' + move?.id} className="d-flex align-items-center position-relative" style={{ width: 'fit-content' }}>
        <span className={move?.type?.toLowerCase() + ' type-border position-relative'}>
          {(props.elite || props.shadow || props.purified || props.special) && (
            <span className="type-badge-border">
              {props.elite && (
                <span className="type-icon-small ic elite-ic">
                  <span>Elite</span>
                </span>
              )}
              {props.shadow && (
                <span className="type-icon-small ic shadow-ic">
                  <span>Shadow</span>
                </span>
              )}
              {props.purified && (
                <span className="type-icon-small ic purified-ic">
                  <span>Purified</span>
                </span>
              )}
              {props.special && (
                <span className="type-icon-small ic special-ic">
                  <span>Special</span>
                </span>
              )}
            </span>
          )}
          <span>{splitAndCapitalize(props.move?.name.replaceAll('_PLUS', '+'), '_', ' ')}</span>
        </span>
        <span className={move?.type?.toLowerCase() + ' type-icon-border'}>
          <div style={{ width: 35 }}>
            <img
              style={{ padding: 5, backgroundColor: 'black' }}
              className="sprite-type"
              alt="img-type-pokemon"
              src={APIService.getTypeHqSprite(capitalize(move?.type))}
            />
          </div>
        </span>
      </Link>
    </div>
  );
};

export default TypeBadge;
