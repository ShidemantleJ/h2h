import React, { useContext } from "react";
import { OnlineUsersContext } from "../user/OnlineUsersContext";
import UserCard from "./UserCard";

function sortUserIds(usersArray) {
  // List online users first
  const { onlineUsers } = useContext(OnlineUsersContext);
  usersArray.sort((a, b) => {
    const aIndex = onlineUsers.indexOf(a);
    const bIndex = onlineUsers.indexOf(b);

    if (aIndex === -1 && bIndex === -1) return 0;
    else if (aIndex === -1) return 1;
    else if (bIndex === -1) return -1;
    else return aIndex - bIndex;
  });
}

function UserCardList({
  usersArray,
  setShowChallengeModal,
  setChallengedUser,
  variant,
  keyPrefix,
  layout,
  friendInfo,
  hover
}) {
  sortUserIds(usersArray);

  return usersArray?.map((id) => (
    <UserCard
      hover={hover}
      layout={layout}
      variant={variant}
      userId={id}
      key={keyPrefix + id}
      friendInfo={friendInfo}
      setShowChallengeModal={setShowChallengeModal}
      setChallengedUser={setChallengedUser}
    />
  ));
}

export default UserCardList;
