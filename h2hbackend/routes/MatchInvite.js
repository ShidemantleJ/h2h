import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

// Re-checks all invite metadata
function validateInvite(
  setFormat,
  solveFormat,
  selectedEvent,
  minutes,
  seconds
) {
  let error = "";
  // console.log(setFormat, solveFormat, selectedEvent, minutes, seconds);
  if (isNaN(Number(setFormat)) || Number(setFormat) < 1)
    error += "Set format must be a whole number greater than or equal to 1\n";
  if (isNaN(Number(solveFormat)) || Number(solveFormat) < 1)
    error += "Solve format must be a whole number greater than or equal to 1\n";
  if (isNaN(Number(minutes)) || Number(minutes) < 0)
    error += "Minutes must be zero or a positive whole number\n";
  if (isNaN(Number(seconds)) || Number(seconds) < 0)
    error += "Seconds must be zero or a positive whole number\n";
  if (Number(seconds) + Number(minutes) * 60 < 10)
    error += "There must be at least 10 seconds allowed between solves.\n";

  if (error !== "") {
    return false;
  } else return true;
}

// Creates skeleton for match until it's started
async function createMatch(match) {
  const senderGoesFirst = Math.round(Math.random());

  const { data, error } = await supabase
    .from("matches")
    .insert({
      id: match.id,
      player_1_id: senderGoesFirst
        ? match.sender_user_id
        : match.recipient_user_id,
      player_2_id: senderGoesFirst
        ? match.recipient_user_id
        : match.sender_user_id,
      best_of_set_format: match.best_of_set_format,
      best_of_solve_format: match.best_of_solve_format,
      // Creates array of best_of_set size, each element is best_of_solve_format.
      // This allows the max_solves to be increased if two players get same result.
      max_solves: Array(Number(match.best_of_set_format)).fill(
        Number(match.best_of_solve_format)
      ),
      event: match.event,
      countdown_secs: match.countdown_secs,
      status: "notstarted",
    })
    .select();
  return { data, error };
}

// Sends match invite with metadata from requestor
router.post("/send", isLoggedIn, async (req, res) => {
  let { recipientId, boSetFormat, boSolveFormat, event, countdown_secs } =
    req.body;
  const senderId = req.user.dbInfo.id;
  if (!validateInvite(boSetFormat, boSolveFormat, event, 0, countdown_secs))
    return res.status(400).send("Invite invalid.");

  const { data, error } = await supabase
    .from("matchinvites")
    .insert({
      sender_user_id: senderId,
      recipient_user_id: recipientId,
      best_of_set_format: Number(boSetFormat),
      best_of_solve_format: boSolveFormat,
      event: event,
      countdown_secs: Number(countdown_secs),
    })
    .select("*");

  return error
    ? res.status(500).json({ msg: "Could not send invite", error: error })
    : res.status(201).json(data);
});

router.post("/accept", isLoggedIn, async (req, res) => {
  const { inviteId } = req.body;

  // First checks if user is already in an ongoing match (in this case, not allowed to join a new one)
  const { data: inProgressMatchData, error: matchDataErr } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "ongoing")
    .or(
      `player_1_id.eq.${req.user.dbInfo.id},player_2_id.eq.${req.user.dbInfo.id}`
    );

  if (inProgressMatchData[0]?.id) {
    // Sends id, allowing frontend to prompt the user to rejoin or resign existing match
    return res.status(418).send(inProgressMatchData[0]?.id);
  }

  // If user not already in match, accept the invite
  const { data, error } = await supabase
    .from("matchinvites")
    .update({ status: "accepted" })
    .eq("id", inviteId)
    .eq("recipient_user_id", req.user.dbInfo.id)
    .select()
    .single();

  if (error)
    return res
      .status(500)
      .send("Could not find this invite, may have been canceled or deleted");

  const { data: createMatchData, error: createMatchError } = createMatch(data);
  return createMatchError
    ? res.status(500).send(createMatchError)
    : res.status(200);
});

router.post("/decline", isLoggedIn, async (req, res) => {
  const { inviteId } = req.body;
  const { error } = await supabase
    .from("matchinvites")
    .update({ status: "declined" })
    .eq("id", inviteId)
    .or(
      `sender_user_id.eq.${req.user.dbInfo.id},recipient_user_id.eq.${req.user.dbInfo.id}`
    );

  return error ? res.status(500).send(error) : res.status(200);
});

router.post("/cancel", isLoggedIn, async (req, res) => {
  const { inviteId } = req.body;
  const { error } = await supabase
    .from("matchinvites")
    .update({ status: "canceled" })
    .eq("id", inviteId)
    .or(
      `sender_user_id.eq.${req.user.dbInfo.id},recipient_user_id.eq.${req.user.dbInfo.id}`
    );

  return error ? res.status(500).send(error) : res.status(200);
});

export default router;
