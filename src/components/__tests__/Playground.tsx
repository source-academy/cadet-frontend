import * as React from 'react'

import { shallow } from 'enzyme'

import Playground from '../Playground'
import { IPlaygroundProps as PlaygroundProps } from '../Playground';

test('Playground renders correctly', () => {
  const props: PlaygroundProps = {
    initialCode: 'Hello World'
  }
  const app = <Playground {...props} />
  const tree = shallow(app)
  expect(tree.debug()).toMatchSnapshot()
})
