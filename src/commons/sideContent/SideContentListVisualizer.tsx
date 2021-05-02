import { Button, Card, Classes } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import * as React from 'react';
import { HotKeys } from 'react-hotkeys';

import ListVisualizer from '../../features/listVisualizer/ListVisualizer';
import { Step } from '../../features/listVisualizer/ListVisualizerTypes';
import { Links } from '../utils/Constants';

type State = {
  steps: Step[];
  currentStep: number;
};

const listVisualizerKeyMap = {
  PREVIOUS_STEP: 'left',
  NEXT_STEP: 'right'
};

/**
 * This class is responsible for the visualization of data structures via the
 * data_data function in Source. It adds a listener to the ListVisualizer singleton
 * which updates the steps list via setState whenever new steps are added.
 */
class SideContentListVisualizer extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = { steps: [], currentStep: 0 };
    ListVisualizer.init(steps => {
      if (steps) {
        //  Blink icon
        const icon = document.getElementById('data_visualiser-icon');
        icon?.classList.add('side-content-tab-alert');
      }
      this.setState({ steps, currentStep: 0 });
    });
  }

  public render() {
    const listVisualizerHandlers = {
      PREVIOUS_STEP: this.onPrevButtonClick,
      NEXT_STEP: this.onNextButtonClick
    };
    const step: Step | undefined = this.state.steps[this.state.currentStep];

    return (
      <HotKeys keyMap={listVisualizerKeyMap} handlers={listVisualizerHandlers}>
        <div className={classNames('sa-list-visualizer', Classes.DARK)}>
          {this.state.steps.length > 1 ? (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10
              }}
            >
              <Button
                style={{
                  position: 'absolute',
                  left: 0
                }}
                large={true}
                outlined={true}
                icon={IconNames.ARROW_LEFT}
                onClick={this.onPrevButtonClick}
                disabled={this.state.currentStep === 0}
              >
                Previous
              </Button>
              <h3 className="bp3-text-large">
                Call {this.state.currentStep + 1}/{this.state.steps.length}
              </h3>
              <Button
                style={{
                  position: 'absolute',
                  right: 0
                }}
                large={true}
                outlined={true}
                icon={IconNames.ARROW_RIGHT}
                onClick={this.onNextButtonClick}
                disabled={
                  !this.state.steps || this.state.currentStep === this.state.steps.length - 1
                }
              >
                Next
              </Button>
            </div>
          ) : null}
          {this.state.steps.length > 0 ? (
            <div
              key={step.length} // To ensure the style refreshes if the step length changes
              style={{
                display: 'flex',
                flexDirection: 'row',
                overflowX: 'scroll',
                justifyContent: step.length === 1 ? 'center' : 'auto' // To center single element, but prevent scrolling issues with multiple
              }}
            >
              {step?.map((elem, i) => (
                <div key={i} style={{ margin: step.length > 1 ? 0 : '0 auto' }}>
                  {' '}
                  {/* To center element when there is only one */}
                  <Card style={{ background: '#1a2530', padding: 10 }}>
                    {step.length > 1 && (
                      <h5
                        className="bp3-heading bp3-monospace-text"
                        style={{ marginTop: 0, marginBottom: 20, whiteSpace: 'nowrap' }}
                      >
                        Structure {i + 1}
                      </h5>
                    )}
                    {elem}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <p id="data-visualizer-default-text" className={Classes.RUNNING_TEXT}>
              The data visualizer helps you to visualize data structures.
              {this.state.steps}
              <br />
              <br />
              It is activated by calling the function{' '}
              <code>
                draw_data(x<sub>1</sub>, x<sub>2</sub>, ... x<sub>n</sub>)
              </code>
              , where{' '}
              <code>
                x<sub>k</sub>
              </code>{' '}
              would be the{' '}
              <code>
                k<sup>th</sup>
              </code>{' '}
              data structure that you want to visualize and <code>n</code> is the number of
              structures.
              <br />
              <br />
              The data visualizer uses box-and-pointer diagrams, as introduced in{' '}
              <a href={Links.textbookChapter2_2} rel="noopener noreferrer" target="_blank">
                <i>
                  Structure and Interpretation of Computer Programs, JavaScript Adaptation, Chapter
                  2, Section 2
                </i>
              </a>
              .
            </p>
          )}
        </div>
      </HotKeys>
    );
  }

  private onPrevButtonClick = () => {
    this.setState(state => {
      return { currentStep: state.currentStep - 1 };
    });
  };

  private onNextButtonClick = () => {
    this.setState(state => {
      return { currentStep: state.currentStep + 1 };
    });
  };
}

export default SideContentListVisualizer;
