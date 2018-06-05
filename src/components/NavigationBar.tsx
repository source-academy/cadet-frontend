import {
  Alignment,
  Icon,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'
import { NavLink } from 'react-router-dom'

export interface INavigationBarProps {
  title: string
}

const NavigationBar: React.SFC<INavigationBarProps> = ({ title }) => (
  <Navbar className="NavigationBar pt-dark">
    <NavbarGroup align={Alignment.LEFT}>
      <NavLink
        to="/device"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.SYMBOL_DIAMOND} />
        <NavbarHeading>Source Academy</NavbarHeading>
      </NavLink>
      <NavLink
        to="/device/announcements"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FEED} />
        News
      </NavLink>
      <NavLink
        to="/device/materials"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.FOLDER_OPEN} />
        Material
      </NavLink>
      <NavLink
        to="/game"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.STAR_EMPTY} />
        Game
      </NavLink>
      <NavLink
        to="/admin"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.EYE_OPEN} />
        Admin
      </NavLink>
    </NavbarGroup>

    <NavbarGroup align={Alignment.RIGHT}>
      <NavLink
        to="/playground"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.CODE} />
        Playground
      </NavLink>
      <NavbarDivider />
      <NavLink
        to="/device/status"
        activeClassName="pt-active"
        className="NavigationBar__link pt-button pt-minimal"
      >
        <Icon icon={IconNames.USER} />
        Profile
      </NavLink>
    </NavbarGroup>
  </Navbar>
)

export default NavigationBar
