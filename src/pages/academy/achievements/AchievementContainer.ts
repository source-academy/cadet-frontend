import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { OverallState } from '../../../commons/application/ApplicationTypes';
import Achievement, { DispatchProps, StateProps } from './Achievement';
import { getAchievements } from 'src/commons/achievements/AchievementActions';
import { defaultMockAchievements } from 'src/commons/mocks/AchievementMocks';
import Inferencer from './subcomponents/utils/Inferencer';

// TODO: replace defaultAchievements with fetch database data
const mapStateToProps: MapStateToProps<StateProps, {}, OverallState> = state => ({
  inferencer: new Inferencer(defaultMockAchievements)
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      handleAchievementsFetch: getAchievements
    },
    dispatch
  );

const AchievementContainer = connect(mapStateToProps, mapDispatchToProps)(Achievement);

export default AchievementContainer;