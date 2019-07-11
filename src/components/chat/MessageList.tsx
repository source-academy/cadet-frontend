import * as React from 'react';

import { getPrettyDate } from '../../utils/dateHelpers';
import Markdown from '../commons/Markdown';

type Message = {
  userStore: { users: { [x: string]: { name: string } } };
  senderId: React.ReactText;
  text: string;
  createdAt: string;
};

type StateProps = {
  messages: Message[];
};

class MessageList extends React.Component<StateProps> {
  public render() {
    return (
      <div className="MessageList">
        <ul className="msg-list">
          {this.props.messages.length > 0 ? (
            this.props.messages.map((message: Message, index: number) => (
              <li className="msg-item" key={index}>
                <pre className="dialogue-box">
                  <span>
                    <strong className="msg-sender">
                      {message.userStore.users[message.senderId].name}
                    </strong>
                    &emsp;
                    <i className="msg-date">{getPrettyDate(message.createdAt)}</i>
                  </span>
                  <Markdown content={message.text} />
                </pre>
              </li>
            ))
          ) : (
            <li className="msg-item" key="no-message">
              <pre className="dialogue-box">
                <span>There are no messages.</span>
              </pre>
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default MessageList;
