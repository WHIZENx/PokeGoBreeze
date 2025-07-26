import React from 'react';
import ATK_LOGO from '../../../../assets/attack.png';
import DEF_LOGO from '../../../../assets/defense.png';
import HP_LOGO from '../../../../assets/hp.png';
import STA_LOGO from '../../../../assets/stamina.png';
import { calculateRaidStat } from '../../../../utils/calculate';
import { RAID_BOSS_TIER } from '../../../../utils/constants';
import { createDataRows } from '../../../../utils/utils';
import { IRow, IStatsTableComponent } from '../../models/component.model';
import Table from '../Table';
import { isUndefined } from '../../../../utils/extension';

const StatsTable = (props: IStatsTableComponent) => {
  const reload = (element: JSX.Element, color = 'var(--loading-custom-bg)') => {
    if (props.isLoadedForms) {
      return element;
    }
    return (
      <div className="ph-item w-75 p-0 m-auto h-4">
        <div className="ph-picture ph-col-3 w-100 h-100 m-0 p-0" style={{ background: color }} />
      </div>
    );
  };

  const rows = createDataRows<IRow>(
    {
      align: 'center',
      subRows: [
        {
          value: 'Stats',
          isSubTitle: true,
          colSpan: 2,
        },
      ],
    },
    {
      align: 'start',
      subRows: [
        {
          value: (
            <>
              <img className="me-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} /> ATK
            </>
          ),
        },
        {
          value: reload(<>{!isUndefined(props.pokemonType) ? calculateRaidStat(props.statATK, props.tier) : ''}</>),
          className: 'text-center theme-text-primary',
        },
      ],
    },
    {
      align: 'start',
      subRows: [
        {
          value: (
            <>
              <img className="me-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} /> DEF
            </>
          ),
        },
        {
          value: reload(<>{!isUndefined(props.pokemonType) ? calculateRaidStat(props.statDEF, props.tier) : ''}</>),
          className: 'text-center theme-text-primary',
        },
      ],
    },
    {
      align: 'start',
      subRows: [
        {
          value: (
            <>
              <img className="me-2" alt="Image Logo" width={20} height={20} src={STA_LOGO} /> HP
            </>
          ),
        },
        {
          value: reload(
            <>
              {!isUndefined(props.pokemonType)
                ? Math.floor(RAID_BOSS_TIER[props.tier].sta / RAID_BOSS_TIER[props.tier].CPm)
                : props.statSTA || ''}
            </>
          ),
          className: 'text-center theme-text-primary',
        },
      ],
    }
  );

  const setRows = () => {
    if (props.isShowHp) {
      rows.push({
        align: 'start',
        subRows: [
          {
            value: (
              <>
                <img className="me-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
                HP
              </>
            ),
          },
          {
            value: reload(<>{RAID_BOSS_TIER[props.tier].sta}</>),
            className: 'text-center theme-text-primary',
          },
        ],
      });
    }
    return rows;
  };

  return <Table tableClass="table-raid" rows={setRows()} />;
};

export default StatsTable;
