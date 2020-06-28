import React from 'react';

import { IconName, Icon } from '@blueprintjs/core';
import { FilterStatus } from '../../../../commons/achievements/AchievementTypes';

type AchievementFilterProps = {
  filterStatus: FilterStatus;
  setFilterStatus: any;
  icon: IconName;
  count: number;
};

function AchievementFilter(props: AchievementFilterProps) {
  const { filterStatus, setFilterStatus, icon, count } = props;

  /**
   * Changes the filter status for the achievement page.
   */
  const changeFilterStatus = () => {
    setFilterStatus(filterStatus);
  };

  return (
    <div>
      <div onClick={changeFilterStatus}>
        <Icon color={'#ffffff'} iconSize={44} icon={icon} />
        <br />
        {filterStatus} ({count})
      </div>
    </div>
  );
}

export default AchievementFilter;