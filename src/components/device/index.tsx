import { Icon, Navbar, NavbarGroup } from '@blueprintjs/core'
import * as React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import { NavLink } from 'react-router-dom'
import JournalContainer from '../../containers/device/JournalContainer'
import NotFound from '../NotFound'

const redirectToJournal = () => <Redirect to="/device/journal" />

const Device: React.SFC<{}> = () => (
  <div className="Device">
    <Navbar className="NavigationBar pt-dark">
      <NavbarGroup className="pt-align-left">
        <NavLink
          to="/device/journal"
          activeClassName="pt-active"
          className="NavigationBar__link pt-button pt-minimal"
        >
          <Icon icon="book" />
          Journal
        </NavLink>
      </NavbarGroup>
    </Navbar>
    <div className="device-content-parent">
      <Switch>
        <Route path="/device/journal" component={JournalContainer} />
        <Route exact={true} path="/device" component={redirectToJournal} />
        <Route component={NotFound} />
      </Switch>
    </div>
  </div>
)

export default Device
