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
    <div className="w-full space-y-2">
      <h2 className="text-2xl font-semibold">Current Scramble</h2>
      <h3 className="text-zinc-300">
        Set {currSet}, solve {currSolve}
      </h3>
      <p className="text-xl mb-2">{currScramble}</p>
      <scramble-display
        className="w-full"
        scramble={currScramble}
        event={event}
      />
    </div>
  );
}

export default Scramble;
