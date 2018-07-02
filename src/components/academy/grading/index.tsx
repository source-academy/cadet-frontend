import { NonIdealState, Spinner } from '@blueprintjs/core'
import { ColDef } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid/dist/styles/ag-grid.css'; import 'ag-grid/dist/styles/ag-theme-balham.css';
import * as React from 'react'

import { GradingOverview } from '../../../reducers/states'

type State = {
  columnDefs: ColDef[]
  rowData: any[]
}

type GradingProps = DispatchProps & StateProps

export type DispatchProps = {
  handleFetchGradingOverviews: () => void
}

export type StateProps = {
  gradingOverviews?: GradingOverview[]
}

class Grading extends React.Component<GradingProps, State> {
  public constructor(props: GradingProps) {
    super(props);

    this.state = {
      columnDefs: [
        {headerName: "Make", field: "make"},
        {headerName: "Model", field: "model"},
        {headerName: "Price", field: "price"}

      ],
      rowData: [
        {make: "Toyota", model: "Celica", price: 35000},
        {make: "Ford", model: "Mondeo", price: 32000},
        {make: "Porsche", model: "Boxter", price: 72000}
      ]
    }
  }

  public componentWillMount() {
    this.props.handleFetchGradingOverviews()
  }

  public render() {
    if (this.props.gradingOverviews === undefined) {
      return (
        <NonIdealState
          description="Fetching submissions..."
          visual={<Spinner large={true} />}
        />
      )
    }
    return (
      <div 
      className="ag-theme-balham"
      style={{ 
        height: '500px', 
          width: '600px' }} 
      >
      <AgGridReact
        columnDefs={this.state.columnDefs}
        rowData={this.state.rowData} />
      </div>
    );
  }
}

export default Grading;
