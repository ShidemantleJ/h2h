import passport from "passport";
import { findOrCreateUser } from "./user.js";
import WCAStrategy from "passport-wca";

// https://github.com/thewca/wca-oauth/tree/master/node/passport-wca
passport.use(
  new WCAStrategy(
    {
      clientID: process.env.WCA_CLIENT_ID,
      clientSecret: process.env.WCA_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/auth/wca/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      findOrCreateUser(profile);
      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (sessionInfo, done) {
  try {
    const dbInfo = await findOrCreateUser(sessionInfo);
    if (dbInfo === null) return null
    const result = {
      dbInfo: dbInfo
    };
    done(null, result);
  } catch (e) {
    done(e);
  }
});
