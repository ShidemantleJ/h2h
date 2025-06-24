import supabase from "../supabase";

const getFriendInfo = async (user, setUser) => {
  // console.log("Getting friend info");

  const { data: friendsData1, error: friendsError1 } = await supabase
    .from("friends")
    .select("user1_id")
    .eq("user2_id", user.dbInfo.id);

  const { data: friendsData2, error: friendsError2 } = await supabase
    .from("friends")
    .select("user2_id")
    .eq("user1_id", user.dbInfo.id);

  const friendsData =
    [
      ...friendsData1.map((u) => u.user1_id),
      ...friendsData2.map((u) => u.user2_id),
    ] || [];
  // console.log(friendsData);
  // console.error(friendsError1, friendsError2);

  const { data: incReqsData, error: incReqsError } = await supabase
    .from("friendreqs")
    .select("sender_user_id")
    .eq("recipient_user_id", user.dbInfo.id)
    .eq("status", "pending");
  // console.log(incReqsData.map((u) => u.sender_user_id));
  // console.error(incReqsError);

  const { data: outReqsData, error: outReqsError } = await supabase
    .from("friendreqs")
    .select("recipient_user_id")
    .eq("sender_user_id", user.dbInfo.id)
    .eq("status", "pending");
  // console.log(outReqsData.map((u) => u.recipient_user_id));
  // console.error(outReqsError);

  if (friendsError1 || friendsError2 || incReqsError || outReqsError) {
    console.error(friendsError1, friendsError2, incReqsError, outReqsError);
    return;
  }
  const friendInfo = {
    incomingReqs: incReqsData.map((u) => u.sender_user_id) || [],
    outgoingReqs: outReqsData.map((u) => u.recipient_user_id) || [],
    friends: friendsData || [],
  };
  setUser((prevUser) => ({
    ...prevUser,
    friendInfo: friendInfo,
  }));
};

const subscribeToFriendChanges = (user, setUser) => {
  // console.log("subscribed to friend changes");
  const channelA = supabase
    .channel(`friend-req-changes-${user.dbInfo.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friends",
        filter: `user1_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        await getFriendInfo(user, setUser);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friends",
        filter: `user2_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        await getFriendInfo(user, setUser);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendreqs",
        filter: `sender_user_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        await getFriendInfo(user, setUser);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "friendreqs",
        filter: `recipient_user_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        await getFriendInfo(user, setUser);
      }
    )
    .subscribe();

  return () => channelA.unsubscribe();
};

export { subscribeToFriendChanges, getFriendInfo };
