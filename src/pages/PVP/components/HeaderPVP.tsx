import React from 'react';
import { HeaderComponent } from '../models/component.model';
import TypeInfo from '../../../components/Sprites/Type/Type';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import { splitAndCapitalize, getMoveType } from '../../../util/utils';

const HeaderPVP = (props: HeaderComponent) => {
  return (
    <>
      <div className="d-flex flex-wrap align-items-center" style={{ columnGap: 15 }}>
        {props.data && (
          <h3 className="text-white text-shadow">
            <b>
              #{props.data.id} {splitAndCapitalize(props.data.name, '-', ' ')}
            </b>
          </h3>
        )}
        <TypeInfo isShowShadow={true} isBlock={true} color="white" arr={props.data?.pokemon?.types} />
      </div>
      <h6 className="text-white text-shadow" style={{ textDecoration: 'underline' }}>
        Recommend Moveset in PVP
      </h6>
      <div className="d-flex flex-wrap element-top" style={{ columnGap: 10 }}>
        <TypeBadge
          isGrow={true}
          isFind={true}
          title="Fast Move"
          color="white"
          move={props.data?.fMove}
          moveType={getMoveType(props.data?.pokemon, props.data?.fMove?.name)}
        />
        <TypeBadge
          isGrow={true}
          isFind={true}
          title="Primary Charged Move"
          color="white"
          move={props.data?.cMovePri}
          moveType={getMoveType(props.data?.pokemon, props.data?.cMovePri?.name)}
        />
        {props.data?.cMoveSec && (
          <TypeBadge
            isGrow={true}
            isFind={true}
            title="Secondary Charged Move"
            color="white"
            move={props.data.cMoveSec}
            moveType={getMoveType(props.data.pokemon, props.data.cMoveSec.name)}
          />
        )}
      </div>
    </>
  );
};

export default HeaderPVP;
