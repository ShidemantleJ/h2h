import { TimerOff } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

// Returns time between now and timestamp + countdownSecs
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

function CountdownTimer({
  startTimestamp,
  countdownSecs,
  isRunning,
  onTimeUp,
}) {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(startTimestamp, countdownSecs)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(startTimestamp, countdownSecs));
  }, [isRunning]);

  useEffect(() => {
    if (!startTimestamp || !countdownSecs) return;
    const intervalId = setInterval(() => {
      const calculatedTimeLeft = calculateTimeLeft(
        startTimestamp,
        countdownSecs
      );
      setTimeLeft(calculatedTimeLeft);
      if (typeof onTimeUp === "function" && calculatedTimeLeft.seconds < 0) {
        if (isRunning) onTimeUp();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTimestamp, countdownSecs]);

  return (
    <div
      className={`w-fit lg:text-xl text-black bg-zinc-200 p-2 rounded-lg h-fit`}
    >
      <p
        className={`${
          isRunning && timeLeft.seconds < countdownSecs / 3
            ? "text-red-600"
            : "text-black"
        }`}
      >
        {isRunning ? timeLeft.text : "00:00"}
      </p>
    </div>
  );
}

export default CountdownTimer;
