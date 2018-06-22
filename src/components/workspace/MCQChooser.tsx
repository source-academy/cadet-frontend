import { Button, Card, Tooltip } from '@blueprintjs/core'
import * as React from 'react'

import { MCQChoice } from '../assessment/assessmentShape'

export interface IMCQChooserProps {
  choices: MCQChoice[]
}

class MCQChooser extends React.Component<IMCQChooserProps, {}> {
  public render() {
    const options = this.props.choices.map((choice, i) => (
      <Button className="mcq-option col-xs-6">
        <Tooltip key={i} content={choice.hint}>
          { choice.content }
        </Tooltip>
      </ Button>
    ))
    return (
        <div className="MCQChooser">
          <Card className="mcq-content-parent row center-xs">
            <div className="col-xs-10">
              <div className="mcq-task-parent row center-xs ">
                <Card className="mcq-task col-xs-12" elevation={2}>
                    MCQ QUESTION
                </ Card>
              </div>
              <div className="row mcq-options-parent center-xs">
                { options } 
              </div>
            </div>
          </Card>
        </div>
    )
  }
}

export default MCQChooser
