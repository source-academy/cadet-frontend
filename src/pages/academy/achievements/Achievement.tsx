import React, { useState } from 'react';

import { IconNames } from '@blueprintjs/icons';

import AchievementFilter from './subcomponents/AchievementFilter';
import { FilterStatus } from '../../../commons/achievements/AchievementTypes';
import { achievementData } from 'src/commons/mocks/AchievementMocks';
import Inferencer from './subcomponents/utils/Inferencer';
import AchievementTask from './subcomponents/AchievementTask';
import AchievementModal from './subcomponents/AchievementModal';

export type DispatchProps = {};

export type StateProps = {};

function Achievement() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(FilterStatus.ALL);
  const [modalId, setModalId] = useState<number>(-1);

  const _inferencer = new Inferencer(achievementData);
  //_inferencer.logInfo();

  const mapAchievementIdsToTasks = (taskIds: number[]) =>
    taskIds.map(id => (
      <AchievementTask
        key={id}
        id={id}
        inferencer={_inferencer}
        filterStatus={filterStatus}
        displayModal={setModalId}
      />
    ));

  return (
    <div className="Achievements">
      <div className="achievement-main">
        <div className="icons">
          <div></div>
          <AchievementFilter
            filterStatus={FilterStatus.ALL}
            setFilterStatus={setFilterStatus}
            icon={IconNames.GLOBE}
            count={_inferencer.getFilterCount(FilterStatus.ALL)}
          />
          <AchievementFilter
            filterStatus={FilterStatus.ACTIVE}
            setFilterStatus={setFilterStatus}
            icon={IconNames.LOCATE}
            count={_inferencer.getFilterCount(FilterStatus.ACTIVE)}
          />
          <AchievementFilter
            filterStatus={FilterStatus.COMPLETED}
            setFilterStatus={setFilterStatus}
            icon={IconNames.ENDORSED}
            count={_inferencer.getFilterCount(FilterStatus.COMPLETED)}
          />
        </div>

        <div className="cards">
          <ul className="display-list">{mapAchievementIdsToTasks(_inferencer.listTaskIds())}</ul>
        </div>

        <AchievementModal id={modalId} inferencer={_inferencer} />
      </div>
    </div>
  );
}

export default Achievement;