import React from "react";
import { wonSet } from "../../helpers/matchHelpers";
import { Crown } from "lucide-react";

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
  const numSets = Math.max(p1timearr.length, p2timearr.length);

  // Creates array with a row for each set. Each row contains solves won by p1 at index 0,
  // and solves won by p2 at index 1
  let solvesWonArr = Array.from({ length: numSets }, () => Array(2).fill(0));
  let setsWonArr = [0, 0];

  for (let i = 0; i < numSets; i++) {
    const { setResult, solvesWonArr: solvesWonInSetArr } = wonSet(
      match.best_of_solve_format,
      p1timearr?.[i],
      p2timearr?.[i]
    );

    solvesWonArr[i][0] += solvesWonInSetArr[0];
    solvesWonArr[i][1] += solvesWonInSetArr[1];
    if (setResult === "P1_WON") setsWonArr[0]++;
    else if (setResult === "P2_WON") setsWonArr[1]++;
  }

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
          solves
          <br />
          this set
        </p>
      </div>
    </div>
  );
}

export default MiniStats;
