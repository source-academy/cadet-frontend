import { Icon, Intent, ProgressBar } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React from 'react';
import { handleGlow } from 'src/features/achievement/AchievementConstants';

import { AchievementStatus } from '../../../features/achievement/AchievementTypes';
import AchievementDeadline from './AchievementDeadline';
import AchievementExp from './AchievementExp';
import AchievementInferencer from './AchievementInferencer';

type AchievementCardProps = {
  id: number;
  inferencer: AchievementInferencer;
  shouldRender: boolean;
  focusState: [number, any];
  isDropdownOpen?: boolean;
  toggleDropdown?: any;
};

function AchievementCard(props: AchievementCardProps) {
  const { id, inferencer, shouldRender, focusState, isDropdownOpen, toggleDropdown } = props;

  const [focusId, setFocusId] = focusState;

  const { title, ability, cardTileUrl } = inferencer.getAchievementItem(id);

  const status = inferencer.getStatus(id);
  const displayDeadline = inferencer.getDisplayDeadline(id);
  const displayExp = inferencer.getMaxExp(id);
  const progressFrac = inferencer.getProgressFrac(id);

  // Only task card with prerequisites has dropdown button
  const hasDropdown =
    isDropdownOpen !== undefined && inferencer.getImmediateChildren(id).size !== 0;

  return (
    <div
      className="achievement-card"
      style={{
        ...handleGlow(id, focusId, ability),
        opacity: shouldRender ? '100%' : '20%',
        background: `url(${cardTileUrl}) center/cover`
      }}
      onClick={() => setFocusId(id)}
      onClickCapture={toggleDropdown}
    >
      <div className="dropdown-button">
        {hasDropdown && (
          <Icon icon={isDropdownOpen ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
        )}
      </div>

      <div className="content">
        <div className="heading">
          <h3>{title.toUpperCase()}</h3>
          <span className="status">
            {status === AchievementStatus.COMPLETED && (
              <Icon icon={IconNames.CONFIRM} intent={Intent.SUCCESS} style={{ padding: '1em' }} />
            )}
          </span>
        </div>

        <div className="details">
          <div className="ability">
            <p>{ability}</p>
          </div>
          <AchievementDeadline deadline={displayDeadline} ability={ability} />
          <AchievementExp exp={displayExp} isBonus={hasDropdown} />
        </div>

        <ProgressBar
          className="progress"
          intent={progressFrac === 1 ? 'success' : undefined}
          value={progressFrac}
          animate={false}
          stripes={false}
        />
      </div>
    </div>
  );
}

export default AchievementCard;
