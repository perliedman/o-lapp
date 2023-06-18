import React, { useContext, useMemo, useState } from "react";
import Query from "./Query";
import { store } from "./store";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { reduceAttendanceEvents, dispatchEvent } from "./attendance-state";
import formatRelative from "date-fns/formatRelative";
import { sv } from "date-fns/locale";
import "./Attendance.css";
import Button from "./ui/Button";

const memberJoin = (memberKey) => `members/${memberKey}`

export default function Attendance({ groupId, eventId }) {
  const {
    state: { database, user, sort },
    dispatch,
  } = useContext(store);
  const [selectedMember, setSelectedMember] = useState();

  return (
    <Query
      path={`groups/${groupId}/members`}
      join={memberJoin}
    >
      {(members) => (
        <Query path={`attendance/${eventId}`} acceptEmpty={true}>
          {(attendance) => (
            <div>
              <AttendanceTable
                attendance={attendance || {}}
                members={members || {}}
                reportUrl={`/event/${eventId}/report`}
                dispatch={createDispatch(attendance)}
                reopenEvent={() => setEventClosed(attendance, false)}
                onMemberSelected={(member) => setSelectedMember(member)}
                sort={sort}
                setSort={(sort) => dispatch({ type: "SET_SORT", sort })}
              />
              {selectedMember && (
                <MemberInfoModal
                  member={selectedMember}
                  onClose={() => setSelectedMember(null)}
                />
              )}
              <div className="log">
                <section className="content">
                  <Log attendance={attendance || {}} members={members || {}} />
                </section>
              </div>
            </div>
          )}
        </Query>
      )}
    </Query>
  );

  function createDispatch(events) {
    return function (eventType, memberKey) {
      const now = +new Date();

      if (memberKey) {
        // If another user created an event for the same user
        // within the timeout period, it's likely a conflict,
        // don't create this event.
        const lastMemberEventWithinTimeout = sortEvents(events)
          .reverse()
          .find(
            (e) =>
              e.memberKey === memberKey &&
              e.createdBy !== user.uid &&
              now - e.createdAt < 5000
          );
        if (lastMemberEventWithinTimeout) return false;
        dispatchEvent(database, user, eventId, { type: eventType, memberKey });
        return true;
      } else {
        dispatchEvent(database, user, eventId, { type: eventType });
        return true;
      }
    };
  }

  function setEventClosed(events, isClosed) {
    const dispatch = createDispatch(events);
    if (dispatch(isClosed ? "CLOSE_EVENT" : "REOPEN_EVENT")) {
      const eventClosedRef = database.ref(`/events/${eventId}/closed`);
      eventClosedRef.set(isClosed);
    }
  }
}

const sortOptions = [
  ["Närvaro", "attendance"],
  ["Kvar i skogen", "not_returned"],
]

function AttendanceTable({
  attendance,
  members,
  reportUrl,
  dispatch,
  reopenEvent,
  onMemberSelected,
  sort: mode,
  setSort: setMode,
}) {
  const memberKeys = Object.keys(members);
  const state = reduceAttendanceEvents(memberKeys, attendance);
  const sortedMembers = useMemo(() => {
    const byName = (a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0);
    const byReturned = (a, b) => {
      const aState = state[a.key];
      const bState = state[b.key];

      if (aState.attending && bState.attending) {
        return !aState.returned && bState.returned
          ? -1
          : !bState.returned && aState.returned
          ? 1
          : byName(a, b);
      } else if (aState.attending) {
        return -1;
      } else if (bState.attending) {
        return 1;
      } else {
        return byName(a, b);
      }
    };
    return Object.keys(members)
      .map((key) => ({ ...members[key], key }))
      .sort(mode === "attendance" ? byName : byReturned);
  }, [members, mode, state]);

  const [nAttending, nNotReturned] = Object.values(state).reduce(
    ([na, nnr], m) => [
      na + (m.attending ? 1 : 0),
      nnr + (m.attending && !m.returned ? 1 : 0),
    ],
    [0, 0]
  );

  return (
    <>
      <div className="is-pulled-right">
        {!state.open ? (
          <button onClick={reopenEvent} className="button is-primary">
            Återöppna
          </button>
        ) : nNotReturned === 0 ? (
          <Link to={reportUrl} className="button is-primary">
            Avrapportera
          </Link>
        ) : null}
      </div>
      <div className="button-group mb-2">
        {sortOptions.map(([label, m]) => (
          <Button
            key={m}
            onClick={(e) => {
              setMode(m);
            }}
            className={m === mode ? "active" : ""}
          >
            {label}
          </Button>
        ))}
      </div>
      <p>
        {nAttending} närvarande, {nNotReturned} kvar i skogen
      </p>
      <table className="attendance-table">
        <thead>
          <tr>
            <th>Namn</th>
            <th>Närvarande</th>
            <th>Tillbaka</th>
          </tr>
        </thead>
        <tbody>
          {sortedMembers.map((m, i) => (
            <AttendanceRow
              key={m.key}
              member={m}
              memberKey={m.key}
              state={state[m.key]}
              mode={mode}
              disabled={!state.open}
              dispatch={dispatch}
              onNameClicked={() => onMemberSelected && onMemberSelected(m)}
            />
          ))}
        </tbody>
      </table>
      <div className="bottom-filler" />
    </>
  );
}

function AttendanceRow({
  member,
  memberKey,
  state,
  mode,
  disabled,
  dispatch,
  onNameClicked,
}) {
  return (
    <tr
      style={
        mode === "not_returned" && (!state.attending || state.returned)
          ? { opacity: 0.4 }
          : {}
      }
    >
      <td onClick={onNameClicked}>{member.name}</td>
      <td className="text-center">
        <input
          type="checkbox"
          checked={state.attending}
          disabled={disabled}
          onChange={(e) =>
            dispatch(
              e.target.checked ? "ADD_ATTENDANCE" : "REMOVE_ATTENDANCE",
              memberKey
            )
          }
        />
      </td>
      <td className="text-center">
        <input
          type="checkbox"
          checked={state.attending && state.returned}
          disabled={disabled || !state.attending}
          onChange={(e) =>
            dispatch(
              e.target.checked ? "NOTE_RETURNED" : "UNDO_RETURNED",
              memberKey
            )
          }
        />
      </td>
    </tr>
  );
}

function MemberInfoModal({ member, onClose }) {
  const guardians = Object.values(member.guardians || {});

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content">
        <div className="box">
          {[member, ...guardians].map((p) => (
            <>
              <h2>{p.name}</h2>
              <p>
                <FontAwesomeIcon icon={faPhone} />
                &nbsp;<a href={`tel:${p.phone}`}>{p.phone || "-"}</a>
              </p>
              <p>
                <FontAwesomeIcon icon={faEnvelope} />
                &nbsp;<a href={`mailto:${p.email}`}>{p.email || "-"}</a>
              </p>
            </>
          ))}
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>
  );
}

function Log({ attendance, members }) {
  const events = useMemo(() => sortEvents(attendance), [attendance]);
  const now = new Date();

  return (
    <ul>
      {events
        .slice(events.length - 10)
        .reverse()
        .map((e) => {
          const description = eventDescription(e);
          return (
            description && (
              <li key={e.createdAt}>
                {description}
                <span className="meta">
                  &nbsp;({formatRelative(e.createdAt, now, { locale: sv })}
                  {e.createdByName && ` av ${e.createdByName}`})
                </span>
              </li>
            )
          );
        })}
    </ul>
  );

  function eventDescription(event) {
    const { type, memberKey } = event;
    switch (type) {
      case "ADD_ATTENDANCE":
        return `${memberName(event)} är närvarande`;
      case "REMOVE_ATTENDANCE":
        return `${memberName(event)} är ej närvarande`;
      case "NOTE_RETURNED":
        return `${memberName(event)} är tillbaka`;
      case "UNDO_RETURNED":
        return `${memberName(event)} är ute i skogen`;
      case "CLOSE_EVENT":
        return `Tillfället är avslutat`;
      case "REOPEN_EVENT":
        return `Tillfället öppnades igen`;
      default:
        return null;
    }

    function memberName(e) {
      return members[memberKey] && members[memberKey].name;
    }
  }
}

function sortEvents(events) {
  return Object.values(events || {}).sort((a, b) => a.createdAt - b.createdAt);
}
