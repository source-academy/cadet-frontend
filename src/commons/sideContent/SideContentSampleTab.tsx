import { Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { DebuggerContext } from '../workspace/WorkspaceTypes';
import { SideContentTab } from './SideContentTypes';

const SideContentSampleTab = (props: any) => {
  return (
    <div>
      <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
        The environmental visualizer generates the environmental model diagram based on breakpoints
        set in the editor.
      </p>
    </div>
  );
};

const toSpawnSideContentSampleTab = (debuggerContext: DebuggerContext) => {
  return Math.random() >= 0.5;
};

const toDespawnSideContentSampleTab = (debuggerContext: DebuggerContext) => {
  return !toSpawnSideContentSampleTab(debuggerContext);
};

export const sampleTab: SideContentTab = {
  label: 'Sample',
  iconName: IconNames.ASTERISK,
  body: <SideContentSampleTab />,
  toSpawn: toSpawnSideContentSampleTab,
  toDespawn: toDespawnSideContentSampleTab
};

export default SideContentSampleTab;
