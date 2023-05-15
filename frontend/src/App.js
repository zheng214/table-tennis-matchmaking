import './App.css';
import React, { useState, useEffect } from 'react';

import { Route } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import ChatPage from './Pages/ChatPage';
import SearchPage from './Pages/SearchPage';
import { ChatState } from './Context/ChatProvider';

function App() {
  const { user } = ChatState();
  return (
    <div className="App">
      <Route path='/login' render={(props) => <Homepage {...props} authed={true} />} />
      <Route path='/' render={(props) => user ? <SearchPage {...props} authed={true} />: <></>} exact />
      <Route path='/chat' render={(props) => user ? <ChatPage {...props} authed={true} />: <></>} exact />
    </div>
  );
}

export default App;
