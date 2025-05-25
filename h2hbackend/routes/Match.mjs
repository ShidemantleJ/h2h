import express from "express";
const router = express.Router();
import { supabase } from "../supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";
import { randomScrambleForEvent } from "cubing/scramble";

function isPlaying(match, userId) {
  return match.player_1_id === userId || match.player_2_id === userId;
}
// Returns 0 if first time won, 1 if second time won, -1 if invalid, -2 if same time
function whoWonSolve(solve1, solve2) {
  if (isNaN(solve1) || isNaN(solve2)) return -1;
  else if (solve2 === solve1) return -2;
  else if (solve2 === -1) return 0;
  else if (solve1 === -1) return 1;
  else if (solve1 < solve2) return 0;
  else if (solve2 < solve1) return 1;
}

function wonSet(boSolve, p1setarr, p2setarr) {
  const solvesToWin = Math.ceil((boSolve + 1) / 2);
  if (
    !p1setarr ||
    !p1setarr ||
    p1setarr?.length !== p2setarr?.length ||
    p1setarr?.length < solvesToWin
  )
    return "SET_NOT_OVER";
  let solvesWonArr = [0, 0];
  for (let i = 0; i < p1setarr.length; i++) {
    const winningPlayer = whoWonSolve(p1setarr[i], p2setarr[i]);
    if (winningPlayer < 0) continue;
    solvesWonArr[winningPlayer]++;
    console.assert(winningPlayer === 0 || winningPlayer === 1);
  }
  if (solvesWonArr[0] >= solvesToWin) return "P1_WON";
  else if (solvesWonArr[1] >= solvesToWin) return "P2_WON";
  return "SET_NOT_OVER";
}

function gameOver(boSolve, boSet, p1timearr, p2timearr) {
  const setsToWin = Math.ceil(boSet / 2);
  if (Math.min(p1timearr.length, p2timearr.length) < Math.ceil(boSet / 2))
    return "ongoing";

  const setsWon = [0, 0];
  for (let i = 0; i < boSet; i++) {
    if (wonSet(boSolve, p1timearr[i], p2timearr[i]) === "P1_WON") setsWon[0]++;
    else if (wonSet(boSolve, p1timearr[i], p2timearr[i]) === "P2_WON")
      setsWon[0]++;
    if (setsWon[0] >= setsToWin) return "P1_WON";
    else if (setsWon[1] >= setsToWin) return "P2_WON";
  }
  return "ongoing";
}

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
  if (matchError) return res.status(500).send(matchError);
  // console.log("Got match");

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

  // Check if user is participating in match
  const userIsP1 = req.user.dbInfo.id === match.player_1_id;
  const userIsP2 = req.user.dbInfo.id === match.player_2_id;
  if (!userIsP1 && !userIsP2) {
    return res
      .status(401)
      .send("Cannot add times to games you aren't participating in");
  }
  // console.log("Found out that user is participating");

  // Check if it's the user's turn
  if (
    (userIsP1 && match.player_turn !== 1) ||
    (userIsP2 && match.player_turn !== 2)
  )
    return res.status(400).send("Cannot add a time out of turn!");
  // console.log("Found out it's the user's turn");

  // Get previous time array (2D) and update
  const prevP1TimeArr = structuredClone(match.player_1_times);
  const prevP2TimeArr = structuredClone(match.player_2_times);
  let newP1TimeArr = structuredClone(prevP1TimeArr);
  let newP2TimeArr = structuredClone(prevP2TimeArr);
  if (newP1TimeArr.length !== 0 || newP2TimeArr.length !== 0)
    console.assert(
      newP1TimeArr.length - 1 >= 0 || newP2TimeArr.length - 1 >= 0
    );
  if (userIsP1) {
    if (newP1TimeArr.length === 0) newP1TimeArr.push([newTime]);
    else newP1TimeArr[newP1TimeArr.length - 1].push(newTime);
  } else if (userIsP2) {
    if (newP2TimeArr.length === 0) newP2TimeArr.push([newTime]);
    else newP2TimeArr[newP2TimeArr.length - 1].push(newTime);
  }
  // console.log(
  // whoWonSolve(newP1TimeArr.at(-1).at(-1), newP2TimeArr.at(-1).at(-1))
  // );
  // console.log(newP1TimeArr.at(-1).at(-1), newP2TimeArr.at(-1).at(-1));
  let newBoSolveFormat = structuredClone(match.best_of_solve_format);
  if (
    whoWonSolve(newP1TimeArr.at(-1).at(-1), newP2TimeArr.at(-1).at(-1)) === -2
  ) {
    // console.log("increasing bosolve format");
    newBoSolveFormat[newP1TimeArr.length - 1]++;
  }
  if (
    wonSet(
      newBoSolveFormat[newP1TimeArr.length - 1],
      newP1TimeArr[newP1TimeArr.length - 1],
      newP2TimeArr[newP2TimeArr.length - 1]
    ) !== "SET_NOT_OVER"
  ) {
    newP1TimeArr.push([]);
    newP2TimeArr.push([]);
  }
  // console.log("Updated time array");

  // Get previous scramble array (2D) and update
  const currSet = Math.max(newP1TimeArr.length, newP2TimeArr.length);
  const currSolve = Math.max(
    newP1TimeArr[newP1TimeArr.length - 1].length,
    newP2TimeArr[newP2TimeArr.length - 1].length
  );
  const prevScrambleArr = structuredClone(match.scrambles) || [[]];
  let newScrambleArr = structuredClone(prevScrambleArr);
  // If scramble array doesn't contain a subarray for the current set, create subarray
  // and add scramble to the subarray
  if (!Array.isArray(prevScrambleArr[currSet - 1])) {
    let scramble;
    try {
      scramble = await randomScrambleForEvent(match.event);
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to generate scramble");
    }
    newScrambleArr.push([scramble.toString()]);
  } else if (prevScrambleArr[currSet - 1].length <= currSolve) {
    let scramble;
    try {
      scramble = await randomScrambleForEvent(match.event);
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to generate scramble");
    }
    newScrambleArr?.[currSet - 1]?.push(scramble.toString());
  }
  // console.log("Updated scramble array");

  // Push updated array, new turn, and current time to DB
  const newTurn = (currSet + currSolve) % 2 === 0 ? 2 : 1;
  const currTime = new Date().toUTCString();
  let status = "ongoing";
  // Check if anybody has won:
  const gameOverState = gameOver(
    newBoSolveFormat,
    match.best_of_set_format,
    newP1TimeArr,
    newP2TimeArr
  );

  const { error: addTimeError } = await supabase
    .from("matches")
    .update({
      player_1_times: newP1TimeArr,
      player_2_times: newP2TimeArr,
      player_turn: newTurn,
      countdown_timestamp: currTime,
      scrambles: newScrambleArr,
      best_of_solve_format: newBoSolveFormat,
    })
    .eq("id", matchId);
  if (addTimeError) return res.status(400).send(addTimeError);
  // console.log("Added times, turn, countdown, scrambles\n\n");

  return res.status(200).send("OK");
});

router.post("/addDNFForOpponent", isLoggedIn, async (req, res) => {
  const { matchId } = req.body;
  const { match, matchError } = await getMatch(matchId);

  if (matchError) return res.status(500).send(matchError);

  const requesterIsP1 = match.player_1_id === req.user.dbInfo.id;
  const requesterIsP2 = match.player_2_id === req.user.dbInfo.id;

  if (!requesterIsP1 && !requesterIsP2)
    return res
      .status(400)
      .send("Cannot add a time for a match you aren't participating in!");

  // Check if opponent should be DNF'd (if the time has run out)
  if (
    match.countdown_secs -
      Math.floor(
        (new Date().getTime() - new Date(match.countdown_timestamp).getTime()) /
          1000
      ) <
      0 && match.player_turn === requesterIsP1
      ? 2
      : 1
  ) {
    let opponentTimeArr = requesterIsP1
      ? structuredClone(match.player_2_times)
      : structuredClone(match.player_1_times);

    const currSetIndex = opponentTimeArr.length - 1;
    opponentTimeArr[currSetIndex].push(-1);
    const { error: updateTimesErr } = await supabase.from("matches").update({
      player_turn: match.player_turn === 1 ? 2 : 1,
      player_1_times: requesterIsP1 ? match.player_1_times : opponentTimeArr,
      player_2_times: requesterIsP2 ? match.player_2_times : opponentTimeArr,
      countdown_timestamp: new Date().toUTCString(),
    });
    return res.status(200);
  }

  return res.status(500);
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
    .update({ status: "ongoing" })
    .eq("status", "notstarted")
    .eq("id", matchId)
    .select()
    .single();

  if (error || !data) return res.status(500).send(error);

  const firstScramble = await randomScrambleForEvent(data.event);
  const { error: addScrambleErr } = await supabase
    .from("matches")
    .update({
      scrambles: [[firstScramble.toString()]],
      countdown_timestamp: new Date().toUTCString(),
    })
    .eq("id", matchId);

  if (addScrambleErr) return res.status(500).send(addScrambleErr);

  return res.status(200);
});

export default router;
