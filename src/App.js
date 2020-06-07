import React from 'react';
import './App.css';
import { StateProvider } from './store';
import Event from './Event';

function App() {
  return (
    <StateProvider>
      <div className="App">
        <Event groupId="IpVEumfgNDNiKI4Ln2Qo" eventId="T0HXko7ZyGYs0GVxvE8u" />
      </div>
    </StateProvider>
  );
}

export default App;
