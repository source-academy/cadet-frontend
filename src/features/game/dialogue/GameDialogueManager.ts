import { ItemId } from '../commons/CommonTypes';
import { Dialogue } from './GameDialogueTypes';
import { Constants } from '../commons/CommonConstants';
import { fadeIn } from '../effects/FadeEffect';
import DialogueGenerator from './GameDialogueGenerator';
import GameGlobalAPI from '../scenes/gameManager/GameGlobalAPI';
import { Layer } from '../layer/GameLayerTypes';
import { textTypeWriterStyle } from './GameDialogueConstants';
import DialogueRenderer from './GameDialogueRenderer';
import GameManager from '../scenes/gameManager/GameManager';

export default class DialogueManager {
  private dialogueMap: Map<ItemId, Dialogue>;

  constructor() {
    this.dialogueMap = new Map<ItemId, Dialogue>();
  }

  public initialise(gameManager: GameManager) {
    this.dialogueMap = gameManager.getCurrentCheckpoint().map.getDialogues();
  }

  public async showDialogue(dialogueId: ItemId): Promise<void> {
    const dialogue = this.dialogueMap.get(dialogueId);

    if (!dialogue || !dialogue.content) {
      return;
    }

    const gameManager = GameGlobalAPI.getInstance().getGameManager();
    const generateDialogue = DialogueGenerator(dialogue);

    const dialogueRenderer = new DialogueRenderer(textTypeWriterStyle);
    const dialogueContainer = dialogueRenderer.getDialogueContainer();

    gameManager.layerManager.addToLayer(Layer.Dialogue, dialogueContainer);
    gameManager.add.tween(fadeIn([dialogueContainer], Constants.fadeDuration * 2));

    async function nextLine(resolve: () => void) {
      const { line, speakerDetail, actionIds } = generateDialogue();
      const lineWithName = line.replace('{name}', gameManager.getAccountInfo().name);
      dialogueRenderer.changeText(lineWithName);
      gameManager.characterManager.changeSpeakerTo(speakerDetail);
      await GameGlobalAPI.getInstance().processGameActionsInSamePhase(actionIds);
      if (!lineWithName) {
        resolve();
        dialogueRenderer.destroy();
        gameManager.characterManager.changeSpeakerTo(null);
      }
    }

    const activateContainer = new Promise(resolve => {
      nextLine(resolve);
      dialogueRenderer
        .getDialogueBox()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, async () => await nextLine(resolve));
    });

    await activateContainer;
  }
}
