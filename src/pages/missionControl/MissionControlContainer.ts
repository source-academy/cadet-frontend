import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchAssessmentOverviews, submitAssessment } from 'src/actions/session'; // TODO: Import from commons
import { IState, Role } from 'src/reducers/states'; // TODO: Import from commons
import MissionControl, { DispatchProps, StateProps } from './MissionControlComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, IState> = (state, props) => {
  const stateProps: StateProps = {
    isStudent: state.session.role ? state.session.role === Role.Student : true
  };
  return stateProps;
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAssessmentOverviewFetch: fetchAssessmentOverviews,
      handleSubmitAssessment: submitAssessment
    },
    dispatch
  );

const MissionControlContainer = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MissionControl)
);

export default MissionControlContainer;
