import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'ag-grid-community/dist/styles/ag-grid.css';

import { Divider, H1 } from '@blueprintjs/core';
import { Variant } from 'js-slang/dist/types';
import * as React from 'react';

import { UpdateCourseConfiguration } from '../../../commons/application/types/SessionTypes';
import {
  AssessmentConfiguration,
  AssessmentType
} from '../../../commons/assessment/AssessmentTypes';
import ContentDisplay from '../../../commons/ContentDisplay';
import AssessmentConfigPanel from './subcomponents/AssessmentConfigPanel';
import CourseConfigPanel from './subcomponents/CourseConfigPanel';

export type AdminPanelProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleUpdateCourseConfig: (courseConfiguration: UpdateCourseConfiguration) => void;
  handleUpdateAssessmentConfig: (assessmentConfiguration: AssessmentConfiguration) => void;
  handleUpdateAssessmentTypes: (assessmentTypes: AssessmentType[]) => void;
};

export type StateProps = {
  courseName?: string;
  courseShortName?: string;
  viewable?: boolean;
  enableGame?: boolean;
  enableAchievements?: boolean;
  enableSourcecast?: boolean;
  sourceChapter: number;
  sourceVariant: Variant;
  moduleHelpText?: string;
  assessmentTypes: AssessmentType[];
};

const AdminPanel: React.FC<AdminPanelProps> = props => {
  const data = (
    <div className="admin-panel">
      <H1>Admin Panel</H1>
      <CourseConfigPanel {...props} />
      <Divider />
      <AssessmentConfigPanel {...props} />
    </div>
  );
  return <ContentDisplay loadContentDispatch={() => {}} display={data} fullWidth={false} />;
};

export default AdminPanel;