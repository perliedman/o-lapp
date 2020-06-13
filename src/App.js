import React, { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import { StateProvider } from './store';
import Navbar from './Navbar'
import Event from './Event';

import 'bulma/css/bulma.css';
import Query from './Query';
import Events from './Events';

import firebase from 'firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

function App() {
  return (
    <StateProvider>
      <Router>
        <Navbar />

        <section className="section">
          <div className="container">
            <Switch>
              <Route path="/event/:eventId" component={EventView} />
              <Route path="/group/:groupId" component={EventsView} />
              <Route path="/signin" component={SignIn} />
              <Route path="/" component={StartView} />
            </Switch>
          </div>
        </section>
      </Router>
    </StateProvider>
  );
}

function StartView () {
  return <Query path="/groups">
    {groups => {
      const groupIds = Object.keys(groups)
      return groupIds.length > 1
        ? <GroupsView groups={groups} />
        : <Events group={groups[groupIds[0]]} groupId={groupIds[0]} />}}
  </Query>
}

function GroupsView () {
  return null
}

function EventsView({ match: { params: { groupId } } }) {
  return <Query path={`/groups/${groupId}`}>
    {group => <Events group={group} groupId={groupId} />}
  </Query>
}

function EventView({ match: { params: { eventId } } }) {
  return <Event eventId={eventId} />
}

function SignIn () {
  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
}

export default App;
