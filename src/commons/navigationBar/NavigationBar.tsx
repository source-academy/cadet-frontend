import {
  Alignment,
  Button,
  Classes,
  Drawer,
  FocusStyleManager,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Position
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Tooltip2 } from '@blueprintjs/popover2';
import classNames from 'classnames';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';
import { NavLink, Route, Switch } from 'react-router-dom';

import SicpNavigationBar from '../../commons/navigationBar/subcomponents/SicpNavigationBar';
import { Role } from '../application/ApplicationTypes';
import Dropdown from '../dropdown/Dropdown';
import Constants from '../utils/Constants';
import AcademyNavigationBar from './subcomponents/AcademyNavigationBar';
import NavigationBarMobileSideMenu from './subcomponents/NavigationBarMobileSideMenu';

type NavigationBarProps = DispatchProps & StateProps;

type DispatchProps = {
  handleLogOut: () => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

type StateProps = {
  role?: Role;
  title: string;
  name?: string;
};

const NavigationBar: React.FC<NavigationBarProps> = props => {
  const [mobileSideMenuOpen, setMobileSideMenuOpen] = React.useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(true);
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });

  FocusStyleManager.onlyShowFocusOnTabs();

  const playgroundOnlyNavbarLeft = Constants.enableGitHubAssessments ? (
    isMobileBreakpoint ? (
      <>
        <NavbarGroup align={Alignment.LEFT}>
          <Button
            onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
            icon={IconNames.MENU}
            large={true}
            minimal={true}
          />
          <NavLink
            className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
            to="/"
          >
            <Icon icon={IconNames.SYMBOL_DIAMOND} />
            <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
          </NavLink>
          <Drawer
            isOpen={mobileSideMenuOpen}
            position="left"
            onClose={() => setMobileSideMenuOpen(false)}
            title=""
            className={Classes.DARK}
          >
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to="/playground"
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.CODE} />
              <div>Playground</div>
            </NavLink>
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to="/githubassessments/missions"
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.BRIEFCASE} />
              <div>Classroom</div>
            </NavLink>
            <NavLink
              activeClassName={Classes.ACTIVE}
              className={classNames(
                'NavigationBar__link__mobile',
                Classes.BUTTON,
                Classes.MINIMAL,
                Classes.LARGE
              )}
              to="/sicpjs/index"
              onClick={() => setMobileSideMenuOpen(false)}
            >
              <Icon icon={IconNames.BOOK} />
              <div>SICP JS</div>
            </NavLink>
          </Drawer>
        </NavbarGroup>
      </>
    ) : (
      <NavbarGroup align={Alignment.LEFT}>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/playground"
        >
          <Icon icon={IconNames.CODE} />
          <div>Playground</div>
        </NavLink>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/githubassessments"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div>Classroom</div>
        </NavLink>
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
          to="/sicpjs/index"
        >
          <Icon icon={IconNames.BOOK} />
          <div>SICP JS</div>
        </NavLink>
      </NavbarGroup>
    )
  ) : (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div>Playground</div>
      </NavLink>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link__mobile', Classes.BUTTON, Classes.MINIMAL)}
        to="/sicpjs/index"
      >
        <Icon icon={IconNames.BOOK} />
        <div>SICP JS</div>
      </NavLink>
    </NavbarGroup>
  );

  const mobileNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <Button
        onClick={() => setMobileSideMenuOpen(!mobileSideMenuOpen)}
        icon={IconNames.MENU}
        large={true}
        minimal={true}
      />

      <NavLink
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      <NavigationBarMobileSideMenu
        role={props.role}
        isOpen={mobileSideMenuOpen}
        onClose={() => setMobileSideMenuOpen(false)}
        handleGitHubLogIn={() => props.handleGitHubLogIn}
        handleGitHubLogOut={() => props.handleGitHubLogOut}
      />
    </NavbarGroup>
  );

  const desktopNavbarLeft = (
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/academy"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading style={{ paddingBottom: '0px' }}>Source Academy</NavbarHeading>
      </NavLink>

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/sourcecast"
      >
        <Icon icon={IconNames.MUSIC} />
        <div className="navbar-button-text">Sourcecast</div>
      </NavLink>

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/playground"
      >
        <Icon icon={IconNames.CODE} />
        <div className="navbar-button-text">Playground</div>
      </NavLink>

      {Constants.enableGitHubAssessments && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/githubassessments"
        >
          <Icon icon={IconNames.BRIEFCASE} />
          <div className="navbar-button-text">Classroom</div>
        </NavLink>
      )}

      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/sicpjs/index"
      >
        <Icon icon={IconNames.BOOK} />
        <div className="navbar-button-text">SICP JS</div>
      </NavLink>

      {props.role && Constants.enableAchievements && (
        <NavLink
          activeClassName={Classes.ACTIVE}
          className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
          to="/achievement"
        >
          <Icon icon={IconNames.MOUNTAIN} />
          <div className="navbar-button-text">Achievement</div>
        </NavLink>
      )}
    </NavbarGroup>
  );

  const commonNavbarRight = (
    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        activeClassName={Classes.ACTIVE}
        className={classNames('NavigationBar__link', Classes.BUTTON, Classes.MINIMAL)}
        to="/contributors"
      >
        <Icon icon={IconNames.HEART} />
        <div className="navbar-button-text hidden-sm hidden-xs">Contributors</div>
      </NavLink>

      {!Constants.playgroundOnly && props.role && !isMobileBreakpoint && (
        <>
          <NavbarDivider className="default-divider" />
          <Tooltip2 content="Toggle Menu" placement={Position.BOTTOM}>
            <Button
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              icon={IconNames.COMPASS}
              minimal={true}
              style={{ outline: 'none' }}
            />
          </Tooltip2>
        </>
      )}

      <div className="visible-xs">
        <NavbarDivider className="thin-divider" />
      </div>
      <div className="hidden-xs">
        <NavbarDivider className="default-divider" />
      </div>

      <Dropdown handleLogOut={props.handleLogOut} name={props.name} />
    </NavbarGroup>
  );

  return (
    <>
      <Navbar className={classNames('NavigationBar', 'primary-navbar', Classes.DARK)}>
        {Constants.playgroundOnly
          ? playgroundOnlyNavbarLeft
          : isMobileBreakpoint
          ? mobileNavbarLeft
          : desktopNavbarLeft}
        {commonNavbarRight}
      </Navbar>

      <Switch>
        <Route path="/sicpjs/:section?">
          <SicpNavigationBar />
        </Route>
        <Route>
          {!Constants.playgroundOnly && props.role && !isMobileBreakpoint && desktopMenuOpen && (
            <AcademyNavigationBar role={props.role} />
          )}
        </Route>
      </Switch>
    </>
  );
};

export default NavigationBar;
