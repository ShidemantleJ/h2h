import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabase";
import { UserContext } from "../user/UserContext";
import InProgressMatch from "../components/Match/InProgressMatch";
import CompleteMatch from "../components/Match/CompleteMatch";

async function getMatch(matchId, setMatch) {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      *,
      player1:users!matches_player_1_id_fkey(id, name),
      player2:users!matches_player_2_id_fkey(id, name)
      `
    )
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

  useEffect(() => {
    getMatch(matchId, setMatch);
  }, [matchId]);

  if (!match || !match.player_1_id || !match.created_at)
    return <div className="bg-zinc-900 w-full min-h-dvh flex items-center justify-center font-bold text-white text-2xl">Error: Match not found</div>;

  if (match.status === "ongoing" || match.status === "notstarted")
    return (
      <InProgressMatch match={match} matchId={matchId} setMatch={setMatch} />
    );
  else return <CompleteMatch match={match} />;
}

export default Match;
