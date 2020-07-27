export function reduceAttendanceEvents(memberKeys, attendance) {
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
