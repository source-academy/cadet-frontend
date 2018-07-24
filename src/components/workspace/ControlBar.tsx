import { Button, Intent, MenuItem, Popover, Text, Tooltip } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ItemRenderer, Select } from '@blueprintjs/select'
import * as React from 'react'
import * as CopyToClipboard from 'react-copy-to-clipboard'

import { externalLibraries } from '../../reducers/externalLibraries'
import { sourceChapters } from '../../reducers/states'
import { controlButton } from '../commons'

/**
 * FullControlBarProps is used to allow the higher order component workspace to
 * pass it's state isUnsavedChanges as a prop to this ControlBar component.
 * Components implementing the higher order component workspace do not need to
 * concern themselves with OwnProps---they will use ControlBarProps instead.
 */
export type FullControlBarProps = ControlBarProps & OwnProps

export type ControlBarProps = {
  hasChapterSelect: boolean
  hasNextButton: boolean
  hasPreviousButton: boolean
  hasSaveButton: boolean
  hasShareButton: boolean
  hasDoneButton: boolean
  isRunning: boolean
  queryString?: string
  sourceChapter: number
  externalLibraryName?: string
  handleChapterSelect?: (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleExternalSelect?: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
  handleEditorEval: () => void
  handleGenerateLz?: () => void
  handleInterruptEval: () => void
  handleReplEval: () => void
  handleReplOutputClear: () => void
  onClickNext?(): any
  onClickPrevious?(): any
  onClickSave?(): any
  onClickDone?(): any
}

export type OwnProps = {
  isUnsavedChanges: boolean
}

interface IChapter {
  chapter: number
  displayName: string
}

/**
 * Defined for displaying an external library.
 * @see Library under assessmentShape.ts for
 *   the definition of a Library in an assessment.
 */
interface IExternal {
  key: number
  name: string
  symbols: string[]
}

class ControlBar extends React.PureComponent<FullControlBarProps, {}> {
  public static defaultProps: Partial<ControlBarProps> = {
    hasChapterSelect: false,
    hasNextButton: false,
    hasPreviousButton: false,
    hasSaveButton: false,
    hasShareButton: true,
    hasDoneButton: false,
    onClickNext: () => {},
    onClickPrevious: () => {},
    onClickSave: () => {}
  }

  private shareInputElem: HTMLInputElement

  constructor(props: FullControlBarProps) {
    super(props)
    this.selectShareInputText = this.selectShareInputText.bind(this)
  }

  public render() {
    return (
      <div className="ControlBar">
        {this.editorControl()}
        {this.flowControl()}
        {this.replControl()}
      </div>
    )
  }

  private editorControl() {
    const runButton = (
      <Tooltip content="...or press shift-enter in the editor">
        {controlButton('Run', IconNames.PLAY, this.props.handleEditorEval)}
      </Tooltip>
    )
    const stopButton = controlButton('Stop', IconNames.STOP, this.props.handleInterruptEval)
    const saveButtonOpts = this.props.isUnsavedChanges
      ? { intent: Intent.WARNING, minimal: false }
      : {}
    const saveButton = this.props.hasSaveButton
      ? controlButton('Save', IconNames.FLOPPY_DISK, this.props.onClickSave, saveButtonOpts)
      : undefined
    const shareUrl = `${window.location.protocol}//${window.location.hostname}/playground#${
      this.props.queryString
    }`
    const shareButton = this.props.hasShareButton ? (
      <Popover popoverClassName="Popover-share" inheritDarkTheme={false}>
        {controlButton('Share', IconNames.SHARE, this.props.handleGenerateLz)}
        {this.props.queryString === undefined ? (
          <Text>
            Share your programs! Type something into the editor (left), then click on this button
            again.
          </Text>
        ) : (
          <>
            <input
              defaultValue={shareUrl}
              readOnly={true}
              ref={e => (this.shareInputElem = e!)}
              onFocus={this.selectShareInputText}
            />
            <CopyToClipboard text={shareUrl}>
              {controlButton('', IconNames.DUPLICATE, this.selectShareInputText)}
            </CopyToClipboard>
          </>
        )}
      </Popover>
    ) : (
      undefined
    )
    const chapterSelectButton = this.props.hasChapterSelect
      ? chapterSelect(this.props.sourceChapter, this.props.handleChapterSelect)
      : undefined
    const externalSelectButton =
      this.props.hasChapterSelect && this.props.externalLibraryName !== undefined
        ? externalSelect(this.props.externalLibraryName, this.props.handleExternalSelect!)
        : undefined
    return (
      <div className="ControlBar_editor pt-button-group">
        {this.props.isRunning ? stopButton : runButton} {saveButton}
        {shareButton} {chapterSelectButton} {externalSelectButton}
      </div>
    )
  }

  private flowControl() {
    const previousButton = this.props.hasPreviousButton
      ? controlButton('Previous', IconNames.ARROW_LEFT, this.props.onClickPrevious)
      : undefined
    const nextButton = this.props.hasNextButton
      ? controlButton('Next', IconNames.ARROW_RIGHT, this.props.onClickNext, { iconOnRight: true })
      : undefined
    const submitButton = this.props.hasDoneButton
      ? controlButton('Done', IconNames.TICK_CIRCLE, this.props.onClickDone, {
          iconOnRight: true
        })
      : undefined

    return (
      <div className="ControlBar_flow pt-button-group">
        {previousButton} {nextButton} {submitButton}
      </div>
    )
  }

  private replControl() {
    const evalButton = (
      <Tooltip content="...or press shift-enter in the REPL">
        {controlButton('Eval', IconNames.CODE, this.props.handleReplEval)}
      </Tooltip>
    )
    const clearButton = controlButton('Clear', IconNames.REMOVE, this.props.handleReplOutputClear)
    return (
      <div className="ControlBar_repl pt-button-group">
        {this.props.isRunning ? null : evalButton} {clearButton}
      </div>
    )
  }

  private selectShareInputText() {
    this.shareInputElem.focus()
    this.shareInputElem.select()
  }
}

function styliseChapter(chap: number) {
  return `Source \xa7${chap}`
}

const chapters = sourceChapters.map(chap => ({ displayName: styliseChapter(chap), chapter: chap }))

const chapterSelect = (
  currentChap: number,
  handleSelect = (i: IChapter, e: React.ChangeEvent<HTMLSelectElement>) => {}
) => (
  <ChapterSelectComponent
    className="pt-minimal"
    items={chapters}
    onItemSelect={handleSelect}
    itemRenderer={chapterRenderer}
    filterable={false}
  >
    <Button
      className="pt-minimal"
      text={styliseChapter(currentChap)}
      rightIcon="double-caret-vertical"
    />
  </ChapterSelectComponent>
)

const ChapterSelectComponent = Select.ofType<IChapter>()

const chapterRenderer: ItemRenderer<IChapter> = (chap, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={chap.chapter} onClick={handleClick} text={chap.displayName} />
)

const iExternals = Array.from(externalLibraries.entries()).map((entry, index) => ({
  name: entry[0],
  key: index,
  symbols: entry[1]
}))

const externalSelect = (
  currentExternal: string,
  handleSelect: (i: IExternal, e: React.ChangeEvent<HTMLSelectElement>) => void
) => (
  <ExternalSelectComponent
    className="pt-minimal"
    items={iExternals}
    onItemSelect={handleSelect}
    itemRenderer={externalRenderer}
    filterable={false}
  >
    <Button className="pt-minimal" text={currentExternal} rightIcon="double-caret-vertical" />
  </ExternalSelectComponent>
)

const ExternalSelectComponent = Select.ofType<IExternal>()

const externalRenderer: ItemRenderer<IExternal> = (external, { handleClick, modifiers, query }) => (
  <MenuItem active={false} key={external.key} onClick={handleClick} text={external.name} />
)

export default ControlBar
