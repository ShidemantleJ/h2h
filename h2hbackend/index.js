import "dotenv/config";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import pgPool from "./db/pg.js";
import "./login/passportconfig.js";
import cors from "cors";

const pgSession = connectPgSimple(session);

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
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
    rolling: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 3, // Max cookie age of 3 days
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

app.get("/", async (req, res) => {
  return res.status(200).send("reached h2hbackend");
});

if (process.env.DEVELOPMENT !== "true")
  app.listen(5000, () => console.log("Listening on port 5000"));

export default app;
