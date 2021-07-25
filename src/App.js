import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { StateProvider, store } from "./store";
import Navbar from "./Navbar";
import Event from "./Event";

import Query from "./Query";
import Events from "./Events";

import firebase from "firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import Breadcrumbs from "./breadcrumbs";
import Report from "./Report";
import "./App.css";

function App() {
  return (
    <StateProvider>
      <Router>
        <Navbar />

        <section>
          <div className="container">
            <Switch>
              <Route path="/event/:eventId/report" component={ReportView} />
              <Route path="/event/:eventId" component={EventView} />
              <Route path="/group/:groupId/event/new" component={NewEvent} />
              <Route path="/group/:groupId" component={GroupView} />
              <Route path="/signin" component={SignIn} />
              <Route path="/" component={StartView} />
            </Switch>
          </div>
        </section>
      </Router>
    </StateProvider>
  );
}

function StartView() {
  const {
    state: { user },
  } = useContext(store);

  return user ? (
    <Query
      path={`/users/${user.uid}/groups`}
      join={(groupId) => `/groups/${groupId}`}
    >
      {(groups) => {
        const groupIds = Object.keys(groups);

        return groupIds.length > 0 ? (
          <GroupsView groups={groups} />
        ) : (
          "Du är inte medlem i någon grupp ännu. Kontakta någon som kan hjälpa dig med det!"
        );
      }}
    </Query>
  ) : (
    <section className="content">
      <p>Logga in för att hantera närvaro.</p>
      <p>Första gången du loggar in behöver du registrera din användare.</p>
      <p>
        <Link className="button is-success" to="/signin">
          <strong>Logga In</strong>
        </Link>
      </p>
    </section>
  );
}

function GroupsView({ groups }) {
  return (
    <>
      <div className="heading">
        <Breadcrumbs crumbs={[]}>o-Lapp</Breadcrumbs>
      </div>
      <div className="content">
        <div className="box-group">
          {Object.keys(groups).map((groupId) => (
            <div key={groupId} className="box">
              <Link to={`/group/${groupId}`}>
                <article>
                  <h2 className="title">{groups[groupId].name}</h2>
                </article>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function GroupView({
  match: {
    params: { groupId },
  },
}) {
  return (
    <Query path={`/groups/${groupId}`}>
      {(group) => (
        <>
          <div className="heading">
            <div className="is-pulled-right">
              <Link
                to={`/group/${groupId}/event/new`}
                className="button is-primary"
              >
                + Nytt tillfälle
              </Link>
            </div>
            <Breadcrumbs crumbs={[[`/group/${groupId}`, group.name]]}>
              {group.name}
            </Breadcrumbs>
          </div>
          <section className="content">
            <Events group={group} groupId={groupId} />
          </section>
        </>
      )}
    </Query>
  );
}

function EventView({
  match: {
    params: { eventId },
  },
}) {
  return <Event eventId={eventId} />;
}

function ReportView({
  match: {
    params: { eventId },
  },
}) {
  return <Report eventId={eventId} />;
}

function SignIn() {
  const uiConfig = {
    signInFlow: "popup",
    signInSuccessUrl: "/",
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  };

  return (
    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
  );
}

function NewEvent({
  match: {
    params: { groupId },
  },
}) {
  const {
    state: { database },
  } = useContext(store);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [redirect, setRedirect] = useState();

  return redirect ? (
    <Redirect to={redirect} />
  ) : (
    <Query path={`/groups/${groupId}`}>
      {(group) => (
        <>
          <Breadcrumbs
            crumbs={[
              [`/group/${groupId}`, group.name],
              [`/group/${groupId}/event/new`, "Nytt tillfälle"],
            ]}
          />
          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="label">Namn</label>
              <input
                className="input"
                type="text"
                placeholder="Tillfällets namn"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Datum</label>
              <input
                className="input"
                type="date"
                placeholder="Datum"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="field is-grouped">
              <div className="control">
                <button
                  type="submit"
                  className="button is-link"
                  disabled={!eventName || !eventDate}
                >
                  Spara
                </button>
              </div>
              <div className="control">
                <Link
                  to={`/group/${groupId}`}
                  className="button is-link is-light"
                >
                  Avbryt
                </Link>
              </div>
            </div>
          </form>
        </>
      )}
    </Query>
  );

  function onSubmit(event) {
    event.preventDefault();

    const eventsRef = database.ref(`/events`);
    const eventRef = eventsRef.push();
    const createEvent = eventRef.set({
      name: eventName,
      date: eventDate,
      groupId,
    });
    const groupEventRef = database.ref(
      `/groups/${groupId}/events/${eventRef.key}`
    );
    const setGroupEvent = groupEventRef.set(true);

    Promise.all([createEvent, setGroupEvent]).then(() =>
      setRedirect(`/group/${groupId}/event/${eventRef.key}`)
    );
  }
}

export default App;
