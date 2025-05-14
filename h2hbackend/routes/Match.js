const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");
const { isLoggedIn } = require("../login/user");

function isPlaying(match, userId) {
  return match.player_1_id === userId || match.player_2_id === userId;
}

function matchIsOver(boSet, boSolve, p1TimesArr, p2TimesArr) {
  let setsWonP1 = 0;
  let setsWonP2 = 0;
  for (let i = 0; i < p1TimesArr.length; i++) {
    let solvesWonP1 = 0;
    let solvesWonP2 = 0;
    for (let j = 0; j < p1TimesArr[i].length; j++) {
      if (!p1TimesArr?.[i]?.[j] || !p2TimesArr?.[i]?.[j]) break;
      else if (p2TimesArr[i][j] === -1) solvesWonP1++;
      else if (p1TimesArr[i][j] === -1) solvesWonP2++;
      else if (p1TimesArr[i][j] < p2TimesArr[i][j]) solvesWonP1++;
      else if (p1TimesArr[i][j] > p2TimesArr[i][j]) solvesWonP2++;
    }
  }
}

// find out if sender is player 1 or 2 or neither (in this case reject,) then add time and change player turn.
// solve countdown is automatically updated by db
router.post("/addTime", isLoggedIn, async (req, res) => {
  const { matchId, newTime } = req.body;
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (error) return res.status(400).send(error);

  const userIsP1 = req.user.dbInfo.id === data.player_1_id;
  const userIsP2 = req.user.dbInfo.id === data.player_2_id;
  if (!userIsP1 && !userIsP2) {
    return res
      .status(401)
      .send("Cannot add times to games you aren't participating in");
  }

  const prevArr = userIsP1 ? data.player_1_times : data.player_2_times;
  const newArr = [...prevArr, newTime];
  if (userIsP1) {
    if (data.player_turn !== 1)
      return res.status(400).send("Cannot add a time out of turn!");

    const { error: addTimeError } = await supabase
      .from("matches")
      .update({ player_1_times: newArr })
      .eq("id", matchId);
    if (addTimeError) return res.status(400).send(addTimeError);
  } else if (userIsP2) {
    if (data.player_turn !== 2)
      return res.status(400).send("Cannot add a time out of turn!");

    const { error: addTimeError } = await supabase
      .from("matches")
      .update({ player_2_times: newArr })
      .eq("id", matchId);
    if (addTimeError) return res.status(400).send(addTimeError);
  }

  const newTurn = data.player_turn === 1 ? 2 : 1;
  const { error: changeTurnError } = await supabase
    .from("matches")
    .update({ player_turn: newTurn })
    .eq("id", matchId);

  if (changeTurnError) return res.status(400).send(changeTurnError);

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

  const prevArr = userIsP1 ? data.player_1_times : data.player_2_times;

  return res.status(200);
});

module.exports = router;
