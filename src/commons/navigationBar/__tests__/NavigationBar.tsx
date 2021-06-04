import { shallow } from 'enzyme';

import { Role } from '../../application/ApplicationTypes';
import NavigationBar from '../NavigationBar';

test('NavigationBar renders "Not logged in" correctly', () => {
  const props = {
    handleLogOut: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});

test('NavigationBar renders correctly with student role', () => {
  const props = {
    handleLogOut: () => {},
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {},
    role: Role.Student,
    title: 'Source Academy'
  };
  const tree = shallow(<NavigationBar {...props} />);
  expect(tree.debug()).toMatchSnapshot();
});
