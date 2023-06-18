import React, { useContext, useState } from "react";
import Attendance from "./Attendance";
import Query from "./Query";
import Breadcrumbs from "./breadcrumbs";
import { store } from "./store";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

export default function Event({ eventId }) {
  return (
    <Query path={`events/${eventId}`}>
      {(event, eventId) =>
        event && (
          <Query path={`groups/${event.groupId}`}>
            {(group) =>
              group && (
                <>
                  <div className="heading">
                    <div class="flex flex-row justify-between items-center">
                      <Breadcrumbs
                        crumbs={[
                          [`/group/${event.groupId}`, group.name],
                          [
                            `/group/${event.groupId}/event/${eventId}`,
                            event.name,
                          ],
                        ]}
                      />
                      <GroupSwitcher eventDate={event.date} currentEventId={eventId} />
                    </div>
                  </div>
                  <section className="content">
                    <Attendance groupId={event.groupId} eventId={eventId} />
                  </section>
                </>
              )
            }
          </Query>
        )
      }
    </Query>
  );
}

const groupJoin = (groupId) => `/groups/${groupId}`;

function GroupSwitcher({ eventDate, currentEventId }) {
  const {
    state: { user },
  } = useContext(store);
  const [redirect, setRedirect] = useState();

  return redirect ? (
    <Redirect to={redirect} />
  ) : user ? (
    <Query path={`/users/${user.uid}/groups`} join={groupJoin} acceptEmpty>
      {(groups) => (
        <Query path={`events`}>
          {(events) => {
            const sameDayEventIds =
              events &&
              Object.keys(events).filter(
                (eventId) =>
                  events[eventId].date === eventDate &&
                  groups[events[eventId].groupId]
              );

            return groups ? (
              <div>
                {sameDayEventIds.length > 1 && (
                  <select
                    className="border border-blue-600 text-sm bg-white p-0 rounded"
                    value={currentEventId || ""}
                    onChange={(e) =>
                      setRedirect(
                        `/event/${
                          e.target.value
                        }`
                      )
                    }
                  >
                    {sameDayEventIds.map(
                      (eventId) =>
                        groups[events[eventId].groupId] && (
                          <option key={events[eventId].groupId} value={eventId}>
                            {groups[events[eventId].groupId].name}
                          </option>
                        )
                    )}
                  </select>
                )}
              </div>
            ) : null;
          }}
        </Query>
      )}
    </Query>
  ) : null;
}
