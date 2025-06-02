import express from "express";
const router = express.Router();
import { supabase } from "../supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

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
      max_solves: Array(Number(match.best_of_set_format)).fill(
        Number(match.best_of_solve_format)
      ),
      event: match.event,
      countdown_secs: match.countdown_secs,
      status: "notstarted",
    })
    .select();
  // console.log(error);
  return { data, error };
}

router.post("/send", isLoggedIn, async (req, res) => {
  let { recipientId, boSetFormat, boSolveFormat, event, countdown_secs } =
    req.body;
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);
  console.log(recipientId, boSetFormat, boSolveFormat, event, countdown_secs);
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

  if (error) {
    res.status(500).json({ msg: "Could not send invite", error: error });
    return;
  }

  res.status(201).json(data);
});

router.post("/accept", isLoggedIn, async (req, res) => {
  const { inviteId } = req.body;
  const { data, error } = await supabase
    .from("matchinvites")
    .update({ status: "accepted" })
    .eq("id", Number.parseInt(inviteId, 10))
    .eq("recipient_user_id", req.user.dbInfo.id)
    .select()
    .single();

  if (error)
    return res
      .status(500)
      .send("Could not find this invite, may have been canceled or deleted");

  const { data: createMatchData, error: createMatchError } = createMatch(data);
  if (createMatchError) return res.status(500).send(createMatchError);
  return res.status(200).send(createMatchData);
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

  if (!error) return res.status(200);
  return res.status(500).send(error);
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

  if (!error) return res.status(200);
  return res.status(500).send(error);
});

export default router;
