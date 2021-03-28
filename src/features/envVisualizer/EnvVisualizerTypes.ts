import { Environment } from 'js-slang/dist/types';
import { KonvaEventObject } from 'konva/types/Node';

import { Binding } from './components/binding/Binding';
import { ArrayUnit } from './components/binding/value/ArrayUnit';
import { Frame } from './components/Frame';

/** this interface defines a drawing function */
export interface Drawable {
  /** the draw logic */
  draw: (key: number) => React.ReactNode;
}

/** this interface defines a Hoverable object */
export interface Hoverable {
  onMouseEnter: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (e: KonvaEventObject<MouseEvent>) => void;
}

// export interface Clickable {
//   onClick: (e: KonvaEventObject<MouseEvent>) => void;
// }

/** this interface defines coordinates and dimensions */
export interface Visible extends Drawable {
  /** x coordinate of top-left corner */
  x: number;

  /** y coordinate of top-left corner */
  y: number;

  /** width */
  width: number;

  /** height */
  height: number;
}

/** types of primitives in JS Slang  */
export type PrimitiveTypes = number | string | null | undefined;

/** types of functions in JS Slang */
export type FnTypes = {
  /** the function itself */
  (): any;

  /** the enclosing environment */
  environment: Environment;

  /** string representation of the function */
  functionName: string;

  node: any;
};

/** the types of data in the JS Slang context */
export type Data = PrimitiveTypes | FnTypes | (() => any) | Data[];

/** modified Environment type to store children and associated frame */
export type Env = Environment & { childEnvs?: Env[]; frame?: Frame };

/** empty object type  */
export type EmptyObject = {
  [K in any]: never;
};

/** types that a reference can be: either from a binding in a frame or from an array  */
export type ReferenceType = Binding | ArrayUnit;
