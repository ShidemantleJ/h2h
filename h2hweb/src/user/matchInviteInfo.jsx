import supabase from "../supabase";
import { toast } from "react-toastify";
import { getNameFromId } from "../utils/dbutils";

const getMatchInviteInfo = async (user, setUser) => {
  const { data: incInviteData, error: incInviteError } = await supabase
    .from("matchinvites")
    .select("*")
    .eq("recipient_user_id", user.dbInfo.id)
    .eq("status", "pending");

  const { data: outInviteData, error: outInviteError } = await supabase
    .from("matchinvites")
    .select("*")
    .eq("sender_user_id", user.dbInfo.id)
    .eq("status", "pending");

  const { data: randomInviteData, error: randomInviteError } = await supabase
    .from("matchinvites")
    .select("*")
    .eq("to_random_users", true)
    .eq("status", "pending")
    .neq("sender_user_id", user.dbInfo.id);

  if (incInviteError || outInviteError || randomInviteError) {
    console.error(incInviteError, outInviteError, randomInviteError);
    return;
  }
  const matchInviteInfo = {
    incomingReqs: incInviteData || [],
    outgoingReqs: outInviteData || [],
    randomIncomingReqs: randomInviteData || [],
  };
  setUser((prevUser) => ({
    ...prevUser,
    matchInviteInfo: matchInviteInfo,
  }));
};

const subscribeToMatchInviteChanges = (user, setUser) => {
  const channelA = supabase
    .channel(`match-invite-changes-${user.dbInfo.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matchinvites",
        filter: `sender_user_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        if (payload.new.status === "accepted") {
          const name = await getNameFromId(payload.new.recipient_user_id);
          toast.success(
            <p>
              {name} accepted your match invite! Join the match by clicking
              <a
                className="font-bold text-emerald-600 ml-2"
                href={`/match/${payload.new.id}`}
              >
                here
              </a>
            </p>,
            {
              autoClose: 60000,
            }
          );
        }
        await getMatchInviteInfo(user, setUser);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matchinvites",
        filter: `recipient_user_id=eq.${user.dbInfo.id}`,
      },
      async (payload) => {
        if (payload.new.status === "accepted") {
          window.location.href = `/match/${payload.new.id}`;
        }
        await getMatchInviteInfo(user, setUser);
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "matchinvites",
        filter: `recipient_user_id=eq.-1`,
      },
      async (payload) => {
        await getMatchInviteInfo(user, setUser);
      }
    )
    .subscribe();

  return () => channelA.unsubscribe();
};

export { subscribeToMatchInviteChanges, getMatchInviteInfo };
