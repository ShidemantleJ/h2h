import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

async function removeFriend(userId, friendId) {
  if (!userId || !friendId) {
    console.error("userid or friendid are undefined");
  }
  // Removes row where user1_id and user2_id are some combination of userId (requestor) and friendId (friend to be removed)
  const { error } = await supabase
    .from("friends")
    .delete()
    .or(
      `and(user1_id.eq.${userId},user2_id.eq.${friendId}),and(user2_id.eq.${userId},user1_id.eq.${friendId})`
    );
  console.error(error);
  return error;
}

router.post("/sendReq", isLoggedIn, async (req, res) => {
  let { recipientId } = req.body;
  const senderId = req.user.dbInfo.id;

  if (!recipientId || !senderId) {
    return res.status(400).send("Improper recipient/sender id");
  }

  const { error } = await supabase.from("friendreqs").insert({
    sender_user_id: senderId,
    recipient_user_id: recipientId,
  });

  return error
    ? res.status(500).send(error)
    : res.status(200).send("Friend request sent");
});

router.post("/acceptReq", isLoggedIn, async (req, res) => {
  let { senderId } = req.body;
  const recipientId = req.user.dbInfo.id;

  const { error } = await supabase
    .from("friendreqs")
    .update({ status: "accepted" })
    .eq("sender_user_id", senderId)
    .eq("recipient_user_id", recipientId)
    .eq("status", "pending");

  return error
    ? res.status(500).send("Error accepting friend request")
    : res.status(200).send("Friend request accepted");
});

router.post("/declineReq", isLoggedIn, async (req, res) => {
  let { senderId } = req.body;
  const recipientId = req.user.dbInfo.id;

  const { error } = await supabase
    .from("friendreqs")
    .update({ status: "declined" })
    .eq("sender_user_id", senderId)
    .eq("recipient_user_id", recipientId)
    .eq("status", "pending");

  return error
    ? res.status(500).send("Error declining friend request")
    : res.status(200).send("Friend request declined");
});

router.post("/cancelReq", isLoggedIn, async (req, res) => {
  let { recipientId } = req.body;
  const senderId = req.user.dbInfo.id;

  const { error } = await supabase
    .from("friendreqs")
    .update({ status: "canceled" })
    .eq("sender_user_id", senderId)
    .eq("recipient_user_id", recipientId)
    .eq("status", "pending");

  return error
    ? res.status(500).send("Request could not be canceled")
    : res.status(200).send("Request has been canceled");
});

router.post("/removeFriend", isLoggedIn, async (req, res) => {
  const senderId = req.user.dbInfo.id;
  let { friendId } = req.body;
  const error = await removeFriend(senderId, friendId);

  return error
    ? res.status(400).send(error)
    : res.status(200).send("Friend removed");
});

export default router;
