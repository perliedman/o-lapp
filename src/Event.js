import React from 'react'
import Attendance from './Attendance'
import Query from './Query'
import { Link } from 'react-router-dom'

export default function Event({eventId}) {
  return <Query path={`events/${eventId}`}>
    {(event, eventId) => event && <Query path={`groups/${event.groupId}`}>
      {group => group && <>
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><Link to={`/group/${event.groupId}`}>{group.name}</Link></li>
            <li className="is-active" ><Link to={`/group/${event.groupId}/event/${eventId}`}>{event.name}</Link></li>
          </ul>
        </nav>
        <Attendance groupId={event.groupId} eventId={eventId} />
      </>}
    </Query>}
  </Query> 
}
