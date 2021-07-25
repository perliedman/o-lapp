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

        return (
          <div className="box-group">
            {sortedEvents.map((event) => (
              <div key={event.id} className="box">
                <article>
                  <Link to={`/event/${event.id}`}>
                    <h2
                      className={`title ${event.closed ? "text-sky-200" : ""}`}
                    >
                      {event.name}
                    </h2>
                  </Link>
                  <span className="meta flex">
                    <span className="mr-4">
                      {formatRelative(parseISO(event.date), new Date(), {
                        locale: sv,
                      })}
                    </span>
                    {event.closed ? (
                      <span className="mr-4">✓ Avrapporterat</span>
                    ) : null}
                  </span>
                </article>
              </div>
            ))}
          </div>
        );
      }}
    </Query>
  );
}

function cmp(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
