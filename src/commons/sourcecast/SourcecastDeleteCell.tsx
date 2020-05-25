import { Classes, Dialog } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import controlButton from 'src/commons/ControlButton';
import { SourcecastData } from 'src/features/sourcecast/SourcecastTypes';

type DeleteCellProps = DispatchProps & StateProps;

type DispatchProps = {
  handleDeleteSourcecastEntry: (id: number) => void;
};

type StateProps = {
  data: SourcecastData;
};

type State = {
  dialogOpen: boolean;
};

class DeleteCell extends React.Component<DeleteCellProps, State> {
  public constructor(props: DeleteCellProps) {
    super(props);
    this.state = {
      dialogOpen: false
    };
  }

  public render() {
    return (
      <div>
        {controlButton('', IconNames.TRASH, this.handleOpenDialog)}
        <Dialog
          icon="info-sign"
          isOpen={this.state.dialogOpen}
          onClose={this.handleCloseDialog}
          title="Delete Sourcecast"
          canOutsideClickClose={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <p>Are you sure to delete this sourcecast entry?</p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {controlButton('Confirm Delete', IconNames.TRASH, this.handleDelete)}
              {controlButton('Cancel', IconNames.CROSS, this.handleCloseDialog)}
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  private handleCloseDialog = () => this.setState({ dialogOpen: false });
  private handleOpenDialog = () => this.setState({ dialogOpen: true });
  private handleDelete = () => {
    const { data } = this.props;
    this.props.handleDeleteSourcecastEntry(data.id);
  };
}

export default DeleteCell;
