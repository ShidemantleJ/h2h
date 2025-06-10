import React, {memo} from "react";
import { wonSet } from "../../helpers/matchHelpers";
import { Crown } from "lucide-react";
import {getMatchScore} from '../../helpers/matchHelpers';

function sumColumn(arr, index) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i][index];
  }
  return sum;
}

function MiniStats({ match, playerNum, currSet }) {
  const p1timearr = match.player_1_times;
  const p2timearr = match.player_2_times;

  const {setsWonArr, solvesWonArr} = getMatchScore(match);

  const setsWon = setsWonArr[playerNum - 1];
  const totalSolvesWon = sumColumn(solvesWonArr, playerNum - 1);
  const solvesWonThisSet = solvesWonArr?.[currSet]?.[playerNum - 1];
  console.log(solvesWonArr, currSet);

  const playerWon = match.status === `P${playerNum}_WON`;
  return (
    <div className={`flex`}>
      <div className="text-white bg-black py-1 px-2 text-center text-xs rounded-lg rounded-r-none">
        <p className="text-xl font-bold">{setsWon}</p>
        <div className="">
          <p className="text-xs font-semibold">set{setsWon !== 1 && "s"}</p>
        </div>
      </div>
      <div className="text-white bg-zinc-900 py-1 px-2 text-center text-xs">
        <p className="text-xl font-bold">{totalSolvesWon}</p>
        <p className="text-xs font-semibold">
          total
          <br />
          solve{totalSolvesWon !== 1 && "s"}
        </p>
      </div>
      <div className="text-white bg-zinc-950 py-1 px-2 text-center text-xs rounded-lg rounded-l-none">
        <p className="text-xl font-bold">{solvesWonThisSet}</p>
        <p className="text-xs font-semibold">
          solve{solvesWonThisSet !== 1 && "s"}
          <br />
          this set
        </p>
      </div>
    </div>
  );
}

export default memo(MiniStats);
