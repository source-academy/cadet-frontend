import { IconNames } from '@blueprintjs/icons';
import * as React from 'react';

import { BACKEND_URL } from '../../../utils/constants';
import { controlButton } from '../../commons';

interface ISelectCellProps {
  data: any;
}

class SelectCell extends React.Component<ISelectCellProps, {}> {
  public constructor(props: ISelectCellProps) {
    super(props);
  }

  public render() {
    return <div>{controlButton('', IconNames.DOWNLOAD, this.handleSelect)}</div>;
  }

  private handleSelect = () => {
    const url = BACKEND_URL + this.props.data.url;
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    const link = document.createElement('A') as HTMLAnchorElement;
    link.href = url;
    link.download = 'output.wav';
    link.dispatchEvent(click);
    link.click();
    return link;
  };
}

export default SelectCell;
