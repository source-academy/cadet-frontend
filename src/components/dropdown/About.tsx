import { Classes, Dialog, Tab, Tabs } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import * as React from 'react'

type DialogProps = {
  isOpen: boolean
  onClose: () => void
}

const About: React.SFC<DialogProps> = props => (
  <Dialog
    className="about"
    icon={IconNames.HELP}
    isCloseButtonShown={false}
    isOpen={props.isOpen}
    onClose={props.onClose}
    title="About"
  >
    <div className={Classes.DIALOG_BODY}>
      <Tabs id="about">
        <Tab id="abt" panel={panelAbout}>
          About
        </Tab>
        <Tab id="devs" panel={panelDevs()}>
          Developers
        </Tab>
      </Tabs>
    </div>
  </Dialog>
)

const panelAbout = (
  <>
    <p>
      The <i>Source Academy</i> is an experimental environment for learning programming in the
      CS1101S module at the National University of Singapore.
    </p>
    <p>
      This iteration of Source Academy, code-named <i>Cadet</i>, is available under the MIT License.
      You may find the source code for Cadet at our GitHub organisation,{' '}
      <a href="https://github.com/source-academy">Source Academy</a>.
    </p>
  </>
)

const dot = <span className="dot">&bull;</span>

const panelDevs = () => (
  <div className="devs">
    <p>
      <strong>Project Managers</strong>
    </p>
    <p>Martin Henz {dot} Evan Sebastian</p>
    <p>
      <strong>Frontend Team</strong>
    </p>
    {Math.round(Math.random()) === 0 ? (
      <p>Lee Ning Yuan {dot} Vignesh Shankar</p>
    ) : (
      <p>Vignesh Shankar {dot} Lee Ning Yuan </p>
    )}
    <p>
      <strong>Backend Team</strong>
    </p>
    <p>
      Julius Putra Tanu Setiaji {dot} Chen Shaowei {dot} Sreyans Sipani
    </p>
    <p>
      <strong>Artistic Team</strong>
    </p>
    <p>
      Ng Tse Pei {dot} Joey Yeo {dot} Tan Yu Wei
    </p>
  </div>
)

export default About
