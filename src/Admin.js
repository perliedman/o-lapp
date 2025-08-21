import { useContext } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "./breadcrumbs";
import Query from "./Query";
import { store } from "./store";

export function Admin() {
  return (
    <Query path={`/users`}>
      {(users) => (
        <div className="box-group">
          {Object.keys(users)
            .sort()
            .map((userId) => (
              <div key={userId} className="box">
                <article>
                  <Link to={`/admin/users/${userId}`}>
                    <h2>{userId}</h2>
                  </Link>
                </article>
              </div>
            ))}
        </div>
      )}
    </Query>
  );
}

export function AdminUser({
  match: {
    params: { userId },
  },
}) {
  const {
    state: { database },
  } = useContext(store);

  return (
    <>
      <div className="heading">
        <Breadcrumbs
          crumbs={[
            ["/admin", "Admin"],
            [`/admin/${userId}`, userId],
          ]}
        >
          o-Lapp
        </Breadcrumbs>
      </div>
      <div className="content">
        <Query path={`/users/${userId}`}>
          {(user) => (
            <Query path="/groups">
              {(groups) => (
                <div>
                  {Array.from(
                    new Set([
                      ...Object.keys(groups),
                      ...(user.groups ? Object.keys(user.groups) : []),
                    ])
                  ).map((groupId) => (
                    <div key={groupId}>
                      <input
                        type="checkbox"
                        checked={user.groups?.[groupId]}
                        onChange={(e) => setMember(groupId, e.target.checked)}
                        className="w-6 h-6"
                      />
                      &nbsp;{groups[groupId]?.name || groupId}
                    </div>
                  ))}
                </div>
              )}
            </Query>
          )}
        </Query>
      </div>
    </>
  );

  function setMember(groupId, isMember) {
    const ref = database.ref(`/users/${userId}/groups/${groupId}`);
    ref.set(isMember);
  }
}
