# o-lapp

Attendance reporting for orienteering.

The problem: when training orienteering, you want to both check who attended the training, but also make sure they returned after the training. o-lapp solves this.

This simple web-app has been "in production" at Tolereds AIK for about two years.

o-lapp is currently a "one-off" project, and documentation is a bit scarce. Don't hesitate to contact me if you are interested in setting up and using o-lapp, I will do my best to help!

## Running

This app is built on [Firebase](https://firebase.google.com/), and in particular uses Firebase's [authentication](https://firebase.google.com/docs/auth) and [realtime database](https://firebase.google.com/docs/database). You need to set this up.

To get the app runnning, you need to create a file under `src/config.js` containing your Firebase credentials, something like this:

```js
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "my-olapp-123cd.firebaseapp.com",
  databaseURL: "https://my-olapp-123cd.firebaseapp.com",
  projectId: "my-olapp-123cd",
  storageBucket: "my-olapp-123cd.appspot.com",
  messagingSenderId: "12345678900",
  appId: "7:12345678900:web:bada55",
  measurementId: "X-Y32CCYN9AS",
};
```

To get a local version runnning, in the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

The project can easily be deployed, also using Firebase:

### `yarn deploy`

## License

o-lapp is distributed under the AGPL license.

    o-lapp - Attendance reporting for orienteering.
    Copyright © 2022 Per Liedman

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
