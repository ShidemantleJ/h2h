/*
    Info to include:
    Top rectangle (full width):
        Profile picture and username of both opponents (modify usercard to do this)
    Next row: 1 full width rectangle displaying scramble
    Next row: 2 rectangles of equal width:
        Timer with box to submit time, buttons for DNF, +2, lists time remaining
        Text chat (add later)
    Next row: 1 rectangle with full width:
        Table of each solve with arrows on each side to switch between viewing different sets
*/

import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Timer from "../components/Match/Timer";
import UserCard from "../components/UserCard";
import supabase from "../supabase";
import SolveTable from "../components/Match/SolveTable";
import TopBar from "../components/Match/TopBar";
import Scramble from "../components/Match/Scramble";
import Modal from "../components/Match/Modal";
import { UserContext } from "../user/UserContext";
import CountdownTimer from "../components/Match/CountdownTimer";
import axios from "axios";

function Match(props) {
  let { matchId } = useParams();
  matchId = Number.parseInt(matchId, 10);
  const [match, setMatch] = useState({});
  const { user } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(true);
  const [timeIsUp, setTimeIsUp] = useState(false);

  useEffect(() => {
    if (!user?.dbInfo?.id) return;

    const changes = supabase
      .channel(`match-updates-${matchId}`)
      .on(
        "postgres_changes",
        {
          schema: "public",
          event: "*",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          setMatch(payload.new);
        }
      )
      .subscribe();

    const matchRoom = supabase.channel(`match_room_${matchId}`, {
      config: { presence: { key: user.dbInfo.id } },
    });

    matchRoom
      .on("presence", { event: "sync" }, () => {
        const usersPresent = Object.values(matchRoom.presenceState())
          .flat()
          .map((user) => user.userId);

        console.log(usersPresent);

        const competitors = [match.player_1_id, match.player_2_id];
        if (competitors.every((element) => usersPresent.includes(element)) && match.status === "notstarted")
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/match/startMatch`,
            { matchId: matchId },
            { withCredentials: true }
          );
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await matchRoom.track({ userId: user.dbInfo.id });
        }
      });

    async function getMatch(matchId) {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error) setMatch(null);
      else setMatch(data);
    }

    getMatch(matchId);

    return () => {
      changes.unsubscribe();
      matchRoom.unsubscribe();
    };
  }, [matchId, user]);

  if (!match || !user || !match.player_1_id)
    return <div className="bg-zinc-900 w-full min-h-screen"></div>;
  const playerTimesArr =
    user.dbInfo.id === match.player_1_id
      ? match.player_1_times
      : match.player_2_times;
  const currSet = playerTimesArr.length || 1;
  const currSolve = playerTimesArr[playerTimesArr.length - 1].length + 1 || 1;

  return (
    <div className="bg-zinc-900 w-full min-h-screen grid grid-cols-2 auto-rows-min text-white gap-5 p-5">
      {match.status === "notstarted" && (
        <Modal open={modalOpen}>
          <div className="space-y-4 flex flex-col items-center">
            {timeIsUp ? (
              <p>Your opponent did not join in time</p>
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
      <div className="bg-zinc-800 rounded-2xl col-span-2">
        <TopBar match={match} />
      </div>
      {/* Current Scramble */}
      <div className="bg-zinc-800 rounded-2xl p-5">
        <Scramble
          event={match.event}
          scrambleArray={match.scrambles}
          currSet={currSet}
          currSolve={currSolve}
        />
      </div>
      {/* Submit Times */}
      <div className="bg-zinc-800 rounded-2xl p-5">
        <Timer matchId={matchId} />
      </div>
      {/* Table of solves */}
      <div className="col-span-2">
        <SolveTable match={match} />
      </div>
    </div>
  );
}

export default Match;
