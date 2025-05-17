require("dotenv").config();
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const passport = require("passport");
require("./login/passportconfig");
const app = express();
const cors = require("cors");
const { supabase } = require("./supabase");

const pgPool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  })
);

app.use(
  session({
    store: new pgSession({
      pool: pgPool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    secure: true,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
      domain: "localhost",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const userRoute = require("./routes/User");
const authRoute = require("./routes/Auth");
const friendRoute = require("./routes/Friend");
const matchInviteRoute = require("./routes/MatchInvite");
const matchRoute = require("./routes/Match");
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/friend", friendRoute);
app.use("/matchInvite", matchInviteRoute);
app.use("/match", matchRoute);

app.listen(5000, () => console.log("Listening on port 5000"));
