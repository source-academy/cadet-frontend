import { Alignment, Classes, Icon, Navbar, NavbarGroup } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import { IState, Role } from '../../reducers/states';
import { assessmentCategoryLink } from '../../utils/paramParseHelpers';
import { AssessmentCategories } from '../assessment/assessmentShape';

import { connect } from 'react-redux';
import NotificationBadge from '../notification/NotificationBadge';
import { AcademyNotification } from '../notification/notificationShape';

type NavigationBarProps = OwnProps & StateProps;

type OwnProps = {
  role: Role;
};

type StateProps = {
  notifications: AcademyNotification[];
};

const NavigationBar: React.SFC<NavigationBarProps> = props => (
  <Navbar className="NavigationBar secondary-navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Mission)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.FLAME} />
        <div className="navbar-button-text hidden-xs">Missions</div>
        <NotificationBadge
          notifications={props.notifications.filter(
            n => !n.submission_id && n.assessment_type && n.assessment_type === 'Mission'
          )}
          enableHover={false}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Sidequest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.LIGHTBULB} />
        <div className="navbar-button-text hidden-xs">Quests</div>
        <NotificationBadge
          notifications={props.notifications.filter(
            n => !n.submission_id && n.assessment_type && n.assessment_type === 'Sidequest'
          )}
          enableHover={false}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Path)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.PREDICTIVE_ANALYSIS} />
        <div className="navbar-button-text hidden-xs">Paths</div>
        <NotificationBadge
          notifications={props.notifications.filter(
            n => !n.submission_id && n.assessment_type && n.assessment_type === 'Path'
          )}
          enableHover={false}
        />
      </NavLink>

      <NavLink
        to={`/academy/${assessmentCategoryLink(AssessmentCategories.Contest)}`}
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
      >
        <Icon icon={IconNames.COMPARISON} />
        <div className="navbar-button-text hidden-xs">Contests</div>
        <NotificationBadge
          notifications={props.notifications.filter(
            n => !n.submission_id && n.assessment_type && n.assessment_type === 'Contest'
          )}
          enableHover={false}
        />
      </NavLink>
    </NavbarGroup>
    {props.role === Role.Admin || props.role === Role.Staff ? (
      <NavbarGroup align={Alignment.RIGHT}>
        <NavLink
          to={'/academy/grading'}
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        >
          <Icon icon={IconNames.ENDORSED} />
          <div className="navbar-button-text hidden-xs">Grading</div>
          <NotificationBadge
            notifications={props.notifications.filter(n => n.submission_id)}
            enableHover={false}
          />
        </NavLink>
      </NavbarGroup>
    ) : null}
  </Navbar>
);

const mapStateToProps = (state: IState) => ({
  notifications: state.session.notifications
});

export default connect(mapStateToProps)(NavigationBar);
