import React from 'react'
import Query from './Query'
import { Link } from 'react-router-dom'

export default function Events({ group, groupId }) {
  return <Query path={`/groups/${groupId}/events`} join={eventId => `/events/${eventId}`}>
    {(events) => Object.keys(events).map((eventId) =>
      <div key={eventId} className="box">
        <Link to={`/event/${eventId}`}>
          <article>
            <h2 className="title">{events[eventId].name}</h2>            
          </article>
        </Link>
      </div>)}
  </Query>
}