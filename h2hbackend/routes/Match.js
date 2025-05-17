const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");
const { isLoggedIn } = require("../login/user");
// import { randomScrambleForEvent } from "cubing";

function isPlaying(match, userId) {
  return match.player_1_id === userId || match.player_2_id === userId;
}

function wonSet(boSolve, p1timesarr, p2timesarr) {}

const getMatch = async (matchId) => {
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  return { match, matchError };
};

// find out if sender is player 1 or 2 or neither (in this case reject,) then add time and change player turn.
// solve countdown is automatically updated by db
router.post("/addTime", isLoggedIn, async (req, res) => {
  const { matchId, newTime } = req.body;
  // Get match data
  const { match, matchError } = await getMatch(matchId);
  if (matchError) return res.status(400).send(matchError);

  // TODO: check if countdown has passed or match is over

  // Check if user is participating in match
  const userIsP1 = req.user.dbInfo.id === match.player_1_id;
  const userIsP2 = req.user.dbInfo.id === match.player_2_id;
  if (!userIsP1 && !userIsP2) {
    return res
      .status(401)
      .send("Cannot add times to games you aren't participating in");
  }

  // Check if it's the user's turn
  if (
    (userIsP1 && match.player_turn !== 1) ||
    (userIsP2 && match.player_turn !== 2)
  )
    return res.status(400).send("Cannot add a time out of turn!");

  // Get previous time array (2D) and update
  const prevTimeArr = (userIsP1
    ? match.player_1_times
    : match.player_2_times) || [[]];
  let newTimeArr = prevTimeArr;
  console.log(newTimeArr);
  if (newTimeArr.length === 0) newTimeArr[0].push(newTime);
  else newTimeArr[newTimeArr.length - 1].push(newTime);

  // Get previous scramble array (2D) and update
  const currSet = newTimeArr.length;
  const currSolve = newTimeArr[newTimeArr.length - 1].length;
  const prevScrambleArr = match.scrambles || [[]];
  // if (prevScrambleArr?.[currSet]?.[currSolve] === undefined) {
  //   const scramble = await randomScrambleForEvent(match.event);
  //   console.log(scramble);
  // }

  // Push updated array, new turn, and current time to DB
  const newTurn = (currSet + currSolve) % 2 === 0 ? 2 : 1;
  const currTime = new Date().toUTCString();
  if (userIsP1) {
    const { error: addTimeError } = await supabase
      .from("matches")
      .update({
        player_1_times: newTimeArr,
        player_turn: newTurn,
        countdown_timestamp: currTime,
      })
      .eq("id", matchId);
    if (addTimeError) return res.status(400).send(addTimeError);
  } else if (userIsP2) {
    const { error: addTimeError } = await supabase
      .from("matches")
      .update({
        player_2_times: newTimeArr,
        player_turn: newTurn,
        countdown_timestamp: currTime,
      })
      .eq("id", matchId);
    if (addTimeError) return res.status(400).send(addTimeError);
  }

  // TODO: check for win
  return res.status(200);
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

  const prevTimeArr = userIsP1 ? data.player_1_times : data.player_2_times;

  return res.status(200);
});

module.exports = router;
