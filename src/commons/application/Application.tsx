import { decompressFromEncodedURIComponent } from 'lz-string';
import * as qs from 'query-string';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router';

import { Variant } from 'js-slang/dist/types';

import Academy from '../../pages/academy/AcademyContainer';
import Contributors from '../../pages/contributors/Contributors';
import Login from '../../pages/login/LoginContainer';
import MissionControlContainer from '../../pages/missionControl/MissionControlContainer';
import NotFound from '../../pages/notFound/NotFound';
import Playground from '../../pages/playground/PlaygroundContainer';
import SourcecastContainer from '../../pages/sourcecast/SourcecastContainer';
import NavigationBar from '../navigationBar/NavigationBar';
import { stringParamToInt } from '../utils/ParamParseHelper';
import { Role, sourceLanguages } from './ApplicationTypes';
import { ExternalLibraryName, ExternalLibraryNames } from './types/ExternalTypes';

import Material from '../../containers/material/MaterialContainer'; // TODO: Remove

export type ApplicationProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleClearContext: (
    chapter: number,
    variant: Variant,
    externalLibraryName: ExternalLibraryName
  ) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleEnsureLibrariesLoaded: () => void;
  handleLogOut: () => void;
  handleExternalLibrarySelect: (external: ExternalLibraryName) => void;
  handleSetExecTime: (execTime: string) => void;
};

export type StateProps = {
  accessToken?: string;
  currentPlaygroundChapter: number;
  currentPlaygroundVariant: Variant;
  role?: Role;
  title: string;
  name?: string;
  currentExternalLibrary: ExternalLibraryName;
};

const assessmentRegExp = ':assessmentId(-?\\d+)?/:questionId(\\d+)?';

class Application extends React.Component<ApplicationProps, {}> {
  public componentDidMount() {
    parsePlayground(this.props);
  }

  public render() {
    return (
      <div className="Application">
        <NavigationBar
          handleLogOut={this.props.handleLogOut}
          role={this.props.role}
          name={this.props.name}
          title={this.props.title}
        />
        <div className="Application__main">
          <Switch>
            <Route path="/academy" component={toAcademy(this.props)} />
            <Route path={`/mission-control/${assessmentRegExp}`} render={toIncubator} />
            <Route path="/playground" component={Playground} />
            <Route path="/login" render={toLogin(this.props)} />
            <Route path="/contributors" component={Contributors} />
            <Route path="/material" component={Material} />
            <Route path="/sourcecast" component={SourcecastContainer} />
            <Route exact={true} path="/" render={this.redirectToPlayground} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    );
  }

  private redirectToPlayground = () => <Redirect to="/playground" />;
}

/**
 * A user routes to /academy,
 *  1. If the user is logged in, render the Academy component
 *  2. If the user is not logged in, redirect to /login
 */
const toAcademy = (props: ApplicationProps) =>
  props.accessToken === undefined || props.role === undefined
    ? () => <Redirect to="/login" />
    : () => <Academy accessToken={props.accessToken} role={props.role!} />;

const toLogin = (props: ApplicationProps) => () => (
  <Login luminusCode={qs.parse(props.location.search).code} />
);

const parsePlayground = (props: ApplicationProps) => {
  const prgrm = parsePrgrm(props);
  const chapter = parseChapter(props) || props.currentPlaygroundChapter;
  const variant = parseVariant(props, chapter) || props.currentPlaygroundVariant;
  const externalLibraryName = parseExternalLibrary(props) || props.currentExternalLibrary;
  const execTime = parseExecTime(props);
  if (prgrm) {
    props.handleEditorValueChange(prgrm);
    props.handleEnsureLibrariesLoaded();
    props.handleClearContext(chapter, variant, externalLibraryName);
    props.handleExternalLibrarySelect(externalLibraryName);
    props.handleSetExecTime(execTime);
  }
};

const toIncubator = (routerProps: RouteComponentProps<any>) => <MissionControlContainer />;

const parsePrgrm = (props: RouteComponentProps<{}>) => {
  const qsParsed = qs.parse(props.location.hash);
  // legacy support
  const program = qsParsed.lz !== undefined ? qsParsed.lz : qsParsed.prgrm;
  return program !== undefined ? decompressFromEncodedURIComponent(program) : undefined;
};

const parseChapter = (props: RouteComponentProps<{}>) => {
  const chapQuery = qs.parse(props.location.hash).chap;
  // find a language with this chapter (if any)
  const langWithMatchingChapter = sourceLanguages.find(language => language.chapter === chapQuery);

  const chap: number = langWithMatchingChapter
    ? langWithMatchingChapter.chapter
    : chapQuery === undefined
    ? NaN
    : parseInt(chapQuery, 10);

  return chap ? chap : undefined;
};

const parseVariant = (props: RouteComponentProps<{}>, chap: number) => {
  const variantQuery = qs.parse(props.location.hash).variant;
  // find a language with this variant and chapter (if any)
  const matchingLang = sourceLanguages.find(
    language => language.chapter === chap && language.variant === variantQuery
  );

  const variant: Variant = matchingLang ? matchingLang.variant : 'default';

  return variant;
};

const parseExternalLibrary = (props: RouteComponentProps<{}>) => {
  const ext = qs.parse(props.location.hash).ext || '';
  return Object.values(ExternalLibraryNames).includes(ext) ? ext : ExternalLibraryNames.NONE;
};

const parseExecTime = (props: RouteComponentProps<{}>) => {
  const time = qs.parse(props.location.hash).exec || '1000';
  // Parse the time string to a number, defaulting execTime to 1000
  const execTime = stringParamToInt(time) || 1000;
  return `${execTime < 1000 ? 1000 : execTime}`;
};

export default Application;
