import React, { useContext, useMemo, useState } from 'react'
import Query from './Query'
import { store } from './store'

export default function Attendance({groupId, eventId}) {
  const { state: { database } } = useContext(store)
  const attendanceRef = useMemo(() => database.ref(`attendance/${eventId}`), [eventId, database])
  const [selectedMember, setSelectedMember] = useState()
 
  return <Query path={`groups/${groupId}/members`} join={memberKey => `members/${memberKey}`}>      
    {(members, memberKeys) =>  <Query path={`attendance/${eventId}`} acceptEmpty={true}>
        {attendance => <>
          <AttendanceTable
            attendance={attendance || {}}
            members={members || {}}
            memberKeys={memberKeys || []}
            dispatch={dispatch}
            onMemberSelected={member => setSelectedMember(member)} />
          {selectedMember && <MemberInfoModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
        </>}
    </Query>}
  </Query>

  function dispatch (eventType, memberKey) {
    const eventRef = attendanceRef.push()
    eventRef.set({
      type: eventType,
      memberKey,
      createdAt: +new Date()
    })
  }
}

function AttendanceTable({ attendance, members, dispatch, onMemberSelected }) {
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
    <p>{nAttending} närvarande, {nNotReturned} kvar i skogen</p>
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
          dispatch={dispatch}
          onNameClicked={() => onMemberSelected && onMemberSelected(m)} />)}
      </tbody>
    </table>
  </>
}

function AttendanceRow({ member, memberKey, state, mode, dispatch, onNameClicked }) {
  return <tr style={mode === 'not_returned' && (!state.attending || state.returned) ? { opacity: 0.4 } : {}}>
    <td onClick={onNameClicked}>{member.name}</td>
    <td>
      <input type="checkbox" checked={state.attending} onChange={e => dispatch(e.target.checked ? 'ADD_ATTENDANCE' : 'REMOVE_ATTENDANCE', memberKey)} />
    </td>
    <td>
      <input type="checkbox" checked={state.attending && state.returned} disabled={!state.attending} onChange={e => dispatch(e.target.checked ? 'NOTE_RETURNED' : 'UNDO_RETURNED', memberKey)} />
    </td>
  </tr>
}

function MemberInfoModal ({ member, onClose }) {
  return <div className="modal is-active">
    <div className="modal-background"></div>
    <div className="modal-content">
      <div className="box">
        <h2>{member.name}</h2>
        <p><a href={`tel:${member.phone}`}>{member.phone}</a></p>
        <p><a href={`mailto:${member.email}`}>{member.email}</a></p>
        <button className="modal-close is-large" aria-label="close" onClick={onClose}></button>
      </div>
    </div>
  </div>
}

function reduceAttendanceEvents(memberKeys, attendance) {
  const state = {}
  for (let key of memberKeys) state[key] = { attending: false, returned: true }

  if (!attendance) return state
  
  const events = Object.values(attendance).sort((a, b) => a.dateTime - b.dateTime)

  for (let event of events) {
    switch (event.type) {
      case 'ADD_ATTENDANCE':
        updateState(event.memberKey, { attending: true, returned: false })
        break
      case 'REMOVE_ATTENDANCE':
        updateState(event.memberKey, { attending: false })
        break
      case 'NOTE_RETURNED':
        updateState(event.memberKey, { returned: true })
        break
      case 'UNDO_RETURNED':
        updateState(event.memberKey, { returned: false })
        break
      default:
        console.warn(`Unknown event type ${event.type}`)
    }
  }

  return state

  function updateState(memberKey, memberState) {
    if (!state[memberKey]) {
      state[memberKey] = memberState
    } else {
      state[memberKey] = { ...state[memberKey], ...memberState }
    }
  }
}
