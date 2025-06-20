import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";

router.get("/loggedInInfo", isLoggedIn, (req, res) => {
  res.json(req.user);
});

export default router;
