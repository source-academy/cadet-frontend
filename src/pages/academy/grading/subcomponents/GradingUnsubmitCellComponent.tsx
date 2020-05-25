import { Alert, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from 'src/commons/ControlButton';
import { GradingOverview } from 'src/features/grading/GradingTypes';
import { Role } from 'src/reducers/states';

export type UnsubmitCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleUnsubmitSubmission: (submissionId: number) => void;
};

type StateProps = {
  data: GradingOverview;
  group: string | null;
  role?: Role;
};

type State = {
  isAlertOpen: boolean;
};

class UnsubmitCell extends React.Component<UnsubmitCellProps, State> {
  public constructor(props: UnsubmitCellProps) {
    super(props);

    this.state = {
      isAlertOpen: false
    };
  }

  public render() {
    if (this.props.data.submissionStatus !== 'submitted') {
      return null;
    } else if (this.props.group !== this.props.data.groupName && this.props.role! !== Role.Admin) {
      return null;
    }

    return (
      <div>
        <Alert
          canEscapeKeyCancel={true}
          canOutsideClickCancel={true}
          cancelButtonText="Cancel"
          className="unsubmit-alert alert"
          intent={Intent.DANGER}
          onConfirm={this.handleConfirmUnsubmit}
          isOpen={this.state.isAlertOpen}
          onCancel={this.handleUnsubmitAlertClose}
        >
          Are you sure you want to unsubmit?
        </Alert>
        {controlButton('', IconNames.ARROW_LEFT, () => this.setState({ isAlertOpen: true }), {
          fullWidth: true
        })}
      </div>
    );
  }

  private handleConfirmUnsubmit = () => {
    this.props.handleUnsubmitSubmission(this.props.data.submissionId);
    this.setState({ isAlertOpen: false });
  };

  private handleUnsubmitAlertClose = () => this.setState({ isAlertOpen: false });
}

export default UnsubmitCell;
