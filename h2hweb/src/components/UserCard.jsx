import React, {useState, useEffect} from "react";
import axios from "axios";

const sendFriendReq = async (userId) => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/friend/sendReq`, { recipientId: userId }, {withCredentials:true});
}

const cancelFriendReq = async (userId) => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/friend/cancelReq`, {recipientId: userId}, {withCredentials:true});
}

const acceptFriendReq = async (userId) => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/friend/acceptReq`, {senderId: userId}, {withCredentials: true});
}

const getUserInfo = async (userId) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userPublic`, {
            params: {
                id: Number.parseInt(userId, 10)
            }
        });
        return res.data;
    } catch (e) {
        console.error(e);
    }
}

const UserCard = (props) => {
    const [user, setUser] = useState(null);
    const variant = props.variant || "Normal";
    const className = props.className || "";
    // console.log(props.userId);
    const userId = Number.parseInt(props.userId, 10);
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserInfo(userId);
            setUser(userData);
        }
        fetchUser();
    }, [userId])
    // console.log(user);
    if (!user) return;
    if (variant === "IncomingReq") return (
        <div className={`w-40 bg-zinc-700 py-5 rounded-4xl flex flex-col items-center space-y-3 ${className}`}>
            <img src={user.profile_pic_url} className="w-20" />
            <p>{user.name}</p>
            <button onClick={() => acceptFriendReq(userId)} className="bg-emerald-700 px-4 py-2 rounded-lg cursor-pointer">Accept Request</button>
        </div>
    )
    if (variant === "OutgoingReq") return (
        <div className={`w-40 bg-zinc-700 py-5 rounded-4xl flex flex-col items-center space-y-3 shrink-0 ${className}`}>
            <img src={user.profile_pic_url} className="w-20" />
            <p>{user.name}</p>
            <button onClick={() => cancelFriendReq(userId)} className="bg-emerald-700 px-4 py-2 rounded-lg cursor-pointer">Cancel Request</button>
        </div>
    )
    if (variant === "MatchInvite") return (
        // TODO: add match invite functionality once endpoint is finished
        <h1>Placeholder for match invite</h1>
    )
    return (
        <div className={`bg-zinc-800 p-5 flex rounded-2xl ${className}`}>
            <img className="hidden lg:block" src={user.profile_pic_url} />
            <div className="ml-auto justify-center flex flex-col">
                <h1 className="font-bold">{user.name}</h1>
                <a href={`http://worldcubeassociation.org/persons/${user.wcaid}`}>{user.wcaid}</a>
                <h3>Joined on {new Date(user.created_at).toISOString().split("T")[0]}</h3>
                {/* <h3>Joined on {user.created_at}</h3> */}
            </div>
            {variant === "FriendReq" && <button onClick={() => sendFriendReq(userId)} className="bg-emerald-700 cursor-pointer ml-auto my-auto p-4 rounded-2xl font-semibold">Send Friend Request</button>}
        </div>
    )
}

export default UserCard;