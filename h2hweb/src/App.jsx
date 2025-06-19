import React, { useEffect, useState, useContext, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import axios from "axios";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const UserView = lazy(() => import("./pages/UserView"));
const Friends = lazy(() => import("./pages/Friends"));
const Play = lazy(() => import("./pages/Play"));
const Match = lazy(() => import("./pages/Match"));

import Sidebar from "./components/Sidebar";
import { UserContext } from "./user/UserContext";
import { OnlineUsersContext } from "./user/OnlineUsersContext";
import { subscribeToFriendChanges, getFriendInfo } from "./user/friendinfo";
import {
  subscribeToMatchInviteChanges,
  getMatchInviteInfo,
} from "./user/matchInviteInfo";
import { ToastContainer } from "react-toastify";
import { subscribeToOnlineUsers } from "./user/onlineUsersChannel";

function App() {
  const [user, setUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user info
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/loggedInInfo`,
          { withCredentials: true }
        );
        setUser((prevUser) => ({
          ...prevUser,
          dbInfo: res.data.dbInfo,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchAndSubscribe();
  }, []);

  // Initialize data and set up subscriptions
  useEffect(() => {
    if (user?.dbInfo?.id && !isInitialized) {
      const initializeData = async () => {
        await Promise.all([
          getFriendInfo(user, setUser),
          getMatchInviteInfo(user, setUser),
        ]);
        setIsInitialized(true);
      };

      initializeData();

      subscribeToFriendChanges(user, setUser);
      subscribeToMatchInviteChanges(user, setUser);
      subscribeToOnlineUsers(user.dbInfo.id, setOnlineUsers);
    }
  }, [user?.dbInfo?.id, isInitialized]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <OnlineUsersContext.Provider value={{ onlineUsers, setOnlineUsers }}>
        <Router>
          <div className="bg-zinc-900">
            <Sidebar />
            {/* Main Page Content */}
            <main className="lg:ml-20">
              <Suspense
                fallback={
                  <div className="bg-zinc-900 min-h-dvh w-full"/>
                }
              >
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/users/:userId" element={<UserView />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/play" element={<Play />} />
                  <Route path="/match/:matchId" element={<Match />} />
                </Routes>
              </Suspense>
            </main>
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
      </OnlineUsersContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
