import React from "react";
import Attendance from "./Attendance";
import Query from "./Query";
import Breadcrumbs from "./breadcrumbs";

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
                    <Breadcrumbs
                      crumbs={[
                        [`/group/${event.groupId}`, group.name],
                        [
                          `/group/${event.groupId}/event/${eventId}`,
                          event.name,
                        ],
                      ]}
                    />
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
