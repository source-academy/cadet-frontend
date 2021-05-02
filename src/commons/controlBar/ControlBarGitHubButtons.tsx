import { ButtonGroup, Classes, Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { Popover2 } from '@blueprintjs/popover2';
import { Octokit } from '@octokit/rest';
import * as React from 'react';
import { useMediaQuery } from 'react-responsive';

import { GitHubState } from '../../features/github/GitHubTypes';
import { store } from '../../pages/createStore';
import controlButton from '../ControlButton';
import Constants from '../utils/Constants';

export type ControlBarGitHubButtonsProps = {
  loggedInAs?: Octokit;
  githubSaveInfo: { repoName: string; filePath: string };
  onClickOpen?: () => any;
  onClickSave?: () => any;
  onClickSaveAs?: () => any;
  onClickLogIn?: () => any;
  onClickLogOut?: () => any;
};

const stateToIntent: { [state in GitHubState]: Intent } = {
  LOGGED_OUT: Intent.NONE,
  LOGGED_IN: Intent.NONE
};

export const ControlBarGitHubButtons: React.FC<ControlBarGitHubButtonsProps> = props => {
  // The 'loggedInAs' is not used directly in this code block
  // However, keeping it in will ensure that the component re-renders immediately
  // Or else, the re-render has to be triggered by something else

  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const isLoggedIn = store.getState().session.githubOctokitInstance !== undefined;

  const shouldDisableButtons = !isLoggedIn;
  const shouldDisableSaveButton =
    props.githubSaveInfo.repoName === '' || props.githubSaveInfo.filePath === '';

  const state: GitHubState = isLoggedIn ? 'LOGGED_IN' : 'LOGGED_OUT';

  const mainButton = controlButton('GitHub', IconNames.GIT_BRANCH, null, {
    intent: stateToIntent[state]
  });

  const openButton = controlButton(
    'Open',
    IconNames.DOCUMENT_OPEN,
    props.onClickOpen,
    undefined,
    shouldDisableButtons
  );

  const saveButton = controlButton(
    'Save',
    IconNames.FLOPPY_DISK,
    props.onClickSave,
    undefined,
    shouldDisableButtons || shouldDisableSaveButton
  );

  const saveAsButton = controlButton(
    'Save As',
    IconNames.SEND_TO,
    props.onClickSaveAs,
    undefined,
    shouldDisableButtons
  );

  const loginButton = isLoggedIn
    ? controlButton('Log Out', IconNames.LOG_OUT, props.onClickLogOut)
    : controlButton('Log In', IconNames.LOG_IN, props.onClickLogIn);

  return (
    <Popover2
      autoFocus={false}
      content={
        <div>
          <ButtonGroup large={!isMobileBreakpoint}>
            {openButton}
            {saveButton}
            {saveAsButton}
            {loginButton}
          </ButtonGroup>
        </div>
      }
      popoverClassName={Classes.POPOVER_DISMISS}
    >
      {mainButton}
    </Popover2>
  );
};
