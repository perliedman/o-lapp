import React from 'react'
import Query from './Query'
import { Link } from 'react-router-dom'

export default function Events({ group, groupId }) {
  return <Query path={`/groups/${groupId}/events`} join={eventId => `/events/${eventId}`}>
    {(events, eventIds) => events.map((e, i) =>
      <div key={eventIds[i]} className="box">
        <Link to={`/event/${eventIds[i]}`}>
          <article>
            <h2 className="title">{e.name}</h2>            
          </article>
        </Link>
      </div>)}
  </Query>
}