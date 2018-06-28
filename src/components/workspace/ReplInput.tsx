import { throttle } from 'lodash'
import * as React from 'react'
import AceEditor from 'react-ace'

import 'brace/mode/javascript'
import 'brace/theme/terminal'

export interface IReplInputProps {
  replValue: string
  handleReplValueChange: (newCode: string) => void
  handleReplEval: () => void
}

class ReplInput extends React.Component<IReplInputProps, {}> {
  public render() {
    return (
      <AceEditor
        className="repl-react-ace react-ace"
        mode="javascript"
        theme="cobalt"
        height="1px"
        width="100%"
        value={this.props.replValue}
        onChange={throttle(this.props.handleReplValueChange, 2000, {
          leading: false,
          trailing: true
        })}
        commands={[
          {
            name: 'evaluate',
            bindKey: {
              win: 'Shift-Enter',
              mac: 'Shift-Enter'
            },
            exec: this.props.handleReplEval
          }
        ]}
        minLines={1}
        maxLines={20}
        fontSize={14}
        highlightActiveLine={false}
        showGutter={false}
      />
    )
  }
}

export default ReplInput
