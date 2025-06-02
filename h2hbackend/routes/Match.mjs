import express from "express";
const router = express.Router();
import { supabase } from "../supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";
import { randomScrambleForEvent } from "cubing/scramble";
import {
  getNewScrambleArr,
  getGameState,
  getMatch,
  getNewTurn,
  getUpdatedTimeArr,
} from "../helpers/matchHelpers.js";

router.post("/addTime", isLoggedIn, async (req, res) => {
  const { matchId, newTime } = req.body;

  // Get match data
  const { match, matchError } = await getMatch(matchId);
  if (matchError) return res.status(500).send(matchError);

  // Check if match is ongoing
  if (match.status !== "ongoing")
    return res.status(400).send("This match has concluded.");

  // Check if user is participating in match
  const userIsP1 = req.user.dbInfo.id === match.player_1_id;
  const userIsP2 = req.user.dbInfo.id === match.player_2_id;
  if (!userIsP1 && !userIsP2) {
    return res
      .status(401)
      .send("Cannot add times to games you aren't participating in");
  }

  // Check if countdown has passed
  if (
    match.countdown_secs -
      Math.floor(
        (new Date().getTime() - new Date(match.countdown_timestamp).getTime()) /
          1000
      ) <
    0
  ) {
    return res.status(400).send("Countdown has passed.");
  }

  // Check if it's the user's turn
  if (
    (userIsP1 && match.player_turn !== 1) ||
    (userIsP2 && match.player_turn !== 2)
  )
    return res.status(400).send("Cannot add a time out of turn!");

  // Get previous time array (2D) and update
  const { newP1TimeArr, newP2TimeArr, newMaxSolves } = getUpdatedTimeArr(
    match,
    newTime,
    userIsP1,
    userIsP2
  );

  // Get new scramble array and update
  const newScrambleArr = await getNewScrambleArr(
    match,
    newP1TimeArr,
    newP2TimeArr
  );

  // Get next player_turn, current time, and game state
  const newTurn = getNewTurn(newP1TimeArr, newP2TimeArr);
  const currTime = new Date().toUTCString();
  const gameState = getGameState(
    match.best_of_solve_format,
    match.best_of_set_format,
    newP1TimeArr,
    newP2TimeArr
  );

  const { data: newMatch, error: addTimeError } = await supabase
    .from("matches")
    .update({
      player_1_times: newP1TimeArr,
      player_2_times: newP2TimeArr,
      player_turn: newTurn,
      countdown_timestamp: currTime,
      scrambles: newScrambleArr,
      max_solves: newMaxSolves,
      status: gameState,
    })
    .eq("id", matchId)
    .select()
    .single();
  if (addTimeError) return res.status(400).send(addTimeError);

  return res.status(200).send("OK");
});

router.post("/modifyTime", isLoggedIn, async (req, res) => {
  const { setNum, solveNum, matchId } = req.body;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();
  const userIsP1 = req.user.dbInfo.id === data.player_1_id;
  const userIsP2 = req.user.dbInfo.id === data.player_2_id;

  if (!userIsP1 && !userIsP2)
    return res
      .status(400)
      .send("Cannot modify times in a match you aren't participating in");

  return res.status(200).send("OK");
});

router.post("/startMatch", isLoggedIn, async (req, res) => {
  const { matchId } = req.body;

  const { data, error } = await supabase
    .from("matches")
    .update({
      status: "ongoing",
      countdown_timestamp: new Date().toUTCString(),
    })
    .eq("status", "notstarted")
    .eq("id", matchId)
    .select()
    .single();

  if (error || !data) return res.status(500).send(error);

  const firstScramble = await randomScrambleForEvent(data.event);
  const { data: match, error: addScrambleErr } = await supabase
    .from("matches")
    .update({
      scrambles: [[firstScramble.toString()]],
    })
    .eq("id", matchId)
    .select()
    .single();

  if (addScrambleErr) return res.status(500).send(addScrambleErr);

  return res.status(200);
});

export default router;
