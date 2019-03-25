import { ButtonGroup, Classes, Dialog, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { IAssessment } from '../../assessment/assessmentShape';
import { controlButton } from '../../commons';
import Markdown from '../../commons/Markdown';
import { mcqTemplate, programmingTemplate } from '../../incubator/assessmentTemplates';

interface IProps {
  assessment: IAssessment;
  hasUnsavedChanges: boolean;
  questionId: number;
  updateAssessment: (assessment: IAssessment) => void;
}

interface IState {
  showSaveOverlay: boolean;
  modifyAssessment: () => void;
}

export class ManageQuestionTab extends React.Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      showSaveOverlay: false,
      modifyAssessment: () => {}
    };
  }

  public render() {
    return (
      <div>
        {this.confirmSaveOverlay()}
        {this.manageQuestionTab()}
      </div>
    );
  }

  private manageQuestionTab = () => {
    return (
      <div>
        {controlButton(
          'Clone Current Question',
          IconNames.DOCUMENT,
          this.confirmSave(
            this.makeQuestion(() => this.props.assessment.questions[this.props.questionId])
          )
        )}
        <br />
        {controlButton(
          'Insert Programming Question',
          IconNames.FONT,
          this.confirmSave(this.makeQuestion(programmingTemplate))
        )}
        {controlButton(
          'Insert MCQ Question',
          IconNames.CONFIRM,
          this.confirmSave(this.makeQuestion(mcqTemplate))
        )}
        <br />
        {controlButton(
          'Delete Current Question',
          IconNames.REMOVE,
          this.confirmSave(this.deleteQuestion)
        )}
        <br />
        {controlButton(
          'Shift Question Left',
          IconNames.CARET_LEFT,
          this.confirmSave(() => this.shiftQuestion(-1))
        )}
        {controlButton(
          'Shift Question Right',
          IconNames.CARET_RIGHT,
          this.confirmSave(() => this.shiftQuestion(1))
        )}
      </div>
    );
  };

  private shiftQuestion = (dir: number) => {
    const assessment = this.props.assessment;
    const index = this.props.questionId;
    const question = assessment.questions[index];
    let questions = assessment.questions;
    questions = questions.slice(0, index).concat(questions.slice(index + 1));
    questions = questions
      .slice(0, index + dir)
      .concat([question])
      .concat(questions.slice(index + dir));
    assessment.questions = questions;
    // tslint:disable-next-line:no-console
    console.log(questions);
    this.props.updateAssessment(assessment);
  };

  private makeQuestion = (template: () => any) => () => {
    const assessment = this.props.assessment;
    const index = this.props.questionId;
    let questions = assessment.questions;
    questions = questions
      .slice(0, index)
      .concat([template()])
      .concat(questions.slice(index));
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
  };

  private deleteQuestion = () => {
    const assessment = this.props.assessment;
    let questions = assessment.questions;
    const index = this.props.questionId;
    if (questions.length > 1) {
      questions = questions.slice(0, index).concat(questions.slice(index + 1));
    }
    assessment.questions = questions;
    this.props.updateAssessment(assessment);
  };

  private confirmSave = (modifyAssessment: () => void) => () => {
    if (this.props.hasUnsavedChanges) {
      this.setState({
        showSaveOverlay: true,
        modifyAssessment
      });
    } else {
      modifyAssessment();
    }
  };

  /**
   * Asks to save work.
   */
  private confirmSaveOverlay = () => (
    <Dialog
      className="assessment-reset"
      icon={IconNames.ERROR}
      isCloseButtonShown={false}
      isOpen={this.state.showSaveOverlay}
      title="Confirmation: Save unsaved changes?"
    >
      <div className={Classes.DIALOG_BODY}>
        <Markdown content="Are you sure you want to save over your unsaved changes?" />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <ButtonGroup>
          {controlButton('Cancel', null, () => this.setState({ showSaveOverlay: false }), {
            minimal: false
          })}
          {controlButton(
            'Confirm',
            null,
            () => {
              this.state.modifyAssessment();
              this.setState({
                showSaveOverlay: false
              });
            },
            { minimal: false, intent: Intent.DANGER }
          )}
        </ButtonGroup>
      </div>
    </Dialog>
  );
}

export default ManageQuestionTab;
