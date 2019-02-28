import { Button } from '@blueprintjs/core';
import * as React from 'react';

class ToneMatrix extends React.Component<{}, {}> {
  private $container: HTMLElement | null;

  public shouldComponentUpdate() {
    return false;
  }

  public componentDidMount() {
    if ((window as any).ToneMatrix) {
      (window as any).ToneMatrix.initialise_matrix(this.$container!);
    }
  }

  public handleClear() {
    (window as any).ToneMatrix.clear_matrix();
  }

  public handleRandomise() {
    (window as any).ToneMatrix.randomise_matrix();
  }

  public render() {
    return (
      <div className="sa-tone-matrix">
        <div className="row">
          <div className="controls col-xs-12 pt-dark pt-button-group">
            <Button id="clear-matrix" onClick={this.handleClear}>
              Clear
            </Button>
            <Button id="randomise-matrix" onClick={this.handleRandomise}>
              Randomise
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12" ref={r => (this.$container = r)} />
        </div>
      </div>
    );
  }
}

export default ToneMatrix;
