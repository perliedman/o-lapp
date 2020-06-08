import React from 'react';
import 'bulma/css/bulma.css';
import { StateProvider } from './store';
import Event from './Event';

function App() {
  return (
    <StateProvider>
      <div className="container">
        <Event eventId="T0HXko7ZyGYs0GVxvE8u" />
      </div>
    </StateProvider>
  );
}

export default App;
