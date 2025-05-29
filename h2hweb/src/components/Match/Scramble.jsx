import React, { useState, useEffect } from "react";
import { ScrambleDisplay } from "scramble-display";

function Scramble(props) {
  const scrambleArray = props.scrambleArray;
  const event = props.event;
  const currSet = props.currSet;
  const currSolve = props.currSolve;

  // console.log(currSet, currSolve);
  const [currScramble, setCurrScramble] = useState("");
  useEffect(() => {
    setCurrScramble(scrambleArray?.[currSet - 1]?.[currSolve - 1]);
  }, [props.currSet, props.currSolve, scrambleArray]);
  // console.log(currScramble);
  // console.log(scrambleArray);

  return (
      <>
        <h3 className="text-zinc-300">
          Scramble for set {currSet}, solve {currSolve}
        </h3>
      <div className="w-full space-y-2 flex">
        {/* Scramble text */}
        <div className="flex-1">
          <p className="text-xl mb-2">{currScramble}</p>
        </div>
        {/* Draw scramble */}
        <div className="flex flex-1 items-start justify-start">
          <scramble-display
            className="w-full h-30"
            scramble={currScramble}
            event={event}
          />
        </div>
      </div>
      </>
  );
}

export default Scramble;
