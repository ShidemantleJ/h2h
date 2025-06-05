import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { getUserInfo } from "../utils/dbutils";
import EventSelector from "../components/EventSelector";

const UserView = () => {
  const { userId } = useParams();
  const { user: loggedInUser } = useContext(UserContext);
  const [user, setUser] = useState({});
  const [selectedEvent, setSelectedEvent] = useState("333");

  useEffect(() => {
    async function getInfo(userId) {
      const uInfo = await getUserInfo(userId);
      setUser(uInfo);
    }
    getInfo(userId);
  }, [userId]);

  if (!user) {
    console.log("No user info");
    return (
      <div className="bg-zinc-900 flex items-center justify-center w-full text-white text-lg">
        User not found
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 w-full text-white p-12 flex flex-col gap-3">
      {/* User name, picture, date joined */}
      <div className="flex gap-10 items-center mx-auto">
        <img src={user.profile_pic_url} className="h-20 w-20" />
        <div className="">
          <h1 className="text-zinc-50 text-lg font-semibold">{user.name}</h1>
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
      <hr className="text-zinc-500" />
      <div className="flex flex-col lg:flex-row">
        {/* Statistics */}
        <div className="w-full">
          <h1 className="font-semibold text-zinc-300 text-lg text-center">
            Statistics
          </h1>
          <div className="flex flex-col lg:flex-row">
            <EventSelector
              setSelectedEvent={setSelectedEvent}
              selectedEvent={selectedEvent}
              bgcolor="bg-zinc-800"
            />
          </div>
        </div>
        {/* Recent matches */}
        <div className="w-full">
          <h1 className="font-semibold text-zinc-300 text-lg text-center">
            Recent Matches
          </h1>
        </div>
      </div>
    </div>
  );
};

export default UserView;
