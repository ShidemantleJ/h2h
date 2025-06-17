import supabase from "../../supabase";
import SolveTable from "./SolveTable";
import Timer from "./Timer";
import Button from "../Button";
import CountdownTimer from "./CountdownTimer";
import TopBar from "./TopBar";
import Scramble from "./Scramble";
import React, { useEffect, useContext, useState, memo } from "react";
import { UserContext } from "../../user/UserContext";
import Modal from "./Modal";
import axios from "axios";

function InProgressMatch({ match, matchId, setMatch }) {
  const { user } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(true);
  const [timeIsUp, setTimeIsUp] = useState(false);

  // Subscribe to match changes (new times, scrambles, etc.)
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
          setMatch((prev) => ({
            player1: prev.player1,
            player2: prev.player2,
            ...payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, [match?.id]);

  // Track presence, send request to start the match if both users are present
  useEffect(() => {
    // Only subscribe to presence channel if logged in
    if (!user || !user?.dbInfo?.id || !match?.id) return;

    const matchRoom = supabase.channel(`match_room_${match.id}`, {
      config: { presence: { key: user.dbInfo.id } || {} },
    });

    matchRoom.on("presence", { event: "sync" }, () => {
      const usersPresent = Object.values(matchRoom.presenceState())
        .flat()
        .map((user) => user.userId);

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
    return <div className="bg-zinc-900 w-full min-h-dvh"></div>;
  let playerTimesArr = [];

  const userIsP1 = user?.dbInfo?.id === match.player_1_id;
  const userIsP2 = user?.dbInfo?.id === match.player_2_id;
  const userIsSpectator = !userIsP1 && !userIsP2;

  if (userIsP1) playerTimesArr = match.player_1_times;
  else if (userIsP2) playerTimesArr = match.player_2_times;
  else if (userIsSpectator)
    playerTimesArr =
      Math.max(
        match.player_1_times.at(-1).length,
        match.player_2_times.at(-1).length
      ) === match.player_1_times.at(-1).length
        ? match.player_1_times
        : match.player_2_times;

  const [currSet, setCurrSet] = useState(0);
  const [currSolve, setCurrSolve] = useState(0);
  const [latestScrambleSet, setLatestScrambleSet] = useState(0);
  const [latestScrambleSolve, setLatestScrambleSolve] = useState(0);

  useEffect(() => {
    setCurrSet(Math.max(playerTimesArr?.length - 1, 0));
    setCurrSolve(Math.max(playerTimesArr.at(-1)?.length, 0));
    setLatestScrambleSet(Math.max(playerTimesArr?.length - 1, 0));
    setLatestScrambleSolve(Math.max(playerTimesArr.at(-1)?.length, 0));
  }, [playerTimesArr]);

  return (
    <div className="bg-zinc-900 w-full h-fit min-h-dvh grid grid-cols-1 lg:grid-cols-2 grid-rows-[auto_1fr] text-white gap-5 p-5">
      {match.status === "notstarted" && (
        <Modal open={modalOpen}>
          <div className="space-y-4 flex flex-col items-center">
            {timeIsUp ? (
              <>
                <p>All players did not join in time</p>
                <Button
                  text="Return to homepage"
                  color="green"
                  onClick={() => (window.location.href = "/play")}
                />
              </>
            ) : (
              <>
                <p>Waiting for all players to join...</p>
                <CountdownTimer
                  startTimestamp={new Date(match.created_at)}
                  countdownSecs={60}
                  isRunning={true}
                  turn={1}
                  player={1}
                  onTimeUp={() => setTimeIsUp(true)}
                />
              </>
            )}
          </div>
        </Modal>
      )}
      {/* Profile picture and username of opponents and timer */}
      <div className="bg-zinc-800 rounded-2xl lg:col-span-2 h-fit">
        <TopBar match={match} currSet={currSet} />
      </div>
      {/* Submit Times */}
      {!userIsSpectator && <div className="bg-zinc-800 rounded-2xl p-5 h-fit w-fit">
        <Timer matchId={matchId} />
      </div>}
      {/* Table of solves */}
      <div className={`bg-zinc-800 rounded-2xl p-5 w-fit ${!userIsSpectator && "lg:ml-auto"} row-span-2`}>
        <SolveTable
          match={match}
          currSet={currSet}
          setCurrSet={setCurrSet}
          currSolve={currSolve}
          setCurrSolve={setCurrSolve}
        />
      </div>
      {/* Current Scramble */}
      <div className="bg-zinc-800 rounded-2xl h-fit">
        <Scramble
          event={match.event}
          scrambleArray={match.scrambles}
          currSet={userIsSpectator ? currSet : latestScrambleSet}
          currSolve={userIsSpectator ? currSolve : latestScrambleSolve}
        />
      </div>
    </div>
  );
}

export default InProgressMatch;
