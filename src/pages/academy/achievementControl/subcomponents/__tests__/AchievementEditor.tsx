import { mount } from 'enzyme';
import React from 'react';
import { mockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from 'src/pages/achievements/dashboard/subcomponents/utils/Inferencer';

import AchievementEditor from '../AchievementEditor';

const mockProps = {
  inferencer: new Inferencer(mockAchievements),
  updateAchievements: () => {},
  editAchievement: () => {},
  forceRender: () => {},
  addUnsavedChange: () => {},
  removeUnsavedChange: () => {},
  removeGoal: () => {},
  removeAchievement: () => {}
};

test('AchievementEditor component renders correctly', () => {
  const component = <AchievementEditor {...mockProps} />;
  const tree = mount(component);
  expect(tree.debug()).toMatchSnapshot();
});
