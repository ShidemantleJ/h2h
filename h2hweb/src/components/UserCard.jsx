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

const declineFriendReq = async (userId) => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/friend/declineReq`, {senderId: userId}, {withCredentials: true});
}

const removeFriend = async (userId) => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/friend/removeFriend`, {friendId: userId}, {withCredentials: true});
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

const AcceptReqButton = (props) => {
    return <button onClick={() => acceptFriendReq(props.userId)} className="bg-emerald-700 px-4 mr-1 py-2 rounded-lg cursor-pointer">Accept</button>
}

const DeclineReqButton = (props) => {
    return <button onClick={() => declineFriendReq(props.userId)} className="bg-red-800 px-4 ml-1 py-2 rounded-lg cursor-pointer">Decline</button>
}

const CancelReqButton = (props) => {
    return <button onClick={() => cancelFriendReq(props.userId)} className="bg-red-800 px-4 py-2 rounded-lg cursor-pointer">Cancel</button>
}

const RemoveFriendButton = (props) => {
    return <button onClick={() => removeFriend(props.userId)} className="bg-red-800 px-4 py-2 rounded-lg cursor-pointer">Remove Friend</button>
}

const SendReqButton = (props) => {
    return <button onClick={() => sendFriendReq(props.userId)} className="bg-emerald-700 cursor-pointer ml-auto my-auto p-4 rounded-2xl font-semibold">Send Friend Request</button>
}

const checkAlreadyFriends = (userId, friendInfo) => {
    console.log("Checking if ", userId, " is friends.", friendInfo?.friends?.includes(userId))
    console.log(friendInfo);
    return friendInfo?.friends?.includes(userId);
}

const checkReceivedRequest = (userId, friendInfo) => {
    return friendInfo?.incomingReqs?.includes(userId);
}

const checkSentRequest = (userId, friendInfo) => {
    return friendInfo?.outgoingReqs?.includes(userId);
}

const UserCard = (props) => {
    const [user, setUser] = useState(null);
    const variant = props.variant || "Normal";
    const className = props.className || "";
    const friendInfo = props?.friendInfo;
    // console.log(props.userId);
    const userId = Number.parseInt(props.userId, 10);
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getUserInfo(userId);
            setUser(userData);
        }
        fetchUser();
    }, [userId])

    if (!user) return null;
    if (variant === "IncomingReq") return (
        <div className={`w-50 bg-zinc-700 py-5 rounded-4xl flex flex-col items-center space-y-3 ${className}`}>
            <img src={user.profile_pic_url} className="w-20" />
            <p>{user.name}</p>
            <div className="flex">
                <AcceptReqButton userId={userId}/>
                <DeclineReqButton userId={userId}/>
            </div>
        </div>
    )
    if (variant === "OutgoingReq") return (
        <div className={`w-40 bg-zinc-700 py-5 rounded-4xl flex flex-col items-center space-y-3 shrink-0 ${className}`}>
            <img src={user.profile_pic_url} className="w-20" />
            <p>{user.name}</p>
            <CancelReqButton userId={userId}/>
        </div>
    )
    if (variant === "MatchInvite") return (
        // TODO: add match invite functionality once endpoint is finished
        <h1>Placeholder for match invite</h1>
    )
    if (variant === "FriendReq") {
        let buttonToDisplay;
        if (checkAlreadyFriends(userId, friendInfo)) buttonToDisplay = <RemoveFriendButton userId={userId}/>
        else if (checkReceivedRequest(userId, friendInfo)) buttonToDisplay = <AcceptReqButton userId={userId}/>
        else if (checkSentRequest(userId, friendInfo)) buttonToDisplay = <CancelReqButton userId={userId}/>
        else buttonToDisplay = <SendReqButton userId={userId}/>
        return (
            <div className={`bg-zinc-800 p-5 grid grid-cols-3 rounded-2xl`}>
                <img className="block" src={user.profile_pic_url} />
                <div className="my-auto">
                    <h1 className="font-bold">{user.name}</h1>
                    <a href={`http://worldcubeassociation.org/persons/${user.wcaid}`}>{user.wcaid}</a>
                    {/* <h3>Joined on {new Date(user.created_at).toISOString().split("T")[0]}</h3> */}
                </div>
                <div className="m-auto">
                {buttonToDisplay}
                </div>
            </div>
        )
    }
    if (variant === "MatchDisplay") return (
        <div className={`bg-zinc-800 p-2 inline-flex rounded-2xl hover:bg-zinc-700 transition-all duration-200 ${className}`}>
            <img className="w-10 h-10 my-auto" src={user.profile_pic_url} />
            <div className="ml-5 items-center my-auto">
                <h1 className="font-bold">{user.name}</h1>
                <a href={`http://worldcubeassociation.org/persons/${user.wcaid}`}>{user.wcaid}</a>
            </div>
        </div>
    )
    return (
        <div className={`bg-zinc-800 p-5 flex rounded-2xl ${className}`}>
            <img className="block" src={user.profile_pic_url} />
            <div className="ml-auto justify-center flex flex-col">
                <h1 className="font-bold">{user.name}</h1>
                <a href={`http://worldcubeassociation.org/persons/${user.wcaid}`}>{user.wcaid}</a>
                <h3>Joined on {new Date(user.created_at).toISOString().split("T")[0]}</h3>
                {/* <h3>Joined on {user.created_at}</h3> */}
            </div>
            {/* {variant === "Friend" && <button onClick={() => sendFriendReq(userId)} className="bg-emerald-700 cursor-pointer ml-auto my-auto p-4 rounded-2xl font-semibold">Send Friend Request</button>} */}
        </div>
    )
}

export default UserCard;