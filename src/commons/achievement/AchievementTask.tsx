import React, { useState } from 'react';

import { getAbilityColor } from '../../features/achievement/AchievementConstants';
import { AchievementStatus, FilterStatus } from '../../features/achievement/AchievementTypes';
import AchievementCard from './utils/AchievementCard';
import AchievementInferencer from './utils/AchievementInferencer';

type AchievementTaskProps = {
  id: number;
  inferencer: AchievementInferencer;
  filterStatus: FilterStatus;
  focusState: [number, any];
};

function AchievementTask(props: AchievementTaskProps) {
  const { id, inferencer, filterStatus, focusState } = props;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const prerequisiteIds = [...inferencer.getImmediateChildren(id)];
  const taskColor = getAbilityColor(inferencer.getAchievementItem(id).ability);

  /**
   * Checks whether the AchievementItem (can be a task or prereq) should be rendered
   * based on the achievement dashboard filterStatus.
   */
  const shouldRender = (id: number): boolean => {
    const status = inferencer.getStatus(id);
    switch (filterStatus) {
      case FilterStatus.ALL:
        return true;
      case FilterStatus.ACTIVE:
        return status === AchievementStatus.ACTIVE;
      case FilterStatus.COMPLETED:
        return status === AchievementStatus.COMPLETED;
      default:
        return false;
    }
  };

  /**
   * Checks whether the AchievementItem has any prerequisite that
   * should be rendered based on the achievement dashboard filterStatus.
   *
   * If there is at least 1 prerequisite that needs to be rendered,
   * the whole AchievementTask will be rendered together.
   */
  const shouldRenderPrerequisites = (id: number) => {
    const children = [...inferencer.getImmediateChildren(id)];
    return children.reduce((canRender, prerequisite) => {
      return canRender || shouldRender(prerequisite);
    }, false);
  };

  /**
   * If the main achievement or any of the prerequisites need to be rendered,
   * the whole achievement task will be rendered
   */
  const shouldRenderTask = (id: number) => shouldRender(id) || shouldRenderPrerequisites(id);

  return (
    <>
      {shouldRenderTask(id) && (
        <li className="task">
          <AchievementCard
            id={id}
            inferencer={inferencer}
            shouldRender={shouldRender(id)}
            focusState={focusState}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="prerequisite-container">
              {prerequisiteIds.map(prerequisiteId => (
                <div className="prerequisite" key={prerequisiteId}>
                  <div
                    className="dropdown-lines"
                    style={{
                      borderBottom: `1px solid ${taskColor}`,
                      borderLeft: `1px solid ${taskColor}`
                    }}
                  ></div>
                  <AchievementCard
                    id={prerequisiteId}
                    inferencer={inferencer}
                    shouldRender={shouldRender(prerequisiteId)}
                    focusState={focusState}
                  />
                </div>
              ))}
            </div>
          )}
        </li>
      )}
    </>
  );
}

export default AchievementTask;
