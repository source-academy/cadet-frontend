import { SpeakerDetail } from '../commons/CommonsTypes';

/* Parsing dialogue */
export const isPartLabel = (line: string) => new RegExp(/\[part[0-9]+\]/).test(line);
export const isGotoLabel = (line: string) => new RegExp(/\[Goto part[0-9]+\]/).test(line);
export const getPartToJump = (line: string) => line.match(/\[Goto (part[0-9]+)\]/)![1];
export const isSpeaker = (line: string) => line && line[0] === '$';
export const getSpeakerDetails = (line: string): SpeakerDetail => {
  const [speaker, expression] = line.slice(1).split(', ');
  return [speaker, expression];
};

/* Error handling */
export const showDialogueError = (partNum: string, lineNum: number) => {
  throw new Error(`Cannot find ${partNum} line: ${lineNum} in dialogue`);
};
