import React from 'react'
import Attendance from './Attendance'
import Query from './Query'

export default function Event({eventId}) {
  return <Query path={`events/${eventId}`}>
    {(event, eventId) => event && <Query path={`groups/${event.groupId}`}>
      {group => group && <>
        <h1>{event.name} - {group.name}</h1>
        <Attendance groupId={event.groupId} eventId={eventId} />
      </>}
    </Query>}
  </Query> 
}
