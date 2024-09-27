const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://olapp-6c8ab.firebaseio.com",
});

const database = admin.database();

const eventsRef = database.ref("/events");
const membersRef = database.ref("/members");
const attendanceRef = database.ref("/attendance");

const result = {};
let ignored = 0;

eventsRef.once("value", (eventsSnapshot) => {
  const events = eventsSnapshot.val();
  membersRef.once("value", (membersSnapshot) => {
    const members = membersSnapshot.val();
    attendanceRef.once("value", (attendanceSnapshot) => {
      const attendanceEvents = attendanceSnapshot.val();
      for (const eventId in attendanceEvents) {
        for (const attendanceEventId in attendanceEvents[eventId]) {
          const attendanceEvent = attendanceEvents[eventId][attendanceEventId];
          if (attendanceEvent.type === "NOTE_RETURNED") {
            const { memberKey } = attendanceEvent;
            if (!result[memberKey]) {
              result[memberKey] = new Set();
            }
            result[memberKey].add(eventId);
          }
        }
      }

      for (const memberId in result) {
        if (members[memberId]) {
          console.log(members[memberId].name);
          console.log(
            [...result[memberId]]
              .filter((eventId) => events[eventId])
              .map(
                (eventId) => `\t${events[eventId].date} ${events[eventId].name}`
              )
              .join("\n")
          );
        } else {
          ignored++;
        }
      }

      console.log("Unknown members:", ignored);
      process.exit(0);
    });
  });
});
