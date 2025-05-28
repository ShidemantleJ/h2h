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

function MatchInviteCard({ inviteData, variant }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!inviteData?.recipient_user_id) return;
    variant === "outgoing" &&
      getUserInfo(inviteData.recipient_user_id).then((user) => {
        setName(user.name);
      });
    variant === "incoming" &&
      getUserInfo(inviteData.sender_user_id).then((user) => {
        setName(user.name);
      });
  }, [inviteData?.recipient_user_id]);

  return (
    <div className="bg-zinc-900 p-2 rounded-lg whitespace-nowrap space-y-1">
      <p className="text-zinc-200">
        {variant === "outgoing" && "To:"} {variant === "incoming" && "From:"}{" "}
        {name}
      </p>
      <p className="text-zinc-600">bo{inviteData.best_of_set_format} sets</p>
      <p className="text-zinc-600">
        bo{inviteData.best_of_solve_format[0]} solves
      </p>
      <p className="text-zinc-600">
        Event: {getEventNameFromId(inviteData.event)}
      </p>
      <p className="text-zinc-600">
        {inviteData.countdown_secs}s between solves
      </p>
      {variant === "outgoing" && (
        <Button
          color="red"
          text="Cancel"
          onClick={() => cancelReq(inviteData.id)}
        />
      )}
      {variant === "incoming" && (
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
    </div>
  );
}

export default MatchInviteCard;
