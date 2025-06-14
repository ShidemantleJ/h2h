import React, { useState, useEffect, memo } from "react";
import { ScrambleDisplay } from "scramble-display";

function Scramble({scrambleArray, event, currSet, currSolve}) {
  const currScramble = scrambleArray?.[currSet]?.[currSolve];

  return (
      <div className="p-5">
        <h3 className="text-zinc-300">
          Scramble for set {currSet + 1}, solve {currSolve + 1}
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
      </div>
  );
}

export default Scramble;
