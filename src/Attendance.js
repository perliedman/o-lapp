import React, { useContext, useMemo, useState } from 'react'
import Query from './Query'
import { store } from './store'
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from 'react-router-dom';
import { reduceAttendanceEvents, dispatchEvent } from './attendance-state';
import formatRelative from 'date-fns/formatRelative';
import { sv } from 'date-fns/locale'

export default function Attendance({groupId, eventId}) {
  const { state: { database, user } } = useContext(store)
  const [selectedMember, setSelectedMember] = useState()
 
  return <Query path={`groups/${groupId}/members`} join={memberKey => `members/${memberKey}`}>      
    {(members) =>  <Query path={`attendance/${eventId}`} acceptEmpty={true}>
        {attendance => <div>
          <AttendanceTable
            attendance={attendance || {}}
            members={members || {}}
            reportUrl={`/event/${eventId}/report`}
            dispatch={createDispatch(attendance)}
            onMemberSelected={member => setSelectedMember(member)} />
          {selectedMember && <MemberInfoModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
          <div className="log">
            <section className="section">
              <Log attendance={attendance || {}} members={members || {}} />
            </section>
          </div>
        </div>}
    </Query>}
  </Query>

  function createDispatch (events) {
    return function(eventType, memberKey) {
      const now = +new Date()

      if (memberKey) {
        // If another user created an event for the same user
        // within the timeout period, it's likely a conflict,
        // don't create this event.
        const lastMemberEventWithinTimeout = 
          sortEvents(events).reverse()
          .find(e => e.memberKey === memberKey && e.createdBy !== user.uid && now - e.createdAt < 5000)
        if (lastMemberEventWithinTimeout) return
        dispatchEvent(database, user, eventId, { type: eventType, memberKey })
      } else {
        dispatchEvent(database, user, eventId, { type: eventType })
      }
    }
  }
}

function AttendanceTable({ attendance, members, reportUrl, dispatch, onMemberSelected }) {
  const memberKeys = Object.keys(members)
  const [mode, setMode] = useState('attendance')
  const state = reduceAttendanceEvents(memberKeys, attendance)
  const sortedMembers = useMemo(() => {
    const byName = (a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    const byReturned = (a, b) => {
      const aState = state[a.key]
      const bState = state[b.key]

      if (aState.attending && bState.attending) {
        return !aState.returned && bState.returned
          ? -1
          : !bState.returned && aState.returned
          ? 1
          : byName(a, b)
      } else if (aState.attending) {
        return -1
      } else if (bState.attending) {
        return 1
      } else {
        return byName(a, b)
      }
    }
    return Object.keys(members).map((key) => ({ ...members[key], key })).sort(mode === 'attendance'
      ? byName
      : byReturned)
  }, [members, mode, state])

  const [nAttending, nNotReturned] = Object.values(state).reduce(([na, nnr], m) =>
    [na + (m.attending ? 1 : 0), nnr + (m.attending && !m.returned ? 1 : 0)], [0, 0])

  return <>
    <div className="is-pulled-right">
      {!state.open ? <button onClick={() => dispatch('REOPEN_EVENT')} className="button is-primary">Återöppna</button>
        : nNotReturned === 0
        ? <Link to={reportUrl} className="button is-primary">Avrapportera</Link>
        : null}
    </div>
    <div className="tabs is-toggle">
      <ul>
        {[['Närvaro', 'attendance'], ['Kvar i skogen', 'not_returned']].map(([label, m]) =>
          <li key={m} className={m === mode ? 'is-active' : ''}>
            <a href="#" onClick={e => {
              e.preventDefault()
              setMode(m)
            }}>{label}</a>
          </li>)}
      </ul>
    </div>
    <p>
      {nAttending} närvarande, {nNotReturned} kvar i skogen
    </p>
    <table className="table is-striped is-fullwidth">
      <thead>
        <tr>
          <th>Namn</th>
          <th>Närvarande</th>
          <th>Tillbaka</th>
        </tr>
      </thead>
      <tbody>
        {sortedMembers.map((m, i) => <AttendanceRow
          key={m.key}
          member={m}
          memberKey={m.key}
          state={state[m.key]}
          mode={mode}
          disabled={!state.open}
          dispatch={dispatch}
          onNameClicked={() => onMemberSelected && onMemberSelected(m)} />)}
      </tbody>
    </table>
  </>
}

function AttendanceRow({ member, memberKey, state, mode, disabled, dispatch, onNameClicked }) {
  return <tr style={mode === 'not_returned' && (!state.attending || state.returned) ? { opacity: 0.4 } : {}}>
    <td onClick={onNameClicked}>{member.name}</td>
    <td>
      <input type="checkbox" checked={state.attending} disabled={disabled} onChange={e => dispatch(e.target.checked ? 'ADD_ATTENDANCE' : 'REMOVE_ATTENDANCE', memberKey)} />
    </td>
    <td>
      <input type="checkbox" checked={state.attending && state.returned} disabled={disabled || !state.attending} onChange={e => dispatch(e.target.checked ? 'NOTE_RETURNED' : 'UNDO_RETURNED', memberKey)} />
    </td>
  </tr>
}

function MemberInfoModal ({ member, onClose }) {
  return <div className="modal is-active">
    <div className="modal-background"></div>
    <div className="modal-content">
      <div className="box">
        <h2>{member.name}</h2>
        <p><FontAwesomeIcon icon={faPhone} />&nbsp;<a href={`tel:${member.phone}`}>{member.phone}</a></p>
        <p><FontAwesomeIcon icon={faEnvelope} />&nbsp;<a href={`mailto:${member.email}`}>{member.email}</a></p>
        <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
      </div>
    </div>
  </div>
}

function Log({ attendance, members }) {
  const events = useMemo(() => sortEvents(attendance), [attendance])
  const now = new Date()

  return <ul>
    {events.slice(events.length - 10).reverse().map(e => {
      const description = eventDescription(e)
      return description && <li key={e.createdAt}>
        {description}
        <span className="has-text-grey-light">
          &nbsp;({formatRelative(e.createdAt, now, { locale: sv })}
          {e.createdByName && ` av ${e.createdByName}`})
        </span>
      </li>
    })}
  </ul>

  function eventDescription(event) {
    const { type, memberKey } = event
    switch (type) {
      case 'ADD_ATTENDANCE':
        return `${members[memberKey].name} är närvarande`
      case 'REMOVE_ATTENDANCE':
        return `${members[memberKey].name} är ej närvarande`
      case 'NOTE_RETURNED':
        return `${members[memberKey].name} är tillbaka`
      case 'UNDO_RETURNED':
        return `${members[memberKey].name} är ute i skogen`
      case 'CLOSE_EVENT':
        return `Tillfället är avslutat`
      case 'REOPEN_EVENT':
        return `Tillfället öppnades igen`
      default:
        return null
    }
  }
}

function sortEvents (events) {
  return Object.values(events || {}).sort((a, b) => a.createdAt - b.createdAt)
}