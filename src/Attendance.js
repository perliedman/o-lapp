import React, { useContext, useMemo, useState } from 'react'
import Query from './Query'
import { store } from './store'

export default function Attendance({groupId, eventId}) {
  const { state: { database } } = useContext(store)
  const attendanceRef = useMemo(() => database.ref(`attendance/${eventId}`), [eventId, database])

  return <Query path={`groups/${groupId}/members`} join={memberKey => `members/${memberKey}`}>      
    {(members, memberKeys) =>  <Query path={`attendance/${eventId}`} acceptEmpty={true}>
        {attendance => <AttendanceTable attendance={attendance} members={members} memberKeys={memberKeys} dispatch={dispatch} />}
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

function AttendanceTable({ attendance, members, memberKeys, dispatch }) {
  const [mode, setMode] = useState('attendance')
  const sortedMembers = useMemo(() => {
    const byName = (a, b) => a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    const byReturned = (a, b) => a.returned && !b.returned ? -1 : b.returned && !a.returned ? 1 : byName(a, b)

    return members.sort(mode === 'attendance'
      ? byName
      : byReturned)
  }, [members, mode])
  const state = reduceAttendanceEvents(memberKeys, attendance)

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
          key={memberKeys[i]}
          member={m}
          memberKey={memberKeys[i]}
          state={state[memberKeys[i]]}
          mode={mode}
          dispatch={dispatch} />)}
      </tbody>
    </table>
  </>
}

function AttendanceRow({ member, memberKey, state, mode, dispatch }) {
  return <tr style={mode === 'not_returned' && state.returned ? { opacity: 0.4 } : {}}>
    <td>{member.name}</td>
    <td>
      <input type="checkbox" checked={state.attending} onChange={e => dispatch(e.target.checked ? 'ADD_ATTENDANCE' : 'REMOVE_ATTENDANCE', memberKey)} />
    </td>
    <td>
      <input type="checkbox" checked={state.attending && state.returned} disabled={!state.attending} onChange={e => dispatch(e.target.checked ? 'NOTE_RETURNED' : 'UNDO_RETURNED', memberKey)} />
    </td>
  </tr>
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
