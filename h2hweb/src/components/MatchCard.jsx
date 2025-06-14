import React, { useEffect, useState, memo } from "react";
import { getUserInfo } from "../utils/dbutils";
import Button from "./Button";
import { getEventNameFromId } from "../lib/events";
import axios from "axios";
import { getMatchScore } from "../helpers/matchHelpers";

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

function acceptReq(inviteId) {
  axios
    .post(
      `${import.meta.env.VITE_BACKEND_URL}/matchInvite/accept`,
      { inviteId: inviteId },
      { withCredentials: true }
    )
    .then((res) => {
      return res.data;
    });
}

function MatchCard({ inviteData, variant }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (
      (!inviteData?.recipient_user_id && !inviteData?.player_1_id) ||
      variant === "normal"
    )
      return;
    variant === "outgoingReq" &&
      getUserInfo(inviteData.recipient_user_id).then((user) => {
        setName(user.name);
      });
    variant === "incomingReq" &&
      getUserInfo(inviteData.sender_user_id).then((user) => {
        setName(user.name);
      });
  }, [inviteData?.recipient_user_id]);

  let nameAndScore;
  if (variant === "normal") {
    const { setsWonArr } = getMatchScore(inviteData);
    console.log(inviteData);
    nameAndScore =
      inviteData.player1.name +
      ` [${setsWonArr[0]}] vs. [${setsWonArr[1]}] ` +
      inviteData.player2.name;
  }

  return (
    <div
      onClick={() => {
        variant === "normal" &&
          (window.location.href = `/match/${inviteData.id}`);
      }}
      className={`relative bg-zinc-800 rounded-2xl shadow-lg p-4 flex flex-col gap-2 transition-all duration-200 border border-zinc-700 
        ${
          variant === "normal"
            ? "cursor-pointer hover:border-emerald-400"
            : "hover:border-amber-400"
        }
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
        <span className="font-semibold text-lg text-white truncate">
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
        <div className="flex flex-col gap-2 justify-end mt-2">
          <Button
            color="green"
            text="Accept"
            onClick={() => acceptReq(inviteData.id)}
            className="w-24"
          />
          <Button
            color="red"
            text="Decline"
            onClick={() => declineReq(inviteData.id)}
            className="w-24"
          />
        </div>
      )}
    </div>
  );
}

export default memo(MatchCard);
