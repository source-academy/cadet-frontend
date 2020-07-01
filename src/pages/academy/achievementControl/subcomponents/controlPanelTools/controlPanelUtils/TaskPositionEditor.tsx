import React, { useState } from 'react';
import { Button } from '@blueprintjs/core';
import Inferencer from '../../../../../achievements/subcomponents/utils/Inferencer';
import AchievementSelector from './AchievementSelector';
import { AchievementItem } from '../../../../../../commons/achievements/AchievementTypes';

type TaskPositionEditorProps = {
  editableAchievement: AchievementItem;
  inferencer: Inferencer;
  updateAchievements: any;
};

function TaskPositionEditor(props: TaskPositionEditorProps) {
  const { editableAchievement, inferencer, updateAchievements } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const taskIDs = inferencer.listTaskIds();

  const [swappedTaskID, setSwappedTaskID] = useState<number>(taskIDs.length === 0 ? 0 : taskIDs[0]);

  const swappingAction = (e: any) => {
    toggleDialogOpen();
    inferencer.swapAchievementPositions(
      editableAchievement,
      inferencer.getAchievementItem(swappedTaskID)
    );
    updateAchievements(inferencer.getAchievements());
  };

  return (
    <>
      <Button className="editor-button" onClick={toggleDialogOpen} text={'Change Pos'} />
      <AchievementSelector
        selections={taskIDs}
        inferencer={inferencer}
        selectedId={swappedTaskID}
        setSelectedId={setSwappedTaskID}
        buttonText={'Swap Positions'}
        dialogHeader={"Swap this task's position"}
        emptySelectionsMessage={'You have no more tasks to swap with'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={swappingAction}
      />
    </>
  );
}

export default TaskPositionEditor;
