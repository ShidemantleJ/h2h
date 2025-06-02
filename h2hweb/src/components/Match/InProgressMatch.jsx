import supabase from "../../supabase";
import SolveTable from "./SolveTable";
import Timer from "./Timer";
import Button from "../Button";
import CountdownTimer from "./CountdownTimer";
import TopBar from "./TopBar";
import Scramble from "./Scramble";
import React, { useEffect, useContext, useState } from "react";
import { UserContext } from "../../user/UserContext";
import Modal from "./Modal";
import axios from "axios";

export default function InProgressMatch({ match, matchId, setMatch }) {
  const {user} = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(true);
  const [timeIsUp, setTimeIsUp] = useState(false);

  useEffect(() => {
    if (!match?.id) return;

    const changes = supabase
      .channel(`match-updates-${match.id}`)
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "*",
          table: "matches",
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          setMatch(payload.new);
        }
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, [match?.id]);

  // Track presence
  useEffect(() => {
    // Only subscribe to presence channel if logged in
    if (!user || !user?.dbInfo?.id || !match?.id) return;

    console.log(user);

    const matchRoom = supabase.channel(`match_room_${match.id}`, {
      config: { presence: { key: user.dbInfo.id } || {} },
    });

    matchRoom.on("presence", { event: "sync" }, () => {
      const usersPresent = Object.values(matchRoom.presenceState())
        .flat()
        .map((user) => user.userId);
      console.log(matchRoom.presenceState());
      console.log(usersPresent);

      const competitors = [match.player_1_id, match.player_2_id];
      if (
        competitors.every((element) => usersPresent.includes(element)) &&
        match.status === "notstarted"
      )
        axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/match/startMatch`,
          { matchId: match.id },
          { withCredentials: true }
        );
    });
    matchRoom.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && user.dbInfo.id) {
        await matchRoom.track({ userId: user.dbInfo.id });
      }
    });

    return () => matchRoom.unsubscribe();
  }, [user?.dbInfo?.id, match?.id]);

  if (!match || !match.player_1_id || !match.created_at)
    return <div className="bg-zinc-900 w-full min-h-screen"></div>;
  let playerTimesArr = [];
  if (!user || !user?.dbInfo?.id) {
    // TODO: maybe prompt the user who they'd like to spectate maybe? or allow them to switch scrambles themselves?
  } else if (user.dbInfo.id === match.player_1_id)
    playerTimesArr = match.player_1_times;
  else if (user.dbInfo.id === match.player_2_id)
    playerTimesArr = match.player_2_times;
  const currSet = playerTimesArr?.length || 1;
  const currSolve = playerTimesArr.at(-1)?.length + 1 || 1;
  return (
    <div className="bg-zinc-900 w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 grid-rows-[auto_1fr] text-white gap-5 p-5">
      {match.status === "notstarted" && (
        <Modal open={modalOpen}>
          <div className="space-y-4 flex flex-col items-center">
            {timeIsUp ? (
              <>
                <p>Your opponent did not join in time</p>
                <Button
                  text="Return to homepage"
                  color="green"
                  onClick={() => (window.location.href = "/play")}
                />
              </>
            ) : (
              <>
                <p>Waiting for your opponent to join...</p>
                <CountdownTimer
                  timestamp={new Date(match.created_at)}
                  countdownSecs={60}
                  turn={1}
                  player={1}
                  setTimeIsUp={setTimeIsUp}
                />
              </>
            )}
          </div>
        </Modal>
      )}
      {/* Profile picture and username of opponents and timer */}
      <div className="bg-zinc-800 rounded-2xl lg:col-span-2 h-fit">
        <TopBar match={match} />
      </div>
      <div className="space-y-5">
        {/* Submit Times */}
        <div className="bg-zinc-800 rounded-2xl p-5">
          <Timer matchId={matchId} />
        </div>
        {/* Current Scramble */}
        <div className="bg-zinc-800 rounded-2xl p-5 h-fit">
          <Scramble
            event={match.event}
            scrambleArray={match.scrambles}
            currSet={currSet}
            currSolve={currSolve}
          />
        </div>
      </div>
      {/* Table of solves */}
      <div className="h-[70vh]">
        <SolveTable match={match} />
      </div>
    </div>
  );
}
