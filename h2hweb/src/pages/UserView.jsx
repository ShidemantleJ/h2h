import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { getUserInfo } from "../utils/dbutils";
import EventSelector from "../components/EventSelector";
import { getAvgLast5Matches, getLastXMatches } from "../utils/userStats";
import MatchCard from "../components/MatchCard";

const UserView = () => {
  const { userId } = useParams();
  const { user: loggedInUser } = useContext(UserContext);
  const [user, setUser] = useState({});
  const [recentMatches, setRecentMatches] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("333");
  const [average, setAverage] = useState(0);

  useEffect(() => {
    async function getInfo(userId) {
      const uInfo = await getUserInfo(userId);
      setUser(uInfo);
    }
    getInfo(userId);
  }, [userId]);

  useEffect(() => {
    async function getAverage(userId, selectedEvent) {
      const avg = await getAvgLast5Matches(selectedEvent, userId);
      const recentMatches = await getLastXMatches("all", userId, 1, 5);
      setRecentMatches(recentMatches);
      setAverage(avg);
    }
    getAverage(userId, selectedEvent);
  }, [userId, selectedEvent]);

  if (!user) {
    console.log("No user info");
    return (
      <div className="bg-zinc-900 flex items-center justify-center w-full text-white text-lg">
        User not found
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 w-full text-white p-12 grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-full">
      {/* User name, picture, date joined */}
      <div className="flex lg:col-span-2 gap-10 items-center mx-auto">
        <img src={user.profile_pic_url} className="h-20 w-20" />
        <div>
          <h1 className="text-zinc-50 text-lg font-semibold whitespace-normal">{user.name}</h1>
          <p
            className="text-zinc-200 text-sm"
            onClick={() =>
              (window.location.href = `https://worldcubeassociation.org/persons/${user.wcaid}`)
            }
          >
            {user.wcaid}
          </p>
          <p className="text-zinc-200 text-sm">
            Joined on {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <hr className="text-zinc-500 lg:col-span-2" />
      {/* Statistics */}
      <div className="">
        <h1 className="font-semibold text-zinc-300 text-lg text-center">
          Statistics (Last 10 matches)
        </h1>
        <div className="flex flex-col lg:flex-row">
          <EventSelector
            setSelectedEvent={setSelectedEvent}
            selectedEvent={selectedEvent}
            bgcolor="bg-zinc-800"
          />
          <p>Average: {average}</p>
        </div>
      </div>
      {/* Recent matches */}
      <div className="space-y-1">
        <h1 className="font-semibold text-zinc-300 text-lg text-center">
          Recent Matches
        </h1>
        <div className="bg-zinc-800 space-y-2 max-h-[60vh] p-5 rounded-2xl overflow-y-auto">
          {recentMatches.map((match) => {
            return (
              match.status !== "ongoing" && <MatchCard inviteData={match} variant="normal" key={match.id} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserView;
