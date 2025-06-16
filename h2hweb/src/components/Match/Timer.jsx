import React, { useEffect, useRef, useState, memo } from "react";
import { Info } from "lucide-react";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { toast } from "react-toastify";

const submitTime = async (time, matchId) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/match/addTime`,
      { matchId: matchId, newTime: time },
      { withCredentials: true }
    );
    return res;
  } catch (err) {
    if (err.response) {
      toast.error(err.response.data);
    } else {
      toast.error("Something went wrong: ", err.message);
    }
    return null;
  }
};

function handleDnfInput(setDnfInputted, setTimeInputVal) {
  setDnfInputted(true);
  setTimeInputVal(-1);
}

function Timer({ matchId }) {
  const [timerVal, setTimerVal] = useState(0);
  const [timerBold, setTimerBold] = useState(false);
  const [timeInputVal, setTimeInputVal] = useState(0);
  const [dnfInputted, setDnfInputted] = useState(false);

  const intervalIdRef = useRef(null);
  const runningRef = useRef(false);
  const justStoppedRef = useRef(false);
  const timerValRef = useRef(0);

  const startTimer = () => {
    if (!intervalIdRef.current) {
      setTimerVal(0);
      const id = setInterval(() => {
        setTimerVal((prevVal) => {
          const newVal = parseFloat((prevVal + 0.01).toFixed(2));
          timerValRef.current = newVal;
          return newVal;
        });
      }, 10);
      intervalIdRef.current = id;
      runningRef.current = true;
    }
  };

  const stopTimer = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      runningRef.current = false;
      setTimeInputVal(timerValRef.current.toFixed(2));
      setDnfInputted(false);
    }
  };

  const handleKeyOrTouchUp = (event) => {
    if (event.key === " " || !event.key) {
      if (event.key) event.preventDefault();
      if (justStoppedRef.current) {
        justStoppedRef.current = false;
      } else if (!runningRef.current && !justStoppedRef.current) {
        startTimer();
        setTimerBold(false);
      }
    }
  };

  const handleKeyOrTouchDown = (event) => {
    if (event.key === " " || !event.key) {
      if (event.key) event.preventDefault();
      if (runningRef.current) {
        stopTimer();
        justStoppedRef.current = true;
      } else {
        setTimerBold(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", handleKeyOrTouchUp);
    window.addEventListener("keydown", handleKeyOrTouchDown);

    return () => {
      window.removeEventListener("keyup", handleKeyOrTouchUp);
      window.removeEventListener("keydown", handleKeyOrTouchDown);
      stopTimer();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center">
        <h2 className="text-2xl font-semibold">Timer</h2>
        <Tooltip anchorSelect=".timer-info" place="top">
          You can use an external timer, or the built in
          <br />
          timer controlled with the spacebar. Once you've
          <br />
          completed your solve, enter your time and submit.
        </Tooltip>
        <Info className="ml-3 timer-info" />
      </div>
      <div className="flex flex-col space-y-3">
        <p
          className={`${
            timerBold ? "text-green-800 font-bold" : ""
          } text-2xl font-semibold`}
          onTouchStart={handleKeyOrTouchDown}
          onTouchEnd={handleKeyOrTouchUp}
        >
          {timerVal.toFixed(2)}
        </p>
        <div className="relative">
          <input
            type="number"
            min="0.00"
            step="0.01"
            className={`${
              dnfInputted ? "text-zinc-950" : "text-white"
            } p-2 rounded-xl bg-zinc-950`}
            placeholder="Enter your time"
            value={dnfInputted ? -1 : timeInputVal}
            onChange={(e) => setTimeInputVal(e.target.value)}
            onFocus={() => {
              if (dnfInputted) {
                setDnfInputted(false);
                setTimeInputVal(0);
              }
            }}
          />
          <p
            className={`${
              dnfInputted ? "block" : "hidden"
            } absolute top-0 left-0 w-full h-full pointer-events-none p-2`}
          >
            DNF
          </p>
        </div>
        <div className="space-x-5">
          <button
            className="bg-emerald-700 rounded-md font-semibold p-2 cursor-pointer"
            onClick={() => submitTime(timeInputVal, matchId)}
          >
            Submit
          </button>
          <button
            className="bg-amber-700 rounded-md font-semibold p-2 cursor-pointer"
            onClick={() =>
              setTimeInputVal((prev) => parseFloat(prev) + 2)?.toFixed(2)
            }
          >
            +2
          </button>
          <button
            className="bg-red-900 rounded-md font-semibold p-2 cursor-pointer"
            onClick={() => handleDnfInput(setDnfInputted, setTimeInputVal)}
          >
            DNF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Timer;
