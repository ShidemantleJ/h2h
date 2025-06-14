import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";
import Home from "./pages/Home";
import UserView from "./pages/UserView";
import Sidebar from "./components/Sidebar";
import Friends from "./pages/Friends";
import Play from "./pages/Play";
import Match from "./pages/Match";
import supabase from "./supabase";
import { UserContext } from "./user/UserContext";
import { User } from "lucide-react";
import { subscribeToFriendChanges, getFriendInfo } from "./user/friendinfo";
import {
  subscribeToMatchInviteChanges,
  getMatchInviteInfo,
} from "./user/matchInviteInfo";
import { ToastContainer } from "react-toastify";

function App() {
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/loggedInInfo`,
          { withCredentials: true }
        );
        setUser((prevUser) => ({
          ...prevUser,
          sessionInfo: res.data.sessionInfo,
          dbInfo: res.data.dbInfo,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndSubscribe();
  }, []);

  useEffect(() => {
    if (user?.dbInfo?.id) {
      getFriendInfo(user, setUser);
      getMatchInviteInfo(user, setUser);
      const friendUnsubscribe = subscribeToFriendChanges(user, setUser);
      const matchInviteUnsubscribe = subscribeToMatchInviteChanges(
        user,
        setUser
      );
      return () => {
        friendUnsubscribe();
        matchInviteUnsubscribe();
      };
    }
  }, [user?.dbInfo?.id]);
  // console.log(user);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="flex">
          <Sidebar />
          {/* Main Page Content */}
          <Routes>
            <Route path="/" element={<Home onlineUsers={onlineUsers} />} />
            <Route path="/users/:userId" element={<UserView />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/play" element={<Play />} />
            <Route path="/match/:matchId" element={<Match />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        theme="dark"
      />
    </UserContext.Provider>
  );
}

export default App;
