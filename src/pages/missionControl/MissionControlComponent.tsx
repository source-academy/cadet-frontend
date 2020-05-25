import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { AssessmentOverview, AssessmentStatuses } from 'src/commons/assessment/AssessmentTypes';
import ContentDisplay from 'src/commons/ContentDisplay';
import { EditingOverviewCard } from 'src/commons/editingOverviewCard/EditingOverviewCardComponent';
import { OwnProps as EditingWorkspaceOwnProps } from 'src/commons/editingWorkspace/EditingWorkspaceComponent';
import EditingWorkspaceContainer from 'src/commons/editingWorkspace/EditingWorkspaceContainer';
import MissionCreator from 'src/commons/missionCreator/MissionCreatorContainer';
import { retrieveLocalAssessmentOverview } from 'src/commons/XMLParser/XMLParserHelper';
import { stringParamToInt } from 'src/utils/paramParseHelpers';

const DEFAULT_QUESTION_ID: number = 0;

// TODO: Duplicate with AssessmentComponent
type MissionControlParams = {
  assessmentId?: string;
  questionId?: string;
};

export type MissionControlProps = DispatchProps & StateProps & RouteComponentProps<MissionControlParams>;

export type DispatchProps = {
  handleAssessmentOverviewFetch: () => void;
  handleSubmitAssessment: (id: number) => void;
};

export type StateProps = {
  isStudent: boolean;
};

type State = {
  editOverview: string;
  editingOverview: AssessmentOverview | null;
};

class MissionControl extends React.Component<MissionControlProps, State> {
  public constructor(props: MissionControlProps) {
    super(props);
    this.state = {
      editOverview: '',
      editingOverview: retrieveLocalAssessmentOverview()
    };
  }

  public render() {
    const assessmentId: number | null = stringParamToInt(this.props.match.params.assessmentId);
    const questionId: number =
      stringParamToInt(this.props.match.params.questionId) || DEFAULT_QUESTION_ID;

    // If mission for testing is to render, create workspace
    if (assessmentId === -1) {
      if (this.state.editingOverview) {
        const overview = this.state.editingOverview;
        const assessmentProps: EditingWorkspaceOwnProps = {
          assessmentId,
          questionId,
          assessmentOverview: overview,
          updateAssessmentOverview: this.updateEditingOverview,
          notAttempted: overview.status === AssessmentStatuses.not_attempted,
          closeDate: overview.closeAt
        };
        return (
          <div className="Academy">
            <EditingWorkspaceContainer {...assessmentProps} />
          </div>
        );
      }
    }

    /** Mission editing card */
    const missionEditingCard = this.state.editingOverview ? (
      <EditingOverviewCard
        overview={this.state.editingOverview}
        updateEditingOverview={this.updateEditingOverview}
        listingPath="/mission-control"
      />
    ) : null;

    const display = (
      <>
        <MissionCreator updateEditingOverview={this.updateEditingOverview} />
        {missionEditingCard}
      </>
    );

    // Finally, render the ContentDisplay.
    return (
      <div className="Assessment Academy">
        <ContentDisplay
          display={display}
          loadContentDispatch={this.props.handleAssessmentOverviewFetch}
        />
      </div>
    );
  }

  private updateEditingOverview = (overview: AssessmentOverview) => {
    this.setState({
      editingOverview: overview
    });
  };
}

export default MissionControl;
