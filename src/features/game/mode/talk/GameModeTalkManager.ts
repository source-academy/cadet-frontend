import { GameChapter } from '../../chapter/GameChapterTypes';
import GameModeTalk from './GameModeTalk';
import { GameMode } from '../GameModeTypes';
import { mapValues } from '../../utils/GameUtils';
import { LocationId } from '../../commons/CommonsTypes';
import GameActionManager from 'src/pages/academy/game/subcomponents/GameActionManager';

const backButtonCallback = () => {
  GameActionManager.getInstance().changeModeTo(GameMode.Menu);
};
class GameModeTalkManager {
  static processTalkMenus(chapter: GameChapter): Map<LocationId, GameModeTalk> {
    return mapValues(chapter.map.getLocations(), location => {
      const possibleDialogues = chapter.map.getTalkTopicsAt(location.name);
      if (!location.modes || !location.modes.includes(GameMode.Talk) || !possibleDialogues.length) {
        return;
      }
      return new GameModeTalk(possibleDialogues, backButtonCallback);
    });
  }
}

export default GameModeTalkManager;
