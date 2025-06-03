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
  if (variant === "MatchDisplay") {
    return (
      <div
        className={`bg-zinc-700 ${
          hover && "hover:bg-zinc-700"
        } py-2 px-4 flex space-x-4 items-center w-fit rounded-2xl`}
      >
        <img className="block w-9 h-9" src={user.profile_pic_url} />
        <div className="overflow-hidden">
          <h1 className="font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
            {user.name}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-zinc-700 ${hover && "hover:bg-zinc-700"} py-2 px-4 flex ${
        layout === "vertical" ? "flex-col text-center space-y-2" : "space-x-4"
      } items-center w-fit rounded-2xl`}
    >
      <img className="block w-15 h-15" src={user.profile_pic_url} />
      <div>
        <h1 className="font-semibold">
          {user.name}
        </h1>
        <a
          className="text-sm"
          href={`http://worldcubeassociation.org/persons/${user.wcaid}`}
        >
          {user.wcaid}
        </a>
      </div>
      <div className="flex gap-2">
        {buttons?.length > 1
          ? buttons?.map((button) => {
              return button;
            })
          : buttons}
      </div>
    </div>
  );
};

export default UserCard;
