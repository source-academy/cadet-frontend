import { Colors, InputGroup, NonIdealState, Spinner } from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid/dist/styles/ag-grid.css'
import 'ag-grid/dist/styles/ag-theme-balham.css'
import { sortBy } from 'lodash'
import * as React from 'react'
import { RouteComponentProps } from 'react-router'

import GradingWorkspaceContainer from '../../../containers/academy/grading/GradingWorkspaceContainer'
import { stringParamToInt } from '../../../utils/paramParseHelpers'
import { controlButton } from '../../commons'
import ContentDisplay from '../../commons/ContentDisplay'
import GradingHistory from './GradingHistory'
import GradingNavLink from './GradingNavLink'
import { GradingOverview } from './gradingShape'
import { OwnProps as GradingWorkspaceProps } from './GradingWorkspace'

/**
 * Column Definitions are defined within the state, so that data
 * can be manipulated easier. See constructor for an example.
 */
type State = {
  columnDefs: ColDef[]
  filterValue: string
}

type GradingNavLinkProps = {
  data: GradingOverview
}

interface IGradingProps
  extends IDispatchProps,
    IStateProps,
    RouteComponentProps<IGradingWorkspaceParams> {}

export interface IGradingWorkspaceParams {
  submissionId?: string
  questionId?: string
}

export interface IDispatchProps {
  handleFetchGradingOverviews: () => void
}

export interface IStateProps {
  gradingOverviews?: GradingOverview[]
}

/** Component to render in table - marks */
const GradingMarks = (props: GradingNavLinkProps) => {
  return <GradingHistory data={props.data} exp={false} grade={true} />
}

/** Component to render in table - XP */
const GradingExp = (props: GradingNavLinkProps) => {
  return <GradingHistory data={props.data} exp={true} grade={false} />
}

class Grading extends React.Component<IGradingProps, State> {
  private gridApi?: GridApi

  public constructor(props: IGradingProps) {
    super(props)

    this.state = {
      columnDefs: [
        { headerName: 'Assessment Name', field: 'assessmentName' },
        { headerName: 'Category', field: 'assessmentCategory', maxWidth: 150 },
        { headerName: 'Student Name', field: 'studentName' },
        {
          headerName: 'Grade',
          field: '',
          cellRendererFramework: GradingMarks,
          maxWidth: 100,
          cellStyle: params => {
            if (params.data.currentGrade < params.data.maxGrade) {
              return { backgroundColor: Colors.RED5 }
            } else {
              return {}
            }
          }
        },
        {
          headerName: 'XP',
          field: '',
          cellRendererFramework: GradingExp,
          maxWidth: 100
        },
        {
          headerName: 'Edit',
          field: '',
          cellRendererFramework: GradingNavLink,
          maxWidth: 70
        },
        { headerName: 'Initial Grade', field: 'initialGrade', hide: true },
        { headerName: 'Grade Adjustment', field: 'gradeAdjustment', hide: true },
        { headerName: 'Initial XP', field: 'initialXp', hide: true },
        { headerName: 'XP Adjustment', field: 'xpAdjustment', hide: true },
        { headerName: 'Current Grade', field: 'currentGrade', hide: true },
        { headerName: 'Max Grade', field: 'maxGrade', hide: true },
        { headerName: 'Current XP', field: 'currentXp', hide: true },
        { headerName: 'Max XP', field: 'maxXp', hide: true }
      ],

      filterValue: ''
    }
  }

  public render() {
    const submissionId: number | null = stringParamToInt(this.props.match.params.submissionId)
    // default questionId is 0 (the first question)
    const questionId: number = stringParamToInt(this.props.match.params.questionId) || 0

    /* Create a workspace to grade a submission. */
    if (submissionId !== null) {
      const props: GradingWorkspaceProps = {
        submissionId,
        questionId
      }
      return <GradingWorkspaceContainer {...props} />
    }

    /* Display either a loading screen or a table with overviews. */
    const loadingDisplay = (
      <NonIdealState
        className="Grading"
        description="Fetching submissions..."
        visual={<Spinner large={true} />}
      />
    )
    const data = sortBy(this.props.gradingOverviews, [
      (a: GradingOverview) => -a.assessmentId,
      (a: GradingOverview) => -a.submissionId
    ])

    const grid = (
      <div className="GradingContainer">
        <div>
          <div className="col-md-6 col-md-offset-3">
            <InputGroup
              large={false}
              leftIcon="filter"
              placeholder="Filter..."
              value={this.state.filterValue}
              onChange={this.handleFilterChange}
            />
          </div>
        </div>

        <br />

        <div className="Grading">
          <div className="ag-grid-parent ag-theme-fresh">
            <AgGridReact
              gridAutoHeight={true}
              enableColResize={true}
              enableSorting={true}
              enableFilter={true}
              columnDefs={this.state.columnDefs}
              onGridReady={this.onGridReady}
              rowData={data}
            />
          </div>
          <div className="ag-grid-export-button">
            {controlButton('Export to CSV', IconNames.EXPORT, this.exportCSV)}
          </div>
        </div>
      </div>
    )
    return (
      <ContentDisplay
        loadContentDispatch={this.props.handleFetchGradingOverviews}
        display={this.props.gradingOverviews === undefined ? loadingDisplay : grid}
        fullWidth={false}
      />
    )
  }

  private handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changeVal = event.target.value
    this.setState({ filterValue: changeVal })

    if (this.gridApi) {
      this.gridApi.setQuickFilter(changeVal)
    }
  }

  private onGridReady = (params: GridReadyEvent) => {
    this.gridApi = params.api
    this.gridApi.sizeColumnsToFit()
  }

  private exportCSV = () => {
    if (this.gridApi === undefined) {
      return
    }
    this.gridApi.exportDataAsCsv({ allColumns: true })
  }
}

export default Grading
