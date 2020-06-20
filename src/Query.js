import React, { useState, useEffect, useContext } from 'react'
import { store } from './store'

export default function Query({ path, children, join, acceptEmpty }) {
  const [state, setState] = useState('idle')
  const [value, setValue] = useState()
  const [key, setKey] = useState()

  const { state: { database } } = useContext(store)

  useEffect(() => {
    const ref = database.ref(path)
    setState('loading')

    if (!join) {
      ref.on('value', snapshot => {
        setValue(snapshot.val())
        setKey(snapshot.key)
        setState('idle')
      })

    } else {
      setValue({})
      ref.on('child_added', snapshot => {
        const joinRef = database.ref(join(snapshot.key))
        joinRef.once('value', joinSnapshot => {
          setValue({ ...value, [joinSnapshot.key]: joinSnapshot.val() })
          setKey((key || []).concat(joinSnapshot.key))
          setState('idle')
        })
      })
    }

    return () => ref.off()
  }, [database, path, join])

  return state === 'loading'
    ? <progress className="progress is-small is-primary" />
    : !value
    ? (!acceptEmpty
      ? 'Not found :('
      : children(value, key))
    : children(value, key)
}
