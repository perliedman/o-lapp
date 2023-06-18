import React, { useContext, useEffect, useState } from "react";
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
import Button from "./ui/Button";
import { ErrorBoundary } from "react-error-boundary";
import { parseISO } from "date-fns";
import { Admin, AdminUser } from "./Admin";
import Spinner from "./ui/Spinner";

function App() {
  return (
    <StateProvider>
      <Router>
        <Navbar />

        <section>
          <div className="container">
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Switch>
                <Route path="/admin/users/:userId" component={AdminUser} />
                <Route path="/admin" component={Admin} />
                <Route path="/event/:eventId/report" component={ReportView} />
                <Route path="/event/:eventId" component={EventView} />
                <Route path="/group/:groupId/event/new" component={NewEvent} />
                <Route path="/group/:groupId" component={GroupView} />
                <Route path="/signin" component={SignIn} />
                <Route path="/" component={StartView} />
              </Switch>
            </ErrorBoundary>
          </div>
        </section>
      </Router>
    </StateProvider>
  );
}

const groupJoin = (groupId) => `/groups/${groupId}`

function StartView() {
  const {
    state: { user },
  } = useContext(store);
  const [wait, setWait] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setWait(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return user ? (
    <Query
      path={`/users/${user.uid}/groups`}
      join={groupJoin}
      empty={<section className="content">
      Du är inte medlem i någon grupp ännu. Kontakta någon som kan hjälpa
      dig med det!
    </section>}
    >
      {(groups) => {
        return <GroupsView groups={groups} />
      }}
    </Query>
  ) : wait ? <Spinner /> :(
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
          {Object.keys(groups).map(
            (groupId) =>
              groups[groupId] && (
                <div key={groupId} className="box">
                  {groups[groupId] ? (
                    <Link to={`/group/${groupId}`} disabled={groups[groupId]}>
                      <article>
                        <h2 className="title">{groups[groupId].name}</h2>
                      </article>
                    </Link>
                  ) : (
                    <article>
                      <h2 className="title text-gray-400">
                        Okänd grupp ({groupId})
                      </h2>
                    </article>
                  )}
                </div>
              )
          )}
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
  const [error, setError] = useState();

  return redirect ? (
    <Redirect to={redirect} />
  ) : (
    <Query path={`/groups/${groupId}`}>
      {(group) => (
        <>
          <div className="heading">
            <Breadcrumbs
              crumbs={[
                [`/group/${groupId}`, group.name],
                [`/group/${groupId}/event/new`, "Nytt tillfälle"],
              ]}
            />
          </div>
          <form onSubmit={onSubmit}>
            {error && <div className="field">{error}</div>}
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
            <div className="actions mr-4">
              <Button
                className="bg-sky-900 text-white mr-2"
                disabled={!eventName || !eventDate}
              >
                Spara
              </Button>
              <Link to={`/group/${groupId}`} className="button">
                Avbryt
              </Link>
            </div>
          </form>
        </>
      )}
    </Query>
  );

  function onSubmit(event) {
    event.preventDefault();

    let parsedDate;
    try {
      parsedDate = parseISO(eventDate);
    } catch {}

    if (eventName && parsedDate) {
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
    } else {
      setError("Ange både ett namn och ett datum.");
    }
  }
}

function ErrorFallback({ error }) {
  return (
    <section className="content">
      <h1 className="text-xl font-bold">Åh nej 😢</h1>
      <p>Tyvärr har något gått snett.</p>
      <p>
        Försök att ladda om sidan och pröva igen. Om felet håller i sig,
        kontakta{" "}
        <a href="mailto:per@liedman.net" className="text-sky-900">
          Per Liedman
        </a>
        .
      </p>
    </section>
  );
}

export default App;
