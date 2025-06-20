import express from "express";
const router = express.Router();
import { supabase } from "../db/supabase.js";
import { isLoggedIn, findOrCreateUser } from "../login/user.js";
import passport from "passport";

router.get("/wca", passport.authenticate("wca"));

router.get(
  "/wca/callback",
  passport.authenticate("wca", { failureRedirect: "/failure" }),
  function (req, res) {
    return res.redirect(process.env.ORIGIN);
  }
);

router.get("/failure", (req, res) => {
  console.error("Authentication failed:", req.session.messages);
  return res.send("You did not log in successfully. Please try again");
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    req.session.destroy();
    return res.redirect(process.env.ORIGIN);
  });
});

export default router;
