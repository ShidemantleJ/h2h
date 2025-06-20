import React, { useState, useContext, useEffect } from "react";
import UserCard from "../UserCard";
import CountdownTimer from "./CountdownTimer";
import MiniStats from "./MiniStats";
import axios from "axios";
import { UserContext } from "../../user/UserContext";

function handleTimeUp(match, userIsSpectator) {
    if (!userIsSpectator) axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/match/timeUpAddDNF`,
      { match: match },
      { withCredentials: true }
    );
}

function TopBar({ match, variant, currSet, userIsSpectator }) {
  const p1name = match?.player1?.name;
  const p2name = match?.player2?.name;

  const { user } = useContext(UserContext);

  let message;
  switch (match.status) {
    case "P1_WON":
      message = `${p1name} won.`;
      break;
    case "P2_WON":
      message = `${p2name} won.`;
      break;
    case "both_left":
      message = "Both players left early.";
      break;
    default:
      message = "";
      break;
  }

  return (
    <div className="py-3 px-5">
      {message && (
        <p className="text-center text-xl">This match has concluded</p>
      )}
      {message && (
        <p className="text-center text-md text-zinc-300 mb-3">{message}</p>
      )}
      <div className="flex flex-col lg:flex-row lg:space-y-0 gap-y-2 items-center h-fit justify-between">
        <div className="flex items-center justify-between md:gap-x-5">
          {variant !== "CompleteMatch" && (
            <CountdownTimer
              isRunning={match.player_turn === 1}
              countdownSecs={match.countdown_secs}
              startTimestamp={match.countdown_timestamp}
              onTimeUp={() => handleTimeUp(match, userIsSpectator)}
            />
          )}
          <UserCard
            key={"user_card_" + match.player_1_id}
            userId={match.player_1_id}
            variant="MatchDisplay"
            wonMatch={match.status === "P1_WON"}
          />
          <MiniStats match={match} playerNum={1} key="mini_stats_1" currSet={currSet} />
        </div>
        <div className="flex items-center md:gap-x-5 flex-row-reverse lg:flex-row">
          <MiniStats match={match} playerNum={2} key="mini_stats_2" currSet={currSet} />
          <UserCard
            key={"user_card_" + match.player_2_id}
            userId={match.player_2_id}
            variant="MatchDisplay"
            wonMatch={match.status === "P2_WON"}
          />
          {variant !== "CompleteMatch" && (
            <CountdownTimer
              isRunning={match.player_turn === 2}
              countdownSecs={match.countdown_secs}
              startTimestamp={match.countdown_timestamp}
              onTimeUp={() => handleTimeUp(match)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
