import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { getNameFromId } from "../../utils/dbutils";
import { toast } from "react-toastify";
import { whoWonSolve, wonSet } from "../../helpers/matchHelpers";

function getTimes(p1timearr, p2timearr, setNum, boSolveFormat) {
  let tableElements = [];
  for (let i = 0; i < boSolveFormat; i++) {
    const p1time = parseFloat(p1timearr?.[setNum]?.[i])?.toFixed(2);
    const p2time = parseFloat(p2timearr?.[setNum]?.[i])?.toFixed(2);
    const winner = whoWonSolve(p1time, p2time);
    tableElements.push(
      <tr
        key={i}
        className="hover:bg-zinc-700 rounded-2xl border-b-1 border-zinc-600"
      >
        <td className="px-6 py-4 text-center">{i + 1}</td>
        <td className={`px-6 py-4 ${winner === 0 && "font-bold"}`}>
          {isNaN(p1time) ? "-" : p1time == -1 ? "DNF" : p1time}
        </td>
        <td className={`px-6 py-4 ${winner === 1 && "font-bold"}`}>
          {isNaN(p2time) ? "-" : p2time == -1 ? "DNF" : p2time}
        </td>
      </tr>
    );
  }
  return tableElements;
}

function SolveTable(props) {
  const match = props.match;
  const [p1name, setp1name] = useState("");
  const [p2name, setp2name] = useState("");
  const [setToDisplay, setSetToDisplay] = useState(0);

  useEffect(() => {
    if (!match || !match.player_1_id || !match.player_2_id) return;
    async function getNames() {
      const player1name = await getNameFromId(match.player_1_id);
      const player2name = await getNameFromId(match.player_2_id);
      setp1name(player1name);
      setp2name(player2name);
    }
    getNames();
  }, [match.player_1_id, match.player_2_id]);

  if (!match || !match.player_1_id || !match.player_2_id || !match.scrambles)
    return <h1>Loading</h1>;

  useEffect(() => {
    // New subarray with 1 scramble in the scrambles array means there is a new set
    const currSetIndex = match.scrambles.length - 1;
    if (match.scrambles[currSetIndex].length === 1 && currSetIndex !== 0) {
      toast(
        `${
          wonSet(
            match.best_of_solve_format[currSetIndex - 1],
            match.player_1_times[currSetIndex - 1],
            match.player_2_times[currSetIndex - 1]
          ) === "P1_WON"
            ? p1name
            : p2name + " won this set! Moving on to set #" + currSetIndex + 1
        }`,
        { autoClose: 5000 }
      );
      setSetToDisplay(currSetIndex);
    }
  }, [match.scrambles]);

  return (
    <div className="m-auto w-fit bg-zinc-800 rounded-2xl p-5 h-full min-h-0">
      <div className="flex items-center justify-center space-x-5 mb-2">
        <ArrowLeftCircle
          className="cursor-pointer"
          onClick={() => setSetToDisplay((prev) => Math.max(0, prev - 1))}
        />
        <h1 className="text-xl font-semibold">Set #{setToDisplay + 1}</h1>
        <ArrowRightCircle
          className="cursor-pointer"
          onClick={() =>
            setSetToDisplay((prev) =>
              Math.max(
                Math.min(match?.player_1_times?.length - 1, prev + 1),
                Math.min(match?.player_2_times?.length - 1, prev + 1)
              )
            )
          }
        />
      </div>
      <div className="inline-flex items-center min-h-0">
        <div className="overflow-y-auto md:max-h-[70vh]">
          <table className="transition-all duration-300 ease-in-out text-sm">
            <thead>
              <tr className="text-zinc-400 border-b-1 border-zinc-600">
                <th className="px-6 py-4">Solve #</th>
                <th className="px-6 py-4">{p1name}'s times</th>
                <th className="px-6 py-4">{p2name}'s times</th>
              </tr>
            </thead>
            <tbody className="">
              {getTimes(
                match?.player_1_times || [[]],
                match?.player_2_times || [[]],
                setToDisplay,
                match.best_of_solve_format[setToDisplay]
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SolveTable;
