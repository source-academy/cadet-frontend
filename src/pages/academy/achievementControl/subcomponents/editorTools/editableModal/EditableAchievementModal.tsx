import React, { useState } from 'react';
import { Button, Dialog, Card } from '@blueprintjs/core';
import { AchievementModalItem } from '../../../../../../commons/achievements/AchievementTypes';
import EditableAchievementModalDescription from './EditableAchievementModalDescription';
import EditableAchievementModalGoalText from './EditableAchievementModalGoalText';
import EditableAchievementModalImage from './EditableAchievementModalImage';
import { modalTemplate } from '../AchievementTemplate';

type EditableAchievementModalProps = {
  title: string;
  modal: AchievementModalItem;
  handleChangeModal: any;
};

function EditableAchievementModal(props: EditableAchievementModalProps) {
  const { title, modal, handleChangeModal } = props;

  const renderModal = modal === undefined ? modalTemplate : modal;

  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [modalData, setModalData] = useState<AchievementModalItem>(renderModal);

  const { modalImageUrl, description, goalText } = modalData;

  const setDescription = (description: string) => {
    setModalData({
      ...modalData,
      description: description
    });
    handleChangeModal(modalData);
  };

  const setGoalText = (goalText: string) => {
    setModalData({
      ...modalData,
      goalText: goalText
    });
    handleChangeModal(modalData);
  };

  const setModalImageUrl = (modalImageUrl: string) => {
    setModalData({
      ...modalData,
      modalImageUrl: modalImageUrl
    });
    handleChangeModal(modalData);
  };

  return (
    <div>
      <div>
        <Button text={'Edit Modal'} onClick={() => setDialogOpen(!isDialogOpen)} />
      </div>
      <Dialog
        onClose={() => setDialogOpen(!isDialogOpen)}
        isOpen={isDialogOpen}
        title={'Edit Modal'}
        usePortal={false}
      >
        <div className="modal-editor">
          <Card className="background-card">
            <h1>{title} </h1>

            <EditableAchievementModalImage
              modalImageUrl={modalImageUrl}
              title={title}
              setModalImageUrl={setModalImageUrl}
            />

            <EditableAchievementModalDescription
              description={description}
              setDescription={setDescription}
            />
            <EditableAchievementModalGoalText goalText={goalText} setGoalText={setGoalText} />
          </Card>
        </div>
      </Dialog>
    </div>
  );
}

export default EditableAchievementModal;
