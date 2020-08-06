import React from 'react';

import { getAbilityBackground } from '../../features/achievement/AchievementConstants';
import { AchievementStatus } from '../../features/achievement/AchievementTypes';
import AchievementInferencer from './utils/AchievementInferencer';
import { prettifyDate } from './utils/DateHelper';
import AchievementViewCompletion from './view/AchievementViewCompletion';
import AchievementViewGoal from './view/AchievementViewGoal';

type AchievementViewProps = {
  id: number;
  inferencer: AchievementInferencer;
  handleGlow: any;
};

function AchievementView(props: AchievementViewProps) {
  const { id, inferencer, handleGlow } = props;

  if (id < 0) return null;

  const achievement = inferencer.getAchievementItem(id);
  const { title, ability, deadline, view } = achievement;
  const { canvasUrl, description, completionText } = view;

  const awardedExp = inferencer.getExp(id);
  const goals = inferencer.getGoals(id);
  const prereqGoals = inferencer.getPrerequisiteGoals(id);
  const status = inferencer.getStatus(id);

  return (
    <div className="view" style={{ ...handleGlow(id), ...getAbilityBackground(ability) }}>
      <div
        className="canvas"
        style={{
          background: `url(${canvasUrl}) center/cover`
        }}
      >
        <h1>{title.toUpperCase()}</h1>
        {deadline && <p>{`Deadline: ${prettifyDate(deadline)}`}</p>}
        <span className="description">
          <p>{description}</p>
        </span>
      </div>
      <AchievementViewGoal goals={goals} />
      {prereqGoals.length > 0 ? (
        <>
          <hr />
          <AchievementViewGoal goals={prereqGoals} />
        </>
      ) : null}
      {status === AchievementStatus.COMPLETED ? (
        <>
          <hr />
          <AchievementViewCompletion awardedExp={awardedExp} completionText={completionText} />
        </>
      ) : null}
    </div>
  );
}

export default AchievementView;
