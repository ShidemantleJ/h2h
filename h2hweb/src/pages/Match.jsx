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
import Button from "../components/Button";
import InProgressMatch from "../components/Match/InProgressMatch";
import CompleteMatch from "../components/Match/CompleteMatch";

async function getMatch(matchId, setMatch) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) setMatch(null);
  else setMatch(data);
}

function Match(props) {
  let { matchId } = useParams();
  matchId = Number.parseInt(matchId, 10);
  const [match, setMatch] = useState({});
  const { user } = useContext(UserContext);
  const [modalOpen, setModalOpen] = useState(true);
  const [timeIsUp, setTimeIsUp] = useState(false);

  useEffect(() => {
    getMatch(matchId, setMatch);
  }, [matchId]);

  if (!match || !match.player_1_id || !match.created_at)
    return <div className="bg-zinc-900 w-full min-h-screen"></div>;
  const playerTimesArr =
    user?.dbInfo?.id === match.player_1_id
      ? match.player_1_times
      : match.player_2_times;
  const currSet = playerTimesArr.length || 1;
  const currSolve = playerTimesArr.at(-1).length + 1 || 1;

  if (match.status === 'ongoing' || match.status === 'notstarted') return <InProgressMatch match={match} matchId={matchId} setMatch={setMatch} />
  else return <CompleteMatch match={match} />
}

export default Match;
