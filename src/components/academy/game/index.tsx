import * as React from 'react';

import { setUser } from '../../../actions';
import { store } from '../../../createStore';
import { Story } from '../../../reducers/states';
import { getUser } from '../../../sagas/backend';

type GameProps = DispatchProps & StateProps;

export type DispatchProps = {
  handleSaveCanvas: (c: HTMLCanvasElement) => void;
};

export type StateProps = {
  canvas?: HTMLCanvasElement;
  name: string;
  story?: Story;
};

export class Game extends React.Component<GameProps, {}> {
  private canvas: HTMLCanvasElement;
  private div: HTMLDivElement;

  /**
   * Basically, if the function story is called twice (on different canvas
   * elements), the second time the component is mounted, the pixi.js canvas
   * will show nothing but a black screen. This means that if the user
   * navigate aways from the game tab, and then back again, the game would not
   * work.
   *
   * So, we save a reference to the first canvas that is loaded. Thereafter,
   * when this component is mounted, use that canvas instead of the new canvas
   * mounted with this div. This is a bit hacky, and refs aren't favoured in
   * react, but it also prevents excessive loading of the game
   *
   * Note that the story/4's 4th param is named 'attemptedAll'. It is true if a
   * storyline should not be loaded, and false if it should. In contrast,
   * backend sends us 'playStory', which is the negation (!) of `attemptedAll`.
   */
  public async componentDidMount() {
    const story: any = (await import('./game.js')).default;
    if (this.props.canvas === undefined) {
      const storyOpts = await this.getStoryOpts();
      story(this.div, this.canvas, this.props.name, ...storyOpts);
      this.props.handleSaveCanvas(this.canvas);
    } else {
      // This browser window has loaded the Game component & canvas before
      this.div.innerHTML = '';
      this.div.appendChild(this.props.canvas);
    }
  }

  public render() {
    return (
      <div id="game-display" className="sa-game" ref={e => (this.div = e!)}>
        <canvas ref={e => (this.canvas = e!)} />
      </div>
    );
  }

  private async getStoryOpts() {
    if (this.props.story) {
      // no missions, no story from backend, just play intro
      return this.props.story.story
        ? [this.props.story.story, !this.props.story.playStory]
        : ['mission-1', true];
    } else {
      // this.props.story is null if creating 'fresh' store from localStorage
      const state = store.getState();
      const tokens = {
        accessToken: state.session.accessToken!,
        refreshToken: state.session.refreshToken!
      };
      const user: any = await getUser(tokens);
      if (user) {
        store.dispatch(setUser(user));
        // no missions, no story from backend, just play intro
        return user.story.story ? [user.story.story, !user.story.playStory] : ['mission-1', true];
      } else {
        // if user is null, actions.logOut is called anyways; nonetheless we
        // return a storyOpts, otherwise typescript complains about using storyOpts
        // before assignment in story/4 below
        return ['mission-1', true];
      }
    }
  }
}

export default Game;
