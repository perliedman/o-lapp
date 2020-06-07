import React, { createContext } from 'react';
import * as firebase from 'firebase/app'
import 'firebase/analytics'
import 'firebase/database'
import { useReducer } from 'react'
import { firebaseConfig } from '../config'

firebase.initializeApp(firebaseConfig)
firebase.analytics()

const initialState = {
  database: firebase.database()
}

const store = createContext(initialState)
const { Provider } = store

const StateProvider = ( {children} ) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return <Provider value={{ state, dispatch }}>
    {children}
  </Provider>
}

export { store, StateProvider }

function reducer(state, action) {
  return state
}
