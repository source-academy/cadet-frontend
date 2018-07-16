import { shallow } from 'enzyme'
import * as React from 'react'

import { mockRouterProps } from '../../mocks/components'
import Application, { IApplicationProps } from '../Application'

test('Application renders correctly', () => {
  const props: IApplicationProps = {
    ...mockRouterProps('/academy', {}),
    title: 'Cadet',
  currentPlaygroundChapter: 2,
  currentPlaygroundExternals: [],
    handleClearContext: (chapter: number, externals: string[]) => {},
    handleEditorValueChange: (val: string) => {}
  }
  const app = <Application {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
