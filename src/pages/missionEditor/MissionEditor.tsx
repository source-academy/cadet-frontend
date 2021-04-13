import { Classes } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Octokit } from "@octokit/rest";
import classNames from "classnames";
import { isStepperOutput } from "js-slang/dist/stepper/stepper";
import { Variant } from "js-slang/dist/types";
import { isEqual } from "lodash";
import { decompressFromEncodedURIComponent } from "lz-string";
import React from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { RouteComponentProps } from "react-router";
import { InterpreterOutput, OverallState, sourceLanguages } from "src/commons/application/ApplicationTypes";
import { externalLibraries, ExternalLibraryName } from "src/commons/application/types/ExternalTypes";
import { ControlBarAutorunButtons } from "src/commons/controlBar/ControlBarAutorunButtons";
import { ControlBarChapterSelect } from "src/commons/controlBar/ControlBarChapterSelect";
import { ControlBarClearButton } from "src/commons/controlBar/ControlBarClearButton";
import { ControlBarEvalButton } from "src/commons/controlBar/ControlBarEvalButton";
import { ControlBarExecutionTime } from "src/commons/controlBar/ControlBarExecutionTime";
import { ControlBarExternalLibrarySelect } from "src/commons/controlBar/ControlBarExternalLibrarySelect";
import { ControlBarGitHubLoginButtons } from "src/commons/controlBar/ControlBarGitHubLoginButton";
import { ControlBarSessionButtons } from "src/commons/controlBar/ControlBarSessionButton";
import { ControlBarShareButton } from "src/commons/controlBar/ControlBarShareButton";
import { ControlBarStepLimit } from "src/commons/controlBar/ControlBarStepLimit";
import { HighlightedLines, Position } from "src/commons/editor/EditorTypes";
import Markdown from "src/commons/Markdown";
import MobileWorkspace, { MobileWorkspaceProps } from "src/commons/mobileWorkspace/MobileWorkspace";
import SideContentEnvVisualizer from "src/commons/sideContent/SideContentEnvVisualizer";
import SideContentFaceapiDisplay from "src/commons/sideContent/SideContentFaceapiDisplay";
import SideContentInspector from "src/commons/sideContent/SideContentInspector";
import SideContentListVisualizer from "src/commons/sideContent/SideContentListVisualizer";
import SideContentRemoteExecution from "src/commons/sideContent/SideContentRemoteExecution";
import SideContentSubstVisualizer from "src/commons/sideContent/SideContentSubstVisualizer";
import { SideContentTab, SideContentType } from "src/commons/sideContent/SideContentTypes";
import SideContentVideoDisplay from "src/commons/sideContent/SideContentVideoDisplay";
import Constants from "src/commons/utils/Constants";
import { generateSourceIntroduction } from "src/commons/utils/IntroductionHelper";
import { stringParamToInt } from "src/commons/utils/ParamParseHelper";
import { parseQuery } from "src/commons/utils/QueryHelper";
import Workspace, { WorkspaceProps } from "src/commons/workspace/Workspace";
import { initSession, log } from "src/features/eventLogging";
import { CodeDelta, Input, SelectionRange } from "src/features/sourceRecorder/SourceRecorderTypes";

export type MissionEditorProps = DispatchProps & StateProps & RouteComponentProps<{}>;

export type DispatchProps = {
  handleActiveTabChange: (activeTab: SideContentType) => void;
  handleBrowseHistoryDown: () => void;
  handleBrowseHistoryUp: () => void;
  handleChangeExecTime: (execTime: number) => void;
  handleChangeStepLimit: (stepLimit: number) => void;
  handleChapterSelect: (chapter: number, variant: Variant) => void;
  handleDeclarationNavigate: (cursorPosition: Position) => void;
  handleEditorEval: () => void;
  handleEditorHeightChange: (height: number) => void;
  handleEditorValueChange: (val: string) => void;
  handleEditorWidthChange: (widthChange: number) => void;
  handleEditorUpdateBreakpoints: (breakpoints: string[]) => void;
  handleFetchSublanguage: () => void;
  handleGenerateLz: () => void;
  handleShortenURL: (s: string) => void;
  handleUpdateShortURL: (s: string) => void;
  handleInterruptEval: () => void;
  handleExternalSelect: (externalLibraryName: ExternalLibraryName, initialise?: boolean) => void;
  handleReplEval: () => void;
  handleReplOutputClear: () => void;
  handleReplValueChange: (newValue: string) => void;
  handleSendReplInputToOutput: (code: string) => void;
  handleSetEditorSessionId: (editorSessionId: string) => void;
  handleSetSharedbConnected: (connected: boolean) => void;
  handleSideContentHeightChange: (heightChange: number) => void;
  handleUsingSubst: (usingSubst: boolean) => void;
  handleDebuggerPause: () => void;
  handleDebuggerResume: () => void;
  handleDebuggerReset: () => void;
  handleToggleEditorAutorun: () => void;
  handleFetchChapter: () => void;
  handlePromptAutocomplete: (row: number, col: number, callback: any) => void;
  handleGitHubLogIn: () => void;
  handleGitHubLogOut: () => void;
};

export type StateProps = {
  editorSessionId: string;
  editorValue: string;
  editorHeight?: number;
  editorWidth: string;
  execTime: number;
  breakpoints: string[];
  highlightedLines: HighlightedLines[];
  isEditorAutorun: boolean;
  isRunning: boolean;
  isDebugging: boolean;
  enableDebugging: boolean;
  newCursorPosition?: Position;
  output: InterpreterOutput[];
  queryString?: string;
  shortURL?: string;
  replValue: string;
  sideContentHeight?: number;
  sourceChapter: number;
  sourceVariant: Variant;
  stepLimit: number;
  sharedbConnected: boolean;
  externalLibraryName: ExternalLibraryName;
  usingSubst: boolean;
  githubOctokitInstance: Octokit | undefined;
  githubSaveInfo: { repoName: string; filePath: string };
};

function handleHash(hash: string, props: MissionEditorProps) {
  const qs = parseQuery(hash);

  const programLz = qs.lz ?? qs.prgrm;
  const program = programLz && decompressFromEncodedURIComponent(programLz);
  if (program) {
    props.handleEditorValueChange(program);
  }

  const chapter = stringParamToInt(qs.chap) || undefined;
  const variant: Variant =
    sourceLanguages.find(
      language => language.chapter === chapter && language.variant === qs.variant
    )?.variant ?? 'default';
  if (chapter) {
    props.handleChapterSelect(chapter, variant);
  }

  const ext =
    Object.values(ExternalLibraryName).find(v => v === qs.ext) || ExternalLibraryName.NONE;
  if (ext) {
    props.handleExternalSelect(ext, true);
  }

  const execTime = Math.max(stringParamToInt(qs.exec || '1000') || 1000, 1000);
  if (execTime) {
    props.handleChangeExecTime(execTime);
  }
}

const MissionEditor: React.FC<MissionEditorProps> = props => {
  const isMobileBreakpoint = useMediaQuery({ maxWidth: Constants.mobileBreakpoint });
  const propsRef = React.useRef(props);
  propsRef.current = props;
  const [selectedTab, setSelectedTab] = React.useState(SideContentType.introduction);
  const [hasBreakpoints, setHasBreakpoints] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(() =>
    initSession('missionEditor', {
      editorValue: propsRef.current.editorValue,
      externalLibrary: propsRef.current.externalLibraryName,
      chapter: propsRef.current.sourceChapter
    })
  );

  const usingRemoteExecution = useSelector(
    (state: OverallState) => !!state.session.remoteExecutionSession
  );

  React.useEffect(() => {
    // Fixes some errors with runes and curves (see PR #1420)
    propsRef.current.handleExternalSelect(propsRef.current.externalLibraryName, true);

    // Only fetch default Playground sublanguage when not loaded via a share link
    if (!propsRef.current.location.hash) {
      propsRef.current.handleFetchSublanguage();
    }
  }, []);

  React.useEffect(() => {
    // When the editor session Id changes, then treat it as a new session.
    setSessionId(
      initSession('playground', {
        editorValue: propsRef.current.editorValue,
        externalLibrary: propsRef.current.externalLibraryName,
        chapter: propsRef.current.sourceChapter
      })
    );
  }, [props.editorSessionId]);
  React.useEffect(() => {
    if (!usingRemoteExecution && !externalLibraries.has(props.externalLibraryName)) {
      propsRef.current.handleExternalSelect(ExternalLibraryName.NONE, true);
    }
  }, [usingRemoteExecution, props.externalLibraryName]);

  const hash = props.location.hash;
  React.useEffect(() => {
    if (!hash) {
      return;
    }
    handleHash(hash, propsRef.current);
  }, [hash]);

  /**
   * Handles toggling of relevant SideContentTabs when mobile breakpoint it hit
   */
  React.useEffect(() => {
    if (
      isMobileBreakpoint &&
      (selectedTab === SideContentType.introduction ||
        selectedTab === SideContentType.remoteExecution)
    ) {
      props.handleActiveTabChange(SideContentType.mobileEditor);
      setSelectedTab(SideContentType.mobileEditor);
    } else if (
      !isMobileBreakpoint &&
      (selectedTab === SideContentType.mobileEditor ||
        selectedTab === SideContentType.mobileEditorRun)
    ) {
      setSelectedTab(SideContentType.introduction);
      props.handleActiveTabChange(SideContentType.introduction);
    }
  }, [isMobileBreakpoint, props, selectedTab]);

  const onEditorValueChange = React.useCallback(val => {
    propsRef.current.handleEditorValueChange(val);
  }, []);

  const onChangeTabs = React.useCallback(
    (
      newTabId: SideContentType,
      prevTabId: SideContentType,
      event: React.MouseEvent<HTMLElement>
    ) => {
      if (newTabId === prevTabId) {
        return;
      }

      const { handleUsingSubst, handleReplOutputClear, sourceChapter } = propsRef.current;

      /**
       * Do nothing when clicking the mobile 'Run' tab while on the stepper tab.
       */
      if (
        !(
          prevTabId === SideContentType.substVisualizer &&
          newTabId === SideContentType.mobileEditorRun
        )
      ) {
        if (sourceChapter <= 2 && newTabId === SideContentType.substVisualizer) {
          handleUsingSubst(true);
        }

        if (prevTabId === SideContentType.substVisualizer && !hasBreakpoints) {
          handleReplOutputClear();
          handleUsingSubst(false);
        }

        setSelectedTab(newTabId);
      }
    },
    [hasBreakpoints]
  );

  const processStepperOutput = (output: InterpreterOutput[]) => {
    const editorOutput = output[0];
    if (
      editorOutput &&
      editorOutput.type === 'result' &&
      editorOutput.value instanceof Array &&
      editorOutput.value[0] === Object(editorOutput.value[0]) &&
      isStepperOutput(editorOutput.value[0])
    ) {
      return editorOutput.value;
    } else {
      return [];
    }
  };

  const pushLog = React.useCallback(
    (newInput: Input) => {
      log(sessionId, newInput);
    },
    [sessionId]
  );

  const autorunButtons = React.useMemo(
    () => (
      <ControlBarAutorunButtons
        handleDebuggerPause={props.handleDebuggerPause}
        handleDebuggerReset={props.handleDebuggerReset}
        handleDebuggerResume={props.handleDebuggerResume}
        handleEditorEval={props.handleEditorEval}
        handleInterruptEval={props.handleInterruptEval}
        handleToggleEditorAutorun={props.handleToggleEditorAutorun}
        isDebugging={props.isDebugging}
        isEditorAutorun={props.isEditorAutorun}
        isRunning={props.isRunning}
        key="autorun"
        autorunDisabled={usingRemoteExecution}
        pauseDisabled={usingRemoteExecution}
      />
    ),
    [
      props.handleDebuggerPause,
      props.handleDebuggerReset,
      props.handleDebuggerResume,
      props.handleEditorEval,
      props.handleInterruptEval,
      props.handleToggleEditorAutorun,
      props.isDebugging,
      props.isEditorAutorun,
      props.isRunning,
      usingRemoteExecution
    ]
  );

  const chapterSelectHandler = React.useCallback(
    ({ chapter, variant }: { chapter: number; variant: Variant }, e: any) => {
      const { handleUsingSubst, handleReplOutputClear, handleChapterSelect } = propsRef.current;
      if ((chapter <= 2 && hasBreakpoints) || selectedTab === SideContentType.substVisualizer) {
        handleUsingSubst(true);
      }
      if (chapter > 2) {
        handleReplOutputClear();
        handleUsingSubst(false);
      }

      const input: Input = {
        time: Date.now(),
        type: 'chapterSelect',
        data: chapter
      };

      pushLog(input);

      handleChapterSelect(chapter, variant);
    },
    [hasBreakpoints, selectedTab, pushLog]
  );

  const chapterSelect = React.useMemo(
    () => (
      <ControlBarChapterSelect
        handleChapterSelect={chapterSelectHandler}
        sourceChapter={props.sourceChapter}
        sourceVariant={props.sourceVariant}
        key="chapter"
        disabled={usingRemoteExecution}
      />
    ),
    [chapterSelectHandler, props.sourceChapter, props.sourceVariant, usingRemoteExecution]
  );

  const clearButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarClearButton
          handleReplOutputClear={props.handleReplOutputClear}
          key="clear_repl"
        />
      ),
    [props.handleReplOutputClear, selectedTab]
  );

  const evalButton = React.useMemo(
    () =>
      selectedTab === SideContentType.substVisualizer ? null : (
        <ControlBarEvalButton
          handleReplEval={props.handleReplEval}
          isRunning={props.isRunning}
          key="eval_repl"
        />
      ),
    [props.handleReplEval, props.isRunning, selectedTab]
  );

  const { githubOctokitInstance } = props;
  const githubButtons = React.useMemo(() => {
    return (
      <ControlBarGitHubLoginButtons
        loggedInAs={githubOctokitInstance}
        key="github"
        onClickLogIn={props.handleGitHubLogIn}
        onClickLogOut={props.handleGitHubLogOut}
      />
    );
  }, [
    githubOctokitInstance,
    props.handleGitHubLogIn,
    props.handleGitHubLogOut
  ]);

  const executionTime = React.useMemo(
    () => (
      <ControlBarExecutionTime
        execTime={props.execTime}
        handleChangeExecTime={props.handleChangeExecTime}
        key="execution_time"
      />
    ),
    [props.execTime, props.handleChangeExecTime]
  );

  const stepperStepLimit = React.useMemo(
    () => (
      <ControlBarStepLimit
        stepLimit={props.stepLimit}
        handleChangeStepLimit={props.handleChangeStepLimit}
        key="step_limit"
      />
    ),
    [props.handleChangeStepLimit, props.stepLimit]
  );

  const { handleExternalSelect, externalLibraryName, handleEditorValueChange } = props;

  const handleExternalSelectAndRecord = React.useCallback(
    (name: ExternalLibraryName) => {
      handleExternalSelect(name);

      const input: Input = {
        time: Date.now(),
        type: 'externalLibrarySelect',
        data: name
      };

      pushLog(input);
    },
    [handleExternalSelect, pushLog]
  );

  const externalLibrarySelect = React.useMemo(
    () => (
      <ControlBarExternalLibrarySelect
        externalLibraryName={externalLibraryName}
        handleExternalSelect={({ name }: { name: ExternalLibraryName }, e: any) =>
          handleExternalSelectAndRecord(name)
        }
        key="external_library"
        disabled={usingRemoteExecution}
      />
    ),
    [externalLibraryName, handleExternalSelectAndRecord, usingRemoteExecution]
  );

  // No point memoing this, it uses props.editorValue
  const sessionButtons = (
    <ControlBarSessionButtons
      editorSessionId={props.editorSessionId}
      editorValue={props.editorValue}
      handleSetEditorSessionId={props.handleSetEditorSessionId}
      sharedbConnected={props.sharedbConnected}
      key="session"
    />
  );

  const shareButton = React.useMemo(
    () => (
      <ControlBarShareButton
        handleGenerateLz={props.handleGenerateLz}
        handleShortenURL={props.handleShortenURL}
        handleUpdateShortURL={props.handleUpdateShortURL}
        queryString={props.queryString}
        shortURL={props.shortURL}
        key="share"
      />
    ),
    [
      props.handleGenerateLz,
      props.handleShortenURL,
      props.handleUpdateShortURL,
      props.queryString,
      props.shortURL
    ]
  );

  const playgroundIntroductionTab: SideContentTab = React.useMemo(
    () => ({
      label: 'Introduction',
      iconName: IconNames.HOME,
      body: (
        <Markdown
          content={generateSourceIntroduction(props.sourceChapter, props.sourceVariant)}
          openLinksInNewWindow={true}
        />
      ),
      id: SideContentType.introduction,
      toSpawn: () => true
    }),
    [props.sourceChapter, props.sourceVariant]
  );

  const tabs = React.useMemo(() => {
    const tabs: SideContentTab[] = [playgroundIntroductionTab];

    // Conditional logic for tab rendering
    if (
      props.externalLibraryName === ExternalLibraryName.PIXNFLIX ||
      props.externalLibraryName === ExternalLibraryName.ALL
    ) {
      // Enable video tab only when 'PIX&FLIX' is selected
      tabs.push({
        label: 'Video Display',
        iconName: IconNames.MOBILE_VIDEO,
        body: <SideContentVideoDisplay replChange={props.handleSendReplInputToOutput} />,
        toSpawn: () => true
      });
    }
    if (props.externalLibraryName === ExternalLibraryName.MACHINELEARNING) {
      // Enable Face API Display only when 'MACHINELEARNING' is selected
      tabs.push(FaceapiDisplayTab);
    }
    if (props.sourceChapter >= 2 && !usingRemoteExecution) {
      // Enable Data Visualizer for Source Chapter 2 and above
      tabs.push(listVisualizerTab);
    }
    if (
      props.sourceChapter >= 3 &&
      props.sourceVariant !== 'concurrent' &&
      props.sourceVariant !== 'non-det' &&
      !usingRemoteExecution
    ) {
      // Enable Inspector, Env Visualizer for Source Chapter 3 and above
      tabs.push(inspectorTab);
      tabs.push(envVisualizerTab);
    }

    if (props.sourceChapter <= 2 && props.sourceVariant === 'default') {
      // Enable Subst Visualizer only for default Source 1 & 2
      tabs.push({
        label: 'Stepper',
        iconName: IconNames.FLOW_REVIEW,
        body: <SideContentSubstVisualizer content={processStepperOutput(props.output)} />,
        id: SideContentType.substVisualizer,
        toSpawn: () => true
      });
    }

    tabs.push(remoteExecutionTab);

    return tabs;
  }, [
    playgroundIntroductionTab,
    props.externalLibraryName,
    props.handleSendReplInputToOutput,
    props.output,
    props.sourceChapter,
    props.sourceVariant,
    usingRemoteExecution
  ]);

  // Remove Intro and Remote Execution tabs for mobile
  const mobileTabs = [...tabs];
  mobileTabs.shift();
  mobileTabs.pop();

  const onChangeMethod = React.useCallback(
    (newCode: string, delta: CodeDelta) => {
      handleEditorValueChange(newCode);

      const input: Input = {
        time: Date.now(),
        type: 'codeDelta',
        data: delta
      };

      pushLog(input);
    },
    [handleEditorValueChange, pushLog]
  );

  const onCursorChangeMethod = React.useCallback(
    (selection: any) => {
      const input: Input = {
        time: Date.now(),
        type: 'cursorPositionChange',
        data: selection.getCursor()
      };

      pushLog(input);
    },
    [pushLog]
  );

  const onSelectionChangeMethod = React.useCallback(
    (selection: any) => {
      const range: SelectionRange = selection.getRange();
      const isBackwards: boolean = selection.isBackwards();
      if (!isEqual(range.start, range.end)) {
        const input: Input = {
          time: Date.now(),
          type: 'selectionRangeData',
          data: { range, isBackwards }
        };

        pushLog(input);
      }
    },
    [pushLog]
  );

  const handleEditorUpdateBreakpoints = React.useCallback(
    (breakpoints: string[]) => {
      // get rid of holes in array
      const numberOfBreakpoints = breakpoints.filter(arrayItem => !!arrayItem).length;
      if (numberOfBreakpoints > 0) {
        setHasBreakpoints(true);
        if (propsRef.current.sourceChapter <= 2) {
          /**
           * There are breakpoints set on Source Chapter 2, so we set the
           * Redux state for the editor to evaluate to the substituter
           */

          propsRef.current.handleUsingSubst(true);
        }
      }
      if (numberOfBreakpoints === 0) {
        setHasBreakpoints(false);

        if (selectedTab !== SideContentType.substVisualizer) {
          propsRef.current.handleReplOutputClear();
          propsRef.current.handleUsingSubst(false);
        }
      }
      propsRef.current.handleEditorUpdateBreakpoints(breakpoints);
    },
    [selectedTab]
  );

  const replDisabled =
    props.sourceVariant === 'concurrent' || props.sourceVariant === 'wasm' || usingRemoteExecution;

  const editorProps = {
    onChange: onChangeMethod,
    onCursorChange: onCursorChangeMethod,
    onSelectionChange: onSelectionChangeMethod,
    sourceChapter: props.sourceChapter,
    externalLibraryName: props.externalLibraryName,
    sourceVariant: props.sourceVariant,
    editorValue: props.editorValue,
    editorSessionId: props.editorSessionId,
    handleDeclarationNavigate: props.handleDeclarationNavigate,
    handleEditorEval: props.handleEditorEval,
    handleEditorValueChange: onEditorValueChange,
    handleSendReplInputToOutput: props.handleSendReplInputToOutput,
    handlePromptAutocomplete: props.handlePromptAutocomplete,
    isEditorAutorun: props.isEditorAutorun,
    breakpoints: props.breakpoints,
    highlightedLines: props.highlightedLines,
    newCursorPosition: props.newCursorPosition,
    handleEditorUpdateBreakpoints: handleEditorUpdateBreakpoints,
    handleSetSharedbConnected: props.handleSetSharedbConnected
  };

  const replProps = {
    sourceChapter: props.sourceChapter,
    sourceVariant: props.sourceVariant,
    externalLibrary: props.externalLibraryName,
    output: props.output,
    replValue: props.replValue,
    handleBrowseHistoryDown: props.handleBrowseHistoryDown,
    handleBrowseHistoryUp: props.handleBrowseHistoryUp,
    handleReplEval: props.handleReplEval,
    handleReplValueChange: props.handleReplValueChange,
    hidden: selectedTab === SideContentType.substVisualizer,
    inputHidden: replDisabled,
    usingSubst: props.usingSubst,
    replButtons: [replDisabled ? null : evalButton, clearButton]
  };

  const workspaceProps: WorkspaceProps = {
    controlBarProps: {
      editorButtons: [
        autorunButtons,
        shareButton,
        chapterSelect,
        props.sourceVariant !== 'concurrent' ? externalLibrarySelect : null,
        sessionButtons,
        githubButtons,
        usingRemoteExecution ? null : props.usingSubst ? stepperStepLimit : executionTime
      ]
    },
    editorProps: editorProps,
    editorHeight: props.editorHeight,
    editorWidth: props.editorWidth,
    handleEditorHeightChange: props.handleEditorHeightChange,
    handleEditorWidthChange: props.handleEditorWidthChange,
    handleSideContentHeightChange: props.handleSideContentHeightChange,
    replProps: replProps,
    sideContentHeight: props.sideContentHeight,
    sideContentProps: {
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs,
      workspaceLocation: 'missionEditor'
    },
    sideContentIsResizeable: selectedTab !== SideContentType.substVisualizer
  };

  const mobileWorkspaceProps: MobileWorkspaceProps = {
    editorProps: editorProps,
    replProps: replProps,
    mobileSideContentProps: {
      mobileControlBarProps: {
        editorButtons: [
          autorunButtons,
          chapterSelect,
          props.sourceVariant !== 'concurrent' ? externalLibrarySelect : null,
          shareButton,
          sessionButtons,
          githubButtons
        ]
      },
      defaultSelectedTabId: selectedTab,
      selectedTabId: selectedTab,
      handleActiveTabChange: props.handleActiveTabChange,
      onChange: onChangeTabs,
      tabs: mobileTabs,
      workspaceLocation: 'missionEditor',
      handleEditorEval: props.handleEditorEval
    }
  };

  return (
    <div className={classNames('MissionEditor', Classes.DARK)}>
      {isMobileBreakpoint ? (
        <MobileWorkspace {...mobileWorkspaceProps} />
      ) : (
        <Workspace {...workspaceProps} />
      )}
    </div>
  );
}

const listVisualizerTab: SideContentTab = {
  label: 'Data Visualizer',
  iconName: IconNames.EYE_OPEN,
  body: <SideContentListVisualizer />,
  id: SideContentType.dataVisualiser,
  toSpawn: () => true
};

const FaceapiDisplayTab: SideContentTab = {
  label: 'Face API Display',
  iconName: IconNames.MUGSHOT,
  body: <SideContentFaceapiDisplay />,
  toSpawn: () => true
};

const inspectorTab: SideContentTab = {
  label: 'Inspector',
  iconName: IconNames.SEARCH,
  body: <SideContentInspector />,
  id: SideContentType.inspector,
  toSpawn: () => true
};

const envVisualizerTab: SideContentTab = {
  label: 'Env Visualizer',
  iconName: IconNames.GLOBE,
  body: <SideContentEnvVisualizer />,
  id: SideContentType.envVisualiser,
  toSpawn: () => true
};

const remoteExecutionTab: SideContentTab = {
  label: 'Remote Execution',
  iconName: IconNames.SATELLITE,
  body: <SideContentRemoteExecution workspace="playground" />,
  id: SideContentType.remoteExecution,
  toSpawn: () => true
};

export default MissionEditor;
