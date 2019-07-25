import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { NavLink } from 'react-router-dom';

import { controlButton } from '../../commons/controlButton';
import { GradingOverview } from './gradingShape';

type EditGradingCellProps = {
  data: GradingOverview;
};

/**
 * Used to render a link in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class EditGradingCell extends React.Component<EditGradingCellProps, {}> {
  constructor(props: EditGradingCellProps) {
    super(props);
  }

  public render() {
    return (
      <NavLink
        to={`/academy/grading/${this.props.data.submissionId}`}
        activeClassName={Classes.ACTIVE}
      >
        {controlButton('', IconNames.ANNOTATION, () => null, { fullWidth: true })}
      </NavLink>
    );
  }
}

export default EditGradingCell;
