import React from "react";
import Query from "./Query";
import { Link } from "react-router-dom";
import { formatRelative, parseISO } from "date-fns";
import { sv } from "date-fns/locale";

export default function Events({ group, groupId }) {
  return (
    <Query
      path={`/groups/${groupId}/events`}
      join={(eventId) => `/events/${eventId}`}
    >
      {(events) => {
        const sortedEvents = Object.keys(events)
          .map((id) => ({
            ...events[id],
            id,
          }))
          .sort((a, b) => cmp(b.date, a.date));

        return sortedEvents.map((event) => (
          <div key={event.id} className="box">
            <article>
              <Link to={`/event/${event.id}`}>
                <h2 className="title">{event.name}</h2>
              </Link>
              <span className="meta">
                {formatRelative(parseISO(event.date), new Date(), {
                  locale: sv,
                })}
              </span>
            </article>
          </div>
        ));
      }}
    </Query>
  );
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
