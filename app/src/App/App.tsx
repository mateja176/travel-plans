import React from 'react';
import './App.css';
import Provider from './Provider/Provider';
import Routes from './Routes';

function App() {
  return (
    <Provider>
      <Routes></Routes>
    </Provider>
  );
}

export default App;
