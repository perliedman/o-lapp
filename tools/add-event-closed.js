const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://olapp-6c8ab.firebaseio.com",
});

const database = admin.database();

const eventsRef = database.ref("/events");

eventsRef.once("value", (eventsSnapshot) => {
  const events = eventsSnapshot.val() || {};
  Object.keys(events).forEach((id) => {
    const event = events[id];
    event.closed = true;
    console.log(id, event);
    eventsRef.child(id).set(event, awaitCb());
  });
});

let waitCount = 0;
function awaitCb() {
  waitCount++;

  return (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (--waitCount <= 0) {
      process.exit(0);
    }
  };
}
