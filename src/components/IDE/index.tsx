import * as React from 'react'

import ControlContainer from '../../containers/IDE/ControlContainer'
import EditorContainer from '../../containers/IDE/EditorContainer'
import ReplContainer from '../../containers/IDE/ReplContainer'

const IDE: React.SFC<{}> = () => (
  <div className="IDE">
    <div className="row button-parent">
      <div className="col-xs-12">
        <ControlContainer />
      </div>
    </div>
    <div className="row ide-content-parent">
      <div className="col-xs-6 editor-parent">
        <EditorContainer />
      </div>
      <div className="col-xs-6 repl-parent">
        <ReplContainer />
      </div>
    </div>
  </div>
)

export default IDE
