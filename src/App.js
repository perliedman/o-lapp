import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import { StateProvider, store } from './store';
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
  const { state: { user } } = useContext(store)

  return user
    ? <Query path={`/users/${user.uid}/groups`} join={groupId => `/groups/${groupId}`}>
      {groups => {
        const groupIds = Object.keys(groups)
        return groupIds.length > 1
          ? <GroupsView groups={groups} />
          : <>
            <h2>{groups[groupIds[0]].name}</h2>
            <Events group={groups[groupIds[0]]} groupId={groupIds[0]} />
          </>}}
      </Query>
    : <section className="section">
      <p>
        Logga in för att hantera närvaro. Första gången du loggar in behöver du registrera din användare.
      </p>
      <p>
        <Link className="button is-success" to="/signin">
          <strong>Logga In</strong>
        </Link>
      </p>
    </section>
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
