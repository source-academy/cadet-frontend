import { ItemId } from 'src/features/game/commons/CommonsTypes';
export type ShortPath = string;

export type SSObjectDetail = {
  id: ItemId;
  x: number;
  y: number;
  width: number;
  height: number;
};
