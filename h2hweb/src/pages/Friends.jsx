import { useState, useEffect, useContext, useRef } from "react";
import UserCard from "../components/UserCard";
import axios from "axios";
import supabase from "../supabase";
import { UserContext } from "../user/UserContext";
import { NewspaperIcon } from "lucide-react";

const fetchPublicUserInfo = async (searchTerm, setUserResult, userId) => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userSearch`, {
        params: {
            term: searchTerm
        }
    }, { withCredentials: true })
    .then(res => {
        console.log(res.data);
        console.log(searchTerm);
        setUserResult(res.data.filter((user) => user.id !== userId) || []);
    })
}

const getFriendInfo = async (user, setFriendInfo) => {
    const {data: friendsData1, error: friendsError1} = await supabase
    .from("friends")
    .select("user1_id")
    .eq("user2_id", user.dbInfo.id);

    const {data: friendsData2, error: friendsError2} = await supabase
    .from("friends")
    .select("user2_id")
    .eq("user1_id", user.dbInfo.id);

    const friendsData = [...friendsData1.map((u) => u.user1_id), ...friendsData2.map((u) => u.user2_id)] || [];
    // console.log(friendsData);
    // console.error(friendsError1, friendsError2);

    const {data: incReqsData, error: incReqsError} = await supabase
    .from("friendreqs")
    .select("sender_user_id")
    .eq("recipient_user_id", user.dbInfo.id)
    .eq("status", "pending");
    // console.log(incReqsData.map((u) => u.sender_user_id));
    // console.error(incReqsError);

    const {data: outReqsData, error: outReqsError} = await supabase
    .from("friendreqs")
    .select("recipient_user_id")
    .eq("sender_user_id", user.dbInfo.id)
    .eq("status", "pending");
    // console.log(outReqsData.map((u) => u.recipient_user_id));
    // console.error(outReqsError);

    setFriendInfo({
        incomingReqs: incReqsData.map((u) => u.sender_user_id) || [],
        outgoingReqs: outReqsData.map((u) => u.recipient_user_id) || [],
        friends: friendsData || []
    });
}

const subscribeToFriendChanges = async (user, setFriendInfo) => {
    const channelA = supabase
    .channel('schema-db-changes')
    .on('postgres_changes',
        {
            event: "*",
            schema: "public",
            table: "friends",
        },
        (payload) => {
            getFriendInfo(user, setFriendInfo);
        }
    )
    .on('postgres_changes',
        {
            event: "*",
            schema: "public",
            table: "friendreqs",
        },
        (payload) => {
            getFriendInfo(user, setFriendInfo);
        }
    )
    .subscribe();
}

const Friends = (props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [userResult, setUserResult] = useState([]);
    const [friendInfo, setFriendInfo] = useState({incomingReqs: [], outgoingReqs: [], friends: []});
    const [openDropdown, setOpenDropdown] = useState(false);
    const {user} = useContext(UserContext);
    const dropdownRef = useRef(null);
    console.log(friendInfo);

    useEffect(() => {   
        if (!user) return;

        searchTerm === "" ? setUserResult([]) : fetchPublicUserInfo(searchTerm, setUserResult, user.dbInfo.id);
        subscribeToFriendChanges(user, setFriendInfo);
        getFriendInfo(user, setFriendInfo);

        const handleOutsideDropdownClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setOpenDropdown(false);
        }

        document.addEventListener("mousedown", handleOutsideDropdownClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideDropdownClick);
        }
    }, [searchTerm, user]);
    // console.log(friendInfo);
    return (
        <div className="bg-zinc-900 text-white min-h-screen p-8 font-sans w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search */}
                <div className="bg-zinc-800 rounded-2xl p-6">
                    <h1 className="text-3xl font-semibold mb-4">Search for New Friends</h1>
                    <div className="relative" ref={dropdownRef}>
                        <input
                            onChange={(e) => {setSearchTerm(e.target.value || ""); setOpenDropdown(true)}}
                            className={`w-full p-4 rounded-xl ${openDropdown && userResult.length > 0 && 'rounded-b-none '} bg-zinc-700 focus:outline-none`}
                            placeholder="Enter a WCA ID or Name"
                            onFocus={() => setOpenDropdown(true)}
                        />
                        {openDropdown && userResult.length > 0 && (
                            <div className="absolute top-full w-full z-50 bg-zinc-700 border border-zinc-700 rounded-b-xl max-h-60 overflow-y-auto shadow-xl p-2 space-y-2">
                                {userResult.map((user, i) => (
                                    <UserCard friendInfo={friendInfo} variant="FriendReq" key={i} userId={user.id} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {/* Requests */}
                <div className="space-y-8">
                    <div className="bg-zinc-800 rounded-2xl p-6">
                        <h2 className="text-2xl font-semibold mb-4">Incoming Friend Requests</h2>
                        <div className="space-y-4">
                            {friendInfo.incomingReqs.map((userId, i) => (
                                <UserCard variant="IncomingReq" key={i} userId={userId} />
                            ))}
                            {friendInfo.incomingReqs.length === 0 && <p className="text-zinc-400">No incoming requests.</p>}
                        </div>
                    </div>
                    <div className="bg-zinc-800 rounded-2xl p-6">
                        <h2 className="text-2xl font-semibold mb-4">Outgoing Friend Requests</h2>
                        <div className="flex flex-wrap gap-4">
                            {friendInfo.outgoingReqs.map((userId, i) => (
                                <UserCard variant="OutgoingReq" key={i} userId={userId} />
                            ))}
                            {friendInfo.outgoingReqs.length === 0 && <p className="text-zinc-400">No outgoing requests.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Friends List */}
            <div className="mt-12 bg-zinc-800 rounded-2xl p-6">
                <h2 className="text-3xl font-semibold mb-4">Your Friends</h2>
                {friendInfo.friends.map((userId, i) => (
                    <UserCard variant="FriendReq" key={i} userId={userId} friendInfo={friendInfo}/>
                ))}
                {friendInfo.friends.length === 0 && <p className="col-span-full text-zinc-400">You have no friends yet.</p>}
            </div>
        </div>
    )
}

export default Friends;