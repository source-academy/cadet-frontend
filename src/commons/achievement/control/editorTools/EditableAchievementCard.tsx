import { Card } from '@blueprintjs/core';
import React, { useState } from 'react';

import {
  AchievementAbility,
  AchievementItem,
  AchievementView
} from '../../../../features/achievement/AchievementTypes';
import AchievementInferencer from '../../utils/AchievementInferencer';
import AchievementDeleter from './editableUtils/AchievementDeleter';
import AchievementUploader from './editableUtils/AchievementUploader';
import EditableAchievementAbility from './editableUtils/EditableAchievementAbility';
import EditableAchievementBackground from './editableUtils/EditableAchievementBackground';
import EditableAchievementDate from './editableUtils/EditableAchievementDate';
import EditableAchievementTitle from './editableUtils/EditableAchievementTitle';
import EditableAchievementView from './editableView/EditableAchievementView';

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
    removeAchievement
  } = props;

  const [editableAchievement, setEditableAchievement] = useState<AchievementItem>(achievement);
  const { id, title, ability, deadline, cardTileUrl, release, view } = editableAchievement;

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

    // It means that there is currently an item being added.
    // Once this item is added, we can reset it to -1, which means
    // that there is no achievement being added.
    // indicating to the system that there is no achievement
    // being added.
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

  /*
  const handleEditGoals = (goals: AchievementGoal[], shouldUpdate: boolean) => {
    setEditableAchievement({
      ...editableAchievement,
      goalIds: goalIds
    });

    inferencer.modifyAchievement(editableAchievement);
    editAchievement(editableAchievement);
  };

  const handleRemoveGoal = (goal: AchievementGoal) => {
    removeGoal(goal, editableAchievement);
  };
  */
  const handleChangeBackground = (cardTileUrl: string) => {
    setEditableAchievement({
      ...editableAchievement,
      cardTileUrl: cardTileUrl
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

  const handleChangeView = (view: AchievementView) => {
    setEditableAchievement({
      ...editableAchievement,
      view: view
    });
    setUnsaved();
  };

  return (
    <Card
      className="editable-achievement"
      style={{
        background: `url(${cardTileUrl}) center/cover`
      }}
    >
      <div className="top-bar">
        <EditableAchievementView title={title} view={view} changeView={handleChangeView} />

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
          cardTileUrl={cardTileUrl}
          setcardTileUrl={handleChangeBackground}
        />
        {/* TODO: Implement goal editor        
        <EditableAchievementGoals
          goalIds={goalIds}
          editGoals={handleEditGoals}
          removeGoalFromBackend={handleRemoveGoal}
        /> */}
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
