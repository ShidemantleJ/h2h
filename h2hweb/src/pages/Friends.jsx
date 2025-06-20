import { useState, useEffect, useContext, useRef, useCallback } from "react";
import UserCard from "../components/UserCard";
import axios from "axios";
import supabase from "../supabase";
import { UserContext } from "../user/UserContext";
import LoggedInMessage from "../components/LoggedInMessage";
import debounce from "lodash.debounce";

const fetchPublicUserInfo = async (searchTerm, setUserResult, userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`wcaid.ilike.%${searchTerm}%, name.ilike.%${searchTerm}%`)
    .limit(5);
  if (error) console.error(error);
  else setUserResult(data.filter((user) => user.id !== userId) || []);
};

const Friends = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userResult, setUserResult] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const { user } = useContext(UserContext);
  const dropdownRef = useRef(null);

  const debouncedFetch = useCallback(
    debounce((searchTerm, setUserResult, userId) => {
      fetchPublicUserInfo(searchTerm, setUserResult, userId);
    }, 400),
    []
  );

  useEffect(() => {
    if (!user) return;

    searchTerm === ""
      ? setUserResult([])
      : debouncedFetch(searchTerm, setUserResult, user.dbInfo.id);

    const handleOutsideDropdownClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(false);
    };

    document.addEventListener("mousedown", handleOutsideDropdownClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideDropdownClick);
    };
  }, [searchTerm, user, debouncedFetch]);

  if (!user || !user?.friendInfo) return <LoggedInMessage />;

  return (
    <div className="text-white h-full min-h-dvh p-8 font-sans w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search */}
        <div className="bg-zinc-800 rounded-2xl p-6 shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">
            Search for New Friends
          </h1>
          <div className="relative" ref={dropdownRef}>
            <input
              onChange={(e) => {
                setSearchTerm(e.target.value || "");
                setOpenDropdown(true);
              }}
              id="friendSearch"
              className={`w-full p-4 rounded-xl ${
                openDropdown && userResult.length > 0 && "rounded-b-none "
              } bg-zinc-700 focus:outline-none`}
              placeholder="Enter a WCA ID or Name"
              onFocus={() => setOpenDropdown(true)}
            />
            {openDropdown && userResult.length > 0 && (
              <div className="absolute top-full w-full z-20 bg-zinc-700 border border-zinc-700 rounded-b-xl max-h-60 overflow-y-auto shadow-xl p-2 space-y-2">
                {userResult.map((searchUser, i) => (
                  <UserCard
                    hover={false}
                    friendInfo={user.friendInfo}
                    variant="FriendReq"
                    key={"friend_search_" + searchUser.id}
                    userId={searchUser.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Requests */}
        <div className="space-y-8 max-h-fit">
          <div className="bg-zinc-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Incoming Friend Requests
            </h2>
            <div className="overflow-x-auto whitespace-nowrap flex gap-4">
              {user?.friendInfo?.incomingReqs.map((userId, i) => (
                <UserCard
                  variant="IncomingReq"
                  layout="vertical"
                  key={"incoming_req_" + userId}
                  userId={userId}
                />
              ))}
              {user?.friendInfo?.incomingReqs.length === 0 && (
                <p className="text-zinc-400">No incoming requests.</p>
              )}
            </div>
          </div>
          <div className="bg-zinc-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Outgoing Friend Requests
            </h2>
            <div className="overflow-x-auto whitespace-nowrap flex gap-4">
              {user?.friendInfo?.outgoingReqs.map((userId, i) => (
                <>
                  <UserCard
                    variant="OutgoingReq"
                    layout="vertical"
                    key={"outgoing_req_" + userId}
                    userId={userId}
                  />
                </>
              ))}
              {user?.friendInfo?.outgoingReqs.length === 0 && (
                <p className="text-zinc-400">No outgoing requests.</p>
              )}
            </div>
          </div>
        </div>
        {/* Friends List */}
        <div className="bg-zinc-800 rounded-2xl p-6 lg:col-span-2 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Your Friends</h2>
          <div className="flex gap-4 whitespace-nowrap overflow-x-auto">
            {user?.friendInfo?.friends.map((userId, i) => (
              <UserCard
                variant="FriendReq"
                layout="vertical"
                key={"friend_" + userId}
                userId={userId}
                friendInfo={user.friendInfo}
              />
            ))}
            {user?.friendInfo?.friends.length === 0 && (
              <p className="col-span-full text-zinc-400">
                You have no friends yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
