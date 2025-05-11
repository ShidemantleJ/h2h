import { useState, useEffect, useContext, useRef } from "react";
import UserCard from "../components/UserCard";
import axios from "axios";
import supabase from "../supabase";
import { UserContext } from "../user/UserContext";

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

const Friends = (props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [userResult, setUserResult] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(false);
    const {user} = useContext(UserContext);
    const dropdownRef = useRef(null);
    console.log(user?.friendInfo);

    useEffect(() => {   
        if (!user) return;

        searchTerm === "" ? setUserResult([]) : fetchPublicUserInfo(searchTerm, setUserResult, user.dbInfo.id);

        const handleOutsideDropdownClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setOpenDropdown(false);
        }

        document.addEventListener("mousedown", handleOutsideDropdownClick);
        return () => {
            document.removeEventListener("mousedown", handleOutsideDropdownClick);
        }
    }, [searchTerm]);
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
                                {userResult.map((searchUser, i) => (
                                    <UserCard friendInfo={user.friendInfo} variant="FriendReq" key={i} userId={searchUser.id} />
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
                            {user?.friendInfo?.incomingReqs.map((userId, i) => (
                                <UserCard variant="IncomingReq" key={i} userId={userId} />
                            ))}
                            {user?.friendInfo?.incomingReqs.length === 0 && <p className="text-zinc-400">No incoming requests.</p>}
                        </div>
                    </div>
                    <div className="bg-zinc-800 rounded-2xl p-6">
                        <h2 className="text-2xl font-semibold mb-4">Outgoing Friend Requests</h2>
                        <div className="flex flex-wrap gap-4">
                            {user?.friendInfo?.outgoingReqs.map((userId, i) => (
                                <UserCard variant="OutgoingReq" key={i} userId={userId} />
                            ))}
                            {user?.friendInfo?.outgoingReqs.length === 0 && <p className="text-zinc-400">No outgoing requests.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Friends List */}
            <div className="mt-12 bg-zinc-800 rounded-2xl p-6">
                <h2 className="text-3xl font-semibold mb-4">Your Friends</h2>
                {user?.friendInfo?.friends.map((userId, i) => (
                    <UserCard variant="FriendReq" key={i} userId={userId} friendInfo={user.friendInfo}/>
                ))}
                {user?.friendInfo?.friends.length === 0 && <p className="col-span-full text-zinc-400">You have no friends yet.</p>}
            </div>
        </div>
    )
}

export default Friends;