const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isLoggedIn } = require("../login/user");

router.get("/wca", passport.authenticate("wca"));

router.get(
  "/wca/callback",
  passport.authenticate("wca", {
    successRedirect: process.env.ORIGIN,
    failureRedirect: "/auth/failure",
  })
);

router.get("/failure", (req, res) => {
  res.send("You did not log in successfully. Please try again");
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.logout(function (err) {
    if (err) res.error(err);
    req.session.destroy();
    res.redirect(process.env.ORIGIN);
  });
});

module.exports = router;
