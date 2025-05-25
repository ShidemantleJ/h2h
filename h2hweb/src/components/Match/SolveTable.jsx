import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { getNameFromId } from "../../utils/dbutils";
import { toast } from "react-toastify";

function p1WonSolve(p1time, p2time) {
  if (isNaN(p1time) || isNaN(p2time)) return -1;
  else if (p1time == -1) return 0;
  else if (p2time == -1) return 1;
  else if (p1time < p2time) return 1;
  else if (p1time > p2time) return 0;
}

function getTimes(p1timearr, p2timearr, setNum, boSolveFormat) {
  let tableElements = [];
  for (let i = 0; i < boSolveFormat; i++) {
    const p1time = parseFloat(p1timearr?.[setNum]?.[i])?.toFixed(2);
    const p2time = parseFloat(p2timearr?.[setNum]?.[i])?.toFixed(2);
    const p1won = p1WonSolve(p1time, p2time);
    tableElements.push(
      <tr
        key={i}
        className="hover:bg-zinc-700 rounded-2xl border-b-1 border-zinc-600"
      >
        <td className="px-6 py-4 text-center">{i + 1}</td>
        <td className={`px-6 py-4 ${p1won === 1 && "font-bold"}`}>
          {isNaN(p1time) ? "-" : p1time == -1 ? "DNF" : p1time}
        </td>
        <td className={`px-6 py-4 ${p1won === 0 && "font-bold"}`}>
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
    async function getNames() {
      if (!match || !match.player_1_id || !match.player_2_id) return;
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
      toast(`This set is over, going to next set...`, {autoClose: 2000});
      setSetToDisplay(currSetIndex);
    }
  }, [match.scrambles]);

  return (
    <div className="m-auto w-fit bg-zinc-800 rounded-2xl p-5 h-full min-h-0">
      <h1 className="text-xl font-semibold mb-2 text-center">
        Set #{setToDisplay + 1}
      </h1>
      <div className="inline-flex items-center h-full min-h-0">
        <ArrowLeftCircle
          className="cursor-pointer mr-5"
          onClick={() => setSetToDisplay((prev) => Math.max(0, prev - 1))}
        />
        <div className="h-full overflow-y-auto">
          <table className="transition-all duration-300 ease-in-out text-sm">
            <thead>
              <tr className="text-zinc-400 border-b-1 border-zinc-600">
                <th className="px-6 py-4">Solve #</th>
                <th className="px-6 py-4">{p1name}'s times</th>
                <th className="px-6 py-4">{p2name}'s times</th>
              </tr>
            </thead>
            <tbody className="overflow-auto">
              {getTimes(
                match?.player_1_times || [[]],
                match?.player_2_times || [[]],
                setToDisplay,
                match.best_of_solve_format[setToDisplay]
              )}
            </tbody>
          </table>
        </div>
        <ArrowRightCircle
          className="cursor-pointer ml-5"
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
    </div>
  );
}

export default SolveTable;
