import { Button, EditableText } from '@blueprintjs/core';
import React, { useState } from 'react';

type EditableModalImageProps = {
  modalImageUrl: string;
  title: string;
  setModalImageUrl: any;
};

function EditableModalImage(props: EditableModalImageProps) {
  const { modalImageUrl, title, setModalImageUrl } = props;

  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <div>
      <Button
        text={isEditing ? 'Save Image URL' : 'Edit Image'}
        onClick={() => setIsEditing(!isEditing)}
      />
      {isEditing ? (
        <EditableText
          placeholder={`Enter your image URL here`}
          value={modalImageUrl}
          onChange={setModalImageUrl}
          multiline={true}
        />
      ) : (
        <img className="modal-img" src={modalImageUrl} alt={title} />
      )}
    </div>
  );
}

export default EditableModalImage;
