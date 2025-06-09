import React, { useEffect, useState } from "react";
import { getUserInfo } from "../utils/dbutils";
import Button from "./Button";
import { getEventNameFromId } from "../lib/events";
import axios from "axios";

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
    if (!inviteData?.recipient_user_id && !inviteData?.player_1_id) return;
    variant === "outgoingReq" &&
      getUserInfo(inviteData.recipient_user_id).then((user) => {
        setName(user.name);
      });
    variant === "incomingReq" &&
      getUserInfo(inviteData.sender_user_id).then((user) => {
        setName(user.name);
      });
    variant === "normal" &&
      getUserInfo(inviteData.player_1_id).then((user1) => {
        getUserInfo(inviteData.player_2_id).then((user2) => {
          setName(user1.name + " vs. " + user2.name);
        });
      });
  }, [inviteData?.recipient_user_id]);

  return (
    <div className="bg-zinc-900 p-2 rounded-lg space-y-1">
      <p className="text-zinc-200">
        {variant === "outgoingReq" && "To: "}
        {variant === "incomingReq" && "From: "}
        {name}
      </p>
      <p className="text-zinc-600">
        {getEventNameFromId(inviteData.event)}, bo
        {inviteData.best_of_set_format} sets, bo
        {inviteData.best_of_solve_format} solves
      </p>
      {variant === "normal" && (
        <p className="text-zinc-600">
          {new Date(inviteData.created_at).toLocaleDateString()}
        </p>
      )}
      {variant !== "normal" && (
        <p className="text-zinc-600">
          {Math.floor(inviteData.countdown_secs / 60)}:
          {(inviteData.countdown_secs % 60).toString().padStart(2, "0")} between
          solves
        </p>
      )}
      {variant === "outgoingReq" && (
        <Button
          color="red"
          text="Cancel"
          onClick={() => cancelReq(inviteData.id)}
        />
      )}
      {variant === "incomingReq" && (
        <div className="flex gap-2 mx-auto">
          <Button
            color="green"
            text="Accept"
            onClick={() => acceptReq(inviteData.id)}
          />
          <Button
            color="red"
            text="Decline"
            onClick={() => declineReq(inviteData.id)}
          />
        </div>
      )}
      {variant === "normal" && (
        <Button
          color="green"
          text="View results"
          onClick={() => (window.location.href = `/match/${inviteData.id}`)}
          key={inviteData.id}
        />
      )}
    </div>
  );
}

export default MatchCard;
