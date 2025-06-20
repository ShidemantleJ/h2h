import React, { useState, useEffect, useContext } from "react";
import Button from "./Button";
import axios from "axios";
import { getUserInfo } from "../utils/dbutils";
import { Crown } from "lucide-react";
import { OnlineUsersContext } from "../user/OnlineUsersContext";

const sendFriendReq = async (userId) => {
  axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/friend/sendReq`,
    { recipientId: userId },
    { withCredentials: true }
  );
};

const cancelFriendReq = async (userId) => {
  axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/friend/cancelReq`,
    { recipientId: userId },
    { withCredentials: true }
  );
};

const acceptFriendReq = async (userId) => {
  axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/friend/acceptReq`,
    { senderId: userId },
    { withCredentials: true }
  );
};

const declineFriendReq = async (userId) => {
  axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/friend/declineReq`,
    { senderId: userId },
    { withCredentials: true }
  );
};

const removeFriend = async (userId) => {
  axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/friend/removeFriend`,
    { friendId: userId },
    { withCredentials: true }
  );
};

const SendMatchInviteButton = ({
  setShowChallengeModal,
  setChallengedUser,
  userId,
}) => {
  return (
    <Button
      color="green"
      text="Challenge"
      onClick={() => {
        setShowChallengeModal(true);
        setChallengedUser(userId);
      }}
    />
  );
};

const AcceptReqButton = (props) => {
  return (
    <Button
      onClick={() => acceptFriendReq(props.userId)}
      color="green"
      text="Accept"
    />
  );
};

const DeclineReqButton = (props) => {
  return (
    <Button
      onClick={() => declineFriendReq(props.userId)}
      color="red"
      text="Decline"
    />
  );
};

const CancelReqButton = (props) => {
  return (
    <Button
      onClick={() => cancelFriendReq(props.userId)}
      color="red"
      text="Cancel"
    />
  );
};

const RemoveFriendButton = (props) => {
  return (
    <Button
      onClick={() => removeFriend(props.userId)}
      color="red"
      text="Remove Friend"
    />
  );
};

const ViewProfileButton = (props) => {
  return (
    <Button
      onClick={() => {
        window.location.href = `/users/${props.userId}`;
      }}
      color="green"
      text="View Profile"
    />
  );
};

const SendReqButton = (props) => {
  return (
    <Button
      onClick={() => sendFriendReq(props.userId)}
      color="green"
      text="Send Friend Request"
    />
  );
};

const checkAlreadyFriends = (userId, friendInfo) => {
  return friendInfo?.friends?.includes(userId);
};

const checkReceivedRequest = (userId, friendInfo) => {
  return friendInfo?.incomingReqs?.includes(userId);
};

const checkSentRequest = (userId, friendInfo) => {
  return friendInfo?.outgoingReqs?.includes(userId);
};

const UserCard = ({
  variant,
  layout = "horizontal",
  friendInfo,
  userId,
  hover = true,
  setShowChallengeModal,
  setChallengedUser,
  wonMatch = false,
}) => {
  const [user, setUser] = useState(null);
  const { onlineUsers } = useContext(OnlineUsersContext);
  const isOnline = onlineUsers.includes(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserInfo(userId);
      setUser(userData);
    };
    fetchUser();
  }, [userId]);

  if (!user) return null;
  let buttons;
  switch (variant) {
    case "FriendReq":
      if (checkAlreadyFriends(userId, friendInfo))
        buttons = [
          <RemoveFriendButton key="1" userId={userId} />,
          <ViewProfileButton key="2" userId={userId} />,
        ];
      else if (checkReceivedRequest(userId, friendInfo))
        buttons = [
          <AcceptReqButton userId={userId} key="1" />,
          <ViewProfileButton key="2" userId={userId} />,
        ];
      else if (checkSentRequest(userId, friendInfo))
        buttons = [
          <CancelReqButton userId={userId} key="1" />,
          <ViewProfileButton key="2" userId={userId} />,
        ];
      else
        buttons = [
          <Button
            text="Send Friend Request"
            onClick={() => sendFriendReq(userId)}
            color="green"
            key="1"
          />,
          <ViewProfileButton key="2" userId={userId} />,
        ];
      break;
    case "IncomingReq":
      buttons = [
        <AcceptReqButton key="1" userId={userId} />,
        <DeclineReqButton key="2" userId={userId} />,
        <ViewProfileButton key="3" userId={userId} />,
      ];
      break;
    case "OutgoingReq":
      buttons = [
        <CancelReqButton userId={userId} key="1" />,
        <ViewProfileButton key="2" userId={userId} />,
      ];
      break;
    case "MatchInvite":
      buttons = [
        <SendMatchInviteButton
          userId={userId}
          setShowChallengeModal={setShowChallengeModal}
          setChallengedUser={setChallengedUser}
          key="1"
        />,
        <ViewProfileButton key="2" userId={userId} />,
      ];
      break;
  }
  if (variant === "MatchDisplay") {
    return (
      <div
        onClick={() => (window.location.href = `/users/${user.id}`)}
        className={`cursor-pointer relative bg-zinc-800 shadow-lg rounded-2xl flex items-center gap-4 px-5 py-3 min-w-[220px] max-w-xs border border-zinc-700 ${
          hover &&
          "hover:shadow-xl hover:border-zinc-500 transition-all duration-200"
        }`}
      >
        <div className="relative">
          {wonMatch && (
            <Crown
              fill="gold"
              className="absolute text-white w-5 h-5 z-10 -top-2.5 -left-2.5 rotate-315"
            />
          )}
          <img
            className="block w-12 h-12 rounded-full border-2 border-zinc-600 shadow-md object-cover bg-zinc-900"
            src={user.profile_pic_url}
            alt={user.name}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="font-semibold text-lg truncate text-white">
            {user.name}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-zinc-800 shadow-lg gap-3 rounded-2xl flex ${
        layout === "vertical"
          ? "flex-col items-center text-center py-5 px-6"
          : "flex-row items-center gap-5 py-3 px-5"
      } w-fit min-w-[260px] max-w-lg border border-zinc-700 ${
        hover &&
        "hover:shadow-xl hover:border-zinc-500 transition-all duration-200"
      }`}
    >
      <div className="relative">
        {isOnline && 
          <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-4xl border-3 border-emerald-500`} />
        }
        <img
          className={`${
            layout === "horizontal" ? "hidden lg:block" : "block"
          } w-16 h-16 rounded-full border-2 border-zinc-600 shadow-md object-cover bg-zinc-900`}
          src={user.profile_pic_url}
          alt={user.name}
        />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="font-semibold text-lg truncate text-white">
          {user.name}
        </h1>
        <a
          className="text-sm text-zinc-300 hover:underline truncate"
          href={`http://worldcubeassociation.org/persons/${user?.wcaid}`}
        >
          {user?.wcaid}
        </a>
      </div>
      <div
        className={`flex gap-2 ${
          layout === "vertical" ? "justify-center mt-2" : "flex-col items-end"
        }`}
      >
        {Array.isArray(buttons)
          ? buttons.map((button, i) => (
              <div key={i} className="w-full">
                {button}
              </div>
            ))
          : buttons}
      </div>
    </div>
  );
};

export default UserCard;
