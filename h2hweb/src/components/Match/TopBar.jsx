import React, { useEffect, useState, useContext } from "react";
import UserCard from "../UserCard";
import CountdownTimer from "./CountdownTimer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UserContext } from "../../user/UserContext";
import MiniStats from "./MiniStats";
import axios from "axios";
import { getNameFromId } from "../../utils/dbutils";

function TopBar(props) {
  const match = props.match;
  const variant = props.variant;
  const currSet = props.currSet;
  const countdownTimestamp = match.countdown_timestamp;
  const countdownSecs = match.countdown_secs;
  const playerTurn = match.player_turn;
  const { user } = useContext(UserContext);

  const [p1countdownIsUp, setP1CountdownIsUp] = useState(false);
  const [p2countdownIsUp, setP2CountdownIsUp] = useState(false);

  const [p1name, setp1name] = useState("");
  const [p2name, setp2name] = useState("");

  useEffect(() => {
    if (!match?.player_1_id || !match?.player_2_id) return;

    async function getNames() {
      const player1name = await getNameFromId(match.player_1_id);
      const player2name = await getNameFromId(match.player_2_id);
      setp1name(player1name);
      setp2name(player2name);
    }

    getNames();
  }, [match?.player_1_id, match?.player_2_id]);

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
        <div className="flex items-center gap-x-5">
          {variant !== "CompleteMatch" && (
            <CountdownTimer
              player={1}
              turn={playerTurn}
              countdownSecs={countdownSecs}
              timestamp={countdownTimestamp}
              setTimeIsUp={setP1CountdownIsUp}
            />
          )}
          <UserCard
            key={match.player_1_id}
            userId={match.player_1_id}
            variant="MatchDisplay"
            wonMatch={match.status === "P1_WON"}
          />
          <MiniStats match={match} playerNum={1} key={1} currSet={currSet} />
        </div>
        <div className="flex items-center gap-x-5 flex-row-reverse lg:flex-row">
          <MiniStats match={match} playerNum={2} key={2} currSet={currSet} />
          <UserCard
            key={match.player_2_id}
            userId={match.player_2_id}
            variant="MatchDisplay"
            wonMatch={match.status === "P2_WON"}
          />
          {variant !== "CompleteMatch" && (
            <CountdownTimer
              player={2}
              turn={playerTurn}
              countdownSecs={countdownSecs}
              timestamp={countdownTimestamp}
              setTimeIsUp={setP2CountdownIsUp}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;
