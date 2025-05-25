import React, { useState, useEffect } from "react";
import Button from "./Button";
import axios from "axios";
import { getUserInfo } from "../utils/dbutils";

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
    <button
      onClick={() => acceptFriendReq(props.userId)}
      className="bg-emerald-700 px-4 mr-1 py-2 rounded-lg cursor-pointer"
    >
      Accept
    </button>
  );
};

const DeclineReqButton = (props) => {
  return (
    <button
      onClick={() => declineFriendReq(props.userId)}
      className="bg-red-900 px-4 ml-1 py-2 rounded-lg cursor-pointer"
    >
      Decline
    </button>
  );
};

const CancelReqButton = (props) => {
  return (
    <button
      onClick={() => cancelFriendReq(props.userId)}
      className="bg-red-900 px-4 py-2 rounded-lg cursor-pointer"
    >
      Cancel
    </button>
  );
};

const RemoveFriendButton = (props) => {
  return (
    <button
      onClick={() => removeFriend(props.userId)}
      className="bg-red-900 px-4 py-2 rounded-lg cursor-pointer"
    >
      Remove Friend
    </button>
  );
};

const SendReqButton = (props) => {
  return (
    <button
      onClick={() => sendFriendReq(props.userId)}
      className="bg-emerald-700 cursor-pointer ml-auto my-auto p-4 rounded-2xl font-semibold"
    >
      Send Friend Request
    </button>
  );
};

const checkAlreadyFriends = (userId, friendInfo) => {
  console.log(
    "Checking if ",
    userId,
    " is friends.",
    friendInfo?.friends?.includes(userId)
  );
  console.log(friendInfo);
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
}) => {
  const [user, setUser] = useState(null);
  // console.log(props.userId);
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
          <RemoveFriendButton userId={userId} />,
          <SendMatchInviteButton
            userId={userId}
            setShowChallengeModal={setShowChallengeModal}
            setChallengedUser={setChallengedUser}
          />,
        ];
      else if (checkReceivedRequest(userId, friendInfo))
        buttons = <AcceptReqButton userId={userId} />;
      else if (checkSentRequest(userId, friendInfo))
        buttons = <CancelReqButton userId={userId} />;
      else
        buttons = (
          <Button
            text="Send Friend Request"
            onClick={() => sendFriendReq(userId)}
            color="green"
          />
        );
      break;
    case "IncomingReq":
      buttons = [
        <AcceptReqButton userId={userId} />,
        <DeclineReqButton userId={userId} />,
      ];
      break;
    case "OutgoingReq":
      buttons = [<CancelReqButton userId={userId} />];
      break;
    case "MatchInvite":
      buttons = (
        <SendMatchInviteButton
          userId={userId}
          setShowChallengeModal={setShowChallengeModal}
          setChallengedUser={setChallengedUser}
        />
      );
      break;
  }
  return (
    <div
      className={`bg-zinc-700 ${hover && "hover:bg-zinc-700"} py-2 px-4 flex ${
        layout === "vertical" ? "flex-col text-center space-y-2" : "space-x-4"
      } items-center w-fit rounded-2xl`}
    >
      <img className="block w-15 h-15" src={user.profile_pic_url} />
      <div>
        <h1 className="font-semibold">{user.name}</h1>
        <a
          className="text-sm"
          href={`http://worldcubeassociation.org/persons/${user.wcaid}`}
        >
          {user.wcaid}
        </a>
      </div>
      {buttons?.length > 1
        ? buttons?.map((button) => {
            return button;
          })
        : buttons}
    </div>
  );
};

export default UserCard;
