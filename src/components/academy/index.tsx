import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import Grading from '../../containers/academy/grading';
import AssessmentContainer from '../../containers/assessment';
import Game from '../../containers/GameContainer';
import { isAcademyRe } from '../../reducers/session';
import { Role } from '../../reducers/states';
import { HistoryHelper } from '../../utils/history';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategories, AssessmentCategory } from '../assessment/assessmentShape';
import AcademyNavigationBar from './NavigationBar';

interface IAcademyProps extends IOwnProps, IStateProps, RouteComponentProps<{}> {}

export interface IOwnProps {
  accessToken?: string;
  role: Role;
}

export interface IStateProps {
  historyHelper: HistoryHelper;
}

const assessmentRenderFactory = (cat: AssessmentCategory) => (
  routerProps: RouteComponentProps<any>
) => <AssessmentContainer assessmentCategory={cat} />;

const assessmentRegExp = ':assessmentId(\\d+)?/:questionId(\\d+)?';
const gradingRegExp = ':submissionId(\\d+)?/:questionId(\\d+)?';

export const Academy: React.SFC<IAcademyProps> = props => (
  <div className="Academy">
    <AcademyNavigationBar role={props.role} />
    <Switch>
      <Route
        path={`/academy/${assessmentCategoryLink(
          AssessmentCategories.Contest
        )}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Contest)}
      />
      <Route path="/academy/game" component={Game} />
      <Route
        path={`/academy/${assessmentCategoryLink(
          AssessmentCategories.Mission
        )}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Mission)}
      />
      <Route
        path={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Path)}
      />
      <Route
        path={`/academy/${assessmentCategoryLink(
          AssessmentCategories.Sidequest
        )}/${assessmentRegExp}`}
        render={assessmentRenderFactory(AssessmentCategories.Sidequest)}
      />
      <Route path={`/academy/grading/${gradingRegExp}`} component={Grading} />
      <Route exact={true} path="/academy" component={dynamicRedirect(props)} />
      <Route component={redirectTo404} />
    </Switch>
  </div>
);

/**
 * 1. If user is in /academy.*, redirect to game
 * 2. If not, redirect to the last /acdaemy.* route the user was in
 * See src/utils/history.ts for more details
 */
const dynamicRedirect = (props: IStateProps) => {
  const clickedFrom = props.historyHelper.lastGeneralLocations[0];
  const lastAcademy = props.historyHelper.lastAcademyLocations[0];
  if (clickedFrom != null && isAcademyRe.exec(clickedFrom!) == null && lastAcademy != null) {
    return () => <Redirect to={lastAcademy!} />;
  } else {
    return redirectToGame;
  }
};

const redirectTo404 = () => <Redirect to="/404" />;

const redirectToGame = () => <Redirect to="/academy/game" />;

export default Academy;
