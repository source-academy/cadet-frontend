import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import {
  fetchAssessmentConfig,
  fetchCourseConfig,
  updateAssessmentTypes,
  updateCourseConfig
} from '../../../commons/application/actions/SessionActions';
import { OverallState } from '../../../commons/application/ApplicationTypes';
import AdminPanel, { DispatchProps, StateProps } from './AdminPanel';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  courseName: state.session.courseName,
  courseShortName: state.session.courseShortName,
  viewable: state.session.viewable,
  enableGame: state.session.enableGame,
  enableAchievements: state.session.enableAchievements,
  enableSourcecast: state.session.enableGame,
  sourceChapter: state.session.sourceChapter,
  sourceVariant: state.session.sourceVariant,
  moduleHelpText: state.session.moduleHelpText,
  assessmentTypes: state.session.assessmentTypes,
  assessmentConfigurations: state.session.assessmentConfigurations
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchCourseConfiguration: fetchCourseConfig,
      handleFetchAssessmentConfig: fetchAssessmentConfig,
      handleUpdateCourseConfig: updateCourseConfig,
      handleUpdateAssessmentTypes: updateAssessmentTypes
    },
    dispatch
  );

const AdminPanelContainer = connect(mapStateToProps, mapDispatchToProps)(AdminPanel);

export default AdminPanelContainer;
