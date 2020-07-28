import React, { createContext, useEffect } from 'react';
import firebase from 'firebase/app'
import 'firebase/analytics'
import 'firebase/database'
import 'firebase/auth'
import { useReducer } from 'react'
import { firebaseConfig } from '../config'

firebase.initializeApp(firebaseConfig)
firebase.analytics()

const initialState = {
  database: firebase.database(),
  auth: firebase.auth()
}

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( {children} ) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    state.auth.onAuthStateChanged(user => {
      if (user) {
        dispatch({ type: 'USER_SIGNED_IN', user })
      } else {
        dispatch({ type: 'USER_SIGNED_OUT' })
      }
    })
  }, [state.auth])

  return <Provider value={{ state, dispatch }}>
    {children}
  </Provider>
}

export { store, StateProvider }

function reducer(state, action) {
  switch (action.type) {
    case 'USER_SIGNED_IN':
      return {
        ...state,
        user: action.user
      }
    case 'USER_SIGNED_OUT':
      return {
        ...state,
        user: undefined
      }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}
