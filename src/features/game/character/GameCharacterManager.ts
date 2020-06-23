import GameActionManager from 'src/features/game/action/GameActionManager';
import { screenSize, screenCenter } from '../commons/CommonConstants';
import {
  charRect,
  charWidth,
  speakerRect,
  textPadding,
  speakerTextStyle
} from './GameCharacterConstants';
import { ItemId } from '../commons/CommonsTypes';
import { LocationId, GameLocationAttr } from '../location/GameMapTypes';
import { Character, SpeakerDetail, CharacterPosition } from './GameCharacterTypes';
import { Layer } from '../layer/GameLayerTypes';
import { resize } from '../utils/SpriteUtils';
import { speakerBox } from '../commons/CommonAssets';
import { capitalise } from '../utils/StringUtils';
import { fadeIn, fadeOut } from '../effects/FadeEffect';

export default class CharacterManager {
  private characterMap: Map<ItemId, Character>;
  private characterSpriteMap: Map<ItemId, Phaser.GameObjects.Image>;

  private currentSpeakerId: ItemId | undefined;

  constructor() {
    this.characterMap = new Map<ItemId, Character>();
    this.characterSpriteMap = new Map<ItemId, Phaser.GameObjects.Image>();
  }

  public initialise(characterMap: Map<ItemId, Character>) {
    this.characterMap = characterMap;
  }

  public renderCharacterLayerContainer(locationId: LocationId): void {
    const idsToRender =
      GameActionManager.getInstance().getLocationAttr(GameLocationAttr.characters, locationId) ||
      [];

    const characterLayer = this.renderCharactersInLoc(idsToRender);
    GameActionManager.getInstance().addContainerToLayer(Layer.Character, characterLayer);
  }

  public renderCharactersInLoc(idsToRender: ItemId[]): Phaser.GameObjects.Container {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const characterContainer = new Phaser.GameObjects.Container(gameManager, 0, 0);
    idsToRender.forEach(id => {
      const characterToRender = this.characterMap.get(id);
      if (characterToRender) {
        const characterSprite = this.createCharacterSprite(characterToRender);
        characterContainer.add(characterSprite);
        this.characterSpriteMap.set(id, characterSprite);
      }
    });

    return characterContainer;
  }

  private createCharacterSprite(
    character: Character,
    overrideExpression?: string,
    overridePosition?: CharacterPosition
  ) {
    const { defaultPosition, defaultExpression, expressions } = character;

    const gameManager = GameActionManager.getInstance().getGameManager();

    const characterXPosition = charRect.x[overridePosition || defaultPosition];
    const assetKey = expressions.get(overrideExpression || defaultExpression)!;

    const characterSprite = new Phaser.GameObjects.Image(
      gameManager,
      characterXPosition,
      screenSize.y,
      assetKey
    ).setOrigin(0.5, 1);

    return resize(characterSprite, charWidth);
  }

  public showCharacterOnMap(characterId: ItemId) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      gameManager.add.tween(fadeIn([characterSprite]));
    }
  }

  public hideCharacterFromMap(characterId: ItemId) {
    const gameManager = GameActionManager.getInstance().getGameManager();
    const characterSprite = this.characterSpriteMap.get(characterId);
    if (characterSprite) {
      gameManager.add.tween(fadeOut([characterSprite]));
    }
  }

  private drawSpeakerBox(text: string) {
    const gameManager = GameActionManager.getInstance().getGameManager();

    const container = new Phaser.GameObjects.Container(gameManager, 0, 0);
    const rectangle = new Phaser.GameObjects.Image(
      gameManager,
      screenCenter.x,
      screenCenter.y,
      speakerBox.key
    ).setAlpha(0.8);

    const speakerText = new Phaser.GameObjects.Text(
      gameManager,
      speakerRect.x + textPadding,
      speakerRect.y + textPadding,
      '',
      speakerTextStyle
    ).setOrigin(0.5);

    container.add([rectangle, speakerText]);
    speakerText.text = capitalise(text);

    gameManager.layerManager.addToLayer(Layer.DialogueLabel, container);
  }

  public changeSpeakerTo(speakerDetail: SpeakerDetail | undefined | null) {
    if (speakerDetail === undefined) {
      return;
    }

    // delete previous speaker and restore his character on map
    if (this.currentSpeakerId) {
      this.showCharacterOnMap(this.currentSpeakerId);
    }
    const gameManager = GameActionManager.getInstance().getGameManager();
    gameManager.layerManager.clearLayerContents(Layer.Speaker);
    gameManager.layerManager.clearLayerContents(Layer.DialogueLabel);

    if (speakerDetail === null) {
      return;
    }

    // show new speaker and hide speaker's character on map
    const { speakerId, expression, speakerPosition } = speakerDetail;

    this.hideCharacterFromMap(speakerId);
    const speakerToShow = this.characterMap.get(speakerId);
    if (speakerToShow) {
      const characterSprite = this.createCharacterSprite(
        speakerToShow,
        expression,
        speakerPosition
      );
      gameManager.layerManager.addToLayer(Layer.Speaker, characterSprite);
      this.drawSpeakerBox(speakerToShow.name);
      this.currentSpeakerId = speakerId;
    }
  }
}