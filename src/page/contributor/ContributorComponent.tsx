import { Card, Elevation } from '@blueprintjs/core';
import * as React from 'react';

import ContributorsDetails from './ContributorsDetails';
import ContributorsList from './ContributorsList';

export class Contributors extends React.Component {
  public render() {
    return (
      <div className="fullpage">
        <Card className="fullpage-content" elevation={Elevation.THREE}>
          <ContributorsDetails />
          <ContributorsList />
        </Card>
      </div>
    );
  }
}

export default Contributors;
