import React from 'react';
import logo from './logo.svg';
import './App.css';
import { StateProvider } from './store';

function App() {
  return (
    <StateProvider>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </StateProvider>
  );
}

export default App;
