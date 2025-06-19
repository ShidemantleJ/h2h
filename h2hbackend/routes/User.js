import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
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

export default router;
