import { Store } from 'redux';
import mockStore from 'redux-mock-store';

import {
  defaultAcademy,
  defaultApplication,
  defaultDashboard,
  defaultPlayground,
  defaultSession,
  defaultWorkspaceManager,
  OverallState
} from '../application/ApplicationTypes';
import { defaultAchievements } from '../achievements/AchievementTypes';

export function mockInitialStore<P>(): Store<OverallState> {
  const createStore = (mockStore as any)();
  const state: OverallState = {
    academy: defaultAcademy,
    achievements: defaultAchievements,
    application: defaultApplication,
    dashboard: defaultDashboard,
    playground: defaultPlayground,
    workspaces: defaultWorkspaceManager,
    session: defaultSession
  };
  return createStore(state);
}
