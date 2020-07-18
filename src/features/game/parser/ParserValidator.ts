import { ItemId } from '../commons/CommonTypes';
import { GameLocationAttr } from '../location/GameMapTypes';
import { GameSoundType } from '../sound/GameSoundTypes';
import Parser from './Parser';

export enum GameAttr {
  locations = 'locations',
  objectives = 'objectives',
  bgms = 'bgms',
  sfxs = 'sfxs'
}

type AssertionDetail = {
  itemId: ItemId;
  actionType?: string;
};

export default class ParserValidator {
  private locAttrAssertions: Map<GameLocationAttr, AssertionDetail[]>;
  private attrAssertions: Map<GameAttr, AssertionDetail[]>;

  constructor() {
    this.locAttrAssertions = new Map<GameLocationAttr, AssertionDetail[]>();
    this.attrAssertions = new Map<GameAttr, AssertionDetail[]>();
  }

  public assertLocAttr(locAttr: GameLocationAttr, itemId: ItemId, actionType?: string) {
    if (!this.locAttrAssertions.get(locAttr)) {
      this.locAttrAssertions.set(locAttr, []);
    }
    this.locAttrAssertions.get(locAttr)!.push({ itemId, actionType });
    return itemId;
  }

  public assertAttr(gameAttr: GameAttr, itemId: ItemId, actionType?: string) {
    if (!this.attrAssertions.get(gameAttr)) {
      this.attrAssertions.set(gameAttr, []);
    }
    this.attrAssertions.get(gameAttr)!.push({ itemId, actionType });
    return itemId;
  }

  public assertLocAttrs(locAttr: GameLocationAttr, itemIds: ItemId[], actionType?: string) {
    itemIds.forEach(itemId => this.assertLocAttr(locAttr, itemId, actionType));
  }

  public verifyAssertions() {
    this.verifyLocAttrAssertions();
    this.verifyAttrAssertions();
  }

  private verifyLocAttrAssertions() {
    this.locAttrAssertions.forEach(
      (assertionDetails: AssertionDetail[], gameLocationAttr: GameLocationAttr) => {
        assertionDetails.forEach((assertionDetail: AssertionDetail) => {
          const { itemId, actionType } = assertionDetail;
          if (!Parser.checkpoint.map[gameLocationAttr].has(itemId)) {
            if (actionType) {
              this.actionAssertionError(itemId, gameLocationAttr, actionType);
            }
            throw new Error(`Cannot find id "${itemId}" under ${gameLocationAttr} entity type`);
          }
        });
      }
    );
  }

  private verifyAttrAssertions() {
    this.attrAssertions.forEach((assertionDetails: AssertionDetail[], gameAttr: GameAttr) => {
      assertionDetails.forEach((assertionDetail: AssertionDetail) => {
        const { itemId, actionType } = assertionDetail;
        switch (gameAttr) {
          case GameAttr.locations:
            Parser.checkpoint.map.getLocationAtId(itemId);
            break;
          case GameAttr.objectives:
            if (Parser.checkpoint.objectives.getObjectives().get(itemId) === undefined) {
              if (actionType) {
                this.actionAssertionError(itemId, gameAttr, actionType);
              }
              throw new Error(`Cannot find objective id "${itemId}"`);
            }
            break;
          case GameAttr.bgms:
            const numberOfBgm = Parser.checkpoint.map
              .getSoundAssets()
              .filter(sound => sound.soundType === GameSoundType.BGM && sound.key === itemId)
              .length;
            if (numberOfBgm === 0) {
              throw new Error(`Cannot find bgm key "${itemId}"`);
            } else if (numberOfBgm > 1) {
              throw new Error(`More than 1 bgm key "${itemId}"`);
            }
            break;
          case GameAttr.sfxs:
            const numberOfSfx = Parser.checkpoint.map
              .getSoundAssets()
              .filter(sound => sound.soundType === GameSoundType.SFX && sound.key === itemId)
              .length;
            if (numberOfSfx === 0) {
              throw new Error(`Cannot find sfx key "${itemId}"`);
            } else if (numberOfSfx > 1) {
              throw new Error(`More than 1 sfx key "${itemId}"`);
            }
            break;
        }
      });
    });
  }

  private actionAssertionError(itemId: ItemId, attribute: string, actionType: string) {
    throw new Error(
      `Expected type of "${attribute}" as argument for "${actionType}", obtained "${itemId}" which is either undefined or the wrong id.`
    );
  }
}