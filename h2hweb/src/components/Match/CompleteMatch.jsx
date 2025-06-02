/*
    Display top bar without countdown timers, scrambles,
    and solve table that updates scramble when a row is clicked
*/
import React, { useState } from "react";
import SolveTable from "./SolveTable";
import TopBar from "./TopBar";
import Scramble from "./Scramble";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

function CompleteMatch({ match }) {
  const [currSet, setCurrSet] = useState(1);
  const [currSolve, setCurrSolve] = useState(1);

  return (
    <div className="bg-zinc-900 w-full grid grid-cols-1 gap-5 p-5 text-white auto-rows-min">
      <div className="bg-zinc-800 rounded-2xl lg:col-span-2 h-fit">
        <TopBar match={match} variant="CompleteMatch" />
      </div>
      <div className="bg-zinc-800 rounded-2xl w-fit">
        <SolveTable match={match} variant="CompleteMatch" setCurrScrambleSet={setCurrSet} setCurrScrambleSolve={setCurrSolve}/>
      </div>
      <div className="bg-zinc-800 rounded-2xl p-5">
        <Scramble
          event={match.event}
          scrambleArray={match.scrambles}
          currSet={currSet}
          currSolve={currSolve}
        />
      </div>
    </div>
  );
}

export default CompleteMatch;
