import React, { useState, useEffect, useContext } from 'react'
import { store } from './store'

export default function Query({ path, children }) {
  const [state, setState] = useState('idle')
  const [value, setValue] = useState()

  const { state: { database } } = useContext(store)

  useEffect(() => {
    const ref = database.ref(path)
    setState('loading')
    ref.on('value', snapshot => {
      setValue(snapshot.val())
      setState('idle')
    })
  }, [database, path])

  return state === 'loading'
    ? "Loading..."
    : !value
    ? 'Not found :('
    : children(value)
}
