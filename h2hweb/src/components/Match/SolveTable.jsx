import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { toast } from "react-toastify";
import { whoWonSolve, wonSet } from "../../helpers/matchHelpers";

function getTimes(
  p1timearr,
  p2timearr,
  setNum,
  boSolveFormat,
  setCurrScrambleSet,
  setCurrScrambleSolve
) {
  let tableElements = [];
  for (let i = 0; i < boSolveFormat; i++) {
    const p1time = parseFloat(p1timearr?.[setNum]?.[i])?.toFixed(2);
    const p2time = parseFloat(p2timearr?.[setNum]?.[i])?.toFixed(2);
    const winner = whoWonSolve(p1time, p2time);
    tableElements.push(
      <tr
        key={i}
        className="hover:bg-zinc-700 rounded-2xl border-b-1 border-zinc-600"
        onClick={() => {
          if (
            setCurrScrambleSet &&
            setCurrScrambleSolve &&
            (!isNaN(p1time) || !isNaN(p2time))
          ) {
            setCurrScrambleSet(setNum);
            setCurrScrambleSolve(i);
          }
        }}
      >
        <td className="p-2 text-center">{i + 1}</td>
        <td className={`p-2 ${winner === 0 && "font-bold"}`}>
          {isNaN(p1time) ? "-" : p1time == -1 ? "DNF" : p1time}
        </td>
        <td className={`p-2 ${winner === 1 && "font-bold"}`}>
          {isNaN(p2time) ? "-" : p2time == -1 ? "DNF" : p2time}
        </td>
      </tr>
    );
  }
  return tableElements;
}

function SolveTable({ match, setCurrSet, currSet, setCurrSolve, currSolve }) {
  const p1name = match?.player1?.name;
  const p2name = match?.player2?.name;

  // Notify user when someone wins a set
  useEffect(() => {
    if (
      !Array.isArray(match?.player_1_times) ||
      !Array.isArray(match?.player_2_times) ||
      match.status !== "ongoing"
    )
      return;
    if (match.player_1_times.length === 0 || match.player_2_times.length === 0)
      return;
    const p1LastSet =
      match.player_1_times.at(-1).length === 0
        ? match.player_1_times.at(-2)
        : match.player_1_times.at(-1);
    const p2LastSet =
      match.player_2_times.at(-1).length === 0
        ? match.player_2_times.at(-2)
        : match.player_2_times.at(-1);
    const { setResult: whoWonSet } = wonSet(
      match.best_of_solve_format,
      p1LastSet,
      p2LastSet
    );
    const currSetIndex = match.player_1_times.length - 1;
    if (whoWonSet !== "SET_NOT_OVER") {
      toast(
        `${
          (whoWonSet === "P1_WON" ? p1name : p2name) +
          " won this set! Moving on to set #" +
          (currSetIndex + 1)
        }`,
        { autoClose: 5000, pauseOnFocusLoss: false }
      );
      setTimeout(() => {
        setCurrSet(currSetIndex);
      }, 1500);
    }
  }, [match?.player_1_times, match?.player_2_times]);

  return (
    <div className="h-full">
      <div className="flex items-center justify-center space-x-5 mb-2">
        <ArrowLeftCircle
          className="cursor-pointer"
          onClick={() => {
            setCurrSet((prev) => Math.max(0, prev - 1));
            setCurrSolve(0);
          }}
        />
        <h1 className="text-xl font-semibold">Set #{currSet + 1}</h1>
        <ArrowRightCircle
          className="cursor-pointer"
          onClick={() => {
            setCurrSet((prev) =>
              Math.max(
                Math.min(match?.player_1_times?.length - 1, prev + 1),
                Math.min(match?.player_2_times?.length - 1, prev + 1)
              )
            );
            setCurrSolve(0);
          }}
        />
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="mx-auto transition-all duration-300 ease-in-out text-sm">
          <thead>
            <tr className="text-zinc-400 border-b-1 border-zinc-600">
              <th className="px-3 py-4">Solve #</th>
              <th className="px-3 py-4">{p1name}'s times</th>
              <th className="px-3 py-4">{p2name}'s times</th>
            </tr>
          </thead>
          <tbody className="">
            {getTimes(
              match?.player_1_times || [[]],
              match?.player_2_times || [[]],
              currSet,
              match.max_solves[currSet],
              setCurrSet,
              setCurrSolve
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SolveTable;
