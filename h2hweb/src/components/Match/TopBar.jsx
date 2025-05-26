import React, { useEffect, useState, useContext } from "react";
import UserCard from "../UserCard";
import CountdownTimer from "./CountdownTimer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UserContext } from "../../user/UserContext";
import axios from "axios";

function TopBar(props) {
  const match = props.match;
  const countdownTimestamp = match.countdown_timestamp;
  const countdownSecs = match.countdown_secs;
  const playerTurn = match.player_turn;
  const { user } = useContext(UserContext);

  const [p1countdownIsUp, setP1CountdownIsUp] = useState(false);
  const [p2countdownIsUp, setP2CountdownIsUp] = useState(false);

  return (
    <div className="flex p-2 items-center">
      <CountdownTimer
        player={1}
        turn={playerTurn}
        countdownSecs={countdownSecs}
        timestamp={countdownTimestamp}
        setTimeIsUp={setP1CountdownIsUp}
      />
      <UserCard
        key={match.player_1_id}
        className=""
        variant="MatchDisplay"
        userId={match.player_1_id}
      />
      <p className="my-auto mx-auto font-bold text-xl">vs</p>
      <UserCard
        key={match.player_2_id}
        className=""
        variant="MatchDisplay"
        userId={match.player_2_id}
      />
      <CountdownTimer
        player={2}
        turn={playerTurn}
        countdownSecs={countdownSecs}
        timestamp={countdownTimestamp}
        setTimeIsUp={setP2CountdownIsUp}
      />
    </div>
  );
}

export default TopBar;
