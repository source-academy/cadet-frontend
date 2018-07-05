import { NumericInput, Position } from '@blueprintjs/core';
import * as React from 'react'
import ReactMde, { ReactMdeTypes } from 'react-mde'
import * as Showdown from 'showdown'

type GradingEditorProps = DispatchProps & OwnProps & StateProps

export type DispatchProps = {
  handleGradingCommentsChange: (s: string) => void
}

export type OwnProps = {
  maximumXP: number
}

export type StateProps = {
  gradingCommentsValue: string
}

class GradingEditor extends React.Component<
  GradingEditorProps,
  { mdeState: ReactMdeTypes.MdeState }
> {
  private converter: Showdown.Converter

  constructor(props: GradingEditorProps) {
    super(props)
    this.state = {
      mdeState: {
        markdown: this.props.gradingCommentsValue
      }
    }
    this.converter = new Showdown.Converter({
      tables: true,
      simplifiedAutoLink: true,
      strikethrough: true,
      tasklists: true,
      openLinksInNewWindow: true
    })
  }

  /**
   * Update the redux state's grading comments value, using the latest
   * value in the local state.
   */
  public componentWillUnmount() {
    this.props.handleGradingCommentsChange(this.state.mdeState.markdown!)
  }

  public render() {
    return (
      <>
        <div className='grading-editor-input-parent'>
          <NumericInput 
            buttonPosition={Position.LEFT} 
            placeholder={'XP here'} 
            min={0} 
            max={this.props.maximumXP}/>
        </div>
        <div className='react-mde-parent'>
          <ReactMde
            layout={'vertical'}
            onChange={this.handleValueChange}
            editorState={this.state.mdeState}
            generateMarkdownPreview={this.generateMarkdownPreview}
          />
        </div>
      </>
    )
  }

  private handleValueChange = (mdeState: ReactMdeTypes.MdeState) => {
    this.setState({ mdeState })
  }

  private generateMarkdownPreview = (markdown: string) =>
    Promise.resolve(this.converter.makeHtml(markdown))
}

export default GradingEditor
