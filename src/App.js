import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import { StateProvider } from './store';
import Navbar from './Navbar'
import Event from './Event';

import 'bulma/css/bulma.css';

function App() {
  return (
    <StateProvider>
      <Router>
        <Navbar />

        <section className="section">
          <div className="container">
            <Switch>
              <Route path="/event/:eventId" component={EventView} />
            </Switch>
          </div>
        </section>
      </Router>
    </StateProvider>
  );
}

function EventView({ match: { params: { eventId } } }) {
  return <Event eventId={eventId} />
}

export default App;
