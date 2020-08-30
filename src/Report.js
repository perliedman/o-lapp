import React, { useMemo, useCallback, useState, useContext } from 'react'
import Query from './Query'
import Breadcrumbs from './breadcrumbs'
import { reduceAttendanceEvents, dispatchEvent } from './attendance-state';
import { store } from './store'

export default function Report({eventId}) {
  return <Query path={`events/${eventId}`}>
    {(event, eventId) => event && <Query path={`groups/${event.groupId}`}>
      {group => group && <>
        <Breadcrumbs crumbs={[
          [`/group/${event.groupId}`, group.name],
          [`/group/${event.groupId}/event/${eventId}`, event.name],
          [`/group/${event.groupId}/event/${eventId}/report`, 'Rapport']
        ]} />
        <Query path={`groups/${event.groupId}/members`} join={memberKey => `members/${memberKey}`}>      
          {(members) => <Query path={`attendance/${eventId}`} acceptEmpty={true}>
            {attendance => <ReportBody
              eventId={eventId}
              event={event}
              group={group}
              attendance={attendance || {}}
              members={members || {}} />}
          </Query>}
        </Query> 
      </>}
    </Query>}
  </Query> 
}

function ReportBody ({ group, eventId, event, members, attendance }) {
  const { state: { database, user } } = useContext(store)
  const [mailBody, setMailBody] = useState()
  const containerRef = useCallback(node => {
    if (node) {
      setMailBody(node.innerText.replace(/\n/g, '\r\n'))
    }
  }, [])
  const memberKeys = Object.keys(members)
  const state = reduceAttendanceEvents(memberKeys, attendance)
  const sortedMembers = useMemo(() => {
    const byName = (a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    return Object.keys(members).filter(key => state[key].attending).map((key) => ({ ...members[key], key })).sort(byName)
  }, [members, state])
  const nAttending = Object.values(state).reduce((na, m) =>
    na + (m.attending ? 1 : 0), 0)

  return <>
    {!state.open
      ? <button type="button" className="button is-primary">Återöppna</button>
      : mailBody
      ? <a 
        onClick={() => dispatchEvent(database, user, eventId, { type: 'CLOSE_EVENT', createdAt: +new Date(), createdBy: user.uid, createdByName: user.displayName })}
        href={`mailto:robert.jerkstrand@toleredutby.se?subject=${encodeURIComponent('Närvarorapport ' + event.name)}&body=${encodeURIComponent(mailBody)}`}
        className="button is-primary">
        Maila rapport
      </a>
      : null}
    <div ref={containerRef}>
      <h1 className="is-size-4">{event.name}</h1>
      <p>{group.name} {event.date}, {nAttending} närvarande</p>
      <ul>
        {sortedMembers.map(m => <li key={m.key}>
          {m.name}
        </li>)}
      </ul>
    </div>
  </>
}
