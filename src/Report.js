import React, {
  useMemo,
  useCallback,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import Query from "./Query";
import Breadcrumbs from "./breadcrumbs";
import { reduceAttendanceEvents, dispatchEvent } from "./attendance-state";
import { store } from "./store";
import Button from "./ui/Button";

export default function Report({ eventId }) {
  return (
    <Query path={`events/${eventId}`}>
      {(event, eventId) =>
        event && (
          <Query path={`groups/${event.groupId}`}>
            {(group) =>
              group && (
                <>
                  <div className="heading">
                    <Breadcrumbs
                      crumbs={[
                        [`/group/${event.groupId}`, group.name],
                        [
                          `/group/${event.groupId}/event/${eventId}`,
                          event.name,
                        ],
                        [
                          `/group/${event.groupId}/event/${eventId}/report`,
                          "Rapport",
                        ],
                      ]}
                    />
                  </div>
                  <Query
                    path={`groups/${event.groupId}/members`}
                    join={(memberKey) => `members/${memberKey}`}
                  >
                    {(members) => (
                      <Query
                        path={`attendance/${eventId}`}
                        acceptEmpty={true}
                        debounceMs={0}
                      >
                        {(attendance) => (
                          <section className="content">
                            {" "}
                            <ReportBody
                              eventId={eventId}
                              event={event}
                              group={group}
                              attendance={attendance || {}}
                              members={members || {}}
                            />
                          </section>
                        )}
                      </Query>
                    )}
                  </Query>
                </>
              )
            }
          </Query>
        )
      }
    </Query>
  );
}

function ReportBody({ group, eventId, event, members, attendance }) {
  const {
    state: { database, user },
  } = useContext(store);
  const [mailBody, setMailBody] = useState();
  const containerRef = useRef();
  useEffect(() => {
    // I can't see any good reason innerText should *ever*
    // contain HTML tags, but after iOS upgrade around june 2021,
    // some clients started generating mails with "<BR>" as line
    // breaks. Try to work around this.
    const body = containerRef.current.innerText
      .replace(/<br>/gi, "\n")
      .replace(/\n/g, "\r\n");
    if (body !== mailBody) {
      setMailBody(body);
    }
  });
  const memberKeys = Object.keys(members);
  const state = reduceAttendanceEvents(memberKeys, attendance);
  const sortedMembers = useMemo(() => {
    const byName = (a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
    return Object.keys(members)
      .filter((key) => state[key].attending)
      .map((key) => ({ ...members[key], key }))
      .sort(byName);
  }, [members, state]);
  const nAttending = Object.values(state).reduce(
    (na, m) => na + (m.attending ? 1 : 0),
    0
  );

  return (
    <div className="bg-white rounded-md p-4 shadow">
      {!state.open ? (
        <Button>Återöppna</Button>
      ) : mailBody ? (
        <a
          onClick={closeEvent}
          href={`mailto:robert.jerkstrand@toleredutby.se?subject=${encodeURIComponent(
            "Närvarorapport " + event.name
          )}&body=${encodeURIComponent(mailBody)}`}
          className="is-pulled-right button bg-blue-700 text-white"
        >
          Maila rapport
        </a>
      ) : null}
      <div className="mt-4" ref={containerRef}>
        <h1 className="is-size-4">{event.name}</h1>
        <p>
          {group.name} {event.date}, {nAttending} närvarande.
        </p>
        <ul>
          {sortedMembers.map((m) => (
            <li key={m.key}>{m.name}</li>
          ))}
        </ul>

        <p className="mt-4">
          Med vänlig hälsning,
          <br />
          {user.displayName}
        </p>

        <p>
          Rapporten skapades automatiskt med{" "}
          <a href="https://narvaro.toleredsaik.se/">o-lapp</a>.
        </p>
      </div>
    </div>
  );

  function closeEvent() {
    dispatchEvent(database, user, eventId, {
      type: "CLOSE_EVENT",
      createdAt: +new Date(),
      createdBy: user.uid,
      createdByName: user.displayName,
    });

    const eventClosedRef = database.ref(`events/${eventId}/closed`);
    eventClosedRef.set(true);
  }
}
