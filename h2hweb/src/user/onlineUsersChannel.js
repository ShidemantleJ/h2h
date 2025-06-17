import supabase from "../supabase";

function subscribeToOnlineUsers(userId, setOnlineUsers) {
  const channel = supabase
    .channel("online-users")
    .on("presence", { event: "sync" }, () => {
      const newState = channel.presenceState() || [];
      setOnlineUsers(
        Object.values(newState).map((userArray) => userArray[0].userId)
      );
    })
    .subscribe(async (status) => {
      if (status !== "SUBSCRIBED") {
        return;
      }
      const presenceTrackStatus = await channel.track({ userId: userId });
    });

    return () => channel.unsubscribe();
}

export { subscribeToOnlineUsers };
