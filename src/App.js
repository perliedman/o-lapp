import React from 'react';
import './App.css';
import { StateProvider } from './store';
import Event from './Event';

function App() {
  return (
    <StateProvider>
      <div className="App">
        <Event eventId="T0HXko7ZyGYs0GVxvE8u" />
      </div>
    </StateProvider>
  );
}

export default App;
