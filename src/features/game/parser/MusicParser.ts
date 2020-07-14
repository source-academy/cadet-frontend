import { LocationId } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import StringUtils from '../utils/StringUtils';
import Parser from './Parser';

export default class MusicParser {
  public static parse(locationId: LocationId, bgmList: string[], soundType: GameSoundType) {
    bgmList.forEach((bgm, bgmIndex) => {
      const [id, assetPath, volume] = StringUtils.splitByChar(bgm, ',');
      Parser.checkpoint.map.addSoundAsset({
        key: id,
        path: assetPath,
        config: {
          volume: parseInt(volume),
          loop: soundType === GameSoundType.BGM
        },
        soundType
      });

      if (soundType === GameSoundType.BGM && bgmIndex === 0) {
        Parser.checkpoint.map.setBGMusicAt(locationId, id);
      }
    });
  }
}
