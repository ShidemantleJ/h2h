import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { getUserInfo } from "../utils/dbutils";
import EventSelector from "../components/EventSelector";
import { getStatsLast10Matches, getLastXMatches } from "../utils/userStats";
import MatchCard from "../components/MatchCard";

const UserView = () => {
  const { userId } = useParams();
  const { user: loggedInUser } = useContext(UserContext);
  const [user, setUser] = useState({});
  const [recentMatches, setRecentMatches] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("333");
  const [eventStats, setEventStats] = useState({});

  useEffect(() => {
    async function getInfo(userId) {
      const uInfo = await getUserInfo(userId);
      setUser(uInfo);
    }
    getInfo(userId);
  }, [userId]);

  useEffect(() => {
    async function getAverage(userId, selectedEvent) {
      const { mean, stddev, record } = await getStatsLast10Matches(
        selectedEvent,
        userId
      );
      const recentMatches = await getLastXMatches("all", userId, 1, 10);
      setRecentMatches(recentMatches);
      setEventStats((prev) => ({
        ...prev,
        average: mean,
        stddev: stddev,
        record: record,
      }));
    }
    getAverage(userId, selectedEvent);
  }, [userId, selectedEvent]);

  if (!user || !user.created_at) {
    return (
      <div className="bg-zinc-900 flex items-center justify-center w-full min-h-dvh text-white text-lg">
        User not found
      </div>
    );
  }

  return (
    <div className="w-full min-h-dvh text-white p-8 flex flex-col items-center">
      {/* Profile Card */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-8 bg-zinc-800/80 rounded-3xl shadow-xl p-8 mb-8 border border-zinc-700">
        <img
          src={user.profile_pic_url}
          className="h-28 w-28 rounded-full border-4 border-emerald-700 shadow-lg object-cover"
          alt="Profile"
        />
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold text-emerald-400 mb-1">
            {user.name}
          </h1>
          <a
            className="text-emerald-200 text-lg cursor-pointer hover:underline"
            href={`https://worldcubeassociation.org/persons/${user.wcaid}`}
          >
            {user.wcaid}
          </a>
          <p className="text-zinc-300 text-md mt-2">
            Joined on{" "}
            <span className="font-semibold">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </p>
        </div>
      </div>

      {/* Stats and Matches */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Statistics Card */}
        <div className="bg-zinc-800/80 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-zinc-700">
          <h1 className="font-semibold text-emerald-300 text-2xl mb-2">
            Statistics (Last 10 Matches)
          </h1>
          <EventSelector
            setSelectedEvent={setSelectedEvent}
            selectedEvent={selectedEvent}
            bgcolor="bg-zinc-900"
          />
          <div className="mt-4 w-full space-y-2">
            <div className="flex justify-between text-lg">
              <span className="text-zinc-300">Average:</span>
              <span className="font-mono">{eventStats.average}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-zinc-300">Std Dev:</span>
              <span className="font-mono">{eventStats.stddev}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-zinc-300">Record (W-L):</span>
              <span className="font-mono">{eventStats.record}</span>
            </div>
          </div>
        </div>

        {/* Recent Matches Card */}
        <div className="bg-zinc-800/80 rounded-2xl shadow-lg p-6 flex flex-col border border-zinc-700 max-h-[60vh]">
          <div className="mb-2">
            <h1 className="font-semibold text-emerald-300 text-2xl text-center">
              Recent Matches
            </h1>
            <h2 className="text-zinc-400 text-sm text-center">
              Click a match to view results
            </h2>
          </div>
          <div className="z-10 flex-1 overflow-y-auto space-y-2 mt-2">
            {recentMatches.length === 0 && (
              <div className="text-zinc-400 text-center mt-8">
                No recent matches found.
              </div>
            )}
            {recentMatches.map((match) => (
              <MatchCard inviteData={match} variant="normal" key={match.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;
