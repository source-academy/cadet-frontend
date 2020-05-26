import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { fetchGradingOverviews } from 'src/commons/application/actions/SessionActions';
import { OverallState } from 'src/commons/application/ApplicationTypes';
import { fetchGroupOverviews } from 'src/features/dashboard/DashboardActions';
import Dashboard, { DispatchProps, StateProps } from './DashboardComponent';

const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  gradingOverviews: state.session.gradingOverviews ? state.session.gradingOverviews : [],
  groupOverviews: state.dashboard.groupOverviews
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleFetchGradingOverviews: fetchGradingOverviews,
      handleFetchGroupOverviews: fetchGroupOverviews
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
