import { NumericInput, Tooltip } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

type ExecutionTimeProps = DispatchProps & StateProps;

type DispatchProps = {
  handleChangeExecTime?: (execTime: number) => void;
};

type StateProps = {
  execTime?: number;
  key: string;
};

export function ExecutionTime(props: ExecutionTimeProps) {
  return (
    <Tooltip content="Execution Time">
      <NumericInput
        leftIcon={IconNames.TIME}
        style={{ width: 80 }}
        min={1000}
        value={props.execTime}
        onValueChange={props.handleChangeExecTime}
      />
    </Tooltip>
  );
}
