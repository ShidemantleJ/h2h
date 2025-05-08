import { useState, useEffect, useContext } from "react";
import UserCard from "../components/UserCard";
import axios from "axios";
import supabase from "../supabase";
import { UserContext } from "../user/UserContext";

const fetchPublicUserInfo = async (searchTerm, setUserResult) => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userSearch`, {
        params: {
            term: searchTerm
        }
    }, { withCredentials: true })
    .then(res => {
        // console.log(res.data);
        setUserResult(res.data);
    })
}

const getFriendRequests = async (user, setFriendInfo) => {
    const {data, error} = await supabase
    .from("Users")
    .select("friend_reqs_outgoing, friend_reqs_incoming, friends")
    .eq("id", user.dbInfo.id)
    .single();
    console.log(data);
    const friendInfo = {
        incomingReqs: data.friend_reqs_incoming || [],
        outgoingReqs: data.friend_reqs_outgoing || [],
        friends: data.friends || []
    }
    setFriendInfo(friendInfo);
}

const subscribeToFriendChanges = async (user, setFriendInfo) => {
    const channelA = supabase
    .channel('schema-db-changes')
    .on('postgres_changes',
        {
            event: "*",
            schema: "public",
            table: "Users",
            filter: `id=eq.${user.dbInfo.id}`
        },
        (payload) => {
            const newFriendInfo = {
                incomingReqs: payload.new.friend_reqs_incoming || [],
                outgoingReqs: payload.new.friend_reqs_outgoing || [],
                friends: payload.new.friends || []
            }
            setFriendInfo(newFriendInfo);
        }
    )
    .subscribe();
}

const Friends = (props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [userResult, setUserResult] = useState([]);
    const [friendInfo, setFriendInfo] = useState({incomingReqs: [], outgoingReqs: [], friends: []});
    const {user} = useContext(UserContext);
    useEffect(() => {
        if (!user) return;

        fetchPublicUserInfo(searchTerm, setUserResult);
        subscribeToFriendChanges(user, setFriendInfo);
        getFriendRequests(user, setFriendInfo);
    }, [searchTerm, user]);
    
    /*
    return (
        <div className="bg-zinc-900 text-white p-8 w-full font-sans flex flex-col">
            <div className="flex flex-row space-x-10 flex-1">
                <div className="flex-1">
                    <h1 className="text-4xl font-semibold">Search for new Friends</h1>
                    <input onBlur={(e) => setSearchTerm(e.target.value)} className="rounded-2xl p-4 mt-5 bg-zinc-800 w-full" placeholder="Enter a WCA ID:"></input>
                    <div className="">
                        {userResult.map((user, i) => {
                            return <UserCard variant="FriendReq" className="mt-5" key={i} userId={user.id}/>
                        })}
                    </div>
                </div>
                <div className="flex-1 w-1/2 space-y-5">
                    <div className="bg-zinc-800 p-5 text-center rounded-2xl">
                        <h1 className="text-2xl mb-5">Incoming Friend Requests</h1>
                        {friendInfo.incomingReqs.map((user, i) => {
                            return <UserCard variant="IncomingReq" className="" key={i} userId={user}/>
                        })}
                    </div>
                    <div className="bg-zinc-800 p-5 text-center rounded-2xl">
                        <h1 className="text-2xl mb-5">Outgoing Friend Requests</h1>
                        <div className="overflow-x-auto w-full">
                            <div className="flex flex-row gap-5 w-max">
                                {friendInfo.outgoingReqs.map((user, i) => (
                                    <UserCard variant="OutgoingReq" key={i} userId={user} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-zinc-800">
                    <h2 className="text-2xl font-semibold">Friends</h2>
                </div>
            </div>
        </div>
    )
        */
    return (
        <div className="bg-zinc-900 text-white min-h-screen p-8 font-sans w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Search */}
                <div className="bg-zinc-800 rounded-2xl p-6">
                    <h1 className="text-3xl font-semibold mb-4">Search for New Friends</h1>
                    <input
                        onBlur={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 rounded-xl bg-zinc-700 focus:outline-none mb-6"
                        placeholder="Enter a WCA ID"
                    />
                    <div className="space-y-4">
                        {userResult.map((user, i) => (
                            <UserCard variant="FriendReq" key={i} userId={user.id} />
                        ))}
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {friendInfo.friends.map((userId, i) => (
                        <UserCard variant="Friend" key={i} userId={userId} />
                    ))}
                    {friendInfo.friends.length === 0 && <p className="col-span-full text-zinc-400">You have no friends yet.</p>}
                </div>
            </div>
        </div>
    )
}

export default Friends;