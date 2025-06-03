import React, { useEffect, useState, useContext } from "react";
import UserCard from "../UserCard";
import CountdownTimer from "./CountdownTimer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UserContext } from "../../user/UserContext";
import MiniStats from "./MiniStats";
import axios from "axios";

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

  return (
    <div className="flex flex-col lg:flex-row py-3 px-5 gap-y-2 lg:space-y-0 items-center h-fit justify-between">
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
        />
        <MiniStats match={match} playerNum={1} key={1} currSet={currSet} />
      </div>
      <div className="flex items-center gap-x-5 flex-row-reverse lg:flex-row">
        <MiniStats match={match} playerNum={2} key={2} currSet={currSet} />
        <UserCard
          key={match.player_2_id}
          userId={match.player_2_id}
          variant="MatchDisplay"
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
  );
}

export default TopBar;
