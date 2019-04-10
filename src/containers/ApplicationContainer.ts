import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { withRouter } from 'react-router';
import { bindActionCreators, Dispatch } from 'redux';

import { beginClearContext, logOut, updateEditorValue } from '../actions';
import {
  ensureLibrariesLoaded,
  playgroundExternalSelect,
  WorkspaceLocations
} from '../actions/workspaces';
import Application, { IDispatchProps, IStateProps } from '../components/Application';
import { ExternalLibraryName } from '../components/assessment/assessmentShape';
import { externalLibraries } from '../reducers/externalLibraries';
import { IState } from '../reducers/states';

/**
 * Provides the title of the application for display.
 * An object with the relevant properties must be
 * returned instead of an object of type @type {IApplicationProps},
 * as the routing properties of @type {RouteComponentProps} are
 * provided using the withRouter() method below.
 */
const mapStateToProps: MapStateToProps<IStateProps, {}, IState> = state => ({
  title: state.application.title,
  accessToken: state.session.accessToken,
  role: state.session.role,
  name: state.session.name,
  currentPlaygroundChapter: state.workspaces.playground.context.chapter,
  currentPlaygroundExternalLibrary: state.workspaces.playground.playgroundExternal
});

const workspaceLocation = WorkspaceLocations.playground;

const mapDispatchToProps: MapDispatchToProps<IDispatchProps, {}> = (dispatch: Dispatch<any>) =>
  bindActionCreators(
    {
      handleClearContext: (chapter: number, externalLibraryName: ExternalLibraryName) =>
        beginClearContext(
          {
            chapter,
            external: {
              name: externalLibraryName,
              symbols: externalLibraries.get(externalLibraryName)!
            },
            globals: []
          },
          workspaceLocation
        ),
      handleEditorValueChange: (val: string) => updateEditorValue(val, workspaceLocation),
      handleEnsureLibrariesLoaded: ensureLibrariesLoaded,
      handleLogOut: logOut,
      handlePlaygroundExternalSelect: (externalLibraryName: ExternalLibraryName) =>
        playgroundExternalSelect(externalLibraryName, workspaceLocation)
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));
