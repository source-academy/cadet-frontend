import { PhaserImage } from '../utils/extendedPhaser';

export type DialogueObject = {
  string?: string[];
};

type Speaker = string;
type Expression = string;
export type SpeakerDetail = [Speaker, Expression];
export type DialogueString = string;
export type GameObject = Phaser.GameObjects.Rectangle | PhaserImage;
