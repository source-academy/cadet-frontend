import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { startCase } from 'lodash';
import * as React from 'react';

import ContentDisplay from '../../../commons/ContentDisplay';
import { GradingSummary } from '../../../features/dashboard/DashboardTypes';

type DashboardProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleFetchGradingSummary: () => void;
};

export type StateProps = {
  gradingSummary: GradingSummary;
};

class Dashboard extends React.Component<DashboardProps> {
  private columnDefs: ColDef[];
  private defaultColumnDefs: ColDef;
  private gridApi?: GridApi;

  public constructor(props: DashboardProps) {
    super(props);

    this.columnDefs = [];

    this.defaultColumnDefs = {
      filter: true,
      resizable: true,
      sortable: true
    };
  }

  public componentDidUpdate(prevProps: DashboardProps) {
    this.columnDefs = this.props.gradingSummary.cols.map(e => {
      return {
        headerName: startCase(e),
        field: e
      };
    });
    if (
      this.gridApi &&
      this.props.gradingSummary.rows.length !== prevProps.gradingSummary.rows.length
    ) {
      this.gridApi.setRowData(this.props.gradingSummary.rows);
    }
  }

  public handleFetchGradingSummary = () => {
    this.props.handleFetchGradingSummary();
  };

  public render() {
    const content = (
      <div className="Dashboard">
        <div className="Grid ag-grid-parent ag-theme-balham">
          <AgGridReact
            domLayout={'autoHeight'}
            columnDefs={this.columnDefs}
            defaultColDef={this.defaultColumnDefs}
            onGridReady={this.onGridReady}
            onGridSizeChanged={this.resizeGrid}
            rowData={this.props.gradingSummary.rows}
            rowHeight={30}
            suppressCellSelection={true}
            suppressMovableColumns={true}
          />
        </div>
      </div>
    );

    return (
      <div>
        <ContentDisplay display={content} loadContentDispatch={this.handleFetchGradingSummary} />
      </div>
    );
  }

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api;
  };

  private resizeGrid = () => {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  };
}

export default Dashboard;
