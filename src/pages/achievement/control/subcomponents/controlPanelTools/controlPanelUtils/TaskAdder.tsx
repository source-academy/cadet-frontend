import { Button } from '@blueprintjs/core';
import React, { useState } from 'react';
import AchievementInferencer from 'src/pages/achievement/dashboard/subcomponents/utils/AchievementInferencer';

import AchievementSelector from './AchievementSelector';

export type TaskAdderProps = {
  inferencer: AchievementInferencer;
  saveChanges: any;
};

function TaskAdder(props: TaskAdderProps) {
  const { inferencer, saveChanges } = props;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const toggleDialogOpen = () => setDialogOpen(!isDialogOpen);

  const nonTaskIDs = inferencer.listNonTaskIds();

  const [addedTaskID, setAddedTaskID] = useState<number>(
    nonTaskIDs.length === 0 ? 0 : nonTaskIDs[0]
  );

  const addNewTask = () => {
    const achievement = inferencer.getAchievementItem(addedTaskID);
    inferencer.setTask(achievement);
    saveChanges();
  };

  const addAction = () => {
    addNewTask();

    toggleDialogOpen();
  };

  return (
    <>
      <Button className="main-adder" onClick={toggleDialogOpen} text={'Add A Task'} />
      <AchievementSelector
        selections={nonTaskIDs}
        inferencer={inferencer}
        selectedId={addedTaskID}
        setSelectedId={setAddedTaskID}
        buttonText={'Add Task'}
        dialogHeader={'Add A Task'}
        emptySelectionsMessage={'You have no more tasks to add'}
        toggleDialogOpen={toggleDialogOpen}
        isDialogOpen={isDialogOpen}
        action={addAction}
      />
    </>
  );
}

export default TaskAdder;