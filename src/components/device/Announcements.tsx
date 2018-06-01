import { Card, NonIdealState, Spinner, Text } from '@blueprintjs/core'
import * as React from 'react'

export type Announcement = {
  author: string
  title: string
  content: string
  pinned: boolean
}

export interface IAnnouncementsProps {
  announcements?: Announcement[]
  handleAnnouncementsFetch: () => void
}

class Announcements extends React.Component<IAnnouncementsProps, {}> {
  public componentDidMount() {
    this.props.handleAnnouncementsFetch()
  }

  public render() {
    let output
    if (this.props.announcements === undefined) {
      output = <Spinner />
    } else {
      output = <AnnouncementCard announcements={this.props.announcements} />
    }

    return (
      <div className="Announcements row center-xs">
        <div className="col-xs-10">{output}</div>
      </div>
    )
  }
}

interface IAnnouncementCardProps {
  announcements: Announcement[]
}

export const AnnouncementCard: React.SFC<IAnnouncementCardProps> = props => {
  if (props.announcements.length === 0) {
    return <NonIdealState title="There are no announcements." visual="feed" />
  } else {
    const cards = props.announcements.map((ann, index) => (
      <div key={index}>
        <Card>
          <h4>{ann.title}</h4>
          <Text>{ann.content}</Text>
        </Card>
      </div>
    ))
    return <>{cards}</>
  }
}

export default Announcements
