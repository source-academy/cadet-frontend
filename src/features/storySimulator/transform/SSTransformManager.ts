import ObjectPlacement from '../scenes/ObjectPlacement/ObjectPlacement';
import { Layer } from 'src/features/game/layer/GameLayerTypes';
import { CursorMode } from '../cursorMode/SSCursorModeTypes';
import { multiplyDimensions } from 'src/features/game/utils/SpriteUtils';
import { scaleFactor, activeSelectMargin } from './SSTransformManagerConstants';

export default class SSTransformManager {
  private activeSelection: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  private activeSelectRect: Phaser.GameObjects.Rectangle | undefined;
  private objectPlacement: ObjectPlacement | undefined;

  public initialise(objectPlacement: ObjectPlacement) {
    this.objectPlacement = objectPlacement;
    this.trackDraggables(objectPlacement);
    this.drawActiveSelectRect();
    this.bindDeleteKey();
  }

  private drawActiveSelectRect() {
    this.activeSelectRect = new Phaser.GameObjects.Rectangle(
      this.getObjectPlacement(),
      0,
      0,
      1,
      1,
      0
    ).setAlpha(0.3);
    this.getObjectPlacement().layerManager.addToLayer(Layer.Selector, this.activeSelectRect);
  }

  private trackDraggables(objectPlacement: ObjectPlacement) {
    const dragListener = objectPlacement.input.on(
      'drag',
      (
        pointer: MouseEvent,
        gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle,
        dragX: number,
        dragY: number
      ) => {
        if (!objectPlacement.isCursorMode(CursorMode.DrawBBox)) {
          objectPlacement.getCursorManager().setCursorMode(CursorMode.DragResizeObj);
          gameObject.x = dragX;
          gameObject.y = dragY;
        }

        if (gameObject.data.get('type') === 'object') {
          objectPlacement.setObjAttribute(gameObject, 'x', dragX);
          objectPlacement.setObjAttribute(gameObject, 'y', dragY);
          this.setActiveSelection(gameObject);
        }

        if (gameObject.data.get('type') === 'bbox') {
          objectPlacement.setBBoxAttribute(gameObject, 'x', dragX);
          objectPlacement.setBBoxAttribute(gameObject, 'y', dragY);
          this.setActiveSelection(gameObject);
        }
      }
    );
    objectPlacement.registerEventListeners([dragListener]);
  }

  public resizeActive(enlarge: boolean) {
    const objectPlacement = this.getObjectPlacement();
    if (!this.activeSelection || !this.activeSelectRect) {
      return;
    }
    const factor = enlarge ? scaleFactor : 1 / scaleFactor;
    multiplyDimensions(this.activeSelection, factor);
    this.activeSelectRect.displayHeight = this.activeSelection.displayHeight + activeSelectMargin;
    this.activeSelectRect.displayWidth = this.activeSelection.displayWidth + activeSelectMargin;

    if (this.activeSelection.data.get('type') === 'object') {
      objectPlacement.setObjAttribute(
        this.activeSelection,
        'width',
        Math.abs(this.activeSelection.displayWidth)
      );
      objectPlacement.setObjAttribute(
        this.activeSelection,
        'height',
        Math.abs(this.activeSelection.displayHeight)
      );
    }

    if (this.activeSelection.data.get('type') === 'bbox') {
      objectPlacement.setBBoxAttribute(
        this.activeSelection,
        'width',
        Math.abs(this.activeSelection.displayWidth)
      );
      objectPlacement.setBBoxAttribute(
        this.activeSelection,
        'height',
        Math.abs(this.activeSelection.displayHeight)
      );
    }
  }

  public setActiveSelection(gameObject: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle) {
    if (!this.activeSelectRect) {
      return;
    }
    this.activeSelection = gameObject;
    this.activeSelectRect.x = gameObject.x;
    this.activeSelectRect.y = gameObject.y;

    this.activeSelectRect.displayHeight = gameObject.displayHeight + activeSelectMargin;
    this.activeSelectRect.displayWidth = gameObject.displayWidth + activeSelectMargin;
  }

  private getObjectPlacement() {
    if (!this.objectPlacement) {
      throw new Error('No object placement parent scene');
    }
    return this.objectPlacement;
  }

  private bindDeleteKey() {
    const deleteKey = this.getObjectPlacement().input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.DELETE
    );

    deleteKey.addListener('up', () => {
      if (!this.activeSelection) return;
      this.activeSelection.destroy();
    });

    this.getObjectPlacement().registerKeyboardListeners([deleteKey]);
  }
}
