import React from 'react';
import { EditableText } from '@blueprintjs/core';

type EditableAchievementTitleProps = {
  title: string;
  changeTitle: any;
};

function EditableAchievementTitle(props: EditableAchievementTitleProps) {
  const { title, changeTitle } = props;

  return (
    <div>
      <h1>
        <EditableText
          placeholder={`Enter your title here`}
          value={title}
          onChange={value => {
            changeTitle(value);
          }}
        />
      </h1>
    </div>
  );
}

export default EditableAchievementTitle;
