const express = require("express");
const router = express.Router();
const { supabase } = require("../supabase");
const { isLoggedIn } = require("../login/user");

// option === 'add' to add req, 'remove' to remove req
async function modifyOutgoingReq(senderId, recipientId, option) {
  // Get sender's array of outgoing friend requests
  const { data, error } = await supabase
    .from("Users")
    .select("friend_reqs_outgoing")
    .eq("id", senderId)
    .single();
  console.error(error);

  // Update sender's array of outgoing friend requests
  const prevOutArray = data?.friend_reqs_outgoing || [];
  const newOutArray =
    option === "add"
      ? [...(prevOutArray || []), recipientId]
      : [...prevOutArray.filter((id) => id !== recipientId)];
  if (newOutArray) {
    const { error } = await supabase
      .from("Users")
      .update({ friend_reqs_outgoing: newOutArray })
      .eq("id", senderId);
    console.error(error);
  }
}

// option === 'add' to add req, 'remove' to remove req
async function modifyIncomingReq(senderId, recipientId, option) {
  // Get recipient's array of incoming friend requests
  const { dataIn, errorIn } = await supabase
    .from("Users")
    .select("friend_reqs_incoming")
    .eq("id", recipientId)
    .single();
  console.error(errorIn);

  const prevInArray = dataIn?.friend_reqs_incoming || [];
  const newInArray =
    option === "add"
      ? [...(prevInArray || []), senderId]
      : [...prevInArray.filter((id) => id !== senderId)];
  console.log(newInArray);
  if (newInArray) {
    const { error } = await supabase
      .from("Users")
      .update({ friend_reqs_incoming: newInArray })
      .eq("id", recipientId);
    console.error(error);
  }
}

async function addFriend(userId, friendId) {
  const { data, error } = await supabase
    .from("Users")
    .select("friends")
    .eq("id", userId)
    .single();

  const prevFriendArr = data?.friends || [];
  const newFriendArr = [...prevFriendArr, friendId];
  if (newFriendArr) {
    const { error } = await supabase
      .from("Users")
      .update({ friends: newFriendArr })
      .eq("id", userId);
  }
}

router.post("/sendReq", isLoggedIn, async (req, res) => {
  let { recipientId } = req.body;
  const senderId = Number.parseInt(req.user.dbInfo.id, 10);
  recipientId = Number.parseInt(recipientId, 10);
  if (recipientId === senderId) {
    return res.status(404).send();
  }
  if (recipientId !== undefined) {
    modifyOutgoingReq(senderId, recipientId, "add");
    modifyIncomingReq(senderId, recipientId, "add");
  }
});

// Remove outgoing from sender, remove incoming from recipient
router.post("/acceptReq", isLoggedIn, async (req, res) => {
  let { senderId } = req.body;
  senderId = Number.parseInt(senderId, 10);
  const recipientId = req.user.dbInfo.id;

  modifyOutgoingReq(senderId, recipientId, "remove");
  modifyIncomingReq(senderId, recipientId, "remove");

  addFriend(senderId, recipientId);
  addFriend(recipientId, senderId);
});

router.post("/cancelReq", isLoggedIn, async (req, res) => {
  let { recipientId } = req.body;
  recipientId = Number.parseInt(recipientId, 10);
  const senderId = req.user.dbInfo.id;

  modifyOutgoingReq(senderId, recipientId, "remove");
  modifyIncomingReq(senderId, recipientId, "remove");
});

module.exports = router;
