const passport = require("passport");
const { findOrCreateUser } = require("./user");

const WCAStrategy = require("passport-wca").Strategy;

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
    const result = {
      dbInfo: dbInfo[0],
      sessionInfo: sessionInfo,
    };
    done(null, result);
  } catch (e) {
    done(e);
  }
});
