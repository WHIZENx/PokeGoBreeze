import React from 'react';
import { HeaderComponent } from '../models/component.model';
import TypeInfo from '../../../components/Sprites/Type/Type';
import TypeBadge from '../../../components/Sprites/TypeBadge/TypeBadge';
import { splitAndCapitalize, getMoveType } from '../../../utils/utils';

const HeaderPVP = (props: HeaderComponent) => {
  return (
    <>
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-x-3">
        {props.data && (
          <h3 className="tw-text-white text-shadow-black">
            <b>
              #{props.data.id} {splitAndCapitalize(props.data.name, '-', ' ')}
            </b>
          </h3>
        )}
        <TypeInfo isShowShadow isBlock color="white" arr={props.data?.pokemon?.types} />
      </div>
      <h6 className="tw-text-white text-shadow-black tw-underline">Recommend Moveset in PVP</h6>
      <div className="tw-flex tw-flex-wrap tw-mt-2 tw-gap-x-2">
        <TypeBadge
          isGrow
          isFind
          title="Fast Move"
          move={props.data?.fMove}
          moveType={getMoveType(props.data?.pokemon, props.data?.fMove?.name)}
        />
        <TypeBadge
          isGrow
          isFind
          title="Primary Charged Move"
          move={props.data?.cMovePri}
          moveType={getMoveType(props.data?.pokemon, props.data?.cMovePri?.name)}
        />
        {props.data?.cMoveSec && (
          <TypeBadge
            isGrow
            isFind
            title="Secondary Charged Move"
            move={props.data.cMoveSec}
            moveType={getMoveType(props.data.pokemon, props.data.cMoveSec.name)}
          />
        )}
      </div>
    </>
  );
};

export default HeaderPVP;
