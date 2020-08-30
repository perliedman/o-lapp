export function reduceAttendanceEvents(memberKeys, attendance) {
  const state = {
    open: true
  }
  for (let key of memberKeys) state[key] = { attending: false, returned: true, lastChange: 0 }

  if (!attendance) return state
  
  const events = Object.values(attendance).sort((a, b) => a.dateTime - b.dateTime)

  for (let event of events) {
    switch (event.type) {
      case 'ADD_ATTENDANCE':
        updateState(event.memberKey, { attending: true, returned: false, lastChange: event.createdAt })
        break
      case 'REMOVE_ATTENDANCE':
        updateState(event.memberKey, { attending: false, lastChange: event.createdAt  })
        break
      case 'NOTE_RETURNED':
        updateState(event.memberKey, { returned: true, lastChange: event.createdAt  })
        break
      case 'UNDO_RETURNED':
        updateState(event.memberKey, { returned: false, lastChange: event.createdAt  })
        break
      case 'CLOSE_EVENT':
        state.open = false
        break
      case 'REOPEN_EVENT':
        state.open = true
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

export function dispatchEvent(database, user, eventId, payload) {
  const attendanceRef = database.ref(`attendance/${eventId}`)
  const eventRef = attendanceRef.push()
  eventRef.set({
    ...payload,
    createdAt: +new Date(),
    createdBy: user.uid,
    createdByName: user.displayName
  })
}