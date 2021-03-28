import { ProgressBar } from '@blueprintjs/core';
import React, { useState } from 'react';

import { xpPerLevel } from '../../../features/achievement/AchievementConstants';
import AchievementMilestone from './AchievementMilestone';

type AchievementLevelProps = {
  studentXp: number;
};

function AchievementLevel(props: AchievementLevelProps) {
  const { studentXp } = props;

  const [showMilestone, setShowMilestone] = useState<boolean>(false);
  const displayMilestone = () => setShowMilestone(true);
  const hideMilestone = () => setShowMilestone(false);

  const level = Math.floor(studentXp / xpPerLevel);
  const progress = studentXp % xpPerLevel;
  const progressFrac = progress / xpPerLevel;

  return (
    <div className="level" onMouseEnter={displayMilestone} onMouseLeave={hideMilestone}>
      <div className="level-badge">
        <span className="level-icon" />
        <p>{level}</p>
      </div>
      <span className="level-progress">
        <ProgressBar
          animate={false}
          className="progress-bar"
          stripes={false}
          value={progressFrac}
        />
        <p>
          {progress} / {xpPerLevel} XP
        </p>
      </span>
      {showMilestone && <AchievementMilestone />}
    </div>
  );
}

export default AchievementLevel;
