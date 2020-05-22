import { Classes, NonIdealState } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as classNames from 'classnames';
import * as React from 'react';

const NotFound: React.SFC<{}> = () => (
  <div className={classNames('NotFound', Classes.DARK)}>
    <NonIdealState
      icon={IconNames.ERROR}
      title="404 Not Found"
      description="The requested resource could not be found"
    />
  </div>
);

export default NotFound;
