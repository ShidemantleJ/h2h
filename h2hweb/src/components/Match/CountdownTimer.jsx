import { TimerOff } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

function calculateTimeLeft(timestamp, countdownSecs) {
  const timestampNow = new Date().getTime();
  const startTimestamp = new Date(timestamp).getTime();
  const secsRemaining =
    countdownSecs - Math.floor((timestampNow - startTimestamp) / 1000);

  const secsToDisplay = Math.max(secsRemaining % 60, 0);
  const minsToDisplay = Math.max(Math.floor(secsRemaining / 60), 0);

  return {
    text: `${String(minsToDisplay).padStart(1, "0")}:${String(
      secsToDisplay
    ).padStart(2, "0")}`,
    seconds: secsRemaining,
  };
}

function CountdownTimer(props) {
  const startTimestamp = props.timestamp;
  const countdownSecs = props.countdownSecs;
  const playerTurn = props.turn;
  const player = props.player;
  const setTimeIsUp = props.setTimeIsUp;

  const [timeLeft, setTimeLeft] = useState({ text: "0:00", seconds: 1 });
  const timeLeftRef = useRef(calculateTimeLeft(startTimestamp, countdownSecs));

  useEffect(() => {
    const intervalId = setInterval(() => {
      const calculatedTimeLeft = calculateTimeLeft(
        startTimestamp,
        countdownSecs
      );
      setTimeLeft(calculatedTimeLeft);
      timeLeftRef.current = calculateTimeLeft(startTimestamp, countdownSecs);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTimestamp, countdownSecs]);

  useEffect(() => {
    if (typeof setTimeIsUp === "function" && timeLeft.seconds < 0) {
      console.log(
        "Time is up",
        timeLeft.seconds,
        countdownSecs - Math.floor((Date.now() - startTimestamp) / 1000)
      );
      setTimeIsUp(true);
    }
  }, [timeLeft, setTimeIsUp]);

  return (
    <div
      className={`w-fit mx-7 text-2xl text-black bg-zinc-200 p-2 rounded-xl`}
    >
      <p
        className={`${
          player === playerTurn && timeLeft.seconds < countdownSecs / 3
            ? "text-red-600"
            : "text-black"
        }`}
      >
        {player === playerTurn ? timeLeft.text : "0:00"}
      </p>
    </div>
  );
}

export default CountdownTimer;
