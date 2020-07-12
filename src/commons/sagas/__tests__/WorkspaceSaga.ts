import { Context, IOptions, Result, resume, runInContext } from 'js-slang';
import createContext from 'js-slang/dist/createContext';
import { ErrorSeverity, ErrorType, Finished, SourceError, Variant } from 'js-slang/dist/types';
import { expectSaga } from 'redux-saga-test-plan';
import { call } from 'redux-saga/effects';

import {
  beginInterruptExecution,
  debuggerReset,
  endDebuggerPause,
  endInterruptExecution,
  evalInterpreterError,
  evalInterpreterSuccess,
  evalTestcaseFailure,
  evalTestcaseSuccess
} from '../../application/actions/InterpreterActions';
import { defaultState, OverallState } from '../../application/ApplicationTypes';
import { externalLibraries, ExternalLibraryName } from '../../application/types/ExternalTypes';
import {
  BEGIN_DEBUG_PAUSE,
  BEGIN_INTERRUPT_EXECUTION,
  DEBUG_RESET,
  DEBUG_RESUME,
  EVAL_INTERPRETER_ERROR,
  EVAL_TESTCASE_FAILURE,
  EVAL_TESTCASE_SUCCESS
} from '../../application/types/InterpreterTypes';
import { Library, Testcase, TestcaseType, TestcaseTypes } from '../../assessment/AssessmentTypes';
import { INVALID_EDITOR_SESSION_ID } from '../../collabEditing/CollabEditingTypes';
import { mockRuntimeContext } from '../../mocks/ContextMocks';
import { mockTestcases } from '../../mocks/GradingMocks';
import { SideContentType } from '../../sideContent/SideContentTypes';
import { showSuccessMessage, showWarningMessage } from '../../utils/NotificationsHelper';
import {
  beginClearContext,
  changeExternalLibrary,
  clearReplInput,
  clearReplOutput,
  clearReplOutputLast,
  endClearContext,
  evalTestcase,
  highlightEditorLine,
  moveCursor,
  sendReplInputToOutput
} from '../../workspace/WorkspaceActions';
import {
  BEGIN_CLEAR_CONTEXT,
  CHAPTER_SELECT,
  ENSURE_LIBRARIES_LOADED,
  EVAL_EDITOR,
  EVAL_REPL,
  EVAL_TESTCASE,
  NAV_DECLARATION,
  PLAYGROUND_EXTERNAL_SELECT,
  TOGGLE_EDITOR_AUTORUN,
  WorkspaceLocation
} from '../../workspace/WorkspaceTypes';
import workspaceSaga, { evalCode, evalTestCode } from '../WorkspaceSaga';

function generateDefaultState(
  workspaceLocation: WorkspaceLocation,
  payload: any = {}
): OverallState {
  return {
    ...defaultState,
    workspaces: {
      ...defaultState.workspaces,
      [workspaceLocation]: {
        ...defaultState.workspaces[workspaceLocation],
        ...payload
      }
    }
  };
}

beforeEach(() => {
  // Mock the inspector
  (window as any).Inspector = jest.fn();
  (window as any).Inspector.updateContext = jest.fn();
  (window as any).Inspector.highlightClean = jest.fn();
  (window as any).Inspector.highlightLine = jest.fn();
});

describe('EVAL_EDITOR', () => {
  test('puts beginClearContext and correctly executes prepend and value in sequence (calls evalCode)', () => {
    const workspaceLocation = 'playground';
    const editorPrepend = 'const foo = (x) => -1;\n"reeee";';
    const editorValue = 'foo(2);';
    const editorPostpend = '42;';
    const execTime = 1000;
    const context = createContext();
    const variant: Variant = 'default';
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const library = {
      chapter: context.chapter,
      variant,
      external: {
        name: ExternalLibraryName.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorPrepend,
      editorPostpend,
      editorValue,
      execTime,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .put(beginInterruptExecution(workspaceLocation))
        .put(beginClearContext(library, workspaceLocation))
        .put(clearReplOutput(workspaceLocation))
        // calls evalCode here with the prepend in elevated Context: silent run
        .call.like({
          fn: runInContext,
          args: [
            editorPrepend,
            {
              scheduler: 'preemptive',
              originalMaxExecTime: execTime,
              useSubst: false
            }
          ]
        })
        // running the prepend block should return 'reeee', but silent run -> not written to REPL
        .not.put(evalInterpreterSuccess('reeee', workspaceLocation))
        // Single call to evalCode made by blockExtraMethods
        .call.like({ fn: runInContext })
        // calls evalCode here with the student's program in normal Context
        .call.like({
          fn: runInContext,
          args: [
            editorValue,
            context,
            { scheduler: 'preemptive', originalMaxExecTime: execTime, useSubst: false }
          ]
        })
        // running the student's program should return -1, which is written to REPL
        .put(evalInterpreterSuccess(-1, workspaceLocation))
        // should NOT attempt to execute the postpend block after above
        .not.call(runInContext)
        .dispatch({
          type: EVAL_EDITOR,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('TOGGLE_EDITOR_AUTORUN', () => {
  test('calls showWarningMessage correctly when isEditorAutorun set to false', () => {
    const workspaceLocation = 'assessment';
    return expectSaga(workspaceSaga)
      .withState(defaultState)
      .call(showWarningMessage, 'Autorun Stopped', 750)
      .dispatch({
        type: TOGGLE_EDITOR_AUTORUN,
        payload: { workspaceLocation }
      })
      .silentRun();
  });

  test('calls showWarningMessage correctly when isEditorAutorun set to true', () => {
    const workspaceLocation = 'grading';
    const isEditorAutorun = true;
    const newDefaultState = generateDefaultState(workspaceLocation, { isEditorAutorun });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .call(showWarningMessage, 'Autorun Started', 750)
      .dispatch({
        type: TOGGLE_EDITOR_AUTORUN,
        payload: { workspaceLocation }
      })
      .silentRun();
  });
});

describe('INVALID_EDITOR_SESSION_ID', () => {
  test('calls showWarningMessage correctly', () => {
    return expectSaga(workspaceSaga)
      .call(showWarningMessage, 'Invalid ID Input', 1000)
      .dispatch({
        type: INVALID_EDITOR_SESSION_ID
      })
      .silentRun();
  });
});

describe('EVAL_REPL', () => {
  test('puts beginInterruptExecution, clearReplInput, sendReplInputToOutput and calls evalCode correctly', () => {
    const workspaceLocation = 'playground';
    const replValue = 'sample code';
    const newState = generateDefaultState(workspaceLocation, { replValue });
    const context = newState.workspaces[workspaceLocation].context;

    return (
      expectSaga(workspaceSaga)
        .withState(newState)
        .put(beginInterruptExecution(workspaceLocation))
        .put(clearReplInput(workspaceLocation))
        .put(sendReplInputToOutput(replValue, workspaceLocation))
        // also calls evalCode here
        .call(runInContext, replValue, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: 1000,
          useSubst: false
        })
        .dispatch({
          type: EVAL_REPL,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESUME', () => {
  let workspaceLocation: WorkspaceLocation;
  let editorValue: string;
  let execTime: number;
  let context: Context;
  let state: OverallState;

  beforeEach(() => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    workspaceLocation = 'playground';
    editorValue = 'sample code here';
    execTime = 1000;
    context = mockRuntimeContext();
    state = generateDefaultState(workspaceLocation);

    return expectSaga(evalCode, editorValue, context, execTime, workspaceLocation, EVAL_EDITOR)
      .withState(state)
      .silentRun();
  });

  test('puts beginInterruptExecution, clearReplOutput, highlightEditorLine and calls evalCode correctly', () => {
    const newDefaultState = generateDefaultState(workspaceLocation, { editorValue, context });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        .provide({
          call(effect) {
            if (effect.fn === resume) {
              return { status: 'finished', value: 'abc' };
            } else {
              return;
            }
          }
        })
        .put(beginInterruptExecution(workspaceLocation))
        .put(clearReplOutput(workspaceLocation))
        .put(highlightEditorLine([], workspaceLocation))
        // also calls evalCode here
        .call.like({
          fn: evalCode,
          args: [editorValue, {}, execTime, workspaceLocation, DEBUG_RESUME]
        })
        .dispatch({
          type: DEBUG_RESUME,
          payload: { workspaceLocation }
        })
        .silentRun()
    );
  });
});

describe('DEBUG_RESET', () => {
  test('puts clearReplOutput correctly', () => {
    const workspaceLocation = 'assessment';
    const newDefaultState = generateDefaultState(workspaceLocation, { editorValue: 'test-value' });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(clearReplOutput(workspaceLocation))
      .dispatch({
        type: DEBUG_RESET,
        payload: { workspaceLocation }
      })
      .silentRun()
      .then(result => {
        expect(result.storeState.workspaces[workspaceLocation].context.runtime.break).toBe(false);
      });
  });
});

describe('EVAL_TESTCASE', () => {
  test('correctly executes prepend, value, postpend, testcase in sequence (calls evalTestCode)', () => {
    const workspaceLocation = 'grading';
    const editorPrepend = 'let z = 2;\nconst bar = (x, y) => 10 * x + y;\n"boink";';
    const editorValue = 'bar(6, 9);';
    const editorPostpend = '777;';
    const execTime = 1000;
    const testcaseId = 0;

    const editorTestcases: Testcase[] = [
      {
        type: TestcaseTypes.public,
        answer: '42',
        program: 'bar(4, z);', // test program.
        score: 1
      }
    ];

    const context = createContext();
    const globals: Array<[string, any]> = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];

    const library = {
      chapter: context.chapter,
      external: {
        name: ExternalLibraryName.NONE,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, {
      editorPrepend,
      editorPostpend,
      editorValue,
      editorTestcases,
      execTime,
      context,
      globals
    });

    return (
      expectSaga(workspaceSaga)
        .withState(newDefaultState)
        // Should not interrupt execution, clear context or clear REPL
        .not.put(beginInterruptExecution(workspaceLocation))
        .not.put(beginClearContext(library, workspaceLocation))
        .not.put(clearReplOutput(workspaceLocation))
        // Expect it to shard a new privileged context here and execute chunks in order
        // calls evalCode here with the prepend in elevated Context: silent run
        .call.like({
          fn: runInContext,
          args: [editorPrepend, { scheduler: 'preemptive', originalMaxExecTime: execTime }]
        })
        // running the prepend block should return 'boink', but silent run -> not written to REPL
        .not.put(evalInterpreterSuccess('boink', workspaceLocation))
        // Single call to evalCode made by blockExtraMethods
        .call.like({ fn: runInContext })
        // calls evalCode here with the student's program in normal Context
        .call.like({
          fn: runInContext,
          args: [editorValue, context, { scheduler: 'preemptive', originalMaxExecTime: execTime }]
        })
        // running the student's program should return 69, which is NOT written to REPL (silent)
        .not.put(evalInterpreterSuccess(69, workspaceLocation))
        // Single call to evalCode made by restoreExtraMethods to enable postpend to run in S4
        .call.like({ fn: runInContext })
        // calls evalCode here again with the postpend now in elevated Context: silent run
        .call.like({
          fn: runInContext,
          args: [editorPostpend, { scheduler: 'preemptive', originalMaxExecTime: execTime }]
        })
        // running the postpend block should return true, but silent run -> not written to REPL
        .not.put(evalInterpreterSuccess(true, workspaceLocation))
        // Single call to evalCode made by blockExtraMethods after postpend execution is complete
        .call.like({ fn: runInContext })
        // finally calls evalTestCode on the testcase
        .call.like({
          fn: runInContext,
          args: [editorTestcases[0].program]
        })
        // this testcase should execute fine in the elevated context and thus write result to REPL
        .put(evalInterpreterSuccess(42, workspaceLocation))
        .put(evalTestcaseSuccess(42, workspaceLocation, testcaseId))
        .dispatch({
          type: EVAL_TESTCASE,
          payload: { workspaceLocation, testcaseId }
        })
        .silentRun()
    );
  });
});

describe('CHAPTER_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = 'playground';
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    context = {
      ...mockRuntimeContext(),
      chapter: 4
    };
  });

  test('puts beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const newChapter = 3;
    const library: Library = {
      chapter: newChapter,
      variant: 'default',
      external: {
        name: 'NONE' as ExternalLibraryName,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(beginClearContext(library, workspaceLocation))
      .put(clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
      .dispatch({
        type: CHAPTER_SELECT,
        payload: { chapter: newChapter, variant: 'default', workspaceLocation }
      })
      .silentRun();
  });

  test('does not call beginClearContext, clearReplOutput and showSuccessMessage when oldChapter === newChapter and oldVariant === newVariant', () => {
    const newChapter = 4;
    const newVariant: Variant = 'default';
    const library: Library = {
      chapter: newChapter,
      variant: newVariant,
      external: {
        name: 'NONE' as ExternalLibraryName,
        symbols: context.externalSymbols
      },
      globals
    };

    const newDefaultState = generateDefaultState(workspaceLocation, { context, globals });

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put(beginClearContext(library, workspaceLocation))
      .not.put(clearReplOutput(workspaceLocation))
      .not.call(showSuccessMessage, `Switched to Source \xa7${newChapter}`, 1000)
      .dispatch({
        type: CHAPTER_SELECT,
        payload: { chapter: newChapter, variant: newVariant, workspaceLocation }
      })
      .silentRun();
  });
});

describe('PLAYGROUND_EXTERNAL_SELECT', () => {
  let workspaceLocation: WorkspaceLocation;
  let globals: Array<[string, any]>;
  let chapter: number;
  let context: Context;

  beforeEach(() => {
    workspaceLocation = 'playground';
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
    chapter = 4;
    context = {
      ...mockRuntimeContext(),
      chapter
    };
  });

  test('puts changeExternalLibrary, beginClearContext, clearReplOutput and calls showSuccessMessage correctly', () => {
    const oldExternalLibraryName = ExternalLibraryName.SOUNDS;
    const newExternalLibraryName = ExternalLibraryName.RUNES;

    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      externalLibrary: oldExternalLibraryName
    });

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .put(changeExternalLibrary(newExternalLibraryName, workspaceLocation))
      .put(beginClearContext(library, workspaceLocation))
      .put(clearReplOutput(workspaceLocation))
      .call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000)
      .dispatch({
        type: PLAYGROUND_EXTERNAL_SELECT,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });

  test('does not call the above when oldExternalLibraryName === newExternalLibraryName', () => {
    const oldExternalLibraryName = ExternalLibraryName.RUNES;
    const newExternalLibraryName = ExternalLibraryName.RUNES;

    const newDefaultState = generateDefaultState(workspaceLocation, {
      context,
      globals,
      externalLibrary: oldExternalLibraryName
    });

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .withState(newDefaultState)
      .not.put(changeExternalLibrary(newExternalLibraryName, workspaceLocation))
      .not.put(beginClearContext(library, workspaceLocation))
      .not.put(clearReplOutput(workspaceLocation))
      .not.call(showSuccessMessage, `Switched to ${newExternalLibraryName} library`, 1000)
      .dispatch({
        type: PLAYGROUND_EXTERNAL_SELECT,
        payload: {
          externalLibraryName: newExternalLibraryName,
          workspaceLocation
        }
      })
      .silentRun();
  });
});

describe('ENSURE_LIBRARIES_LOADED', () => {
  test('does not call showWarningMessage when getReadyWebGLForCanvas is not undefined', () => {
    (window as any).getReadyWebGLForCanvas = jest.fn();

    return expectSaga(workspaceSaga)
      .not.call(showWarningMessage, 'Error loading libraries', 750)
      .dispatch({
        type: ENSURE_LIBRARIES_LOADED
      })
      .silentRun();
  });

  test('calls showWarningMessage when race condition timeouts', () => {
    return expectSaga(workspaceSaga)
      .provide({
        race: () => ({
          loadedScripts: undefined,
          timeout: true
        })
      })
      .call(showWarningMessage, 'Error loading libraries', 750)
      .dispatch({
        type: ENSURE_LIBRARIES_LOADED
      })
      .silentRun();
  });
});

describe('BEGIN_CLEAR_CONTEXT', () => {
  let loadLib: any;
  let getReadyWebGLForCanvas: any;
  let chapter: number;
  let globals: Array<[string, any]>;
  let workspaceLocation: WorkspaceLocation;

  beforeEach(() => {
    loadLib = jest.fn();
    getReadyWebGLForCanvas = jest.fn();

    (window as any).loadLib = loadLib;
    (window as any).getReadyWebGLForCanvas = getReadyWebGLForCanvas;

    workspaceLocation = 'grading';
    chapter = 4;
    globals = [
      ['testNumber', 3.141592653589793],
      ['testObject', { a: 1, b: 2 }],
      ['testArray', [1, 2, 'a', 'b']]
    ];
  });

  test('loads RUNES library correctly', () => {
    const newExternalLibraryName = ExternalLibraryName.RUNES;

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .put(endClearContext(library, workspaceLocation))
      .dispatch({
        type: BEGIN_CLEAR_CONTEXT,
        payload: { library, workspaceLocation }
      })
      .silentRun()
      .then(() => {
        expect(loadLib).toHaveBeenCalledWith('RUNES');
        expect(getReadyWebGLForCanvas).toHaveBeenCalledWith('3d');
        globals.forEach(item => {
          expect(window[item[0]]).toEqual(item[1]);
        });
      });
  });

  test('loads CURVES library correctly', () => {
    const newExternalLibraryName = ExternalLibraryName.CURVES;

    const symbols = externalLibraries.get(newExternalLibraryName)!;
    const library: Library = {
      chapter,
      external: {
        name: newExternalLibraryName,
        symbols
      },
      globals
    };

    return expectSaga(workspaceSaga)
      .put(endClearContext(library, workspaceLocation))
      .dispatch({
        type: BEGIN_CLEAR_CONTEXT,
        payload: { library, workspaceLocation }
      })
      .silentRun()
      .then(() => {
        expect(loadLib).toHaveBeenCalledWith('CURVES');
        expect(getReadyWebGLForCanvas).toHaveBeenCalledWith('curve');
        globals.forEach(item => {
          expect(window[item[0]]).toEqual(item[1]);
        });
      });
  });
});

describe('evalCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let execTime: number;
  let actionType: string;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let lastDebuggerResult: Result;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'assessment';
    code = 'sample code';
    execTime = 1000;
    actionType = EVAL_EDITOR;
    context = createContext(); // mockRuntimeContext();
    value = 'test value';
    options = { scheduler: 'preemptive', originalMaxExecTime: 1000, useSubst: false };
    lastDebuggerResult = { status: 'error' };
    state = generateDefaultState(workspaceLocation);
  });

  describe('on EVAL_EDITOR action without interruptions or pausing', () => {
    test('calls runInContext, puts evalInterpreterSuccess when runInContext returns finished', () => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    // The above test is for an assessment without any editorTestcases
    test('does not put evalTestcase (assessment has testcases and Autograder tab is inactive)', () => {
      state = generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases.slice(0, 1),
        sideContentActiveTab: 0
      });

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .not.call(showSuccessMessage, 'Running all testcases!', 750)
        .not.put(evalTestcase(workspaceLocation, 0))
        .silentRun();
    });

    test('puts evalTestcase (assessment has testcases and Autograder tab is active)', () => {
      const type = 'result';

      state = generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases.slice(0, 2),
        sideContentActiveTab: SideContentType.autograder
      });

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .call(showSuccessMessage, 'Running all testcases!', 750)
        .put(evalTestcase(workspaceLocation, 0))
        .dispatch({
          type: EVAL_TESTCASE_SUCCESS,
          payload: { type, value, workspaceLocation, index: 0 }
        })
        .put(evalTestcase(workspaceLocation, 1))
        .silentRun();
    });

    test('prematurely terminates if execution of one testcase results in an error', () => {
      const type = 'error';
      const mockErrors: SourceError[] = [
        {
          type: ErrorType.RUNTIME,
          severity: ErrorSeverity.ERROR,
          location: { start: { line: 1, column: 5 }, end: { line: 1, column: 5 } },
          explain() {
            return `Name func not declared.`;
          },
          elaborate() {
            return `Name func not declared.`;
          }
        }
      ];

      state = generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases.slice(0, 2),
        sideContentActiveTab: SideContentType.autograder
      });

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .call(showSuccessMessage, 'Running all testcases!', 750)
        .put(evalTestcase(workspaceLocation, 0))
        .dispatch({
          type: EVAL_TESTCASE_FAILURE,
          payload: { type, mockErrors, workspaceLocation, index: 0 }
        })
        .not.put(evalTestcase(workspaceLocation, 1))
        .silentRun();
    });

    test('puts evalTestcase (submission has testcases and Autograder tab is active)', () => {
      const type = 'result';
      workspaceLocation = 'grading';
      state = generateDefaultState(workspaceLocation, {
        editorTestcases: mockTestcases,
        sideContentActiveTab: SideContentType.autograder
      });

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .call(showSuccessMessage, 'Running all testcases!', 750)
        .put(evalTestcase(workspaceLocation, 0))
        .dispatch({
          type: EVAL_TESTCASE_SUCCESS,
          payload: { type, value, workspaceLocation, index: 0 }
        })
        .put(evalTestcase(workspaceLocation, 1))
        .dispatch({
          type: EVAL_TESTCASE_SUCCESS,
          payload: { type, value, workspaceLocation, index: 0 }
        })
        .put(evalTestcase(workspaceLocation, 2))
        .dispatch({
          type: EVAL_TESTCASE_SUCCESS,
          payload: { type, value, workspaceLocation, index: 0 }
        })
        .put(evalTestcase(workspaceLocation, 3))
        .silentRun();
    });

    test('calls runInContext, puts endDebuggerPause and evalInterpreterSuccess when runInContext returns suspended', () => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'suspended' }]])
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(endDebuggerPause(workspaceLocation))
        .put(evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls runInContext, puts evalInterpreterError when runInContext returns error', () => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put.like({ action: { type: EVAL_INTERPRETER_ERROR } })
        .silentRun();
    });

    // TODO: rewrite tests in a way that actually reflects known information.
    test('with error in the code, should return correct line number in error', () => {
      code = '// Prepend\n error';
      state = generateDefaultState(workspaceLocation, { editorPrepend: '// Prepend' });

      runInContext(code, context, {
        scheduler: 'preemptive',
        originalMaxExecTime: 1000,
        useSubst: false
      }).then(result => (context = (result as Finished).context));

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .call(runInContext, code, context, {
          scheduler: 'preemptive',
          originalMaxExecTime: execTime,
          useSubst: false
        })
        .put(evalInterpreterError(context.errors, workspaceLocation))
        .silentRun();
    });
  });

  describe('on DEBUG_RESUME action without interruptions or pausing', () => {
    // Ensure that lastDebuggerResult is set correctly before running each of the tests below
    beforeEach(() => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, EVAL_EDITOR)
        .withState(state)
        .silentRun();
    });

    test('calls resume, puts evalInterpreterSuccess when resume returns finished', () => {
      actionType = DEBUG_RESUME;

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'finished', value }]])
        .call(resume, lastDebuggerResult)
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts endDebuggerPause and evalInterpreterSuccess when resume returns suspended', () => {
      actionType = DEBUG_RESUME;

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide([[call(resume, lastDebuggerResult), { status: 'suspended' }]])
        .call(resume, lastDebuggerResult)
        .put(endDebuggerPause(workspaceLocation))
        .put(evalInterpreterSuccess('Breakpoint hit!', workspaceLocation))
        .silentRun();
    });

    test('calls resume, puts evalInterpreterError when resume returns error', () => {
      actionType = DEBUG_RESUME;

      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .call(resume, lastDebuggerResult)
        .put.like({ action: { type: EVAL_INTERPRETER_ERROR } })
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts debuggerReset, endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: BEGIN_INTERRUPT_EXECUTION,
              payload: { workspaceLocation }
            }
          })
        })
        .put(debuggerReset(workspaceLocation))
        .put(endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, 'Execution aborted', 750)
        .silentRun()
        .then(result => {
          expect(context.errors[0]).toHaveProperty(['type'], 'Runtime');
        });
    });
  });

  describe('on paused', () => {
    test('puts endDebuggerPause and calls showWarningMessage', () => {
      return expectSaga(evalCode, code, context, execTime, workspaceLocation, actionType)
        .withState(state)
        .provide({
          race: () => ({
            paused: {
              type: BEGIN_DEBUG_PAUSE,
              payload: { workspaceLocation }
            }
          })
        })
        .put(endDebuggerPause(workspaceLocation))
        .call(showWarningMessage, 'Execution paused', 750)
        .silentRun();
    });
  });
});

describe('evalTestCode', () => {
  let workspaceLocation: WorkspaceLocation;
  let code: string;
  let execTime: number;
  let context: Context;
  let value: string;
  let options: Partial<IOptions>;
  let index: number;
  let type: TestcaseType;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'assessment';
    code = 'more sample code';
    execTime = 1000;
    context = mockRuntimeContext();
    value = 'another test value';
    options = {
      scheduler: 'preemptive',
      originalMaxExecTime: 1000
    };
    index = 1;
    type = TestcaseTypes.public;
    state = generateDefaultState(workspaceLocation);
  });

  describe('without interrupt', () => {
    test('puts evalInterpreterSuccess and evalTestcaseSuccess on finished status', () => {
      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .put(evalTestcaseSuccess(value, workspaceLocation, index))
        .not.put(clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts additional clearReplOutputLast for hidden testcases after finished status', () => {
      type = TestcaseTypes.hidden;

      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'finished', value }]])
        .put(evalInterpreterSuccess(value, workspaceLocation))
        .put(evalTestcaseSuccess(value, workspaceLocation, index))
        .put(clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts evalInterpreterError and evalTestcaseFailure on error status', () => {
      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'error' }]])
        .put(evalInterpreterError(context.errors, workspaceLocation))
        .put(evalTestcaseFailure(context.errors, workspaceLocation, index))
        .not.put(clearReplOutputLast(workspaceLocation))
        .silentRun();
    });

    test('puts additional clearReplOutputLast for hidden testcases after error status', () => {
      type = TestcaseTypes.hidden;

      return expectSaga(evalTestCode, code, context, execTime, workspaceLocation, index, type)
        .withState(state)
        .provide([[call(runInContext, code, context, options), { status: 'error' }]])
        .put(evalInterpreterError(context.errors, workspaceLocation))
        .put(evalTestcaseFailure(context.errors, workspaceLocation, index))
        .put(clearReplOutputLast(workspaceLocation))
        .silentRun();
    });
  });

  describe('on interrupt', () => {
    test('puts endInterruptExecution and calls showWarningMessage', () => {
      return expectSaga(
        evalTestCode,
        code,
        context,
        execTime,
        workspaceLocation,
        index,
        TestcaseTypes.public
      )
        .withState(state)
        .provide({
          race: () => ({
            interrupted: {
              type: BEGIN_INTERRUPT_EXECUTION,
              payload: { workspaceLocation }
            }
          })
        })
        .put(endInterruptExecution(workspaceLocation))
        .call(showWarningMessage, `Execution of testcase ${index} aborted`, 750)
        .silentRun()
        .then(() => {
          expect(context.errors[0]).toHaveProperty(['type'], 'Runtime');
        });
    });
  });
});

describe('NAV_DECLARATION', () => {
  let workspaceLocation: WorkspaceLocation;
  let context: Context;
  let editorValue: string;
  let state: OverallState;

  beforeEach(() => {
    workspaceLocation = 'playground';
    editorValue = 'const foo = (x) => -1; foo(2);';
    context = {
      ...mockRuntimeContext(),
      chapter: 4
    };
    state = generateDefaultState(workspaceLocation, { editorValue, context });
  });

  test('moves cursor to declaration correctly', () => {
    const loc = { row: 0, column: 24 };
    const resultLoc = { row: 0, column: 6 };
    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: NAV_DECLARATION,
        payload: { workspaceLocation, cursorPosition: loc }
      })
      .put(moveCursor(workspaceLocation, resultLoc))
      .silentRun();
  });

  test('does not move cursor if node is not an identifier', () => {
    const pos = { row: 0, column: 27 };
    const resultPos = { row: 0, column: 6 };
    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: NAV_DECLARATION,
        payload: { workspaceLocation, cursorPosition: pos }
      })
      .not.put(moveCursor(workspaceLocation, resultPos))
      .silentRun();
  });

  test('does not move cursor if node is same as declaration', () => {
    const pos = { row: 0, column: 7 };
    const resultPos = { row: 0, column: 6 };
    return expectSaga(workspaceSaga)
      .withState(state)
      .dispatch({
        type: NAV_DECLARATION,
        payload: { workspaceLocation, cursorPosition: pos }
      })
      .not.put(moveCursor(workspaceLocation, resultPos))
      .silentRun();
  });
});
