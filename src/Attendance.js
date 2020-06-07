import React from 'react'
import Query from './Query'

export default function Attendance({groupId, eventId}) {
  return <Query path={`members/${groupId}`}>
    {members => <Query path={`attendance/${eventId}`}>
      {attendance => null}
    </Query>}
  </Query>
}
