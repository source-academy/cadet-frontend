import { shallow } from 'enzyme';
import * as React from 'react';

import MaterialUpload, { IMaterialProps } from '../MaterialUpload';

test('Story Upload area renders correctly', () => {
  const props: IMaterialProps = {
    handleCreateMaterialFolder(p1: string) {},
    handleDeleteMaterial(p1: number) {},
    handleDeleteMaterialFolder(p1: number) {},
    handleFetchMaterialIndex(p1: number) {},
    handleUploadMaterial(p1: File, p2: string, p3: string) {},
    materialDirectoryTree: null,
    materialIndex: null
  };
  const app = <MaterialUpload {...props} />;
  const tree = shallow(app);
  expect(tree.debug()).toMatchSnapshot();
});
