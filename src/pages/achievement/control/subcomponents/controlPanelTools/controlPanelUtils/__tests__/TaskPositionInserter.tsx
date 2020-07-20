import { mount } from 'enzyme';
import React from 'react';

import { mockAchievements } from '../../../../../../..//commons/mocks/AchievementMocks';
import AchievementInferencer from '../../../../../dashboard/subcomponents/utils/AchievementInferencer';
import TaskPositionInserter from '../TaskPositionInserter';

const mockProps = {
  editableAchievement: mockAchievements[0],
  setEditableAchievement: () => {},
  inferencer: new AchievementInferencer(mockAchievements),
  saveChanges: () => {}
};

test('TaskPositionInserter component renders correctly', () => {
  const component = <TaskPositionInserter {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});