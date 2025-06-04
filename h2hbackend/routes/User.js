import express from "express";
const router = express.Router();
import { supabase } from "../supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

router.get("/loggedInInfo", isLoggedIn, (req, res) => {
  res.json(req.user);
});

router.get("/userPublic", async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("name, wcaid, created_at, profile_pic_url")
    .eq("id", req.query.id)
    .maybeSingle();
  res.send(data);

  // console.log(data);
  // console.error(error);
});

// Todo: remove endpoint and test (handled in client)
router.get("/userSearch", async (req, res) => {
  try {
    // console.log(req.query.term);
    if (req.query.term === "") return;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`wcaid.ilike.%${req.query.term}%, name.ilike.%${req.query.term}%`)
      .limit(5);
    // console.log(data, req.query.term);
    // console.log(error);
    res.send(data);
  } catch (e) {
    console.error(e);
  }
});

export default router;
