import { mandatory } from '../utils/GameUtils';

/**
 * Manager that keeps track of all the event listeners and is
 * in charge of deactivating them when the scene ends
 */
class GameInputManager {
  private scene: Phaser.Scene | undefined;
  private keyboardListeners: Phaser.Input.Keyboard.Key[];
  private eventListeners: Phaser.Input.InputPlugin[];

  constructor() {
    this.keyboardListeners = [];
    this.eventListeners = [];
  }

  public initialise(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public getScene = () => mandatory(this.scene);

  public enableMouseInput(active: boolean) {
    this.getScene().input.mouse.enabled = active;
  }

  public enableKeyboardInput(active: boolean) {
    this.getScene().input.keyboard.enabled = active;
  }

  public registerKeyboardListener(
    key: string | number | Phaser.Input.Keyboard.Key,
    event: string | symbol,
    callback: Function
  ) {
    const keyObj = this.getScene().input.keyboard.addKey(key);
    const keyboardListener = keyObj.addListener(event, callback);
    this.keyboardListeners.push(keyboardListener);
  }

  public registerEventListener(event: string | symbol, callback: Function) {
    const eventListener = this.getScene().input.addListener(event, callback);
    this.eventListeners.concat(eventListener);
  }

  public clearListeners() {
    this.keyboardListeners.forEach(keyboardListener => keyboardListener.removeAllListeners());
    this.eventListeners.forEach(eventListener => eventListener.removeAllListeners());
  }
}

export default GameInputManager;
