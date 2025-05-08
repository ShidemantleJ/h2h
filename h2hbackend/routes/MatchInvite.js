const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");
const { isLoggedIn } = require("../login/user");

// TODO: finish create match function
async function createMatch(match) {
    const {data, error} = await supabase
    .from("Matches")
    .insert({
        player_1_id: match.player_1_id,
        player_2_id: match.player_2_id,
        best_of_set_format: match.boSetFormat,
        best_of_solve_format: match.boSolveFormat,
        event: match.event,
        time_limit: match.timeLimit,
    })
}

// friend.js /sendreq endpoint referenced to write this
router.post("/send", isLoggedIn, async (req, res) => {
  let { recipientId, boSetFormat, boSolveFormat, event, timeLimit } = req.body;
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);

  const { data, error } = await supabase
    .from("MatchInvites")
    .insert({
      player_1_id: senderId,
      player_2_id: recipientId,
      best_of_set_format: boSetFormat,
      best_of_solve_format: boSolveFormat,
      event: event,
      time_limit: timeLimit,
    })
    .select("*");

  if (error) {
    res.status(404).json({ msg: "Could not send invite", error: error });
    return;
  }

  res.status(201).json(data);
});

router.post("/accept", isLoggedIn, async (req, res) => {
  const { inviteId } = req.body;
  const { inviteData, fetchError } = await supabase
    .from("MatchInvites")
    .select("*")
    .eq("id", Number.parseInt(inviteId, 10))
    .single();

  if (fetchError)
    res
      .status(404)
      .send("Could not find this invite, could have been canceled or deleted");

  const { deleteError } = await supabase
    .from("MatchInvites")
    .delete()
    .eq("id", Number.parseInt(inviteId));

  if (deleteError)
    res.status(404).send("Could not remove invite and create match");

  createMatch(inviteData);
});

module.exports = router;
