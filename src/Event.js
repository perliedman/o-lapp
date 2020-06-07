import React from 'react'
import { FirebaseDatabaseNode } from '@react-firebase/database'
import Attendance from './Attendance'
import Query from './Query'

export default function Event({eventId}) {
  return <Query path={`events/${eventId}`}>
    {event => event && <Query path={`groups/${event.groupId}`}>
      {group => group && <>
        <h1>{event.name} - {group.name}</h1>
        <Attendance eventId={event.id} />
      </>}
    </Query>}
  </Query> 
}
