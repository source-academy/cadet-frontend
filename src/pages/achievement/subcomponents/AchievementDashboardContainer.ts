import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import AchievementInferencer from '../../../commons/achievement/utils/AchievementInferencer';
import { fetchAssessmentOverviews } from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import {
  getAchievements,
  getOwnGoals,
  getUsers,
  updateGoalProgress
} from '../../../features/achievement/AchievementActions';
import Dashboard, { DispatchProps, StateProps } from './AchievementDashboard';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  group: state.session.courseRegistration.group,
  inferencer: new AchievementInferencer(state.achievement.achievements, state.achievement.goals),
  name: state.session.user.name,
  role: state.session.courseRegistration.role,
  assessmentOverviews: state.session.assessmentOverviews,
  users: state.achievement.users
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      fetchAssessmentOverviews,
      getAchievements,
      getOwnGoals,
      getUsers,
      updateGoalProgress
    },
    dispatch
  );

const DashboardContainer = connect(mapStateToProps, mapDispatchToProps)(Dashboard);

export default DashboardContainer;
