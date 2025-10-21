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
      <div className="ph-item tw-w-3/4 !tw-p-0 !tw-m-auto !tw-h-4">
        <div className="ph-picture ph-col-3 !tw-w-full !tw-h-full !tw-m-0 !tw-p-0" style={{ background: color }} />
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
              <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={ATK_LOGO} /> ATK
            </>
          ),
        },
        {
          value: reload(<>{!isUndefined(props.pokemonType) ? calculateRaidStat(props.statATK, props.tier) : ''}</>),
          className: '!tw-text-center tw-text-default',
        },
      ],
    },
    {
      align: 'start',
      subRows: [
        {
          value: (
            <>
              <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={DEF_LOGO} /> DEF
            </>
          ),
        },
        {
          value: reload(<>{!isUndefined(props.pokemonType) ? calculateRaidStat(props.statDEF, props.tier) : ''}</>),
          className: '!tw-text-center tw-text-default',
        },
      ],
    },
    {
      align: 'start',
      subRows: [
        {
          value: (
            <>
              <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={STA_LOGO} /> HP
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
          className: '!tw-text-center tw-text-default',
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
                <img className="tw-mr-2" alt="Image Logo" width={20} height={20} src={HP_LOGO} />
                HP
              </>
            ),
          },
          {
            value: reload(<>{RAID_BOSS_TIER[props.tier].sta}</>),
            className: '!tw-text-center tw-text-default',
          },
        ],
      });
    }
    return rows;
  };

  return <Table tableClass="table-raid" rows={setRows()} />;
};

export default StatsTable;
