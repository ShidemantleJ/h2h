import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;
import passport from "passport";
import "./login/passportconfig.js";
import cors from "cors";
import "./MatchMonitor.js";
import { supabase } from "./supabase.js";

const pgSession = connectPgSimple(session);

const app = express();

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
      maxAge: 1000 * 60 * 60 * 24 * 3, // Max cookie age of 3 days 
      // domain: "localhost",
      rolling: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

import userRoute from "./routes/User.js";
import authRoute from "./routes/Auth.js";
import friendRoute from "./routes/Friend.js";
import matchInviteRoute from "./routes/MatchInvite.js";
import matchRoute from "./routes/Match.mjs";
app.use("/user", userRoute);
app.use("/auth", authRoute);
app.use("/friend", friendRoute);
app.use("/matchInvite", matchInviteRoute);
app.use("/match", matchRoute);

app.listen(5000, () => console.log("Listening on port 5000"));
