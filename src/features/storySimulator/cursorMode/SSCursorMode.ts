import { AssetKey } from 'src/features/game/commons/CommonTypes';
import { CursorMode } from './SSCursorModeTypes';
import SSCursorModeConstants, { altTextStyle } from './SSCursorModeConstants';
import { Constants } from 'src/features/game/commons/CommonConstants';
import { HexColor } from 'src/features/game/utils/StyleUtils';
import { createBitmapText } from 'src/features/game/utils/TextUtils';
import SSImageAssets from '../assets/ImageAssets';

export default class SSCursorMode extends Phaser.GameObjects.Container {
  private isModes: Array<boolean>;
  private currCursorMode: CursorMode;
  private cursorModes: Array<Phaser.GameObjects.Container>;
  private currActiveModeIdx: number;

  constructor(
    scene: Phaser.Scene,
    x?: number,
    y?: number,
    defaultCursorMode: CursorMode = CursorMode.DragResizeObj
  ) {
    super(scene, x, y);
    this.currCursorMode = defaultCursorMode;
    this.isModes = new Array<boolean>();
    this.cursorModes = new Array<Phaser.GameObjects.Container>();
    this.currActiveModeIdx = -1;
  }

  public getCurrCursorMode() {
    return this.currCursorMode;
  }

  public setCursorMode(newMode: CursorMode) {
    this.currCursorMode = newMode;
  }

  public addCursorMode(
    scene: Phaser.Scene,
    assetKey: AssetKey,
    isMode: boolean = true,
    text: string = '',
    onClick: () => void = Constants.nullFunction,
    onHover: () => void = Constants.nullFunction,
    onOut: () => void = Constants.nullFunction
  ) {
    // Main container
    const cursorModeContainer = new Phaser.GameObjects.Container(scene, 0, 0);
    const modeIconBg = new Phaser.GameObjects.Sprite(scene, 0, 0, SSImageAssets.iconBg.key)
      .setDisplaySize(SSCursorModeConstants.iconBgSize, SSCursorModeConstants.iconBgSize)
      .setAlpha(SSCursorModeConstants.inactiveAlpha)
      .setInteractive({ pixelPerfect: true, useHandCursor: true });

    // Icon
    const modeIcon = new Phaser.GameObjects.Sprite(scene, 0, 0, assetKey).setDisplaySize(
      SSCursorModeConstants.iconSize,
      SSCursorModeConstants.iconSize
    );

    // On hover text container
    const altTextBg = new Phaser.GameObjects.Rectangle(
      scene,
      0,
      0,
      text.length * 12,
      50,
      HexColor.darkBlue
    )
      .setAlpha(0.7)
      .setOrigin(0.0, 0.5);

    const altText = createBitmapText(
      scene,
      text,
      SSCursorModeConstants.altTextMargin,
      0,
      altTextStyle
    ).setOrigin(0.0, 0.5);
    const altTextContainer = new Phaser.GameObjects.Container(
      scene,
      SSCursorModeConstants.altTextXPos,
      SSCursorModeConstants.altTextYPos,
      [altTextBg, altText]
    );

    // Hide it by default
    altTextContainer.setVisible(false);

    // Update
    this.isModes.push(isMode);
    this.cursorModes.push(cursorModeContainer);
    const currIdx = this.cursorModes.length - 1;

    // Set listeners
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (this.isModes[currIdx]) this.currActiveModeIdx = currIdx;
      onClick();
      this.renderCursorModesContainer();
    });
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
      if (text !== '') altTextContainer.setVisible(true);
      cursorModeContainer.setAlpha(SSCursorModeConstants.onHoverAlpha);
      onHover();
    });
    modeIconBg.addListener(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
      altTextContainer.setVisible(false);
      const activeMode = currIdx === this.currActiveModeIdx && this.isModes[currIdx];
      cursorModeContainer.setAlpha(
        activeMode ? SSCursorModeConstants.activeAlpha : SSCursorModeConstants.inactiveAlpha
      );
      onOut();
    });

    cursorModeContainer.add([modeIconBg, modeIcon, altTextContainer]);
  }

  public renderCursorModesContainer() {
    this.removeAll(false);
    let spacing = 0;
    this.cursorModes.forEach((mode, index) => {
      mode.setPosition(0, spacing);
      const activeMode = index === this.currActiveModeIdx && this.isModes[index];
      mode.setAlpha(
        activeMode ? SSCursorModeConstants.activeAlpha : SSCursorModeConstants.inactiveAlpha
      );
      this.add(mode);
      spacing += SSCursorModeConstants.iconBgSize + SSCursorModeConstants.iconSpacing;
    });
  }
}
