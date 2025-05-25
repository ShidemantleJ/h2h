import express from "express";
const router = express.Router();
import { supabase } from "../supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

async function removeFriend(userId, friendId) {
  if (!userId || !friendId || isNaN(userId) || isNaN(friendId)) {
    console.error("userid or friendid are undefined");
  }
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
  recipientId = Number.parseInt(recipientId, 10);
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);

  if (!recipientId || !senderId || isNaN(recipientId) || isNaN(senderId)) {
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
  senderId = Number.parseInt(senderId, 10);
  const recipientId = Number.parseInt(req.user.dbInfo.id);

  const { error } = await supabase
    .from("friendreqs")
    .update({ status: "accepted" })
    .eq("sender_user_id", senderId)
    .eq("recipient_user_id", recipientId)
    .eq("status", "pending");

  if (error) return res.status(500).send("Could not find friend request");
  return res.status(200).send("You are now friends");
});

router.post("/declineReq", isLoggedIn, async (req, res) => {
  let { senderId } = req.body;
  senderId = Number.parseInt(senderId, 10);
  const recipientId = Number.parseInt(req.user.dbInfo.id);

  const { error } = await supabase
    .from("friendreqs")
    .update({ status: "declined" })
    .eq("sender_user_id", senderId)
    .eq("recipient_user_id", recipientId)
    .eq("status", "pending");

  if (error) {
    console.error(error);
    return res.status(500).send("Could not find friend request");
  }
  return res.status(200).send("Friend request declined");
});

router.post("/cancelReq", isLoggedIn, async (req, res) => {
  let { recipientId } = req.body;
  recipientId = Number.parseInt(recipientId, 10);
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);

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
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);
  let { friendId } = req.body;
  friendId = Number.parseInt(friendId, 10);
  console.log(senderId, friendId);
  const error = await removeFriend(senderId, friendId);

  return error
    ? res.status(400).send(error)
    : res.status(200).send("Friend removed");
});

export default router;
