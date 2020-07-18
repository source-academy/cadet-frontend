import { Card } from '@blueprintjs/core';
import React, { useState } from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import {
  AchievementAbility,
  AchievementGoal,
  AchievementItem,
  AchievementModalItem
} from '../../../../../commons/achievement/AchievementTypes';
import EditableAchievementModal from './editableModal/EditableAchievementModal';
import AchievementDeleter from './editableUtils/AchievementDeleter';
import AchievementUploader from './editableUtils/AchievementUploader';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementBackground from './editableUtils/EditableAchievementBackground';
import EditableAchievementDate from './editableUtils/EditableAchievementDate';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementGoals from './editableUtils/goals/EditableAchievementGoals';

type EditableAchievementCardProps = {
  achievement: AchievementItem;
  inferencer: AchievementInferencer;
  updateAchievements: any;
  editAchievement: any;
  forceRender: any;
  adderId: number;
  setAdderId: any;
  addUnsavedChange: any;
  removeUnsavedChange: any;
  removeGoal: any;
  removeAchievement: any;
};

function EditableAchievementCard(props: EditableAchievementCardProps) {
  const {
    achievement,
    inferencer,
    updateAchievements,
    editAchievement,
    adderId,
    setAdderId,
    addUnsavedChange,
    removeUnsavedChange,
    removeGoal,
    removeAchievement
  } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id, title, ability, deadline, backgroundImageUrl, release, goals } = editableAchievement;

  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);

  const setUnsaved = () => {
    if (!hasChanges) {
      setHasChanges(true);
      addUnsavedChange();
    }
  };

  const setUpload = () => {
    setPendingUpload(false);
    removeUnsavedChange();
  };

  const handleSaveChanges = () => {
    inferencer.modifyAchievement(editableAchievement);
    setHasChanges(false);
    setPendingUpload(true);

    if (id === adderId) {
      setAdderId(-1);
    }
  };

  const handleUploadChanges = () => {
    editAchievement(editableAchievement);
    setUpload();
  };

  const handleDeleteAchievement = () => {
    inferencer.removeAchievement(id);

    removeAchievement(editableAchievement);
    updateAchievements();

    if (id === adderId) {
      setAdderId(-1);
    }
  };

  const handleDiscardChanges = () => {
    setEditableAchievement(achievement);
    setHasChanges(false);
    setUpload();
  };

  const handleChangeTitle = (title: string) => {
    setEditableAchievement({
      ...editableAchievement,
      title: title
    });
    setUnsaved();
  };

  const handleEditGoals = (goals: AchievementGoal[], shouldUpdate: boolean) => {
    setEditableAchievement({
      ...editableAchievement,
      goals: goals
    });

    inferencer.modifyAchievement(editableAchievement);
    editAchievement(editableAchievement);
  };

  const handleRemoveGoal = (goal: AchievementGoal) => {
    removeGoal(goal, editableAchievement);
  };

  const handleChangeBackground = (backgroundImageUrl: string) => {
    setEditableAchievement({
      ...editableAchievement,
      backgroundImageUrl: backgroundImageUrl
    });
    setUnsaved();
  };

  const handleChangeRelease = (release: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      release: release
    });
    setUnsaved();
  };

  const handleChangeDeadline = (deadline: Date) => {
    setEditableAchievement({
      ...editableAchievement,
      deadline: deadline
    });
    setUnsaved();
  };

  const handleChangeAbility = (ability: AchievementAbility, e: any) => {
    setEditableAchievement({
      ...editableAchievement,
      ability: ability
    });
    setUnsaved();
  };

  const handleChangeModal = (modal: AchievementModalItem) => {
    setEditableAchievement({
      ...editableAchievement,
      modal: modal
    });
    setUnsaved();
  };

  return (
    <Card
      className="editable-achievement"
      style={{
        background: `url(${backgroundImageUrl})`
      }}
    >
      <div className="top-bar">
        <EditableAchievementModal
          title={title}
          modal={achievement.modal}
          changeModal={handleChangeModal}
        />

        <AchievementUploader
          hasChanges={hasChanges}
          saveChanges={handleSaveChanges}
          discardChanges={handleDiscardChanges}
          pendingUpload={pendingUpload}
          uploadChanges={handleUploadChanges}
        />
      </div>

      <div className="main">
        <EditableAchievementBackground
          backgroundImageUrl={backgroundImageUrl}
          setBackgroundImageUrl={handleChangeBackground}
        />

        <EditableAchievementGoals
          goals={goals}
          editGoals={handleEditGoals}
          removeGoalFromBackend={handleRemoveGoal}
        />
        <div className="display">
          <EditableAchievementTitle title={title} changeTitle={handleChangeTitle} />

          <div className="details">
            <EditableAchievementAbility ability={ability} changeAbility={handleChangeAbility} />

            <EditableAchievementDate
              type="Deadline"
              deadline={deadline}
              changeDeadline={handleChangeDeadline}
            />

            <EditableAchievementDate
              type="Release"
              deadline={release}
              changeDeadline={handleChangeRelease}
            />
          </div>
        </div>
        <div className="details">
          <AchievementDeleter deleteAchievement={handleDeleteAchievement} />
        </div>
      </div>
    </Card>
  );
}

export default EditableAchievementCard;