import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "./Button";
import axios from "axios";
import EventSelector from "./EventSelector";
import { ReceiptEuroIcon } from "lucide-react";

async function handleSubmit(
  recipientId,
  setFormat,
  solveFormat,
  selectedEvent,
  minutes,
  seconds,
  setShowModal
) {
  try {
    const res = await axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/matchInvite/send`,
        {
          recipientId: recipientId,
          boSetFormat: setFormat,
          boSolveFormat: solveFormat,
          toRandomUsers: recipientId === -1,
          event: selectedEvent,
          countdown_secs: Number(minutes) * 60 + Number(seconds),
        },
        { withCredentials: true }
      );
  } catch (err) {
    // console.log(err);
    toast.error(err.response.data);
  }
  setShowModal(false);
}

function validateForm(setFormat, solveFormat, selectedEvent, minutes, seconds) {
  let error = "";
  if (isNaN(Number(setFormat)) || Number(setFormat) < 1)
    error += "Set format must be a whole number greater than or equal to 1\n";
  if (isNaN(Number(solveFormat)) || Number(solveFormat) < 1)
    error += "Solve format must be a whole number greater than or equal to 1\n";
  if (isNaN(Number(minutes)) || Number(minutes) < 0)
    error += "Minutes must be zero or a positive whole number\n";
  if (isNaN(Number(seconds)) || Number(seconds) < 0)
    error += "Seconds must be zero or a positive whole number\n";
  if (Number(seconds) + Number(minutes) * 60 < 10)
    error += "There must be at least 10 seconds allowed between solves.\n";

  if (error !== "") {
    toast.error(error);
    return false;
  } else return true;
}

function SendChallengeModal({ recipientId, setShowModal }) {
  const [setFormat, setSetFormat] = useState("");
  const [solveFormat, setSolveFormat] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("333");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold">Send a Challenge</h1>
      <p
        className="absolute cursor-pointer top-2 right-3 text-sm"
        onClick={() => setShowModal(false)}
      >
        X
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            validateForm(
              setFormat,
              solveFormat,
              selectedEvent,
              minutes,
              seconds
            )
          ) {
            handleSubmit(
              recipientId,
              setFormat,
              solveFormat,
              selectedEvent,
              minutes,
              seconds,
              setShowModal
            );
          }
        }}
      >
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="space-y-2">
            <p>Choose a format:</p>
            <input
              type="number"
              className={`p-2 rounded-xl bg-zinc-900 block`}
              placeholder="'Best of' set format (e.g. 3)"
              onChange={(e) => setSetFormat(e.target.value)}
              min="1"
              step="2"
              value={setFormat}
            />
            <input
              type="number"
              min="1"
              step="2"
              className={`p-2 rounded-xl bg-zinc-900 block`}
              placeholder="'Best of' solve format (e.g. 5)"
              onChange={(e) => setSolveFormat(e.target.value)}
              value={solveFormat}
            />
          </div>
          <div className="space-y-2">
            <p>Max Time Between Solves:</p>
            <div className="flex items-center gap-x-2">
              <input
                type="number"
                className={`p-2 rounded-xl bg-zinc-900 block w-20 text-right`}
                min="0"
                step="1"
                placeholder="minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              ></input>
              :
              <input
                type="number"
                className={`p-2 rounded-xl bg-zinc-900 block w-20`}
                min="0"
                step="1"
                placeholder="seconds"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="space-y-2">
            <EventSelector
              selectedEvent={selectedEvent}
              setSelectedEvent={setSelectedEvent}
            />
          </div>
        </div>
        <div className="mt-5">
          <Button type="submit" text="Submit" color="green" />
        </div>
      </form>
    </div>
  );
}

export default SendChallengeModal;
