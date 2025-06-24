import React, { useEffect, useState, useContext, memo } from "react";
import { getUserInfo } from "../utils/dbutils";
import Button from "./Button";
import { getEventNameFromId } from "../lib/events";
import axios from "axios";
import { getMatchScore } from "../helpers/matchHelpers";
import { toast } from "react-toastify";
import { getStatsLast10Matches } from "../utils/userStats";
import { OnlineUsersContext } from "../user/OnlineUsersContext";

function declineReq(inviteId) {
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URL}/matchInvite/decline`,
      { inviteId: inviteId },
      { withCredentials: true }
    )
    .then((res) => {
      return res.data;
    });
}

function cancelReq(inviteId) {
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URL}/matchInvite/cancel`,
      { inviteId: inviteId },
      { withCredentials: true }
    )
    .then((res) => {
      return res.data;
    });
}

async function resignFromMatch(matchId) {
  await axios
    .post(
      `${import.meta.env.VITE_BACKEND_URL}/match/resign`,
      { matchId: matchId },
      { withCredentials: true }
    )
    .then((res) => {
      // console.log(res);
      return res.data;
    });
}

async function acceptReq(inviteId) {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/matchInvite/accept`,
      { inviteId: inviteId },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    if (error.status === 418 && error.response) {
      toast.error(
        <p>
          You are already participating in a match. Click{" "}
          <a
            className="font-bold text-emerald-600"
            href={`/match/${error.response.data}`}
          >
            here
          </a>{" "}
          to join that match, or{" "}
          <button
            className="font-bold text-red-500 cursor-pointer"
            onClick={() => {
              resignFromMatch(error.response.data).then(() =>
                acceptReq(inviteId)
              );
            }}
          >
            here
          </button>{" "}
          to resign and join this match
        </p>
      );
    }
  }
}

function MatchCard({ inviteData, variant, showDecline = true }) {
  const [name, setName] = useState("");
  const [avg, setAvg] = useState(0.0);
  const {onlineUsers} = useContext(OnlineUsersContext);

  useEffect(() => {
    if (
      (!inviteData?.recipient_user_id && !inviteData?.player_1_id) ||
      variant === "normal"
    )
      return;
    async function getAvg() {
      const { mean } = await getStatsLast10Matches(
        inviteData.event,
        inviteData.sender_user_id
      );
      setAvg(mean);
    }

    if (variant === "outgoingReq") {
      if (inviteData.recipient_user_id === -1) {
        setName("Anyone");
      } else {
        getUserInfo(inviteData.recipient_user_id).then((user) => {
          setName(user.name);
        });
      }
    }
    if (variant === "incomingReq") {
      getUserInfo(inviteData.sender_user_id).then((user) => {
        setName(user.name);
      });
      getAvg();
    }
  }, [inviteData?.recipient_user_id]);

  let nameAndScore;
  if (variant === "normal") {
    const { setsWonArr } = getMatchScore(inviteData);
    nameAndScore =
      inviteData.player1.name +
      ` [${setsWonArr[0]}] vs. [${setsWonArr[1]}] ` +
      inviteData.player2.name;
  }

  if (variant === "incomingReq" && !onlineUsers.includes(inviteData.sender_user_id)) return null;

  return (
    <div
      onClick={() => {
        variant === "normal" &&
          (window.location.href = `/match/${inviteData.id}`);
      }}
      className={`relative bg-zinc-800 rounded-2xl shadow-lg p-4 flex flex-col gap-2 transition-all duration-200 border border-zinc-700 
        ${variant === "normal" && "cursor-pointer hover:border-emerald-400"}
        ${
          variant === "incomingReq" &&
          "w-fit lg:w-full hover:border-emerald-400"
        }
        ${variant === "outgoingReq" && "w-fit lg:w-full hover:border-amber-400"}
      `}
    >
      <div className="flex items-center gap-2">
        {variant === "outgoingReq" && (
          <span className="text-amber-400 font-bold text-sm px-2 py-1 rounded bg-amber-900/30">
            To
          </span>
        )}
        {variant === "incomingReq" && (
          <span className="text-emerald-400 font-bold text-sm px-2 py-1 rounded bg-emerald-900/30">
            From
          </span>
        )}
        <span className="font-semibold text-lg text-white lg:truncate">
          {variant === "normal" ? nameAndScore : name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <span>{getEventNameFromId(inviteData.event)}</span>
        <span className="mx-1">•</span>
        <span>bo{inviteData.best_of_set_format} sets</span>
        <span className="mx-1">•</span>
        <span>bo{inviteData.best_of_solve_format} solves</span>
      </div>
      {variant === "normal" && (
        <p className="text-zinc-500 text-xs mt-1">
          {new Date(inviteData.created_at).toLocaleDateString()}
        </p>
      )}
      {variant === "incomingReq" && (
        <p className="text-zinc-300 text-sm mt-1">
          {avg === "N/A" ? "Hasn't competed yet" : "Avg: " + avg}
        </p>
      )}
      {variant !== "normal" && (
        <p className="text-zinc-500 text-xs mt-1">
          {Math.floor(inviteData.countdown_secs / 60)}:
          {(inviteData.countdown_secs % 60).toString().padStart(2, "0")} between
          solves
        </p>
      )}
      {variant === "outgoingReq" && (
        <div className="flex justify-end mt-2">
          <Button
            color="red"
            text="Cancel"
            onClick={() => cancelReq(inviteData.id)}
            className="w-24"
          />
        </div>
      )}
      {variant === "incomingReq" && (
        <div className="flex flex-row gap-2 justify-end mt-2">
          <Button
            color="green"
            text="Accept"
            onClick={() => acceptReq(inviteData.id)}
            className="w-24"
          />
          {showDecline && <Button
            color="red"
            text="Decline"
            onClick={() => declineReq(inviteData.id)}
            className="w-24"
          />}
        </div>
      )}
    </div>
  );
}

export default memo(MatchCard);
