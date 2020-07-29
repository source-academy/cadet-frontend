import { mount } from 'enzyme';
import React from 'react';

import { FilterStatus } from '../../../features/achievement/AchievementTypes';
import { mockAchievements } from '../../mocks/AchievementMocks';
import AchievementTask from '../AchievementTask';
import AchievementInferencer from '../utils/AchievementInferencer';

const mockProps = {
  id: 1,
  inferencer: new AchievementInferencer(mockAchievements),
  filterStatus: FilterStatus.ALL,
  displayView: () => {},
  handleGlow: () => {}
};

test('AchievementView component renders correctly', () => {
  const sampleComponent = <AchievementTask {...mockProps} />;
  const tree = mount(sampleComponent);
  expect(tree.debug()).toMatchSnapshot();
});
