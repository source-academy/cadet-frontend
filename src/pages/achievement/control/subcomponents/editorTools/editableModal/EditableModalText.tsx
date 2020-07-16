import { EditableText } from '@blueprintjs/core';
import React from 'react';

type EditableModalTextProps = {
  goalText: string;
  setGoalText: any;
};

function EditableModalText(props: EditableModalTextProps) {
  const { goalText, setGoalText } = props;

  return (
    <>
      <EditableText
        placeholder={`Enter your goal text here`}
        value={goalText}
        onChange={setGoalText}
        multiline={true}
      />
    </>
  );
}

export default EditableModalText;
