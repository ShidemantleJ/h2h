/*
    Display top bar without countdown timers, scrambles,
    and solve table that updates scramble when a row is clicked
*/
import React, { useState, memo } from "react";
import SolveTable from "./SolveTable";
import TopBar from "./TopBar";
import Scramble from "./Scramble";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

function CompleteMatch({ match }) {
  const [currSet, setCurrSet] = useState(0);
  const [currSolve, setCurrSolve] = useState(0);

  return (
    <div className="bg-zinc-900 w-full flex flex-col gap-5 p-5 text-white min-h-dvh auto-rows-min">
      <div className="bg-zinc-800 rounded-2xl lg:col-span-2 h-fit">
        <TopBar match={match} variant="CompleteMatch" currSet={currSet} />
      </div>
      <div className="flex flex-col lg:flex-row gap-5 w-full">
        <div className="bg-zinc-800 rounded-2xl w-full">
          <SolveTable
            currSet={currSet}
            setCurrSet={setCurrSet}
            currSolve={currSolve}
            setCurrSolve={setCurrSolve}
            match={match}
            variant="CompleteMatch"
          />
        </div>
        <div className="bg-zinc-800 rounded-2xl w-full">
          <Scramble
            event={match.event}
            scrambleArray={match.scrambles}
            currSet={currSet}
            currSolve={currSolve}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(CompleteMatch);
