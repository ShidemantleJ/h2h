import React, {useEffect, useState, useContext} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import UserView from './pages/UserView';
import Sidebar from './components/Sidebar';
import Friends from './pages/Friends';
import Play from './pages/Play';
import supabase from './supabase';

function App() {
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/loggedInInfo`, { withCredentials: true });
        setUser(res.data);
  
        const onlineUsersChannel = supabase.channel('onlineUsers');
  
        onlineUsersChannel
          .on('presence', { event: 'sync' }, () => {
            // console.log('Synced presence state: ', onlineUsersChannel.presenceState());
            const userIds = [];
            for (const currId in onlineUsersChannel.presenceState()) {
              userIds.push(res.data.dbInfo.id);
            }
            const userIdsSet = new Set(userIds);
            setOnlineUsers(Array.from(userIdsSet));
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await onlineUsersChannel.track({
                online_at: new Date().toISOString(),
                user: res.data,
              });
            }
          });
  
        return () => {
          onlineUsersChannel.unsubscribe();
        };
  
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchAndSubscribe();
  }, []);

  return (
    <Router>
      <div className="flex">
      <Sidebar user={user}/>
        {/* Main Page Content */}
        <Routes>
          <Route path="/" element={<Home onlineUsers={onlineUsers}/>}/>
          <Route path="/users/:userId" element={<UserView/>}/>
          <Route path="/friends" element={<Friends user={user}/>}/>
          <Route path="/play" element={<Play user={user}/>}/>
        </Routes>
      </div>
    </Router>
  )
}

export default App;

